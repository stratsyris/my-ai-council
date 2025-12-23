import { describe, it, expect, beforeAll } from "vitest";
import { DatabaseService } from "./database";
import { getDb } from "../db";

describe("DatabaseService", () => {
  let dbService: DatabaseService;
  let testUserId: number;
  let testConversationId: string;

  beforeAll(async () => {
    dbService = new DatabaseService();
    // Use a test user ID (assuming user ID 1 exists from auth setup)
    testUserId = 1;
  });

  it("should create a new conversation", async () => {
    const conversation = await dbService.createConversation(testUserId);
    expect(conversation).toHaveProperty("id");
    expect(conversation).toHaveProperty("createdAt");
    expect(typeof conversation.id).toBe("string");
    testConversationId = conversation.id;
  });

  it("should list conversations for a user", async () => {
    const conversations = await dbService.listConversations(testUserId);
    expect(Array.isArray(conversations)).toBe(true);
    expect(conversations.length).toBeGreaterThan(0);
    expect(conversations[0]).toHaveProperty("id");
    expect(conversations[0]).toHaveProperty("messageCount");
  });

  it("should get a conversation with messages", async () => {
    const conversation = await dbService.getConversation(testConversationId, testUserId);
    expect(conversation).not.toBeNull();
    expect(conversation?.id).toBe(testConversationId);
    expect(Array.isArray(conversation?.messages)).toBe(true);
  });

  it("should add a user message", async () => {
    const messageId = await dbService.addUserMessage(
      testConversationId,
      "Test question"
    );
    expect(typeof messageId).toBe("string");
    expect(messageId.length).toBeGreaterThan(0);
  });

  it("should add an assistant message", async () => {
    const stage1 = [{ model: "test-model", response: "Test response" }];
    const stage2 = { analysis: "Test analysis", finalAnswer: "Test final answer" };
    const chairmanModel = "google/gemini-3-pro-preview";

    const messageId = await dbService.addAssistantMessage(
      testConversationId,
      stage1,
      stage2,
      chairmanModel
    );
    expect(typeof messageId).toBe("string");
    expect(messageId.length).toBeGreaterThan(0);
  });

  it("should update conversation title", async () => {
    await dbService.updateConversationTitle(testConversationId, "Test Title");
    const conversation = await dbService.getConversation(testConversationId, testUserId);
    expect(conversation?.title).toBe("Test Title");
  });
});
