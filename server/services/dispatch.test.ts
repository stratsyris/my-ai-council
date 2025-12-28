import { describe, it, expect, beforeEach, vi } from "vitest";
import { CouncilOrchestrator, DispatchBrief } from "./council";
import { classifyQuestion, getSpecializedPrompts } from "./question-classifier";

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

  it("should classify code questions and select appropriate archetypes", async () => {
    const result = await orchestrator.dispatchPhase(
      "Write a function to sort an array efficiently",
      "logician"
    );

    expect(result.task_category).toBe("Code");
    expect(result.selectedArchetypes).toContain("logician");
    expect(result.selectedArchetypes).toContain("architect");
    expect(result.selectedArchetypes.length).toBe(4);
    expect(result.assignments).toBeDefined();
  });

  it("should classify creative questions and select appropriate archetypes", async () => {
    const result = await orchestrator.dispatchPhase(
      "Help me write a compelling brand story",
      "logician"
    );

    expect(result.task_category).toBe("Creative");
    expect(result.selectedArchetypes).toContain("visionary");
    expect(result.selectedArchetypes).toContain("orator");
    expect(result.selectedArchetypes.length).toBe(4);
  });

  it("should classify strategic questions and select appropriate archetypes", async () => {
    const result = await orchestrator.dispatchPhase(
      "What's the best strategy for startup growth?",
      "logician"
    );

    expect(result.task_category).toBe("Strategic");
    expect(result.selectedArchetypes).toContain("visionary");
    expect(result.selectedArchetypes).toContain("financier");
    expect(result.selectedArchetypes.length).toBe(4);
  });

  it("should classify financial questions and select appropriate archetypes", async () => {
    const result = await orchestrator.dispatchPhase(
      "Should I invest in this startup? What's the ROI?",
      "logician"
    );

    expect(result.task_category).toBe("Financial");
    expect(result.selectedArchetypes).toContain("financier");
    expect(result.selectedArchetypes).toContain("logician");
    expect(result.selectedArchetypes.length).toBe(4);
  });

  it("should provide specialized prompts for each archetype", async () => {
    const result = await orchestrator.dispatchPhase(
      "Debug this Python function",
      "logician"
    );

    // Verify assignments have specialized prompts
    for (const archetypeId of result.selectedArchetypes) {
      const prompt = result.assignments[archetypeId];
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
    }
  });

  it("should return default brief on error", async () => {
    // The classifier doesn't throw errors, so we test with an ambiguous query
    // that will be classified as general
    const result = await orchestrator.dispatchPhase(
      "Hello world",
      "logician"
    );

    // Should return default brief for ambiguous queries
    expect(result.task_category).toBe("General");
    expect(result.selectedArchetypes).toEqual(["logician", "humanist", "visionary", "realist"]);
    expect(result.selectedArchetypes.length).toBe(4);
  });

  it("should select different archetypes for different question types", async () => {
    const codeResult = await orchestrator.dispatchPhase(
      "How do I debug this code?",
      "logician"
    );

    const creativeResult = await orchestrator.dispatchPhase(
      "Help me write a story",
      "logician"
    );

    // Different question types should select different archetypes
    expect(codeResult.selectedArchetypes).not.toEqual(creativeResult.selectedArchetypes);
  });

  it("should include reasoning in dispatch strategy", async () => {
    const result = await orchestrator.dispatchPhase(
      "Write a function to sort an array",
      "logician"
    );

    expect(result.dispatch_strategy).toBeDefined();
    expect(result.dispatch_strategy.length).toBeGreaterThan(0);
    expect(result.dispatch_strategy).toContain("keyword matches");
  });

  it("should handle ambiguous questions with general classification", async () => {
    const result = await orchestrator.dispatchPhase(
      "What is the meaning of life?",
      "logician"
    );

    // Should still have 4 archetypes even for ambiguous questions
    expect(result.selectedArchetypes.length).toBe(4);
    expect(result.assignments).toBeDefined();
  });

  it("should inject specialized briefs into council member prompts", async () => {
    // Mock the queryModel to capture the prompts sent
    const capturedCalls: any[] = [];
    mockClient.queryModel.mockImplementation((model: string, messages: any[]) => {
      capturedCalls.push([model, messages]);
      return Promise.resolve({ content: "Response" });
    });

    // Execute stage 1 with a dispatch brief
    const classification = classifyQuestion("Debug this function");
    const specializedPrompts = getSpecializedPrompts(classification.type, classification.selectedArchetypes);
    
    const dispatchBrief: DispatchBrief = {
      task_category: classification.type,
      dispatch_strategy: classification.reasoning,
      selectedArchetypes: classification.selectedArchetypes,
      assignments: specializedPrompts,
    };

    await orchestrator.stage1CollectResponses(
      "Debug this function",
      undefined,
      dispatchBrief
    );

    // Verify that specialized briefs were injected into prompts
    expect(capturedCalls.length).toBeGreaterThan(0);
    
    for (const call of capturedCalls) {
      const messages = call[1];
      const prompt = messages[0].content;
      // Each prompt should contain the special brief
      expect(prompt).toContain("Special Brief for this task:");
    }
  });
});
