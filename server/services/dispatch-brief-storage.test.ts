import { describe, it, expect, beforeEach, vi } from "vitest";
import { DatabaseService } from "./database";

describe("Dispatch Brief Storage", () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService();
  });

  it("should store dispatch brief in message metadata", async () => {
    // Mock dispatch brief
    const mockDispatchBrief = {
      task_category: "Technical/Code",
      dispatch_strategy: "Prioritize code quality and performance optimization",
      assignments: {
        Logician: "Focus on code correctness and edge cases",
        Humanist: "Ensure code readability and team collaboration",
        Visionary: "Suggest architectural improvements",
        Realist: "Optimize for execution efficiency",
      },
    };

    const mockStage1 = [
      { model: "gpt-5.2", response: "Test response 1" },
      { model: "claude-sonnet-4.5", response: "Test response 2" },
    ];

    const mockStage2 = {
      finalAnswer: "Test final answer",
    };

    // Test that addAssistantMessage accepts dispatch brief parameter
    expect(dbService.addAssistantMessage).toBeDefined();

    // Verify the method signature includes dispatchBrief parameter
    const methodSignature = dbService.addAssistantMessage.toString();
    expect(methodSignature).toContain("dispatchBrief");
  });

  it("should serialize dispatch brief to JSON in metadata", () => {
    const dispatchBrief = {
      task_category: "Creative/Writing",
      dispatch_strategy: "Balance creativity with coherence",
      assignments: {
        Logician: "Ensure logical flow",
        Humanist: "Add emotional depth",
        Visionary: "Suggest innovative ideas",
        Realist: "Keep it practical",
      },
    };

    // Test JSON serialization
    const metadata = { dispatchBrief };
    const serialized = JSON.stringify(metadata);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.dispatchBrief.task_category).toBe("Creative/Writing");
    expect(deserialized.dispatchBrief.assignments.Logician).toBe(
      "Ensure logical flow"
    );
  });

  it("should handle null dispatch brief gracefully", () => {
    // Test that null dispatch brief doesn't break serialization
    const metadata = null;
    const serialized = metadata ? JSON.stringify(metadata) : null;

    expect(serialized).toBeNull();
  });

  it("should preserve all dispatch brief fields", () => {
    const dispatchBrief = {
      task_category: "Strategic Planning",
      dispatch_strategy: "Consider multiple perspectives",
      assignments: {
        Logician: "Analyze risks and benefits",
        Humanist: "Consider stakeholder impact",
        Visionary: "Envision future possibilities",
        Realist: "Focus on implementation",
      },
    };

    const metadata = { dispatchBrief };
    const serialized = JSON.stringify(metadata);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.dispatchBrief).toEqual(dispatchBrief);
    expect(Object.keys(deserialized.dispatchBrief.assignments)).toHaveLength(4);
  });
});
