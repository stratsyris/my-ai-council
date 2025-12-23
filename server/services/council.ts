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
   * Get model-specific synthesis prompt tailored to the Chairman's strengths
   */
  private getSynthesisPrompt(userQuery: string, responseSummary: string): string {
    const chairmanModel = this.config.chairmanModel;

    // Model-specific prompts that leverage each model's unique strengths
    if (chairmanModel.includes("gpt-5")) {
      // GPT-5.2: Strong at logical analysis and comprehensive synthesis
      return `You are the Chairman of an LLM Council, known for your exceptional logical reasoning and ability to synthesize complex information.

**Original Question:**
${userQuery}

**Responses from Council Members:**
${responseSummary}

Your task is to:
1. Apply rigorous logical analysis to evaluate the validity of each response
2. Identify logical inconsistencies, assumptions, and evidence quality
3. Synthesize the most logically sound elements into a coherent final answer
4. Highlight any areas where council members disagree and explain the reasoning
5. Provide a definitive, well-reasoned consensus answer

Provide:
1. Brief logical analysis of the responses
2. Your final synthesized answer with clear reasoning`;
    } else if (chairmanModel.includes("claude")) {
      // Claude: Strong at nuanced understanding and balanced perspectives
      return `You are the Chairman of an LLM Council, renowned for your ability to understand nuance and balance multiple perspectives.

**Original Question:**
${userQuery}

**Responses from Council Members:**
${responseSummary}

Your task is to:
1. Deeply understand the nuances and context in each response
2. Recognize the validity and limitations of different perspectives
3. Balance competing viewpoints to find common ground
4. Synthesize a thoughtful answer that honors the complexity of the topic
5. Acknowledge important caveats and contextual factors

Provide:
1. Nuanced analysis of the different perspectives
2. Your balanced, synthesized final answer`;
    } else if (chairmanModel.includes("gemini")) {
      // Gemini: Strong at creative synthesis and finding novel connections
      return `You are the Chairman of an LLM Council, known for your ability to find creative connections and synthesize information in novel ways.

**Original Question:**
${userQuery}

**Responses from Council Members:**
${responseSummary}

Your task is to:
1. Look for creative connections and patterns across the responses
2. Find novel insights that emerge from combining different perspectives
3. Synthesize a comprehensive answer that goes beyond simple aggregation
4. Identify unique strengths in each response and amplify them
5. Create an answer that is more insightful than any individual response

Provide:
1. Creative synthesis highlighting novel connections
2. Your comprehensive final answer with unique insights`;
    } else if (chairmanModel.includes("grok")) {
      // Grok: Strong at cutting through complexity and direct analysis
      return `You are the Chairman of an LLM Council, known for your ability to cut through complexity and provide direct, insightful analysis.

**Original Question:**
${userQuery}

**Responses from Council Members:**
${responseSummary}

Your task is to:
1. Cut through the complexity and identify the core issues
2. Provide direct, no-nonsense analysis of each response
3. Identify what's essential and what's extraneous
4. Synthesize a clear, actionable final answer
5. Be direct about strengths and weaknesses in the council's responses

Provide:
1. Direct analysis of the responses
2. Your clear, synthesized final answer`;
    }

    // Default prompt for any other model
    return `You are the Chairman of an LLM Council. You have received responses from 4 expert models on the following question:

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

    const analysisPrompt = this.getSynthesisPrompt(userQuery, responseSummary);

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
