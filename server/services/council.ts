/**
 * 3-stage LLM Council orchestration - Chairman-Led Dispatch Architecture
 * Dispatch: Chairman analyzes prompt and generates dynamic mission briefs
 * Stage 1: All 4 council models provide responses with injected briefs
 * Stage 2: Chairman analyzes all responses and creates consensus-based final answer
 */

import { OpenRouterClient, Message } from "./openrouter";
import {
  generateCouncilMemberPrompt,
  generateChairmanPrompt,
  generateSuperpowerDispatchPrompt,
  SuperpowerDispatchResult,
} from "../../shared/prompt_generators";
import {
  COUNCIL_CONFIG,
  getAllCouncilMemberIds,
  getCouncilMember,
  MODEL_SUPERPOWER_MATRIX,
} from "../../shared/council_config";
import { getGlobalRequestQueue } from "./request-queue";
import {
  classifyQuestion,
  getSpecializedPrompts,
  getArchetypeDisplayNames,
} from "./question-classifier";

export interface Stage1Result {
  memberId: string;
  archetypeName: string;  // Display name like "The Logician"
  model: string;
  response: string;
  secretInstruction?: string;  // The custom brief for this member
}

export interface Stage2Result {
  analysis: string;
  finalAnswer: string;
}

export interface DispatchBrief {
  task_category: string;
  dispatch_strategy: string;
  selectedArchetypes: string[];  // IDs of selected archetypes (e.g., ["logician", "architect", "pragmatist", "skeptic"])
  assignments: Record<string, string>;  // Dynamic assignments based on selected archetypes
}

export interface CouncilConfig {
  councilModels: string[];
  chairmanModel: string;
}

export class CouncilOrchestrator {
  private client: OpenRouterClient;
  private config: CouncilConfig;

  constructor(client: OpenRouterClient, config: CouncilConfig) {
    this.client = client;
    this.config = config;
  }

  /**
   * Superpower-Based Dispatch: Use LLM to detect required superpowers and select optimal squad
   * This is more sophisticated than the question classifier - it routes based on model strengths
   */
  async superpowerDispatchPhase(
    userQuery: string,
    chairmanMemberId: string
  ): Promise<DispatchBrief> {
    try {
      const chairman = getCouncilMember(chairmanMemberId);
      if (!chairman) {
        throw new Error(`Chairman "${chairmanMemberId}" not found`);
      }

      // Generate the superpower dispatch prompt
      const dispatchPrompt = generateSuperpowerDispatchPrompt(userQuery);
      const messages: Message[] = [{ role: "user", content: dispatchPrompt }];

      // Query the chairman model to analyze superpowers
      const response = await this.client.queryModel(chairman.model_id, messages);
      
      if (!response || !response.content) {
        throw new Error("Empty response from chairman dispatch");
      }

      // Parse the JSON response
      let dispatchResult: SuperpowerDispatchResult | null = null;
      try {
        let jsonContent = response.content.trim();
        
        // Remove markdown code blocks
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Extract JSON object
        const jsonStart = jsonContent.indexOf('{');
        const jsonEnd = jsonContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
          dispatchResult = JSON.parse(jsonContent);
        }
      } catch (e) {
        console.error("[superpowerDispatch] Failed to parse dispatch JSON:", e);
      }

      if (!dispatchResult || !dispatchResult.selected_squad || dispatchResult.selected_squad.length !== 4) {
        throw new Error("Invalid dispatch result structure");
      }

      // Convert the superpower dispatch result to DispatchBrief format
      const selectedArchetypes = dispatchResult.selected_squad.map(s => s.archetype);
      const assignments: Record<string, string> = {};
      
      for (const squadMember of dispatchResult.selected_squad) {
        assignments[squadMember.archetype] = squadMember.reason;
      }

      const brief: DispatchBrief = {
        task_category: dispatchResult.required_superpowers.join(" + "),
        dispatch_strategy: dispatchResult.superpower_rationale,
        selectedArchetypes,
        assignments
      };

      console.log(`[superpowerDispatch] Detected superpowers: ${dispatchResult.required_superpowers.join(", ")}`);
      console.log(`[superpowerDispatch] Selected archetypes: ${selectedArchetypes.join(", ")}`);

      return brief;
    } catch (error) {
      console.error("[superpowerDispatch] Failed:", error);
      // Fall back to question classifier
      return this.dispatchPhase(userQuery, chairmanMemberId);
    }
  }

  /**
   * Dispatch Phase: Classify question type and dynamically select 4 optimal archetypes
   * Each question type gets a different council composition with specialized prompts
   */
  async dispatchPhase(
    userQuery: string,
    chairmanMemberId: string
  ): Promise<DispatchBrief> {
    try {
      // Step 1: Classify the question to determine task type
      const classification = classifyQuestion(userQuery);
      console.log(`[dispatchPhase] Question classified as: ${classification.type} (${(classification.confidence * 100).toFixed(0)}% confidence)`);
      console.log(`[dispatchPhase] Selected archetypes: ${getArchetypeDisplayNames(classification.selectedArchetypes).join(", ")}`);
      
      // Step 2: Get specialized prompts for each selected archetype
      const specializedPrompts = getSpecializedPrompts(classification.type, classification.selectedArchetypes);
      
      // Step 3: Build assignments with archetype IDs as keys
      const assignments: Record<string, string> = {};
      for (const archetypeId of classification.selectedArchetypes) {
        assignments[archetypeId] = specializedPrompts[archetypeId] || "Provide your expert perspective on this question.";
      }
      
      // Step 4: Return the dispatch brief with dynamic selection
      const brief: DispatchBrief = {
        task_category: classification.type.charAt(0).toUpperCase() + classification.type.slice(1),
        dispatch_strategy: classification.reasoning,
        selectedArchetypes: classification.selectedArchetypes,
        assignments
      };
      
      console.log(`[dispatchPhase] Generated brief for task: ${brief.task_category}`);
      console.log(`[dispatchPhase] Assignments: ${JSON.stringify(assignments)}`);
      
      return brief;
    } catch (error) {
      console.error(`[dispatchPhase] Classification failed:`, error);
      // Return default brief on error
      return this.getDefaultBrief();
    }
  }

  /**
   * Get default brief when dispatch fails - fallback to standard personas
   */
  private getDefaultBrief(): DispatchBrief {
    return {
      task_category: "General",
      dispatch_strategy: "Using standard council personas without specialization",
      selectedArchetypes: ["logician", "humanist", "visionary", "realist"],
      assignments: {
        logician: "Provide logical analysis and identify potential issues",
        humanist: "Consider user impact and safety implications",
        visionary: "Suggest creative alternatives and novel approaches",
        realist: "Focus on practical implementation and efficiency",
      },
    };
  }

  /**
   * Map member ID to display name for brief assignments
   */
  private getMemberDisplayName(memberId: string): string {
    const displayNames: Record<string, string> = {
      logician: "Logician",
      humanist: "Humanist",
      visionary: "Visionary",
      realist: "Realist",
      skeptic: "Skeptic",
      pragmatist: "Pragmatist",
      financier: "Financier",
      ethicist: "Ethicist",
      architect: "Architect",
      orator: "Orator",
    };
    return displayNames[memberId] || memberId;
  }

  /**
   * Stage 1: Collect individual responses from all 4 council models.
   * Uses config-driven prompts + dynamic briefs from dispatch phase.
   */
  async stage1CollectResponses(
    userQuery: string,
    imageUrls?: string[],
    dispatchBrief?: DispatchBrief
  ): Promise<Stage1Result[]> {
    let councilMemberIds = getAllCouncilMemberIds();
    const stage1Results: Stage1Result[] = [];

    // Filter to only selected archetypes if dispatch brief is available
    if (dispatchBrief && dispatchBrief.selectedArchetypes && dispatchBrief.selectedArchetypes.length > 0) {
      councilMemberIds = councilMemberIds.filter((memberId) => {
        return dispatchBrief.selectedArchetypes.includes(memberId);
      });
      console.log(`[stage1] Filtered to ${councilMemberIds.length} selected archetypes: ${councilMemberIds.join(", ")}`);
    }

    // Generate prompts for each council member using the config
    const prompts = councilMemberIds.map((memberId) => {
      let prompt = generateCouncilMemberPrompt(memberId, userQuery);

      // Inject dynamic brief if available
      if (dispatchBrief && dispatchBrief.assignments) {
        const dynamicBrief = dispatchBrief.assignments[memberId];
        if (dynamicBrief) {
          prompt = `${prompt}\n\nSpecial Brief for this task: ${dynamicBrief}`;
          console.log(`[stage1] Injected brief for ${memberId}: ${dynamicBrief}`);
        } else {
          console.log(`[stage1] No brief found for ${memberId} in assignments`);
        }
      } else {
        console.log(`[stage1] No dispatch brief available for ${memberId}`);
      }

      return { memberId, prompt };
    });

    // Query all selected models in parallel
    for (const { memberId, prompt } of prompts) {
      const member = getCouncilMember(memberId);
      if (!member) continue;

      const messages: Message[] = [{ role: "user", content: prompt }];

      // Add images to the message if provided
      if (imageUrls?.length) {
        const messageContent: any = [{ type: "text", text: prompt }];

        for (const imageUrl of imageUrls) {
          messageContent.push({
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "auto",
            },
          });
        }

        messages[0].content = messageContent;
      }

      try {
        const response = await this.client.queryModel(member.model_id, messages);

        if (response) {
          // Get the secret instruction for this member from dispatch brief
          const secretInstruction = dispatchBrief?.assignments[memberId];
          
          stage1Results.push({
            memberId,
            archetypeName: member.display_name,  // e.g., "The Logician"
            model: member.model_id,
            response: response.content,
            secretInstruction: secretInstruction,
          });
        }
      } catch (error) {
        console.error(`[stage1] Error querying ${memberId}:`, error);
      }
    }

    return stage1Results;
  }

  /**
   * Stage 2: Chairman analyzes all Stage 1 responses and synthesizes final answer
   */
  async stage2ChairmanAnalysis(
    userQuery: string,
    stage1Results: Stage1Result[],
    chairmanMemberId: string
  ): Promise<Stage2Result> {
    const chairman = getCouncilMember(chairmanMemberId);
    if (!chairman) {
      throw new Error(`Chairman "${chairmanMemberId}" not found in config`);
    }

    // Build the synthesis prompt with all stage 1 responses
    const synthesisPrompt = generateChairmanPrompt(
      chairmanMemberId,
      userQuery,
      stage1Results
    );

    const messages: Message[] = [{ role: "user", content: synthesisPrompt }];

    try {
      const response = await this.client.queryModel(chairman.model_id, messages);

      if (!response || !response.content) {
        throw new Error("Empty response from chairman");
      }

      // Try to parse as JSON verdict, otherwise use as plain text
      let analysis = "";
      let finalAnswer = response.content;

      try {
        // Try to extract JSON if the response is a verdict
        let jsonContent = response.content.trim();
        
        // Remove markdown code blocks if present
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to extract JSON object
        const jsonStart = jsonContent.indexOf('{');
        const jsonEnd = jsonContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonContent);
          
          if (parsed.final_verdict_markdown) {
            analysis = parsed.evolution_logic || "";
            finalAnswer = parsed.final_verdict_markdown;
          }
        }
      } catch (e) {
        // Not JSON, use as plain text
        console.log("[stage2] Response is not JSON, using as plain text");
      }

      return {
        analysis,
        finalAnswer
      };
    } catch (error) {
      console.error("[stage2] Chairman analysis failed:", error);
      throw error;
    }
  }

  /**
   * Execute the full 3-stage council orchestration
   */
  async executeCouncil(
    userQuery: string,
    chairmanMemberId: string,
    imageUrls?: string[]
  ): Promise<{
    dispatchBrief: DispatchBrief;
    stage1Results: Stage1Result[];
    stage2Result: Stage2Result;
  }> {
    // Stage 0: Dispatch - Classify question and select 4 archetypes
    const dispatchBrief = await this.dispatchPhase(userQuery, chairmanMemberId);
    console.log("[executeCouncil] Dispatch complete");

    // Stage 1: Collect responses from selected archetypes
    const stage1Results = await this.stage1CollectResponses(
      userQuery,
      imageUrls,
      dispatchBrief
    );
    console.log(`[executeCouncil] Stage 1 complete with ${stage1Results.length} responses`);

    // Stage 2: Chairman synthesizes final answer
    const stage2Result = await this.stage2ChairmanAnalysis(
      userQuery,
      stage1Results,
      chairmanMemberId
    );
    console.log("[executeCouncil] Stage 2 complete");

    return {
      dispatchBrief,
      stage1Results,
      stage2Result,
    };
  }
}
