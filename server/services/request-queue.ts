/**
 * Request Queue Service
 * Manages concurrent API requests with rate limiting and backoff
 * Prevents overwhelming the OpenRouter API and handles rate limit errors gracefully
 */

export interface QueuedRequest {
  id: string;
  priority: number;
  execute: () => Promise<any>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: Error;
  result?: any;
}

export interface QueueStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  totalProcessed: number;
  averageWaitTime: number;
  averageExecutionTime: number;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private running: Set<string> = new Set();
  private completed: QueuedRequest[] = [];
  private maxConcurrent: number;
  private requestDelay: number; // ms between requests
  private lastRequestTime: number = 0;
  private rateLimitRetries: number = 3;
  private retryBackoff: number = 1000; // ms

  constructor(maxConcurrent: number = 2, requestDelay: number = 500) {
    this.maxConcurrent = maxConcurrent;
    this.requestDelay = requestDelay;
  }

  /**
   * Add a request to the queue
   */
  enqueue(
    execute: () => Promise<any>,
    priority: number = 0,
    id: string = Math.random().toString(36).substr(2, 9)
  ): string {
    const request: QueuedRequest = {
      id,
      priority,
      execute,
      createdAt: new Date(),
      status: 'pending',
    };

    this.queue.push(request);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();

    return id;
  }

  /**
   * Process the queue - execute requests respecting concurrency limits
   */
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const request = this.queue.shift();
      if (!request) break;

      this.running.add(request.id);
      request.status = 'running';
      request.startedAt = new Date();

      this.executeWithRetry(request).catch((error) => {
        console.error(`[RequestQueue] Request ${request.id} failed:`, error);
      });
    }
  }

  /**
   * Execute a request with retry logic for rate limits
   */
  private async executeWithRetry(request: QueuedRequest, retryCount: number = 0): Promise<void> {
    try {
      // Enforce minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.requestDelay) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
        );
      }

      this.lastRequestTime = Date.now();
      request.result = await request.execute();
      request.status = 'completed';
      request.completedAt = new Date();
      this.completed.push(request);

      console.log(`[RequestQueue] Request ${request.id} completed successfully`);
    } catch (error) {
      const err = error as any;

      // Check if it's a rate limit error (402 or 429)
      if ((err.status === 402 || err.status === 429) && retryCount < this.rateLimitRetries) {
        const backoffTime = this.retryBackoff * Math.pow(2, retryCount);
        console.warn(
          `[RequestQueue] Rate limited on request ${request.id}, retrying in ${backoffTime}ms (attempt ${retryCount + 1}/${this.rateLimitRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return this.executeWithRetry(request, retryCount + 1);
      }

      // Permanent failure
      request.status = 'failed';
      request.error = error as Error;
      request.completedAt = new Date();
      this.completed.push(request);

      console.error(`[RequestQueue] Request ${request.id} failed permanently:`, error);
    } finally {
      this.running.delete(request.id);
      this.processQueue();
    }
  }

  /**
   * Get request status by ID
   */
  getRequestStatus(id: string): QueuedRequest | undefined {
    const pending = this.queue.find((r) => r.id === id);
    if (pending) return pending;

    const running = Array.from(this.running).find((rid) => rid === id);
    if (running) {
      return this.completed.find((r) => r.id === id);
    }

    return this.completed.find((r) => r.id === id);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const pending = this.queue.length;
    const running = this.running.size;
    const completed = this.completed.filter((r) => r.status === 'completed').length;
    const failed = this.completed.filter((r) => r.status === 'failed').length;
    const totalProcessed = completed + failed;

    let averageWaitTime = 0;
    let averageExecutionTime = 0;

    if (this.completed.length > 0) {
      const waitTimes = this.completed
        .filter((r) => r.startedAt && r.createdAt)
        .map((r) => r.startedAt!.getTime() - r.createdAt.getTime());

      if (waitTimes.length > 0) {
        averageWaitTime = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
      }

      const executionTimes = this.completed
        .filter((r) => r.startedAt && r.completedAt)
        .map((r) => r.completedAt!.getTime() - r.startedAt!.getTime());

      if (executionTimes.length > 0) {
        averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      }
    }

    return {
      pending,
      running,
      completed,
      failed,
      totalProcessed,
      averageWaitTime,
      averageExecutionTime,
    };
  }

  /**
   * Clear completed requests to free memory
   */
  clearCompleted(): void {
    this.completed = [];
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length + this.running.size;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && this.running.size === 0;
  }
}

// Global singleton instance
let globalQueue: RequestQueue | null = null;

export function getGlobalRequestQueue(): RequestQueue {
  if (!globalQueue) {
    globalQueue = new RequestQueue(2, 500); // Max 2 concurrent, 500ms between requests
  }
  return globalQueue;
}

export function resetGlobalRequestQueue(): void {
  globalQueue = null;
}
