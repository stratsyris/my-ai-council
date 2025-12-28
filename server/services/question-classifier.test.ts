import { describe, it, expect } from "vitest";
import {
  classifyQuestion,
  getSpecializedPrompts,
  getArchetypeDisplayNames,
} from "./question-classifier";

describe("Question Classifier", () => {
  describe("classifyQuestion", () => {
    it("should classify code questions correctly", () => {
      const result = classifyQuestion("How do I debug this Python function?");
      expect(result.type).toBe("code");
      expect(result.selectedArchetypes).toContain("logician");
      expect(result.selectedArchetypes).toContain("architect");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should classify creative questions correctly", () => {
      const result = classifyQuestion("Help me write a compelling brand story for my startup");
      expect(result.type).toBe("creative");
      expect(result.selectedArchetypes).toContain("visionary");
      expect(result.selectedArchetypes).toContain("orator");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should classify strategic questions correctly", () => {
      const result = classifyQuestion("What's the best strategy for startup growth?");
      expect(result.type).toBe("strategic");
      expect(result.selectedArchetypes).toContain("visionary");
      expect(result.selectedArchetypes).toContain("financier");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should classify financial questions correctly", () => {
      const result = classifyQuestion("Should I invest in this startup? What's the ROI?");
      expect(result.type).toBe("financial");
      expect(result.selectedArchetypes).toContain("financier");
      expect(result.selectedArchetypes).toContain("logician");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should classify ethical questions correctly", () => {
      const result = classifyQuestion("Is it ethical to use this data collection method?");
      expect(result.type).toBe("ethical");
      expect(result.selectedArchetypes).toContain("ethicist");
      expect(result.selectedArchetypes).toContain("humanist");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should classify technical questions correctly", () => {
      const result = classifyQuestion("How should I design the architecture for a scalable microservices system?");
      expect(result.type).toBe("technical");
      expect(result.selectedArchetypes).toContain("architect");
      expect(result.selectedArchetypes).toContain("logician");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should classify analytical questions correctly", () => {
      const result = classifyQuestion("Analyze this data and find the key trends");
      expect(result.type).toBe("analytical");
      expect(result.selectedArchetypes).toContain("logician");
      expect(result.selectedArchetypes).toContain("skeptic");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should classify practical questions correctly", () => {
      const result = classifyQuestion("How do I quickly implement this feature?");
      expect(result.type).toBe("practical");
      expect(result.selectedArchetypes).toContain("pragmatist");
      expect(result.selectedArchetypes).toContain("realist");
      expect(result.selectedArchetypes.length).toBe(4);
    });

    it("should have confidence score between 0 and 1", () => {
      const result = classifyQuestion("What should I do?");
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should return different archetypes for different question types", () => {
      const codeResult = classifyQuestion("Write a function to sort an array");
      const creativeResult = classifyQuestion("Write a creative story about AI");
      
      expect(codeResult.selectedArchetypes).not.toEqual(creativeResult.selectedArchetypes);
    });

    it("should default to general for ambiguous questions", () => {
      const result = classifyQuestion("What is the meaning of life?");
      // Could be general or another type, but should have 4 archetypes
      expect(result.selectedArchetypes.length).toBe(4);
    });
  });

  describe("getSpecializedPrompts", () => {
    it("should return prompts for all selected archetypes", () => {
      const archetypes = ["logician", "architect", "pragmatist", "skeptic"];
      const prompts = getSpecializedPrompts("code", archetypes);
      
      expect(prompts["logician"]).toBeDefined();
      expect(prompts["architect"]).toBeDefined();
      expect(prompts["pragmatist"]).toBeDefined();
      expect(prompts["skeptic"]).toBeDefined();
    });

    it("should return different prompts for different question types", () => {
      const codeArchetypes = ["logician", "architect", "pragmatist", "skeptic"];
      const creativeArchetypes = ["visionary", "orator", "humanist", "pragmatist"];
      
      const codePrompts = getSpecializedPrompts("code", codeArchetypes);
      const creativePrompts = getSpecializedPrompts("creative", creativeArchetypes);
      
      // Logician's prompt should be different for code vs creative
      expect(codePrompts["logician"]).not.toEqual(creativePrompts["visionary"]);
    });

    it("should include specialized instructions for each archetype", () => {
      const prompts = getSpecializedPrompts("code", ["logician", "architect", "pragmatist", "skeptic"]);
      
      expect(prompts["logician"]).toContain("technical");
      expect(prompts["architect"]).toContain("scalability");
      expect(prompts["pragmatist"]).toContain("efficient");
      expect(prompts["skeptic"]).toContain("wrong");
    });

    it("should handle financial question prompts", () => {
      const prompts = getSpecializedPrompts("financial", ["financier", "logician", "skeptic", "pragmatist"]);
      
      expect(prompts["financier"]).toContain("ROI");
      expect(prompts["logician"]).toContain("numbers");
      expect(prompts["skeptic"]).toContain("wrong");
    });

    it("should handle ethical question prompts", () => {
      const prompts = getSpecializedPrompts("ethical", ["ethicist", "humanist", "logician", "visionary"]);
      
      expect(prompts["ethicist"]).toContain("principled");
      expect(prompts["humanist"]).toContain("hurt");
      expect(prompts["logician"]).toContain("evidence");
    });
  });

  describe("getArchetypeDisplayNames", () => {
    it("should convert archetype IDs to display names", () => {
      const names = getArchetypeDisplayNames(["logician", "humanist", "visionary", "realist"]);
      
      expect(names).toContain("The Logician");
      expect(names).toContain("The Humanist");
      expect(names).toContain("The Visionary");
      expect(names).toContain("The Realist");
    });

    it("should handle all 10 archetypes", () => {
      const allArchetypes = [
        "logician", "humanist", "visionary", "realist",
        "skeptic", "pragmatist", "financier", "ethicist", "architect", "orator"
      ];
      const names = getArchetypeDisplayNames(allArchetypes);
      
      expect(names.length).toBe(10);
      expect(names).toContain("The Skeptic");
      expect(names).toContain("The Pragmatist");
      expect(names).toContain("The Financier");
      expect(names).toContain("The Ethicist");
      expect(names).toContain("The Architect");
      expect(names).toContain("The Orator");
    });

    it("should maintain order of input archetypes", () => {
      const input = ["realist", "logician", "humanist"];
      const names = getArchetypeDisplayNames(input);
      
      expect(names[0]).toBe("The Realist");
      expect(names[1]).toBe("The Logician");
      expect(names[2]).toBe("The Humanist");
    });
  });

  describe("Integration: Different question types select different councils", () => {
    it("code and creative questions should select different members", () => {
      const code = classifyQuestion("Debug this React component");
      const creative = classifyQuestion("Write a creative marketing campaign");
      
      expect(code.selectedArchetypes).not.toEqual(creative.selectedArchetypes);
    });

    it("strategic and financial questions should select different members", () => {
      const strategic = classifyQuestion("What's our growth strategy?");
      const financial = classifyQuestion("What's the ROI on this investment?");
      
      expect(strategic.selectedArchetypes).not.toEqual(financial.selectedArchetypes);
    });

    it("each question type should select exactly 4 archetypes", () => {
      const questionTypes = [
        "How do I code this?",
        "Write me a story",
        "What's our strategy?",
        "I need advice",
        "Is this a good investment?",
        "Is this ethical?",
        "Design the system",
        "Analyze this data",
        "How do I do this quickly?"
      ];

      for (const question of questionTypes) {
        const result = classifyQuestion(question);
        expect(result.selectedArchetypes.length).toBe(4);
      }
    });

    it("should provide specialized prompts for each selected archetype", () => {
      const result = classifyQuestion("How do I debug this Python function?");
      const prompts = getSpecializedPrompts(result.type, result.selectedArchetypes);
      
      for (const archetype of result.selectedArchetypes) {
        expect(prompts[archetype]).toBeDefined();
        expect(prompts[archetype].length).toBeGreaterThan(0);
      }
    });
  });
});
