/**
 * CHAIRMAN DISPATCH SERVICE
 * 
 * Stage 0: The Chairman analyzes the user's query and intelligently selects
 * 4 archetypes from the 10-person roster that will generate the most diverse
 * and high-quality debate for this specific topic.
 * 
 * The Chairman also assigns "Secret Instructions" to each selected archetype,
 * tailoring their persona to the current problem.
 */

import { invokeLLM } from "../_core/llm";
import { getAllArchetypeIds, getCouncilMember, getBestModelForArchetype } from "../../shared/council_config";

export interface SelectedArchetype {
  archetype_id: string;
  archetype_name: string;
  model_id: string;
  secret_instruction: string;
}

export interface ChairmanDispatch {
  core_conflict: string;
  dispatch_strategy: string;
  selected_archetypes: SelectedArchetype[];
}

/**
 * Stage 0: Chairman analyzes query and selects 4 archetypes
 */
export async function stage0ChairmanDispatch(
  userQuery: string,
  chairmanModel: string
): Promise<ChairmanDispatch> {
  const allArchetypeIds = getAllArchetypeIds();
  const archetypeDescriptions = allArchetypeIds
    .map((id: string) => {
      const archetype = getCouncilMember(id);
      return `- ${archetype?.archetype_name} (${id}): ${archetype?.archetype_bias}`;
    })
    .join("\n");

  const dispatchPrompt = `You are The Chairman. Your sole responsibility is to assemble a "Council of 4" to debate the user's query.

Available Archetypes:
${archetypeDescriptions}

User Query: "${userQuery}"

Your task:
1. Analyze the user's query to determine the CORE CONFLICT (e.g., "Speed vs. Quality", "Ethics vs. Profit", "Innovation vs. Safety")
2. Select exactly 4 archetypes from the roster that will generate the most diverse and high-quality debate
3. CONSTRAINT: Do not select 4 similar roles (e.g., do not pick all "efficiency" focused archetypes for a sensitive ethics issue)
4. For each selected archetype, assign a "Secret Instruction" - a specific directive to tailor their persona to this problem

Output ONLY valid JSON (no markdown, no code blocks):
{
  "core_conflict": "string describing the main tension",
  "dispatch_strategy": "string explaining why these 4 were selected",
  "selected_archetypes": [
    {
      "archetype_id": "string",
      "archetype_name": "string",
      "secret_instruction": "string - specific directive for this archetype"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are The Chairman. You select 4 archetypes from a 10-person roster to debate user queries. Output only valid JSON.",
      },
      {
        role: "user",
        content: dispatchPrompt,
      },
    ],
  });

  const responseContent = response.choices[0]?.message?.content;
  const responseText = typeof responseContent === "string" ? responseContent : "";

  // Parse JSON response
  let dispatchData;
  try {
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    dispatchData = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[stage0ChairmanDispatch] Failed to parse dispatch JSON:", error);
    // Fallback: return a sensible default selection
    return getFallbackDispatch(userQuery);
  }

  // Validate and enrich selected archetypes with model IDs
  const enrichedArchetypes: SelectedArchetype[] = (dispatchData.selected_archetypes || [])
    .slice(0, 4)
    .map((archetype: Record<string, any>) => {
      const modelId = getBestModelForArchetype(archetype.archetype_id) || "openai/gpt-5.2";
      return {
        archetype_id: archetype.archetype_id,
        archetype_name: archetype.archetype_name,
        model_id: modelId,
        secret_instruction: archetype.secret_instruction,
      };
    });

  // Ensure we have exactly 4 archetypes
  if (enrichedArchetypes.length < 4) {
    console.warn("[stage0ChairmanDispatch] Got fewer than 4 archetypes, using fallback");
    return getFallbackDispatch(userQuery);
  }

  return {
    core_conflict: dispatchData.core_conflict || "Unknown conflict",
    dispatch_strategy: dispatchData.dispatch_strategy || "Strategic selection",
    selected_archetypes: enrichedArchetypes,
  };
}

/**
 * Fallback dispatch when Chairman dispatch fails
 * Returns a sensible default selection
 */
function getFallbackDispatch(userQuery: string): ChairmanDispatch {
  const defaultSelection = ["logician", "humanist", "visionary", "realist"];

  return {
    core_conflict: "General inquiry",
    dispatch_strategy: "Default balanced council selection",
    selected_archetypes: defaultSelection.map((id) => {
      const archetype = getCouncilMember(id);
      const modelId = getBestModelForArchetype(id) || "openai/gpt-5.2";
      return {
        archetype_id: id,
        archetype_name: archetype?.archetype_name || id,
        model_id: modelId,
        secret_instruction: archetype?.archetype_bias || "Provide your perspective",
      };
    }),
  };
}
