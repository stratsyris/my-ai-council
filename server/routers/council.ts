/**
 * Council API router with streaming support.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { OpenRouterClient } from "../services/openrouter";
import { CouncilOrchestrator } from "../services/council";
import { DatabaseService } from "../services/database";
import { TRPCError } from "@trpc/server";

// Initialize services
const getOpenRouterClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "OPENROUTER_API_KEY not configured",
    });
  }
  return new OpenRouterClient({ apiKey });
};

const getCouncilOrchestrator = () => {
  const client = getOpenRouterClient();
  
  // Default council models - using latest top-performing models
  const councilModels = process.env.COUNCIL_MODELS
    ? process.env.COUNCIL_MODELS.split(",")
    : [
        "openai/gpt-5.1",
        "anthropic/claude-sonnet-4.5",
        "google/gemini-3-pro",
        "x-ai/grok-4",
      ];

  // Chairman model - using latest Gemini 3
  const chairmanModel = process.env.CHAIRMAN_MODEL || "google/gemini-3-pro";

  return new CouncilOrchestrator(client, { councilModels, chairmanModel });
};

const dbService = new DatabaseService();

export const councilRouter = router({
  /**
   * Create a new conversation.
   */
  createConversation: protectedProcedure.mutation(async ({ ctx }) => {
    const conversation = await dbService.createConversation(ctx.user.id);
    return conversation;
  }),

  /**
   * List all conversations for the current user.
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await dbService.listConversations(ctx.user.id);
    return conversations;
  }),

  /**
   * Get a conversation with all its messages.
   */
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await dbService.getConversation(
        input.conversationId,
        ctx.user.id
      );

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      return conversation;
    }),

  /**
   * Send a message and run the council process.
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify conversation ownership
      const conversation = await dbService.getConversation(
        input.conversationId,
        ctx.user.id
      );

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Add user message
      await dbService.addUserMessage(input.conversationId, input.content);

      // Run council process
      const orchestrator = getCouncilOrchestrator();
      const result = await orchestrator.runFullCouncil(input.content);

      // Add assistant message
      await dbService.addAssistantMessage(
        input.conversationId,
        result.stage1Results,
        result.stage2Results,
        result.stage3Result,
        result.metadata
      );

      // Generate title if this is the first message
      if (conversation.messages.length === 0) {
        const title = await orchestrator.generateConversationTitle(input.content);
        await dbService.updateConversationTitle(input.conversationId, title);
      }

      return {
        stage1: result.stage1Results,
        stage2: result.stage2Results,
        stage3: result.stage3Result,
        metadata: result.metadata,
      };
    }),
});
