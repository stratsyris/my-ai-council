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
} from "../../shared/prompt_generators";
import {
  COUNCIL_CONFIG,
  getAllCouncilMemberIds,
  getCouncilMember,
} from "../../shared/council_config";
import { getGlobalRequestQueue } from "./request-queue";

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
  assignments: {
    Logician: string;
    Humanist: string;
    Visionary: string;
    Realist: string;
  };
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
   * Dispatch Phase: Chairman analyzes the prompt and generates dynamic mission briefs
   * for each council member based on task type (Code, Creative, Emotional, etc.)
   */
  async dispatchPhase(
    userQuery: string,
    chairmanMemberId: string
  ): Promise<DispatchBrief> {
    const chairman = getCouncilMember(chairmanMemberId);
    if (!chairman) {
      throw new Error(`Chairman "${chairmanMemberId}" not found in config`);
    }

    const dispatchPrompt = `You are a Chief Strategy Officer analyzing a user request to dynamically brief your council members.

User Request: "${userQuery}"

Analyze this request and determine:
1. What type of task is this? (e.g., Technical/Code, Creative/Writing, Strategic/Planning, Emotional/Support, etc.)
2. What specific focus should each council member have?

For each member, provide a specific instruction that customizes their expertise:
- The Logician (Logic & Truth): Focus on technical accuracy, edge cases, or logical consistency
- The Humanist (Safety & Ethics): Focus on user experience, safety implications, or ethical concerns
- The Visionary (Innovation & Context): Focus on creative solutions, novel approaches, or synthesis
- The Realist (Speed & Efficiency): Focus on practical implementation, efficiency, or immediate action

RESPOND WITH ONLY VALID JSON. NO MARKDOWN. NO CODE BLOCKS. NO EXPLANATION. NO EXTRA TEXT.
Ensure all strings use double quotes and are properly escaped.
Do not include any text before or after the JSON object.

{"task_category": "string describing the type of task", "dispatch_strategy": "one sentence explaining your overall approach", "assignments": {"Logician": "specific instruction for the Logician", "Humanist": "specific instruction for the Humanist", "Visionary": "specific instruction for the Visionary", "Realist": "specific instruction for the Realist"}}`;

    const messages: Message[] = [{ role: "user", content: dispatchPrompt }];

    try {
      const response = await this.client.queryModel(chairman.model_id, messages);

      if (!response || !response.content || response.content.trim().length === 0) {
        console.error('[dispatchPhase] Empty response from chairman, using default brief');
        return this.getDefaultBrief();
      }

      // Parse the JSON response - handle markdown-wrapped JSON and malformed responses
      try {
        let jsonContent = response.content.trim();
        console.log('[dispatchPhase] Raw response length:', jsonContent.length);
        
        // Remove markdown code blocks if present
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to extract JSON object if there's extra text
        const jsonStart = jsonContent.indexOf('{');
        const jsonEnd = jsonContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
        }
        
        // Clean up whitespace and fix common JSON issues
        jsonContent = jsonContent.replace(/\n/g, ' ').replace(/\r/g, ' ');
        jsonContent = jsonContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        // Fix unquoted keys (common LLM mistake)
        jsonContent = jsonContent.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        
        // Validate we have content
        if (!jsonContent || jsonContent.trim().length === 0) {
          throw new Error('Empty JSON content');
        }

        // Try parsing first
        let brief;
        try {
          console.log('[dispatchPhase] Attempting JSON parse...');
          brief = JSON.parse(jsonContent) as DispatchBrief;
          console.log('[dispatchPhase] Successfully parsed');
        } catch (e) {
          // If parsing fails, remove any trailing content
          console.log('[dispatchPhase] Initial parse failed, attempting repairs...', e);
          if (jsonContent.includes('}')) {
            jsonContent = jsonContent.substring(0, jsonContent.lastIndexOf('}') + 1);
          }
          if (!jsonContent || jsonContent.trim().length === 0) {
            throw new Error('No valid JSON after repair');
          }
          try {
            brief = JSON.parse(jsonContent) as DispatchBrief;
            console.log('[dispatchPhase] Successfully parsed after repair');
          } catch (e2) {
            console.error('[dispatchPhase] Repair failed:', e2);
            throw new Error('JSON parse failed after repair');
          }
        }
        
        // Validate the brief has required fields
        if (!brief.task_category || !brief.assignments) {
          console.error('[dispatchPhase] Invalid brief:', brief);
          throw new Error('Invalid dispatch brief structure');
        }
        
        // Ensure all members have assignments
        const members = ['Logician', 'Humanist', 'Visionary', 'Realist'];
        for (const m of members) {
          if (!brief.assignments[m as keyof typeof brief.assignments]) {
            brief.assignments[m as keyof typeof brief.assignments] = `Default ${m} perspective`;
          }
        }
        
        console.log(`[dispatchPhase] Generated brief for task: ${brief.task_category}`);
        return brief;
      } catch (parseError) {
        console.error("[dispatchPhase] Failed to parse dispatch JSON:", parseError);
        console.error("[dispatchPhase] Raw response:", response.content.substring(0, 500));
        console.error("[dispatchPhase] Using default brief as fallback");
        return this.getDefaultBrief();
      }
    } catch (error) {
      console.error(`[dispatchPhase] Dispatch failed:`, error);
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
      assignments: {
        Logician: "Provide logical analysis and identify potential issues",
        Humanist: "Consider user impact and safety implications",
        Visionary: "Suggest creative alternatives and novel approaches",
        Realist: "Focus on practical implementation and efficiency",
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
    if (dispatchBrief && Object.keys(dispatchBrief.assignments).length > 0) {
      const selectedArchetypes = Object.keys(dispatchBrief.assignments);
      councilMemberIds = councilMemberIds.filter((memberId) => {
        const displayName = this.getMemberDisplayName(memberId);
        return selectedArchetypes.includes(displayName);
      });
      console.log(`[stage1] Filtered to ${councilMemberIds.length} selected archetypes: ${councilMemberIds.join(", ")}`);
    }

    // Generate prompts for each council member using the config
    const prompts = councilMemberIds.map((memberId) => {
      let prompt = generateCouncilMemberPrompt(memberId, userQuery);

      // Inject dynamic brief if available
      if (dispatchBrief) {
        const displayName = this.getMemberDisplayName(memberId);
        const dynamicBrief = dispatchBrief.assignments[displayName as keyof typeof dispatchBrief.assignments];
        if (dynamicBrief) {
          prompt = `${prompt}\n\nSpecial Brief for this task: ${dynamicBrief}`;
          console.log(`[stage1] Injected brief for ${displayName}: ${dynamicBrief}`);
        } else {
          console.log(`[stage1] No brief found for ${displayName} in assignments`);
        }
      } else {
        console.log(`[stage1] No dispatch brief available for ${memberId}`);
      }

      return { memberId, prompt };
    });

    // Query all 4 models in parallel
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
          const displayName = this.getMemberDisplayName(memberId);
          const secretInstruction = dispatchBrief?.assignments[displayName as keyof typeof dispatchBrief.assignments];
          
          stage1Results.push({
            memberId,
            archetypeName: member.display_name,  // e.g., "The Logician"
            model: member.model_id,
            response: response.content,
            secretInstruction: secretInstruction,
          });
        }
      } catch (error) {
        console.error(
          `Failed to get response from ${member.display_name}:`,
          error
        );
        throw error;
      }
    }

    return stage1Results;
  }

  /**
   * Stage 2: Chairman analyzes all responses and creates consensus-based final answer.
   * Uses config-driven prompt generation to ensure the chairman's lens is applied.
   */
  async stage2ChairmanAnalysis(
    userQuery: string,
    stage1Results: Stage1Result[],
    chairmanMemberId: string,
    imageUrls?: string[]
  ): Promise<Stage2Result> {
    const chairman = getCouncilMember(chairmanMemberId);
    if (!chairman) {
      throw new Error(`Chairman "${chairmanMemberId}" not found in config`);
    }

    // Build the council responses object for the prompt generator
    const councilResponses: {
      logician: string;
      humanist: string;
      visionary: string;
      realist: string;
    } = {
      logician: "",
      humanist: "",
      visionary: "",
      realist: "",
    };

    // Map stage1 results to the council responses object
    for (const result of stage1Results) {
      const member = getCouncilMember(result.memberId);
      if (member) {
        councilResponses[result.memberId as keyof typeof councilResponses] =
          result.response;
      }
    }

    // Generate the chairman prompt using the config
    const chairmanPrompt = generateChairmanPrompt(
      chairmanMemberId,
      userQuery,
      councilResponses
    );

    const messages: Message[] = [{ role: "user", content: chairmanPrompt }];

    // Add images to chairman message if provided
    if (imageUrls?.length) {
      const messageContent: any = [{ type: "text", text: chairmanPrompt }];

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
      console.log(`[stage2ChairmanAnalysis] Added ${imageUrls.length} images to chairman context`);
    }

    try {
      const chairmanResponse = await this.client.queryModel(
        chairman.model_id,
        messages
      );

      if (!chairmanResponse) {
        throw new Error("Chairman failed to generate response");
      }

      // Parse chairman response - entire response is the final answer
      const content = chairmanResponse.content;

      // Chairman's full analysis and synthesis is the final answer
      const analysis = content;
      const finalAnswer = content;

      return {
        analysis,
        finalAnswer,
      };
    } catch (error) {
      console.error(`Chairman synthesis failed:`, error);
      throw error;
    }
  }

  /**
   * Execute full council process: Dispatch -> Stage 1 + Stage 2
   */
  async executeCouncil(
    userQuery: string,
    chairmanMemberId: string,
    imageUrls?: string[]
  ) {
    // Dispatch Phase: Chairman generates dynamic mission briefs
    const dispatchBrief = await this.dispatchPhase(userQuery, chairmanMemberId);
    console.log(`[executeCouncil] Dispatch brief generated for task: ${dispatchBrief.task_category}`);

    // Stage 1: Collect responses from all 4 models with dynamic briefs injected
    const stage1Results = await this.stage1CollectResponses(
      userQuery,
      imageUrls,
      dispatchBrief
    );

    // Stage 2: Chairman analyzes and synthesizes using config-driven prompt
    const stage2Result = await this.stage2ChairmanAnalysis(
      userQuery,
      stage1Results,
      chairmanMemberId,
      imageUrls
    );

    return {
      stage1: stage1Results,
      stage2: stage2Result,
      dispatchBrief: dispatchBrief,
    };
  }
}
