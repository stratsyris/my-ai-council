/**
 * OpenRouter API client for making LLM requests.
 */

export interface Message {
  role: string;
  content: string;
}

export interface ModelResponse {
  content: string;
  reasoning_details?: any;
}

export interface OpenRouterConfig {
  apiKey: string;
  apiUrl?: string;
}

const DEFAULT_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export class OpenRouterClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || DEFAULT_API_URL;
  }

  /**
   * Query a single model via OpenRouter API.
   */
  async queryModel(
    model: string,
    messages: Message[],
    timeout: number = 120000
  ): Promise<ModelResponse | null> {
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    // Set reasonable max_tokens limits to reduce credit usage
    // Dispatch phase needs less tokens (just JSON), council members need more for detailed responses
    let maxTokens = 2000; // Default for council responses
    
    // Check if this is a dispatch phase call (very short prompt)
    const isDispatchCall = messages[0]?.content?.includes("Chief Strategy Officer");
    if (isDispatchCall) {
      maxTokens = 500; // Dispatch only needs JSON output
    }

    const payload = {
      model,
      messages,
      max_tokens: maxTokens,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        const errorMsg = errorData?.error?.message || errorText;
        console.error(`Error querying model ${model}: ${response.status} ${errorMsg}`);
        return null;
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;

      if (!message) {
        console.error(`No message in response from model ${model}`);
        return null;
      }

      return {
        content: message.content || "",
        reasoning_details: message.reasoning_details,
      };
    } catch (error: any) {
      console.error(`Error querying model ${model}:`, error);
      return null;
    }
  }

  /**
   * Query multiple models in parallel.
   */
  async queryModelsParallel(
    models: string[],
    messages: Message[]
  ): Promise<Record<string, ModelResponse | null>> {
    const tasks = models.map((model) => this.queryModel(model, messages));
    const responses = await Promise.all(tasks);

    const result: Record<string, ModelResponse | null> = {};
    models.forEach((model, index) => {
      result[model] = responses[index];
    });

    return result;
  }
}
