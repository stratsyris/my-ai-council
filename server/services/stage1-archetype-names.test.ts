import { describe, it, expect, beforeEach, vi } from "vitest";
import { CouncilOrchestrator, Stage1Result, DispatchBrief } from "./council";

// Mock OpenRouterClient
vi.mock("./openrouter");

describe("CouncilOrchestrator - Stage 1 with Archetype Names", () => {
  let orchestrator: CouncilOrchestrator;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      queryModel: vi.fn(),
    };
    orchestrator = new CouncilOrchestrator(mockClient, {
      councilModels: [],
      chairmanModel: "google/gemini-3-pro-preview",
    });
  });

  it("should include archetypeName in Stage 1 results", async () => {
    // Mock responses for all council members
    mockClient.queryModel.mockResolvedValue({
      content: "This is a test response from a council member.",
    });

    const dispatchBrief: DispatchBrief = {
      task_category: "Technical/Code",
      dispatch_strategy: "Focus on code quality",
      assignments: {
        Logician: "Check for edge cases",
        Humanist: "Ensure readability",
        Visionary: "Suggest improvements",
        Realist: "Focus on efficiency",
      },
    };

    const results = await orchestrator.stage1CollectResponses(
      "Write a function to sort an array",
      undefined,
      dispatchBrief
    );

    // Verify all results have archetypeName
    expect(results.length).toBeGreaterThan(0);
    
    results.forEach((result: Stage1Result) => {
      expect(result).toHaveProperty("archetypeName");
      expect(result).toHaveProperty("secretInstruction");
      expect(result.archetypeName).toBeTruthy();
      expect(result.response).toBeTruthy();
    });

    // Verify specific archetype names are present
    const archetypeNames = results.map((r: Stage1Result) => r.archetypeName);
    expect(archetypeNames).toContain("The Logician");
    expect(archetypeNames).toContain("The Humanist");
    expect(archetypeNames).toContain("The Visionary");
    expect(archetypeNames).toContain("The Realist");
  });

  it("should include secret instructions from dispatch brief", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Response from council member",
    });

    const dispatchBrief: DispatchBrief = {
      task_category: "Creative/Writing",
      dispatch_strategy: "Balance creativity with coherence",
      assignments: {
        Logician: "Ensure narrative consistency",
        Humanist: "Focus on emotional resonance",
        Visionary: "Suggest creative metaphors",
        Realist: "Keep story grounded",
      },
    };

    const results = await orchestrator.stage1CollectResponses(
      "Help me write a story",
      undefined,
      dispatchBrief
    );

    // Verify secret instructions are present
    const logicianResult = results.find((r: Stage1Result) => r.memberId === "logician");
    expect(logicianResult?.secretInstruction).toBe("Ensure narrative consistency");

    const humanistResult = results.find((r: Stage1Result) => r.memberId === "humanist");
    expect(humanistResult?.secretInstruction).toBe("Focus on emotional resonance");

    const visionaryResult = results.find((r: Stage1Result) => r.memberId === "visionary");
    expect(visionaryResult?.secretInstruction).toBe("Suggest creative metaphors");

    const realistResult = results.find((r: Stage1Result) => r.memberId === "realist");
    expect(realistResult?.secretInstruction).toBe("Keep story grounded");
  });

  it("should handle missing dispatch brief gracefully", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Response from council member",
    });

    // Call without dispatch brief
    const results = await orchestrator.stage1CollectResponses(
      "Test query"
    );

    // Should still have archetypeNames but no secretInstructions
    expect(results.length).toBeGreaterThan(0);
    results.forEach((result: Stage1Result) => {
      expect(result.archetypeName).toBeTruthy();
      expect(result.secretInstruction).toBeUndefined();
    });
  });

  it("should preserve model IDs in Stage 1 results", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Response",
    });

    const results = await orchestrator.stage1CollectResponses("Test");

    // Verify model IDs are preserved
    expect(results.length).toBeGreaterThan(0);
    const models = results.map((r: Stage1Result) => r.model);
    models.forEach(model => {
      expect(model).toBeTruthy();
    });
  });
});
