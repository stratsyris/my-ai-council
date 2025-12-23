import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { User, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content?: string | null;
  stage1?: any;
  stage2?: any;
  stage3?: any;
  metadata?: any;
  chairmanModel?: string | null;
  createdAt: Date;
}

interface MessageDisplayProps {
  message: Message;
  isMobile?: boolean;
}

export default function MessageDisplay({ message, isMobile = false }: MessageDisplayProps) {
  const [stage1Open, setStage1Open] = useState(!isMobile);
  const [stage2Open, setStage2Open] = useState(true);

  if (message.role === "user") {
    return (
      <div className="flex gap-2 md:gap-3">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold mb-1 text-sm md:text-base">You</div>
          <div className="prose prose-sm max-w-none text-sm md:text-base break-words">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message with stages (Option A flow)
  return (
    <div className="flex gap-2 md:gap-3">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold mb-2 md:mb-3 text-sm md:text-base">LLM Council</div>

        {/* Stage 2: Chairman Final Answer (shown first - most important) */}
        {message.stage2 && (
          <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg w-full overflow-x-hidden">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="font-bold text-sm md:text-base text-primary break-words">
                🎯 Chairman's Final Answer
              </h3>
              {message.chairmanModel && (
                <span className="text-xs md:text-sm bg-primary/20 text-primary px-2 py-1 rounded whitespace-nowrap">
                  {message.chairmanModel.includes("gpt-5")
                    ? "GPT-5.2"
                    : message.chairmanModel.includes("claude")
                    ? "Claude Sonnet"
                    : message.chairmanModel.includes("gemini")
                    ? "Gemini 3"
                    : message.chairmanModel.includes("grok")
                    ? "Grok 4"
                    : message.chairmanModel}
                </span>
              )}
            </div>
            <div className="prose prose-sm max-w-none text-sm md:text-base break-words w-full overflow-x-hidden">
              <div className="w-full overflow-x-hidden">
                <ReactMarkdown>
                  {message.stage2.finalAnswer || message.stage2.analysis || ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Stage 1: Individual Responses from Council Members */}
        {message.stage1 && message.stage1.length > 0 && (
          <Collapsible open={stage1Open} onOpenChange={setStage1Open}>
            <div className="border border-muted rounded-lg overflow-hidden">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 md:p-4 h-auto hover:bg-muted/50 rounded-none"
                >
                  <h3 className="font-semibold text-sm md:text-base">
                    📋 Stage 1: Individual Council Responses
                  </h3>
                  {stage1Open ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-muted">
                <div className="p-3 md:p-4">
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
                      {message.stage1.map((result: any, index: number) => (
                        <TabsTrigger
                          key={index}
                          value={index.toString()}
                          className="text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <span className="truncate max-w-[100px] md:max-w-none">
                            {result.model.split("/").pop() || `Model ${index + 1}`}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {message.stage1.map((result: any, index: number) => (
                      <TabsContent
                        key={index}
                        value={index.toString()}
                        className="mt-3 md:mt-4"
                      >
                        <div className="prose prose-sm max-w-none text-sm md:text-base break-words">
                          <ReactMarkdown>{result.response}</ReactMarkdown>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
