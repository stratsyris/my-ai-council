/**
 * Council API router with streaming support.
 */

import { z } from "zod";
import { publicProcedure, router } from "../\_core/trpc";
import { OpenRouterClient } from "../services/openrouter";
import { CouncilOrchestrator } from "../services/council";
import { DatabaseService } from "../services/database";
import { TRPCError } from "@trpc/server";
import { getChairmanPreference, updateChairmanPreference } from "../db";

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

const getCouncilOrchestrator = (overrideChairmanModel?: string) => {
  const client = getOpenRouterClient();
  
  // Default council models - using latest top-performing models
  const councilModels = process.env.COUNCIL_MODELS
    ? process.env.COUNCIL_MODELS.split(",")
    : [
        "openai/gpt-5.2",
        "anthropic/claude-sonnet-4.5",
        "google/gemini-3-pro-preview",
        "x-ai/grok-4",
      ];

  // Chairman model - use provided model or fall back to environment/default
  const selectedChairman = overrideChairmanModel || process.env.CHAIRMAN_MODEL || "google/gemini-3-pro-preview";

  return new CouncilOrchestrator(client, { councilModels, chairmanModel: selectedChairman });
};

const dbService = new DatabaseService();

export const councilRouter = router({
  /**
   * Create a new conversation.
   */
  createConversation: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user?.id || 1;
      console.log("[createConversation] Creating with userId:", userId);
      const conversation = await dbService.createConversation(userId);
      console.log("[createConversation] Created:", conversation);
      return conversation;
    } catch (error) {
      console.error("[createConversation] Error:", error);
      throw error;
    }
  }),

  /**
   * List conversations for the current user.
   */
  listConversations: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id || 1;
    const conversations = await dbService.listConversations(userId);
    return conversations;
  }),

  /**
   * Get a specific conversation.
   */
  getConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id || 1;
      const conversation = await dbService.getConversation(input.conversationId, userId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      return conversation;
    }),

  /**
   * Send a message to the council with optional images.
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string(),
        chairmanModel: z.string().optional(),
        imageUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify conversation exists and belongs to user
      const userId = ctx.user?.id || 1;
      const conversation = await dbService.getConversation(input.conversationId, userId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      // Add user message
      await dbService.addUserMessage(input.conversationId, input.content);

      // Run council process with selected chairman and images
      const orchestrator = getCouncilOrchestrator(input.chairmanModel);
      const result = await orchestrator.executeCouncil(input.content, input.imageUrls);

      // Add assistant message with chairman model info
      await dbService.addAssistantMessage(
        input.conversationId,
        result.stage1,
        result.stage2,
        input.chairmanModel
      );

      // Generate title if this is the first message
      if (conversation.messages.length === 0) {
        const titleContent = input.imageUrls?.length ? `Image Analysis: ${input.content.substring(0, 40)}...` : `Council Discussion: ${input.content.substring(0, 50)}...`;
        await dbService.updateConversationTitle(input.conversationId, titleContent);
      }

      return {
        stage1: result.stage1,
        stage2: result.stage2,
      };
    }),

  /**
   * Upload a document for council evaluation.
   */
  uploadDocument: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        fileData: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id || 1;
      const conversation = await dbService.getConversation(input.conversationId, userId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const { DocumentService } = await import("../services/document");
      const docService = new DocumentService();

      const fileBuffer = Buffer.from(input.fileData, "base64");

      const uploadedDoc = await docService.uploadDocument(
        {
          name: input.fileName,
          type: input.fileType,
          size: input.fileSize,
          data: fileBuffer,
        },
        input.conversationId,
        userId
      );

      const doc = await dbService.addDocument(
        uploadedDoc.id,
        uploadedDoc.conversationId,
        uploadedDoc.userId,
        uploadedDoc.fileName,
        uploadedDoc.fileType,
        uploadedDoc.s3Key,
        uploadedDoc.s3Url,
        uploadedDoc.extractedText,
        uploadedDoc.fileSize
      );

      return {
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        s3Url: doc.s3Url,
        extractedText: doc.extractedText,
      };
    }),

  /**
   * Get documents for a conversation.
   */
  getDocuments: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.id || 1;
      const conversation = await dbService.getConversation(input.conversationId, userId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      return dbService.getDocumentsByConversation(input.conversationId);
    }),

  deleteConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id || 1;
      const conversation = await dbService.getConversation(input.conversationId, userId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      await dbService.deleteConversation(input.conversationId);
      return { success: true };
    }),

  /**
   * Delete multiple conversations at once.
   */
  bulkDeleteConversations: publicProcedure
    .input(z.object({ conversationIds: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Delete all conversations without ownership check
      for (const conversationId of input.conversationIds) {
        try {
          await dbService.deleteConversation(conversationId);
        } catch (error) {
          console.error(`Failed to delete conversation ${conversationId}:`, error);
        }
      }

      return { success: true, deletedCount: input.conversationIds.length };
    }),

  renameConversation: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        title: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id || 1;
      const conversation = await dbService.getConversation(input.conversationId, userId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      await dbService.updateConversationTitle(input.conversationId, input.title);
      return { success: true, title: input.title };
    }),

  /**
   * Get user's saved Chairman preference
   */
  getChairmanPreference: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id || 1;
    const chairmanModel = await getChairmanPreference(userId);
    return { chairmanModel };
  }),

  /**
   * Update user's Chairman preference
   */
  updateChairmanPreference: publicProcedure
    .input(
      z.object({
        chairmanModel: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id || 1;
      await updateChairmanPreference(userId, input.chairmanModel);
      return { success: true, chairmanModel: input.chairmanModel };
    }),
});
