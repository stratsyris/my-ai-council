import { describe, it, expect } from "vitest";
import { parseVerdictJSON, isVerdictResponse } from "../../client/src/lib/verdict_parser";

describe("Verdict Parser", () => {
  describe("parseVerdictJSON", () => {
    it("should parse valid verdict JSON", () => {
      const validJSON = JSON.stringify({
        conflict_level: "High",
        primary_conflict: "Efficiency vs. Correctness",
        evolution_logic: "Initially favored speed, but correctness is paramount",
        final_verdict_markdown: "The correct approach is essential.",
      });

      const result = parseVerdictJSON(validJSON);
      expect(result).not.toBeNull();
      expect(result?.conflict_level).toBe("High");
    });

    it("should handle unterminated strings by closing them", () => {
      const unterminatedJSON = `{
        "conflict_level": "High",
        "primary_conflict": "Efficiency vs. Correctness",
        "evolution_logic": "Initially favored speed, but correctness is paramount",
        "final_verdict_markdown": "The correct approach is essential.`;

      const result = parseVerdictJSON(unterminatedJSON);
      expect(result).not.toBeNull();
      expect(result?.conflict_level).toBe("High");
    });

    it("should handle escaped quotes in strings", () => {
      const escapedQuotes = JSON.stringify({
        conflict_level: "High",
        primary_conflict: 'He said "hello"',
        evolution_logic: 'The phrase "correctness" is key',
        final_verdict_markdown: "Important: Always verify",
      });

      const result = parseVerdictJSON(escapedQuotes);
      expect(result).not.toBeNull();
      expect(result?.primary_conflict).toContain("hello");
    });

    it("should handle text before and after JSON", () => {
      const textWithJSON = `Some explanation here. ${JSON.stringify({
        conflict_level: "Low",
        primary_conflict: "Minor issue",
        evolution_logic: "Quick resolution",
        final_verdict_markdown: "All good",
      })} And some text after.`;

      const result = parseVerdictJSON(textWithJSON);
      expect(result).not.toBeNull();
      expect(result?.conflict_level).toBe("Low");
    });

    it("should return null for invalid conflict_level", () => {
      const invalidConflict = JSON.stringify({
        conflict_level: "Medium",
        primary_conflict: "Some conflict",
        evolution_logic: "Some logic",
        final_verdict_markdown: "Some verdict",
      });

      const result = parseVerdictJSON(invalidConflict);
      expect(result).toBeNull();
    });

    it("should return null for missing required fields", () => {
      const missingField = JSON.stringify({
        conflict_level: "High",
        primary_conflict: "Some conflict",
        final_verdict_markdown: "Some verdict",
      });

      const result = parseVerdictJSON(missingField);
      expect(result).toBeNull();
    });

    it("should return null for non-JSON text", () => {
      const result = parseVerdictJSON("This is just plain text");
      expect(result).toBeNull();
    });
  });

  describe("isVerdictResponse", () => {
    it("should detect valid verdict response", () => {
      const validJSON = JSON.stringify({
        conflict_level: "High",
        primary_conflict: "Efficiency vs. Correctness",
        evolution_logic: "Initially favored speed, but correctness is paramount",
        final_verdict_markdown: "The correct approach is essential.",
      });

      expect(isVerdictResponse(validJSON)).toBe(true);
    });

    it("should return false for non-verdict JSON", () => {
      const nonVerdictJSON = JSON.stringify({
        some_field: "value",
        another_field: "data",
      });

      expect(isVerdictResponse(nonVerdictJSON)).toBe(false);
    });

    it("should return false for plain text", () => {
      expect(isVerdictResponse("Just some text")).toBe(false);
    });
  });
});
