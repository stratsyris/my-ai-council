import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Menu, Paperclip, Image as ImageIcon, X } from "lucide-react";
import MessageDisplay from "./MessageDisplay";
import DocumentUpload from "./DocumentUpload";
import EnhancedHeader from "./EnhancedHeader";
import AnimatedCard from "./AnimatedCard";

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

interface Conversation {
  id: string;
  title: string | null;
  messages: Message[];
}

interface ChatInterfaceProps {
  conversation: Conversation | undefined;
  onSendMessage: (content: string, imageUrls?: string[]) => Promise<void>;
  isLoading: boolean;
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  selectedChairman?: string;
  onChairmanChange?: (chairmanModel: string) => void;
}

const MAX_IMAGES_PER_MESSAGE = 10;

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
  onOpenSidebar,
  isMobile = false,
  selectedChairman = "google/gemini-3-pro-preview",
  onChairmanChange,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [attachedImages, setAttachedImages] = useState<Array<{id: string; file: File; preview: string}>>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const filesToAdd: Array<{id: string; file: File; preview: string}> = [];
    let rejectedCount = 0;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        // Check if adding this file would exceed the limit
        if (attachedImages && attachedImages.length + filesToAdd.length >= MAX_IMAGES_PER_MESSAGE) {
          rejectedCount++;
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = event.target?.result as string;
          filesToAdd.push({ id: Math.random().toString(36), file, preview });
          setAttachedImages((prev) => [...(prev || []), ...filesToAdd]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (rejectedCount > 0) {
      alert(`You can only upload up to ${MAX_IMAGES_PER_MESSAGE} images per message. ${rejectedCount} image(s) were not added.`);
    }

    e.currentTarget.value = "";
  };

  const removeImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

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
    if (!input.trim() && attachedImages.length === 0) return;
    if (isLoading) return;

    const content = input.trim();
    let imageUrls: string[] = [];
    
    // Upload images to S3 if any are attached
    if (attachedImages.length > 0) {
      try {
        const uploadPromises = attachedImages.map(async (img) => {
          const formData = new FormData();
          formData.append('file', img.file);
          
          console.log(`[ChatInterface] Uploading image: ${img.file.name}`);
          
          // Upload to S3 via backend
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Upload failed: ${errorData.message || errorData.error}`);
          }
          
          const data = await response.json();
          console.log(`[ChatInterface] Image uploaded successfully: ${data.url}`);
          return data.url;
        });
        
        imageUrls = await Promise.all(uploadPromises);
        console.log(`[ChatInterface] All images uploaded: ${imageUrls.length} URLs`);
      } catch (error) {
        console.error('[ChatInterface] Error uploading images:', error);
        alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    setInput("");
    setAttachedImages([]);
    await onSendMessage(content, imageUrls);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only allow Enter to send if we have text (not just images)
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen">
      <EnhancedHeader 
        onOpenSidebar={onOpenSidebar} 
        isMobile={isMobile}
        selectedChairman={selectedChairman}
        onChairmanChange={onChairmanChange}
      />

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
          <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden w-full">
            <div className="p-3 md:p-4 w-full flex justify-center">
              {conversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground py-12">
                  <div className="text-center">
                    <h2 className="text-lg md:text-xl font-semibold mb-2">Start a Conversation</h2>
                    <p className="text-sm md:text-base">Ask a question and watch the council collaborate</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
                  {conversation.messages.map((message, idx) => (
                    <AnimatedCard key={message.id} delay={idx}>
                      <MessageDisplay message={message} isMobile={isMobile} />
                    </AnimatedCard>
                  ))}
                  {isLoading && (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Council is deliberating...</p>
                        <p className="text-xs mt-1">Analyzing your {attachedImages.length > 0 ? 'image and question' : 'question'} with {selectedChairman?.includes('gpt-5') ? 'GPT-5.2' : selectedChairman?.includes('claude') ? 'Claude' : selectedChairman?.includes('gemini') ? 'Gemini 3' : 'Grok 4'} as Chairman</p>
                        <p className="text-xs mt-2 text-yellow-600">This may take 30-60 seconds...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area - Always visible when conversation exists */}
          <div className="border-t p-3 md:p-4 bg-background flex-shrink-0 space-y-3">
            {showDocumentUpload && conversation && (
              <DocumentUpload
                conversationId={conversation.id}
                onDocumentUploaded={() => setShowDocumentUpload(false)}
              />
            )}
            {/* Image Previews */}
            {attachedImages && attachedImages.length > 0 && (
              <div className="px-3 md:px-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Images: {attachedImages.length}/{MAX_IMAGES_PER_MESSAGE}</span>
                  {attachedImages.length === MAX_IMAGES_PER_MESSAGE && (
                    <span className="text-yellow-600">Limit reached</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachedImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.preview}
                        alt="preview"
                        className="h-16 w-16 object-cover rounded border border-border"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  size="icon"
                  variant="outline"
                  className="h-[44px] w-[44px] md:h-[50px] md:w-[50px] flex-shrink-0"
                  disabled={attachedImages && attachedImages.length >= MAX_IMAGES_PER_MESSAGE}
                  title={attachedImages && attachedImages.length >= MAX_IMAGES_PER_MESSAGE ? `Maximum ${MAX_IMAGES_PER_MESSAGE} images reached` : "Attach photos"}
                >
                  <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                  size="icon"
                  variant="outline"
                  className="h-[44px] w-[44px] md:h-[50px] md:w-[50px] flex-shrink-0"
                  title="Upload document"
                >
                  <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <Button
                  type="submit"
                  disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
                  size="icon"
                  className="h-[44px] w-[44px] md:h-[50px] md:w-[50px] flex-shrink-0"
                  title="Send message"
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
