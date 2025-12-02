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

    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    // Get message counts for each conversation
    const result: ConversationWithMessageCount[] = [];
    for (const conv of convs) {
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id));

      result.push({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: msgs.length,
      });
    }

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
    stage3: any,
    metadata: any
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
      stage3: JSON.stringify(stage3),
      metadata: JSON.stringify(metadata),
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
}
