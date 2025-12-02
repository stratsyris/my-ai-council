import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import MessageDisplay from "./MessageDisplay";

interface Message {
  id: string;
  role: "user" | "assistant";
  content?: string | null;
  stage1?: any;
  stage2?: any;
  stage3?: any;
  metadata?: any;
  createdAt: Date;
}

interface Conversation {
  id: string;
  title: string | null;
  messages: Message[];
}

interface ChatInterfaceProps {
  conversation: Conversation | undefined;
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversation?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    setInput("");
    await onSendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">LLM Council</h1>
        <p className="text-sm text-muted-foreground">
          Multiple LLMs work together to answer your questions
        </p>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {!conversation ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Welcome to LLM Council</h2>
              <p>Create a new conversation to get started</p>
            </div>
          </div>
        ) : conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
              <p>Ask a question and watch the council collaborate</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            {conversation.messages.map((message) => (
              <MessageDisplay key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Council is deliberating...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      {conversation && (
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your question..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
