import { describe, it, expect, beforeAll } from "vitest";
import { OpenRouterClient } from "./openrouter";

describe("OpenRouterClient", () => {
  let client: OpenRouterClient;
  const hasApiKey = !!process.env.OPENROUTER_API_KEY;

  beforeAll(() => {
    if (hasApiKey) {
      client = new OpenRouterClient({
        apiKey: process.env.OPENROUTER_API_KEY!,
      });
    }
  });

  it("should be instantiable", () => {
    const testClient = new OpenRouterClient({
      apiKey: "test-key",
    });
    expect(testClient).toBeDefined();
  });

  it.skipIf(!hasApiKey)("should query a model successfully", async () => {
    const messages = [
      { role: "user", content: "Say hello in exactly 3 words" },
    ];

    const response = await client.queryModel(
      "google/gemini-2.5-flash",
      messages,
      30000
    );

    expect(response).not.toBeNull();
    expect(response?.content).toBeDefined();
    expect(typeof response?.content).toBe("string");
    expect(response!.content.length).toBeGreaterThan(0);
  }, 60000);

  it.skipIf(!hasApiKey)("should handle invalid model gracefully", async () => {
    const messages = [
      { role: "user", content: "Test" },
    ];

    const response = await client.queryModel(
      "invalid/model-that-does-not-exist",
      messages,
      10000
    );

    // Should return null for invalid models
    expect(response).toBeNull();
  }, 30000);

  it.skipIf(!hasApiKey)("should query multiple models in parallel", async () => {
    const messages = [
      { role: "user", content: "Say hello" },
    ];

    const models = [
      "google/gemini-2.5-flash",
      "openai/gpt-4o-mini",
    ];

    const responses = await client.queryModelsParallel(models, messages);

    expect(responses).toBeDefined();
    expect(Object.keys(responses).length).toBe(models.length);
    
    // At least one model should respond successfully
    const successfulResponses = Object.values(responses).filter(r => r !== null);
    expect(successfulResponses.length).toBeGreaterThan(0);
  }, 60000);
});
