import { VerdictCardData } from "./verdict_types";

/**
 * Extract JSON from text, handling incomplete JSON
 * Looks for opening brace and captures everything after it
 */
function extractJSON(text: string): string | null {
  // First try to find a complete JSON object
  const completeMatch = text.match(/\{[\s\S]*\}/);
  if (completeMatch) {
    return completeMatch[0];
  }

  // If no complete JSON found, try to extract from opening brace to end
  const startIdx = text.indexOf("{");
  if (startIdx === -1) {
    return null;
  }

  // Return everything from the opening brace onward
  return text.substring(startIdx);
}

/**
 * Repair unterminated strings in JSON by closing them properly
 */
function repairUnteminatedStrings(jsonStr: string): string {
  // Track if we're inside a string and handle escaping
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    result += char;
  }

  // If we ended while still in a string, close it
  if (inString) {
    result += '"';
  }

  return result;
}

/**
 * Attempt to repair incomplete JSON by closing unclosed braces/brackets
 */
function repairIncompleteJSON(jsonStr: string): string {
  let repaired = repairUnteminatedStrings(jsonStr);

  // Count braces and brackets, accounting for strings
  let braceCount = 0;
  let bracketCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") braceCount++;
    else if (char === "}") braceCount--;
    else if (char === "[") bracketCount++;
    else if (char === "]") bracketCount--;
  }

  // Close unclosed brackets
  while (bracketCount > 0) {
    repaired += "]";
    bracketCount--;
  }

  // Close unclosed braces
  while (braceCount > 0) {
    repaired += "}";
    braceCount--;
  }

  return repaired;
}

/**
 * Parse verdict JSON from LLM response text
 * Handles cases where the LLM might include extra text around the JSON
 * or return incomplete/malformed JSON
 */
export function parseVerdictJSON(text: string): VerdictCardData | null {
  if (!text) return null;

  try {
    // Try to extract JSON from the text
    const jsonStr = extractJSON(text);
    if (!jsonStr) return null;

    // Try parsing as-is first
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      // If parsing fails, try to repair the JSON
      console.warn("Initial JSON parse failed, attempting repair...", parseError);
      const repairedJson = repairIncompleteJSON(jsonStr);
      try {
        parsed = JSON.parse(repairedJson);
      } catch (repairError) {
        // If repair also fails, log and return null
        console.error("Failed to repair JSON:", repairError);
        return null;
      }
    }

    // Validate required fields exist
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("conflict_level" in parsed) ||
      !("primary_conflict" in parsed) ||
      !("evolution_logic" in parsed) ||
      !("final_verdict_markdown" in parsed)
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
    const jsonStr = extractJSON(text);
    if (!jsonStr) return false;

    // Try parsing as-is first, then with repair
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const repairedJson = repairIncompleteJSON(jsonStr);
      try {
        parsed = JSON.parse(repairedJson);
      } catch {
        return false;
      }
    }

    // Check if all required fields exist and have values
    if (!parsed || typeof parsed !== "object") return false;
    if (!("conflict_level" in parsed)) return false;
    if (!("primary_conflict" in parsed)) return false;
    if (!("evolution_logic" in parsed)) return false;
    if (!("final_verdict_markdown" in parsed)) return false;
    if (!parsed.conflict_level) return false;
    if (!parsed.primary_conflict) return false;
    if (!parsed.evolution_logic) return false;
    if (!parsed.final_verdict_markdown) return false;
    return true;
  } catch {
    return false;
  }
}
