/**
 * 2-stage LLM Council orchestration - Configuration-Driven Architecture
 * Stage 1: All 4 council models provide responses using config-driven prompts
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

export interface Stage1Result {
  memberId: string;
  model: string;
  response: string;
}

export interface Stage2Result {
  analysis: string;
  finalAnswer: string;
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
   * Stage 1: Collect individual responses from all 4 council models.
   * Uses config-driven prompts to ensure consistency and flexibility.
   */
  async stage1CollectResponses(
    userQuery: string,
    imageUrls?: string[]
  ): Promise<Stage1Result[]> {
    const councilMemberIds = getAllCouncilMemberIds();
    const stage1Results: Stage1Result[] = [];

    // Generate prompts for each council member using the config
    const prompts = councilMemberIds.map((memberId) => ({
      memberId,
      prompt: generateCouncilMemberPrompt(memberId, userQuery),
    }));

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
          stage1Results.push({
            memberId,
            model: member.model_id,
            response: response.content,
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
    chairmanMemberId: string
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
   * Execute full council process: Stage 1 + Stage 2
   */
  async executeCouncil(
    userQuery: string,
    chairmanMemberId: string,
    imageUrls?: string[]
  ) {
    // Stage 1: Collect responses from all 4 models using config-driven prompts
    const stage1Results = await this.stage1CollectResponses(
      userQuery,
      imageUrls
    );

    // Stage 2: Chairman analyzes and synthesizes using config-driven prompt
    const stage2Result = await this.stage2ChairmanAnalysis(
      userQuery,
      stage1Results,
      chairmanMemberId
    );

    return {
      stage1: stage1Results,
      stage2: stage2Result,
    };
  }
}
