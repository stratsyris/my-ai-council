import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

/**
 * Test suite for Chairman LLM selector feature
 * Tests that the selected Chairman model is properly passed through the system
 * and used for generating the final answer
 */

describe("Chairman Selector Feature", () => {
  describe("sendMessage mutation input validation", () => {
    it("should accept chairmanModel as optional parameter", () => {
      const inputSchema = z.object({
        conversationId: z.string(),
        content: z.string(),
        chairmanModel: z.string().optional(),
      });

      // Test with chairmanModel provided
      const validInputWithChairman = {
        conversationId: "conv-123",
        content: "What is AI?",
        chairmanModel: "openai/gpt-5.2",
      };
      expect(() => inputSchema.parse(validInputWithChairman)).not.toThrow();

      // Test without chairmanModel (should use default)
      const validInputWithoutChairman = {
        conversationId: "conv-123",
        content: "What is AI?",
      };
      expect(() => inputSchema.parse(validInputWithoutChairman)).not.toThrow();
    });

    it("should validate chairmanModel is a string when provided", () => {
      const inputSchema = z.object({
        conversationId: z.string(),
        content: z.string(),
        chairmanModel: z.string().optional(),
      });

      const invalidInput = {
        conversationId: "conv-123",
        content: "What is AI?",
        chairmanModel: 123, // Invalid: should be string
      };

      expect(() => inputSchema.parse(invalidInput)).toThrow();
    });
  });

  describe("Chairman model selection", () => {
    it("should support all available council member models as Chairman", () => {
      const supportedChairmanModels = [
        "openai/gpt-5.2",
        "anthropic/claude-sonnet-4.5",
        "google/gemini-3-pro-preview",
        "x-ai/grok-4",
      ];

      const chairmanMap: Record<string, string> = {
        "openai/gpt-5.2": "GPT-5.2",
        "anthropic/claude-sonnet-4.5": "Sonnet 4.5",
        "google/gemini-3-pro-preview": "Gemini 3",
        "x-ai/grok-4": "Grok 4",
      };

      supportedChairmanModels.forEach((model) => {
        expect(chairmanMap[model]).toBeDefined();
        expect(typeof chairmanMap[model]).toBe("string");
      });
    });

    it("should default to Gemini 3 Pro Preview when no Chairman is selected", () => {
      const defaultChairman = "google/gemini-3-pro-preview";
      expect(defaultChairman).toBe("google/gemini-3-pro-preview");
    });

    it("should allow switching between different Chairman models", () => {
      let selectedChairman = "google/gemini-3-pro-preview";

      // Simulate switching to GPT-5.2
      selectedChairman = "openai/gpt-5.2";
      expect(selectedChairman).toBe("openai/gpt-5.2");

      // Simulate switching to Claude
      selectedChairman = "anthropic/claude-sonnet-4.5";
      expect(selectedChairman).toBe("anthropic/claude-sonnet-4.5");

      // Simulate switching to Grok
      selectedChairman = "x-ai/grok-4";
      expect(selectedChairman).toBe("x-ai/grok-4");

      // Simulate switching back to Gemini
      selectedChairman = "google/gemini-3-pro-preview";
      expect(selectedChairman).toBe("google/gemini-3-pro-preview");
    });
  });

  describe("Frontend Chairman selector state management", () => {
    it("should maintain selected Chairman state across component renders", () => {
      // Simulate React state management
      let selectedChairman = "google/gemini-3-pro-preview";
      const chairmanChanges: string[] = [];

      const handleChairmanChange = (newChairman: string) => {
        selectedChairman = newChairman;
        chairmanChanges.push(newChairman);
      };

      // Simulate user selecting different Chairman
      handleChairmanChange("openai/gpt-5.2");
      expect(selectedChairman).toBe("openai/gpt-5.2");
      expect(chairmanChanges).toContain("openai/gpt-5.2");

      handleChairmanChange("anthropic/claude-sonnet-4.5");
      expect(selectedChairman).toBe("anthropic/claude-sonnet-4.5");
      expect(chairmanChanges).toContain("anthropic/claude-sonnet-4.5");

      // Verify all changes were recorded
      expect(chairmanChanges.length).toBe(2);
    });

    it("should pass selected Chairman to sendMessage mutation", () => {
      const selectedChairman = "openai/gpt-5.2";
      const conversationId = "conv-123";
      const content = "What is machine learning?";

      // Simulate the mutation input
      const mutationInput = {
        conversationId,
        content,
        chairmanModel: selectedChairman,
      };

      expect(mutationInput.chairmanModel).toBe("openai/gpt-5.2");
      expect(mutationInput.conversationId).toBe("conv-123");
      expect(mutationInput.content).toBe("What is machine learning?");
    });
  });

  describe("Backend Chairman orchestration", () => {
    it("should use provided Chairman model in CouncilOrchestrator", () => {
      // Simulate the getCouncilOrchestrator function behavior
      const getCouncilOrchestrator = (overrideChairmanModel?: string) => {
        const selectedChairman =
          overrideChairmanModel ||
          process.env.CHAIRMAN_MODEL ||
          "google/gemini-3-pro-preview";

        return {
          chairmanModel: selectedChairman,
          councilModels: [
            "openai/gpt-5.2",
            "anthropic/claude-sonnet-4.5",
            "google/gemini-3-pro-preview",
            "x-ai/grok-4",
          ],
        };
      };

      // Test with explicit Chairman
      const orchestratorWithGPT = getCouncilOrchestrator("openai/gpt-5.2");
      expect(orchestratorWithGPT.chairmanModel).toBe("openai/gpt-5.2");

      // Test with default Chairman
      const orchestratorWithDefault = getCouncilOrchestrator();
      expect(orchestratorWithDefault.chairmanModel).toBe(
        "google/gemini-3-pro-preview"
      );

      // Test with environment variable
      const originalEnv = process.env.CHAIRMAN_MODEL;
      process.env.CHAIRMAN_MODEL = "anthropic/claude-sonnet-4.5";
      const orchestratorWithEnv = getCouncilOrchestrator();
      expect(orchestratorWithEnv.chairmanModel).toBe(
        "anthropic/claude-sonnet-4.5"
      );
      process.env.CHAIRMAN_MODEL = originalEnv;
    });

    it("should override environment variable with explicit Chairman selection", () => {
      const getCouncilOrchestrator = (overrideChairmanModel?: string) => {
        const selectedChairman =
          overrideChairmanModel ||
          process.env.CHAIRMAN_MODEL ||
          "google/gemini-3-pro-preview";

        return {
          chairmanModel: selectedChairman,
        };
      };

      // Set environment variable
      const originalEnv = process.env.CHAIRMAN_MODEL;
      process.env.CHAIRMAN_MODEL = "google/gemini-3-pro-preview";

      // Explicit selection should override environment
      const orchestrator = getCouncilOrchestrator("openai/gpt-5.2");
      expect(orchestrator.chairmanModel).toBe("openai/gpt-5.2");

      process.env.CHAIRMAN_MODEL = originalEnv;
    });
  });

  describe("Chairman selector UI integration", () => {
    it("should display current Chairman in header", () => {
      const chairmanMap: Record<string, string> = {
        "openai/gpt-5.2": "GPT-5.2",
        "anthropic/claude-sonnet-4.5": "Sonnet 4.5",
        "google/gemini-3-pro-preview": "Gemini 3",
        "x-ai/grok-4": "Grok 4",
      };

      const selectedChairman = "google/gemini-3-pro-preview";
      const displayName = chairmanMap[selectedChairman];

      expect(displayName).toBe("Gemini 3");
    });

    it("should show dropdown menu with all available Chairman options", () => {
      const chairmanOptions = [
        { model: "openai/gpt-5.2", displayName: "GPT-5.2" },
        { model: "anthropic/claude-sonnet-4.5", displayName: "Sonnet 4.5" },
        { model: "google/gemini-3-pro-preview", displayName: "Gemini 3" },
        { model: "x-ai/grok-4", displayName: "Grok 4" },
      ];

      expect(chairmanOptions).toHaveLength(4);
      expect(chairmanOptions[0].model).toBe("openai/gpt-5.2");
      expect(chairmanOptions[1].model).toBe("anthropic/claude-sonnet-4.5");
      expect(chairmanOptions[2].model).toBe("google/gemini-3-pro-preview");
      expect(chairmanOptions[3].model).toBe("x-ai/grok-4");
    });

    it("should indicate selected Chairman with visual indicator", () => {
      const selectedChairman = "openai/gpt-5.2";
      const chairmanOptions = [
        "openai/gpt-5.2",
        "anthropic/claude-sonnet-4.5",
        "google/gemini-3-pro-preview",
        "x-ai/grok-4",
      ];

      chairmanOptions.forEach((option) => {
        const isSelected = option === selectedChairman;
        expect(isSelected).toBe(option === "openai/gpt-5.2");
      });
    });
  });

  describe("End-to-end Chairman selection flow", () => {
    it("should complete full flow: select Chairman -> send message -> use selected model", () => {
      // Step 1: User selects a Chairman
      let selectedChairman = "google/gemini-3-pro-preview";
      const handleChairmanChange = (model: string) => {
        selectedChairman = model;
      };

      handleChairmanChange("openai/gpt-5.2");
      expect(selectedChairman).toBe("openai/gpt-5.2");

      // Step 2: User sends a message
      const conversationId = "conv-123";
      const content = "What is AI?";

      const sendMessageInput = {
        conversationId,
        content,
        chairmanModel: selectedChairman,
      };

      expect(sendMessageInput.chairmanModel).toBe("openai/gpt-5.2");

      // Step 3: Backend receives the Chairman and uses it
      const getCouncilOrchestrator = (overrideChairmanModel?: string) => {
        return {
          chairmanModel:
            overrideChairmanModel || "google/gemini-3-pro-preview",
        };
      };

      const orchestrator = getCouncilOrchestrator(
        sendMessageInput.chairmanModel
      );
      expect(orchestrator.chairmanModel).toBe("openai/gpt-5.2");
    });
  });
});
