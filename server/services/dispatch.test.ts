import { describe, it, expect, beforeEach, vi } from "vitest";
import { CouncilOrchestrator, DispatchBrief } from "./council";
import { OpenRouterClient } from "./openrouter";

// Mock OpenRouterClient
vi.mock("./openrouter");

describe("CouncilOrchestrator - Dispatch Phase", () => {
  let orchestrator: CouncilOrchestrator;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      queryModel: vi.fn(),
    };
    orchestrator = new CouncilOrchestrator(mockClient, {
      councilModels: [],
      chairmanModel: "openai/gpt-5.2",
    });
  });

  it("should generate valid dispatch brief for code task", async () => {
    const codeBrief = {
      task_category: "Technical/Code",
      dispatch_strategy: "Prioritize code quality, performance, and maintainability",
      assignments: {
        Logician: "Focus on code correctness, edge cases, and potential bugs",
        Humanist: "Ensure code readability and maintainability for team collaboration",
        Visionary: "Suggest architectural improvements and design patterns",
        Realist: "Optimize for performance and execution efficiency",
      },
    };

    mockClient.queryModel.mockResolvedValue({
      content: JSON.stringify(codeBrief),
    });

    const result = await orchestrator.dispatchPhase(
      "Write a function to sort an array efficiently",
      "logician"
    );

    expect(result.task_category).toBe("Technical/Code");
    expect(result.assignments.Logician).toContain("correctness");
    expect(result.assignments.Realist).toContain("performance");
  });

  it("should generate valid dispatch brief for creative task", async () => {
    const creativeBrief = {
      task_category: "Creative/Writing",
      dispatch_strategy: "Balance creativity with coherence and emotional impact",
      assignments: {
        Logician: "Ensure narrative consistency and logical plot progression",
        Humanist: "Focus on emotional resonance and character development",
        Visionary: "Suggest creative metaphors and unique storytelling approaches",
        Realist: "Keep story grounded in realistic details and practical outcomes",
      },
    };

    mockClient.queryModel.mockResolvedValue({
      content: JSON.stringify(creativeBrief),
    });

    const result = await orchestrator.dispatchPhase(
      "Help me write a short story about time travel",
      "visionary"
    );

    expect(result.task_category).toBe("Creative/Writing");
    expect(result.assignments.Visionary).toContain("metaphors");
    expect(result.assignments.Humanist).toContain("emotional");
  });

  it("should generate valid dispatch brief for emotional support task", async () => {
    const emotionalBrief = {
      task_category: "Emotional/Support",
      dispatch_strategy: "Provide empathetic support while offering practical solutions",
      assignments: {
        Logician: "Identify root causes and potential solutions logically",
        Humanist: "Provide validation and empathetic support",
        Visionary: "Suggest creative coping strategies and new perspectives",
        Realist: "Offer practical, immediate action steps",
      },
    };

    mockClient.queryModel.mockResolvedValue({
      content: JSON.stringify(emotionalBrief),
    });

    const result = await orchestrator.dispatchPhase(
      "I'm feeling overwhelmed with work",
      "humanist"
    );

    expect(result.task_category).toBe("Emotional/Support");
    expect(result.assignments.Humanist).toContain("validation");
    expect(result.assignments.Realist).toContain("practical");
  });

  it("should return default brief on JSON parse error", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Invalid JSON {{{",
    });

    const result = await orchestrator.dispatchPhase(
      "Some query",
      "logician"
    );

    expect(result.task_category).toBe("General");
    expect(result.dispatch_strategy).toContain("standard");
    expect(result.assignments.Logician).toBeDefined();
    expect(result.assignments.Humanist).toBeDefined();
    expect(result.assignments.Visionary).toBeDefined();
    expect(result.assignments.Realist).toBeDefined();
  });

  it("should return default brief on API error", async () => {
    mockClient.queryModel.mockRejectedValue(
      new Error("API Error")
    );

    const result = await orchestrator.dispatchPhase(
      "Some query",
      "logician"
    );

    expect(result.task_category).toBe("General");
    expect(result.dispatch_strategy).toContain("standard");
  });

  it("should inject dispatch briefs into council member prompts", async () => {
    const dispatchBrief: DispatchBrief = {
      task_category: "Technical/Code",
      dispatch_strategy: "Optimize for performance",
      assignments: {
        Logician: "Check for edge cases",
        Humanist: "Ensure readability",
        Visionary: "Suggest improvements",
        Realist: "Focus on efficiency",
      },
    };

    // Mock the stage1 response
    mockClient.queryModel.mockResolvedValue({
      content: "Test response",
    });

    const results = await orchestrator.stage1CollectResponses(
      "Write a sorting function",
      undefined,
      dispatchBrief
    );

    // Verify that queryModel was called (Chairman + 4 council members)
    // With dynamic dispatch: 1 call for Chairman analysis + 4 calls for council responses
    expect(mockClient.queryModel.mock.calls.length).toBeGreaterThanOrEqual(4);

    // Check that the prompts contain the dispatch briefs
    const calls = mockClient.queryModel.mock.calls;
    for (const call of calls) {
      const messages = call[1];
      const prompt = messages[0].content;
      expect(prompt).toContain("Special Brief for this task:");
    }
  });
});
