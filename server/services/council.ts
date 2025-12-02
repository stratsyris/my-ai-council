/**
 * 3-stage LLM Council orchestration.
 */

import { OpenRouterClient, Message } from "./openrouter";

export interface Stage1Result {
  model: string;
  response: string;
}

export interface Stage2Result {
  model: string;
  ranking: string;
  parsed_ranking: string[];
}

export interface Stage3Result {
  model: string;
  response: string;
}

export interface CouncilMetadata {
  label_to_model: Record<string, string>;
  aggregate_rankings: Array<{
    model: string;
    average_rank: number;
    rankings_count: number;
  }>;
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
   * Stage 1: Collect individual responses from all council models.
   */
  async stage1CollectResponses(userQuery: string): Promise<Stage1Result[]> {
    const messages: Message[] = [{ role: "user", content: userQuery }];

    // Query all models in parallel
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
   * Stage 2: Each model ranks the anonymized responses.
   */
  async stage2CollectRankings(
    userQuery: string,
    stage1Results: Stage1Result[]
  ): Promise<{ stage2Results: Stage2Result[]; labelToModel: Record<string, string> }> {
    // Create anonymized labels for responses (Response A, Response B, etc.)
    const labels = stage1Results.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, ...

    // Create mapping from label to model name
    const labelToModel: Record<string, string> = {};
    labels.forEach((label, i) => {
      labelToModel[`Response ${label}`] = stage1Results[i].model;
    });

    // Build the ranking prompt
    const responsesText = stage1Results
      .map((result, i) => `Response ${labels[i]}:\n${result.response}`)
      .join("\n\n");

    const rankingPrompt = `You are evaluating different responses to the following question:

Question: ${userQuery}

Here are the responses from different models (anonymized):

${responsesText}

Your task:
1. First, evaluate each response individually. For each response, explain what it does well and what it does poorly.
2. Then, at the very end of your response, provide a final ranking.

IMPORTANT: Your final ranking MUST be formatted EXACTLY as follows:
- Start with the line "FINAL RANKING:" (all caps, with colon)
- Then list the responses from best to worst as a numbered list
- Each line should be: number, period, space, then ONLY the response label (e.g., "1. Response A")
- Do not add any other text or explanations in the ranking section

Example of the correct format for your ENTIRE response:

Response A provides good detail on X but misses Y...
Response B is accurate but lacks depth on Z...
Response C offers the most comprehensive answer...

FINAL RANKING:
1. Response C
2. Response A
3. Response B

Now provide your evaluation and ranking:`;

    const messages: Message[] = [{ role: "user", content: rankingPrompt }];

    // Get rankings from all council models in parallel
    const responses = await this.client.queryModelsParallel(
      this.config.councilModels,
      messages
    );

    // Format results
    const stage2Results: Stage2Result[] = [];
    for (const [model, response] of Object.entries(responses)) {
      if (response !== null) {
        const fullText = response.content;
        const parsed = this.parseRankingFromText(fullText);
        stage2Results.push({
          model,
          ranking: fullText,
          parsed_ranking: parsed,
        });
      }
    }

    return { stage2Results, labelToModel };
  }

  /**
   * Stage 3: Chairman synthesizes final response.
   */
  async stage3SynthesizeFinal(
    userQuery: string,
    stage1Results: Stage1Result[],
    stage2Results: Stage2Result[]
  ): Promise<Stage3Result> {
    // Build comprehensive context for chairman
    const stage1Text = stage1Results
      .map((result) => `Model: ${result.model}\nResponse: ${result.response}`)
      .join("\n\n");

    const stage2Text = stage2Results
      .map((result) => `Model: ${result.model}\nRanking: ${result.ranking}`)
      .join("\n\n");

    const chairmanPrompt = `You are the Chairman of an LLM Council. Multiple AI models have provided responses to a user's question, and then ranked each other's responses.

Original Question: ${userQuery}

STAGE 1 - Individual Responses:
${stage1Text}

STAGE 2 - Peer Rankings:
${stage2Text}

Your task as Chairman is to synthesize all of this information into a single, comprehensive, accurate answer to the user's original question. Consider:
- The individual responses and their insights
- The peer rankings and what they reveal about response quality
- Any patterns of agreement or disagreement

Provide a clear, well-reasoned final answer that represents the council's collective wisdom:`;

    const messages: Message[] = [{ role: "user", content: chairmanPrompt }];

    // Query the chairman model
    const response = await this.client.queryModel(this.config.chairmanModel, messages);

    if (response === null) {
      return {
        model: this.config.chairmanModel,
        response: "Error: Unable to generate final synthesis.",
      };
    }

    return {
      model: this.config.chairmanModel,
      response: response.content,
    };
  }

  /**
   * Parse the FINAL RANKING section from the model's response.
   */
  private parseRankingFromText(rankingText: string): string[] {
    // Look for "FINAL RANKING:" section
    if (rankingText.includes("FINAL RANKING:")) {
      const parts = rankingText.split("FINAL RANKING:");
      if (parts.length >= 2) {
        const rankingSection = parts[1];
        // Try to extract numbered list format (e.g., "1. Response A")
        const numberedMatches = rankingSection.match(/\d+\.\s*Response [A-Z]/g);
        if (numberedMatches) {
          return numberedMatches.map((m) => {
            const match = m.match(/Response [A-Z]/);
            return match ? match[0] : "";
          }).filter(Boolean);
        }

        // Fallback: Extract all "Response X" patterns in order
        const matches = rankingSection.match(/Response [A-Z]/g);
        return matches || [];
      }
    }

    // Fallback: try to find any "Response X" patterns in order
    const matches = rankingText.match(/Response [A-Z]/g);
    return matches || [];
  }

  /**
   * Calculate aggregate rankings across all models.
   */
  calculateAggregateRankings(
    stage2Results: Stage2Result[],
    labelToModel: Record<string, string>
  ): Array<{ model: string; average_rank: number; rankings_count: number }> {
    const modelPositions: Record<string, number[]> = {};

    for (const ranking of stage2Results) {
      const parsedRanking = ranking.parsed_ranking;

      parsedRanking.forEach((label, index) => {
        const position = index + 1;
        if (label in labelToModel) {
          const modelName = labelToModel[label];
          if (!modelPositions[modelName]) {
            modelPositions[modelName] = [];
          }
          modelPositions[modelName].push(position);
        }
      });
    }

    // Calculate average position for each model
    const aggregate = Object.entries(modelPositions).map(([model, positions]) => {
      const avgRank = positions.reduce((a, b) => a + b, 0) / positions.length;
      return {
        model,
        average_rank: Math.round(avgRank * 100) / 100,
        rankings_count: positions.length,
      };
    });

    // Sort by average rank (lower is better)
    aggregate.sort((a, b) => a.average_rank - b.average_rank);

    return aggregate;
  }

  /**
   * Generate a short title for a conversation based on the first user message.
   */
  async generateConversationTitle(userQuery: string): Promise<string> {
    const titlePrompt = `Generate a very short title (3-5 words maximum) that summarizes the following question.
The title should be concise and descriptive. Do not use quotes or punctuation in the title.

Question: ${userQuery}

Title:`;

    const messages: Message[] = [{ role: "user", content: titlePrompt }];

    // Use gemini-2.5-flash for title generation (fast and cheap)
    const response = await this.client.queryModel(
      "google/gemini-2.5-flash",
      messages,
      30000
    );

    if (response === null) {
      return "New Conversation";
    }

    let title = response.content.trim();

    // Clean up the title - remove quotes, limit length
    title = title.replace(/^["']|["']$/g, "");

    // Truncate if too long
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    return title;
  }

  /**
   * Run the complete 3-stage council process.
   */
  async runFullCouncil(userQuery: string): Promise<{
    stage1Results: Stage1Result[];
    stage2Results: Stage2Result[];
    stage3Result: Stage3Result;
    metadata: CouncilMetadata;
  }> {
    // Stage 1: Collect individual responses
    const stage1Results = await this.stage1CollectResponses(userQuery);

    // If no models responded successfully, return error
    if (stage1Results.length === 0) {
      return {
        stage1Results: [],
        stage2Results: [],
        stage3Result: {
          model: "error",
          response: "All models failed to respond. Please try again.",
        },
        metadata: {
          label_to_model: {},
          aggregate_rankings: [],
        },
      };
    }

    // Stage 2: Collect rankings
    const { stage2Results, labelToModel } = await this.stage2CollectRankings(
      userQuery,
      stage1Results
    );

    // Calculate aggregate rankings
    const aggregateRankings = this.calculateAggregateRankings(
      stage2Results,
      labelToModel
    );

    // Stage 3: Synthesize final answer
    const stage3Result = await this.stage3SynthesizeFinal(
      userQuery,
      stage1Results,
      stage2Results
    );

    return {
      stage1Results,
      stage2Results,
      stage3Result,
      metadata: {
        label_to_model: labelToModel,
        aggregate_rankings: aggregateRankings,
      },
    };
  }
}
