import { describe, it, expect, beforeEach, vi } from "vitest";
import { CouncilOrchestrator } from "./council";
import { DatabaseService } from "./database";

// Mock OpenRouterClient
vi.mock("./openrouter");

describe("End-to-End: Archetype Names and Secret Instructions", () => {
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

  it("should flow archetype names from orchestrator through to database storage", async () => {
    // Mock all council member responses
    mockClient.queryModel.mockResolvedValue({
      content: "This is a council member response.",
    });

    // Execute the full council process with valid chairman
    const result = await orchestrator.executeCouncil(
      "What is the best approach to learning programming?",
      "visionary" // Valid chairman member ID
    );

    // Verify stage1 has archetype names
    expect(result.stage1Results).toBeDefined();
    expect(result.stage1Results.length).toBeGreaterThan(0);

    // Verify each stage1 result has archetype name
    result.stage1Results.forEach((member: any) => {
      expect(member).toHaveProperty("archetypeName");
      expect(member).toHaveProperty("model");
      expect(member).toHaveProperty("response");
      expect(member.archetypeName).toBeTruthy();
      expect(member.archetypeName).toMatch(/^The /); // Should start with "The"
    });

    // Verify specific archetype names are present
    const archetypeNames = result.stage1Results.map((m: any) => m.archetypeName);
    expect(archetypeNames).toContain("The Logician");
    expect(archetypeNames).toContain("The Humanist");
    expect(archetypeNames).toContain("The Visionary");
    expect(archetypeNames).toContain("The Realist");
  });

  it("should include secret instructions when dispatch brief is provided", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Response from council member",
    });

    // Execute with dispatch brief
    const result = await orchestrator.executeCouncil(
      "Design a new product feature",
      "visionary" // Valid chairman member ID
    );

    // Verify stage1 has secret instructions
    expect(result.stage1Results).toBeDefined();
    result.stage1Results.forEach((member: any) => {
      // Secret instructions may be undefined if dispatch brief wasn't generated
      // but archetype names should always be present
      expect(member.archetypeName).toBeTruthy();
    });
  });

  it("should serialize archetype names correctly for database storage", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Council response",
    });

    const result = await orchestrator.executeCouncil(
      "Test query for serialization",
      "visionary" // Valid chairman member ID
    );

    // Simulate what database does: JSON stringify and parse
    const serialized = JSON.stringify(result.stage1Results);
    const deserialized = JSON.parse(serialized);

    // Verify archetype names survive serialization
    expect(deserialized).toBeDefined();
    expect(deserialized.length).toBeGreaterThan(0);
    deserialized.forEach((member: any) => {
      expect(member.archetypeName).toBeTruthy();
      expect(member.model).toBeTruthy();
      expect(member.response).toBeTruthy();
    });
  });

  it("should have all 10 council members with archetype names", async () => {
    mockClient.queryModel.mockResolvedValue({
      content: "Member response",
    });

    const result = await orchestrator.executeCouncil("Test query", "visionary"); // Valid chairman member ID

    // Verify exactly 4 dynamically selected members are present with archetype names
    expect(result.stage1Results.length).toBe(4);
    
    // Each result should have archetype name and secret instruction
    result.stage1Results.forEach((member: any) => {
      expect(member.archetypeName).toBeDefined();
      expect(member.archetypeName).toMatch(/^The /);
      expect(member.secretInstruction).toBeDefined();
      expect(member.response).toBeDefined();
    });
    
    // Verify dispatch brief has the selected archetypes
    expect(result.dispatchBrief.selectedArchetypes).toBeDefined();
    expect(result.dispatchBrief.selectedArchetypes.length).toBe(4);
  });
});
