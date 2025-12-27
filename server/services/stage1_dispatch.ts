/**
 * STAGE 1: COUNCIL RESPONSES
 * 
 * Dispatch each selected archetype with their secret instruction + user query.
 * All 4 respond in parallel (sometimes with conflicting viewpoints).
 * Responses are collected and saved.
 */

import { invokeLLM } from "../_core/llm";
import { SelectedArchetype } from "./chairman_dispatch";
import { getArchetype } from "../../shared/council_config";

export interface CouncilResponse {
  archetype_id: string;
  archetype_name: string;
  model_id: string;
  response: string;
  timestamp: number;
}

/**
 * Stage 1: Dispatch all 4 selected archetypes in parallel
 */
export async function stage1CollectResponses(
  userQuery: string,
  selectedArchetypes: SelectedArchetype[]
): Promise<CouncilResponse[]> {
  // Create parallel requests for each archetype
  const responsePromises = selectedArchetypes.map((archetype) =>
    dispatchArchetype(userQuery, archetype)
  );

  // Wait for all responses
  const responses = await Promise.all(responsePromises);
  return responses;
}

/**
 * Dispatch a single archetype with their secret instruction
 */
async function dispatchArchetype(
  userQuery: string,
  archetype: SelectedArchetype
): Promise<CouncilResponse> {
  const archetypeConfig = getArchetype(archetype.archetype_id);

  const systemPrompt = `You are ${archetypeConfig?.display_name}.

Your archetype bias:
${archetypeConfig?.archetype_bias}

Your secret instruction for this specific query:
${archetype.secret_instruction}

Respond with your perspective on the user's query. Be authentic to your archetype. If you disagree with others, say so. If you see risks, highlight them. If you have a different approach, propose it.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
    });

    const responseContent = response.choices[0]?.message?.content;
    const responseText = typeof responseContent === "string" ? responseContent : "";

    return {
      archetype_id: archetype.archetype_id,
      archetype_name: archetype.archetype_name,
      model_id: archetype.model_id,
      response: responseText,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`[stage1] Error dispatching ${archetype.archetype_name}:`, error);
    return {
      archetype_id: archetype.archetype_id,
      archetype_name: archetype.archetype_name,
      model_id: archetype.model_id,
      response: `Error: Failed to get response from ${archetype.archetype_name}`,
      timestamp: Date.now(),
    };
  }
}
