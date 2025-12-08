/**
 * 2-stage LLM Council orchestration - Option A flow.
 * Stage 1: All 4 council models provide responses
 * Stage 2: Chairman analyzes all responses and creates consensus-based final answer
 */

import { OpenRouterClient, Message } from "./openrouter";

export interface Stage1Result {
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
   */
  async stage1CollectResponses(userQuery: string): Promise<Stage1Result[]> {
    const messages: Message[] = [{ role: "user", content: userQuery }];

    // Query all 4 models in parallel
    const responses = await this.client.queryModelsParallel(
      this.config.councilModels,
      messages
    );

    // Format results
    const stage1Results: Stage1Result[] = [];
    for (const [model, response] of Object.entries(responses)) {
      if (response !== null) {
        stage1Results.push({
          model,
          response: response.content,
        });
      }
    }

    return stage1Results;
  }

  /**
   * Stage 2: Chairman analyzes all responses and creates consensus-based final answer.
   */
  async stage2ChairmanAnalysis(
    userQuery: string,
    stage1Results: Stage1Result[]
  ): Promise<Stage2Result> {
    // Format all responses for chairman analysis
    const responseSummary = stage1Results
      .map(
        (r, i) =>
          `**${r.model}:**\n${r.response}`
      )
      .join("\n\n---\n\n");

    const analysisPrompt = `You are the Chairman of an LLM Council. You have received responses from 4 expert models on the following question:

**Original Question:**
${userQuery}

**Responses from Council Members:**
${responseSummary}

Your task:
1. Analyze all 4 responses carefully
2. Identify key insights, agreements, and disagreements
3. Extract the most valuable and accurate information from each response
4. Create a comprehensive consensus-based final answer that synthesizes the best elements from all responses
5. Ensure your final answer is more complete, accurate, and thorough than any individual response

Please provide:
1. A brief analysis of the responses (key themes, strengths, gaps)
2. Your final synthesized answer that represents the council's consensus`;

    const messages: Message[] = [{ role: "user", content: analysisPrompt }];

    const chairmanResponse = await this.client.queryModel(
      this.config.chairmanModel,
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
  }

  /**
   * Execute full council process: Stage 1 + Stage 2
   */
  async executeCouncil(userQuery: string) {
    // Stage 1: Collect responses from all 4 models
    const stage1Results = await this.stage1CollectResponses(userQuery);

    // Stage 2: Chairman analyzes and synthesizes
    const stage2Result = await this.stage2ChairmanAnalysis(
      userQuery,
      stage1Results
    );

    return {
      stage1: stage1Results,
      stage2: stage2Result,
    };
  }
}
