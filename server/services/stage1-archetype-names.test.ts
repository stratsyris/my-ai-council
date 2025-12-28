import { describe, it, expect, beforeEach, vi } from "vitest";
import { CouncilOrchestrator, Stage1Result, DispatchBrief } from "./council";
import { classifyQuestion, getSpecializedPrompts } from "./question-classifier";

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

    // Use dynamic dispatch to get real archetype selection
    const classification = classifyQuestion("Write a function to sort an array");
    const specializedPrompts = getSpecializedPrompts(classification.type, classification.selectedArchetypes);
    
    const dispatchBrief: DispatchBrief = {
      task_category: classification.type.charAt(0).toUpperCase() + classification.type.slice(1),
      dispatch_strategy: classification.reasoning,
      selectedArchetypes: classification.selectedArchetypes,
      assignments: specializedPrompts,
    };

    const results = await orchestrator.stage1CollectResponses(
      "Write a function to sort an array",
      undefined,
      dispatchBrief
    );

    // Verify all results have archetypeName
    expect(results.length).toBe(4);
    results.forEach((result: Stage1Result) => {
      expect(result.archetypeName).toBeTruthy();
      expect(result.archetypeName).toMatch(/^The /);
      expect(result.secretInstruction).toBeDefined();
    });
  });

  it("should include secret instructions from dispatch brief", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Response from council member",
    });

    // Use dynamic dispatch for creative writing
    const classification = classifyQuestion("Help me write a story");
    const specializedPrompts = getSpecializedPrompts(classification.type, classification.selectedArchetypes);
    
    const dispatchBrief: DispatchBrief = {
      task_category: classification.type.charAt(0).toUpperCase() + classification.type.slice(1),
      dispatch_strategy: classification.reasoning,
      selectedArchetypes: classification.selectedArchetypes,
      assignments: specializedPrompts,
    };

    const results = await orchestrator.stage1CollectResponses(
      "Help me write a story",
      undefined,
      dispatchBrief
    );

    // Verify secret instructions are present for all selected archetypes
    expect(results.length).toBe(4);
    
    results.forEach((result) => {
      expect(result.secretInstruction).toBeDefined();
      expect(result.secretInstruction?.length).toBeGreaterThan(0);
      expect(result.archetypeName).toBeDefined();
      expect(result.archetypeName).toMatch(/^The /);
    });
    
    // Verify the selected archetypes match what was in dispatch brief
    const resultMemberIds = results.map(r => r.memberId).sort();
    const dispatchMemberIds = dispatchBrief.selectedArchetypes.sort();
    expect(resultMemberIds).toEqual(dispatchMemberIds);
  });

  it("should handle missing dispatch brief gracefully", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Response from council member",
    });

    // Call without dispatch brief - should query all 10 members
    const results = await orchestrator.stage1CollectResponses(
      "Test query"
    );

    // Should have all 10 members with archetypeNames but no secretInstructions
    expect(results.length).toBe(10);
    results.forEach((result: Stage1Result) => {
      expect(result.archetypeName).toBeTruthy();
      expect(result.archetypeName).toMatch(/^The /);
      expect(result.secretInstruction).toBeUndefined();
    });
  });

  it("should preserve model IDs in Stage 1 results", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Response",
    });

    const results = await orchestrator.stage1CollectResponses("Test");

    // Verify model IDs are preserved for all 10 members (no dispatch brief)
    expect(results.length).toBe(10);
    const models = results.map((r: Stage1Result) => r.model);
    models.forEach(model => {
      expect(model).toBeTruthy();
    });
  });
});
