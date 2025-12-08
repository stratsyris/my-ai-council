import { Card } from "@/components/ui/card";
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
  createdAt: Date;
}

interface MessageDisplayProps {
  message: Message;
  isMobile?: boolean;
}

export default function MessageDisplay({ message, isMobile = false }: MessageDisplayProps) {
  const [stage1Open, setStage1Open] = useState(!isMobile);
  const [stage2Open, setStage2Open] = useState(!isMobile);

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

  // Assistant message with stages
  return (
    <div className="flex gap-2 md:gap-3">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold mb-2 md:mb-3 text-sm md:text-base">LLM Council</div>

        {/* Stage 3: Final Answer (shown first) */}
        {message.stage3 && (
          <Card className="p-3 md:p-4 mb-3 md:mb-4 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2 text-primary text-sm md:text-base">Final Answer</h3>
            <div className="prose prose-sm max-w-none text-sm md:text-base break-words">
              <ReactMarkdown>{message.stage3.response}</ReactMarkdown>
            </div>
            <div className="text-xs text-muted-foreground mt-2 truncate">
              Synthesized by: {message.stage3.model}
            </div>
          </Card>
        )}

        {/* Stage 1: Individual Responses */}
        {message.stage1 && message.stage1.length > 0 && (
          <Collapsible open={stage1Open} onOpenChange={setStage1Open}>
            <Card className="p-3 md:p-4 mb-3 md:mb-4">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent mb-2"
                >
                  <h3 className="font-semibold text-sm md:text-base">
                    Stage 1: Individual Responses
                  </h3>
                  {stage1Open ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Tabs defaultValue="0" className="w-full">
                  <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted">
                    {message.stage1.map((result: any, index: number) => (
                      <TabsTrigger
                        key={index}
                        value={index.toString()}
                        className="text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <span className="truncate max-w-[100px] md:max-w-none">
                          {result.model.split("/").pop()}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {message.stage1.map((result: any, index: number) => (
                    <TabsContent key={index} value={index.toString()} className="mt-3 md:mt-4">
                      <div className="prose prose-sm max-w-none text-sm md:text-base break-words">
                        <ReactMarkdown>{result.response}</ReactMarkdown>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Stage 2: Rankings */}
        {message.stage2 && message.stage2.length > 0 && (
          <Collapsible open={stage2Open} onOpenChange={setStage2Open}>
            <Card className="p-3 md:p-4 mb-3 md:mb-4">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent mb-2"
                >
                  <h3 className="font-semibold text-sm md:text-base">
                    Stage 2: Peer Reviews
                  </h3>
                  {stage2Open ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {/* Aggregate Rankings */}
                {message.metadata?.aggregate_rankings && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-muted rounded-lg">
                    <h4 className="text-xs md:text-sm font-semibold mb-2">Aggregate Rankings</h4>
                    <div className="space-y-1">
                      {message.metadata.aggregate_rankings.map((rank: any, index: number) => (
                        <div
                          key={index}
                          className="text-xs md:text-sm flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            {index + 1}. {rank.model.split("/").pop()}
                          </span>
                          <span className="text-muted-foreground flex-shrink-0">
                            Avg: {rank.average_rank.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Tabs defaultValue="0" className="w-full">
                  <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                    {message.stage2.map((result: any, index: number) => (
                      <TabsTrigger
                        key={index}
                        value={index.toString()}
                        className="text-xs px-2 py-1 md:text-sm md:px-3 md:py-1.5"
                      >
                        <span className="truncate max-w-[100px] md:max-w-none">
                          {result.model.split("/").pop()}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {message.stage2.map((result: any, index: number) => (
                    <TabsContent key={index} value={index.toString()} className="mt-3 md:mt-4">
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-xs md:text-sm break-words">
                        {result.ranking}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
