import { describe, it, expect, beforeEach } from "vitest";
import { RequestQueue } from "./request-queue";

describe("RequestQueue", () => {
  let queue: RequestQueue;

  beforeEach(() => {
    queue = new RequestQueue(2, 100);
  });

  it("should execute requests sequentially with concurrency limit", async () => {
    const executionOrder: number[] = [];

    const requests = Array.from({ length: 4 }, (_, i) => async () => {
      executionOrder.push(i);
      await new Promise((resolve) => setTimeout(resolve, 50));
      return `result-${i}`;
    });

    requests.forEach((req, i) => queue.enqueue(req, 0, `req-${i}`));

    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (queue.isEmpty()) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 10);
    });

    expect(executionOrder.length).toBe(4);
    expect(queue.getStats().completed).toBe(4);
  });

  it("should track queue statistics", async () => {
    const requests = Array.from({ length: 3 }, () => async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    requests.forEach((req, i) => queue.enqueue(req, 0, `req-${i}`));

    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (queue.isEmpty()) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 10);
    });

    const stats = queue.getStats();
    expect(stats.completed).toBe(3);
    expect(stats.failed).toBe(0);
    expect(stats.totalProcessed).toBe(3);
  });

  it("should handle request failures gracefully", async () => {
    const failingRequest = async () => {
      throw new Error("Request failed");
    };

    queue.enqueue(failingRequest, 0, "failing-req");

    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (queue.isEmpty()) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 10);
    });

    const stats = queue.getStats();
    expect(stats.failed).toBe(1);
    expect(stats.completed).toBe(0);
  });

  it("should enforce request delay between requests", async () => {
    const timestamps: number[] = [];
    const delay = 200;
    const queue2 = new RequestQueue(1, delay);

    const requests = Array.from({ length: 3 }, () => async () => {
      timestamps.push(Date.now());
    });

    requests.forEach((req, i) => queue2.enqueue(req, 0, `req-${i}`));

    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (queue2.isEmpty()) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 10);
    });

    for (let i = 1; i < timestamps.length; i++) {
      const timeBetween = timestamps[i] - timestamps[i - 1];
      expect(timeBetween).toBeGreaterThanOrEqual(delay - 50);
    }
  });

  it("should clear completed requests", async () => {
    const requests = Array.from({ length: 2 }, () => async () => {
      return "result";
    });

    requests.forEach((req, i) => queue.enqueue(req, 0, `req-${i}`));

    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (queue.isEmpty()) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 10);
    });

    const statsBefore = queue.getStats();
    expect(statsBefore.completed).toBe(2);

    queue.clearCompleted();

    const statsAfter = queue.getStats();
    expect(statsAfter.completed).toBe(0);
  });
});
