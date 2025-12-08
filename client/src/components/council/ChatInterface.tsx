import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Menu } from "lucide-react";
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
  onOpenSidebar?: () => void;
  isMobile?: boolean;
}

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
  onOpenSidebar,
  isMobile = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 0);
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
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen md:h-auto">
      {/* Header */}
      <div className="border-b p-3 md:p-4 flex items-center gap-3 flex-shrink-0">
        {isMobile && onOpenSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            className="flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-2xl font-bold truncate">LLM Council</h1>
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            Multiple LLMs work together to answer your questions
          </p>
        </div>
      </div>

      {/* Messages Area */}
      {!conversation ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-semibold mb-2">Welcome to LLM Council</h2>
            <p className="text-sm md:text-base">Create a new conversation to get started</p>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden">
            <div className="p-3 md:p-4">
              {conversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground py-12">
                  <div className="text-center">
                    <h2 className="text-lg md:text-xl font-semibold mb-2">Start a Conversation</h2>
                    <p className="text-sm md:text-base">Ask a question and watch the council collaborate</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
                  {conversation.messages.map((message) => (
                    <MessageDisplay key={message.id} message={message} isMobile={isMobile} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Council is deliberating...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area - Always visible when conversation exists */}
          <div className="border-t p-3 md:p-4 bg-background flex-shrink-0">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your question..."
                  className="flex-1 min-h-[44px] md:min-h-[50px] resize-none text-sm md:text-base"
                  disabled={isLoading}
                  rows={isMobile ? 2 : 3}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[44px] w-[44px] md:h-[50px] md:w-[50px] flex-shrink-0"
                  title="Send message (Enter to send, Shift+Enter for new line)"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
