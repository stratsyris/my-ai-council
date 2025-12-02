import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";

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
}

export default function MessageDisplay({ message }: MessageDisplayProps) {
  if (message.role === "user") {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="font-semibold mb-1">You</div>
          <div className="prose prose-sm max-w-none">{message.content}</div>
        </div>
      </div>
    );
  }

  // Assistant message with stages
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold mb-3">LLM Council</div>

        {/* Stage 3: Final Answer (shown first) */}
        {message.stage3 && (
          <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2 text-primary">Final Answer</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{message.stage3.response}</ReactMarkdown>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Synthesized by: {message.stage3.model}
            </div>
          </Card>
        )}

        {/* Stage 1: Individual Responses */}
        {message.stage1 && message.stage1.length > 0 && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Stage 1: Individual Responses</h3>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto">
                {message.stage1.map((result: any, index: number) => (
                  <TabsTrigger key={index} value={index.toString()} className="text-xs">
                    {result.model.split("/").pop()}
                  </TabsTrigger>
                ))}
              </TabsList>
              {message.stage1.map((result: any, index: number) => (
                <TabsContent key={index} value={index.toString()} className="mt-4">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{result.response}</ReactMarkdown>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        )}

        {/* Stage 2: Rankings */}
        {message.stage2 && message.stage2.length > 0 && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Stage 2: Peer Reviews</h3>
            
            {/* Aggregate Rankings */}
            {message.metadata?.aggregate_rankings && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Aggregate Rankings</h4>
                <div className="space-y-1">
                  {message.metadata.aggregate_rankings.map((rank: any, index: number) => (
                    <div key={index} className="text-sm flex items-center justify-between">
                      <span>
                        {index + 1}. {rank.model.split("/").pop()}
                      </span>
                      <span className="text-muted-foreground">
                        Avg: {rank.average_rank.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="0" className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto">
                {message.stage2.map((result: any, index: number) => (
                  <TabsTrigger key={index} value={index.toString()} className="text-xs">
                    {result.model.split("/").pop()}
                  </TabsTrigger>
                ))}
              </TabsList>
              {message.stage2.map((result: any, index: number) => (
                <TabsContent key={index} value={index.toString()} className="mt-4">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {result.ranking}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
}
