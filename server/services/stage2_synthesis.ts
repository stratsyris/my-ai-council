/**
 * STAGE 2: CHAIRMAN SYNTHESIS
 * 
 * The Chairman reads all 4 responses, weighs the conflicts and different perspectives,
 * and produces a final "verdict" that synthesizes the best insights.
 */

import { invokeLLM } from "../_core/llm";
import { CouncilResponse } from "./stage1_dispatch";
import { ChairmanDispatch } from "./chairman_dispatch";

export interface ChairmanVerdict {
  final_response: string;
  conflict_analysis: string;
  evolution_logic: string;
  confidence_level: "high" | "medium" | "low";
  timestamp: number;
}

/**
 * Stage 2: Chairman synthesizes all responses into a final verdict
 */
export async function stage2ChairmanSynthesis(
  userQuery: string,
  dispatch: ChairmanDispatch,
  councilResponses: CouncilResponse[]
): Promise<ChairmanVerdict> {
  // Format the council responses for the Chairman
  const councilSummary = councilResponses
    .map(
      (response) =>
        `${response.archetype_name}:\n${response.response}`
    )
    .join("\n\n---\n\n");

  const synthesisPrompt = `You are The Chairman. You have assembled a Council of 4 to debate this query:

USER QUERY: "${userQuery}"

CORE CONFLICT IDENTIFIED: ${dispatch.core_conflict}

DISPATCH STRATEGY: ${dispatch.dispatch_strategy}

THE COUNCIL'S RESPONSES:
${councilSummary}

YOUR TASK:
1. Analyze the different perspectives and identify key conflicts
2. Weigh the strengths and weaknesses of each argument
3. Synthesize the best insights into a final verdict
4. Explain how you resolved conflicts between opposing views
5. Provide a clear, actionable recommendation

Output ONLY valid JSON (no markdown, no code blocks):
{
  "final_response": "string - your synthesized verdict and recommendation",
  "conflict_analysis": "string - how you resolved conflicts between council members",
  "evolution_logic": "string - how the council's debate evolved and what changed your thinking",
  "confidence_level": "high|medium|low"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are The Chairman. You synthesize council debates into clear verdicts. Output only valid JSON.",
        },
        {
          role: "user",
          content: synthesisPrompt,
        },
      ],
    });

    const responseContent = response.choices[0]?.message?.content;
    const responseText = typeof responseContent === "string" ? responseContent : "";

    // Parse JSON response
    let verdictData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      verdictData = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("[stage2] Failed to parse verdict JSON:", error);
      return getFallbackVerdict(councilResponses);
    }

    return {
      final_response: verdictData.final_response || "Unable to synthesize verdict",
      conflict_analysis: verdictData.conflict_analysis || "No conflict analysis available",
      evolution_logic: verdictData.evolution_logic || "No evolution logic available",
      confidence_level: verdictData.confidence_level || "medium",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("[stage2] Error during synthesis:", error);
    return getFallbackVerdict(councilResponses);
  }
}

/**
 * Fallback verdict when synthesis fails
 */
function getFallbackVerdict(councilResponses: CouncilResponse[]): ChairmanVerdict {
  const responsesSummary = councilResponses
    .map((r) => `${r.archetype_name}: ${r.response.substring(0, 100)}...`)
    .join("\n");

  return {
    final_response: `The Council has provided diverse perspectives:\n\n${responsesSummary}`,
    conflict_analysis: "Multiple perspectives were presented by the council members.",
    evolution_logic: "The council debate revealed different priorities and concerns.",
    confidence_level: "low",
    timestamp: Date.now(),
  };
}
