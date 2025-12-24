/**
 * Database service for conversations and messages.
 */

import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { conversations, messages, InsertConversation, InsertMessage } from "../../drizzle/schema";
import { nanoid } from "nanoid";

export interface ConversationWithMessageCount {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export class DatabaseService {
  /**
   * Create a new conversation.
   */
  async createConversation(userId: number): Promise<{ id: string; createdAt: Date }> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const id = nanoid();
    const now = new Date();

    const insertData: InsertConversation = {
      id,
      userId,
      title: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(conversations).values(insertData);

    return { id, createdAt: now };
  }

  /**
   * List all conversations for a user.
   */
  async listConversations(userId: number): Promise<ConversationWithMessageCount[]> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Get conversations with message counts in a single query
    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));

    // Get all message counts for these conversations in one query
    const allMessages = await db
      .select()
      .from(messages);

    // Create a map of conversation ID to message count
    const messageCounts = new Map<string, number>();
    for (const msg of allMessages) {
      messageCounts.set(msg.conversationId, (messageCounts.get(msg.conversationId) || 0) + 1);
    }

    // Build result with message counts
    const result: ConversationWithMessageCount[] = convs.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: messageCounts.get(conv.id) || 0,
    }));

    return result;
  }

  /**
   * Get a conversation with all its messages.
   */
  async getConversation(conversationId: string, userId: number) {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conv.length === 0 || conv[0].userId !== userId) {
      return null;
    }

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return {
      ...conv[0],
      messages: msgs.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        stage1: msg.stage1 ? JSON.parse(msg.stage1) : null,
        stage2: msg.stage2 ? JSON.parse(msg.stage2) : null,
        stage3: msg.stage3 ? JSON.parse(msg.stage3) : null,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
        chairmanModel: msg.chairmanModel,
        createdAt: msg.createdAt,
      })),
    };
  }

  /**
   * Add a user message to a conversation.
   */
  async addUserMessage(conversationId: string, content: string): Promise<string> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const id = nanoid();
    const now = new Date();

    const insertData: InsertMessage = {
      id,
      conversationId,
      role: "user",
      content,
      createdAt: now,
    };

    await db.insert(messages).values(insertData);

    // Update conversation's updatedAt
    await db
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    return id;
  }

  /**
   * Add an assistant message to a conversation.
   */
  async addAssistantMessage(
    conversationId: string,
    stage1: any,
    stage2: any,
    chairmanModel?: string
  ): Promise<string> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const id = nanoid();
    const now = new Date();

    const insertData: InsertMessage = {
      id,
      conversationId,
      role: "assistant",
      content: null,
      stage1: JSON.stringify(stage1),
      stage2: JSON.stringify(stage2),
      chairmanModel: chairmanModel || null,
      createdAt: now,
    };

    await db.insert(messages).values(insertData);

    // Update conversation's updatedAt
    await db
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    return id;
  }

  /**
   * Update conversation title.
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    await db
      .update(conversations)
      .set({ title })
      .where(eq(conversations.id, conversationId));
  }

  /**
   * Add a document to a conversation.
   */
  async addDocument(
    id: string,
    conversationId: string,
    userId: number,
    fileName: string,
    fileType: string,
    s3Key: string,
    s3Url: string,
    extractedText: string,
    fileSize: number
  ) {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const { documents: documentsTable } = await import("../../drizzle/schema");
    await db.insert(documentsTable).values({
      id,
      conversationId,
      userId,
      fileName,
      fileType,
      s3Key,
      s3Url,
      extractedText,
      fileSize,
    });

    return { id, conversationId, userId, fileName, fileType, s3Key, s3Url, extractedText, fileSize, createdAt: new Date() };
  }

  /**
   * Get documents for a conversation.
   */
  async getDocumentsByConversation(conversationId: string) {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const { documents: documentsTable } = await import("../../drizzle/schema");
    return db.select().from(documentsTable).where(eq(documentsTable.conversationId, conversationId));
  }

  /**
   * Get a specific document.
   */
  async getDocument(documentId: string, userId: number) {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const { documents: documentsTable } = await import("../../drizzle/schema");
    const doc = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId))
      .limit(1);

    return doc.length > 0 && doc[0].userId === userId ? doc[0] : null;
  }

  /**
   * Delete a conversation and all its messages.
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    await db.delete(conversations).where(eq(conversations.id, conversationId));
  }
}
