import { VerdictCardData } from "./verdict_types";

/**
 * Parse verdict JSON from LLM response text
 * Handles cases where the LLM might include extra text around the JSON
 */
export function parseVerdictJSON(text: string): VerdictCardData | null {
  if (!text) return null;

  try {
    // Try to extract JSON from the text (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      !parsed.conflict_level ||
      !parsed.primary_conflict ||
      !parsed.evolution_logic ||
      !parsed.final_verdict_markdown
    ) {
      return null;
    }

    // Validate conflict_level is one of the allowed values
    if (!["Low", "High"].includes(parsed.conflict_level)) {
      return null;
    }

    return parsed as VerdictCardData;
  } catch (error) {
    console.error("Failed to parse verdict JSON:", error);
    return null;
  }
}

/**
 * Check if a response is likely a verdict card (contains JSON structure)
 */
export function isVerdictResponse(text: string): boolean {
  if (!text) return false;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return false;

    const parsed = JSON.parse(jsonMatch[0]);
    return (
      parsed.conflict_level &&
      parsed.primary_conflict &&
      parsed.evolution_logic &&
      parsed.final_verdict_markdown
    );
  } catch {
    return false;
  }
}
