import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Menu, Paperclip, Image as ImageIcon, X } from "lucide-react";
import MessageDisplay from "./MessageDisplay";
import DocumentUpload from "./DocumentUpload";
import EnhancedHeader from "./EnhancedHeader";
import AnimatedCard from "./AnimatedCard";
import HeroSection from "./HeroSection";
import { getDisplayNameForModel } from "@/lib/council_utils";

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

interface AttachedImage {
  id: string;
  file: File;
  preview: string;
  disabled?: boolean;
}

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
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    let loadedCount = 0;
    const filesToAdd: AttachedImage[] = [];
    const totalFiles = Array.from(files).filter(f => f.type.startsWith("image/")).length;

    if (totalFiles === 0) {
      e.currentTarget.value = "";
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          loadedCount++;
          const id = `img-${Date.now()}-${loadedCount}`;
          const preview = event.target?.result as string;
          const totalImages = attachedImages.length + filesToAdd.length + 1;
          const isDisabled = totalImages > MAX_IMAGES_PER_MESSAGE;

          filesToAdd.push({
            id,
            file,
            preview,
            disabled: isDisabled,
          });

          if (loadedCount === totalFiles) {
            setAttachedImages((prev) => [...prev, ...filesToAdd]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    e.currentTarget.value = "";
  };

  const removeImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachedImages.length === 0) return;
    
    // If no conversation exists, we need to create one first
    // This will be handled by the parent component (Council.tsx)
    // For now, just return if no conversation
    if (!conversation) return;

    const enabledImages = attachedImages.filter((img) => !img.disabled);
    let imageUrls: string[] = [];

    if (enabledImages.length > 0) {
      try {
        imageUrls = await Promise.all(
          enabledImages.map(async (img) => {
            const formData = new FormData();
            formData.append("file", img.file);

            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const error = await response.text();
              throw new Error(error || "Upload failed");
            }

            const data = await response.json();
            return data.url;
          })
        );
      } catch (error) {
        alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    setInput("");
    setAttachedImages([]);
    await onSendMessage(input, imageUrls);
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

      {/* Messages Area - Always show ScrollArea */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden w-full">
        <div className="w-full flex flex-col min-h-full">
          {/* Hero Section - Always shown at top */}
          <div className="w-full flex-shrink-0 h-auto">
            <HeroSection />
          </div>
          
          {/* Messages - Shown below hero section when conversation exists */}
          {conversation && conversation.messages.length > 0 && (
            <div className="p-3 md:p-4 w-full flex justify-center">
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
                      <p className="text-sm font-medium">Chairman is briefing the Council...</p>
                      <p className="text-xs mt-1">Analyzing your {attachedImages.length > 0 ? 'image and question' : 'question'} with {getDisplayNameForModel(selectedChairman || 'google/gemini-3-pro-preview')} as Chairman</p>
                      <p className="text-xs mt-2 text-yellow-600">This may take 30-60 seconds...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Loading indicator when no messages yet but processing */}
          {conversation && conversation.messages.length === 0 && isLoading && (
            <div className="p-3 md:p-4 w-full flex justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium">Chairman is briefing the Council...</p>
                  <p className="text-xs mt-1">Analyzing your {attachedImages.length > 0 ? 'image and question' : 'question'} with {getDisplayNameForModel(selectedChairman || 'google/gemini-3-pro-preview')} as Chairman</p>
                  <p className="text-xs mt-2 text-yellow-600">This may take 30-60 seconds...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area - Always visible */}
      <div className="border-t p-3 md:p-4 bg-background flex-shrink-0 space-y-3 max-h-96 overflow-y-auto">
        {showDocumentUpload && conversation && (
          <DocumentUpload
            conversationId={conversation.id}
            onDocumentUploaded={() => setShowDocumentUpload(false)}
          />
        )}
        {/* Image Previews - Enhanced visibility */}
        {attachedImages && attachedImages.length > 0 && (
          <div className="bg-muted/40 rounded-lg p-3 border border-border/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Attached Images: {attachedImages.filter(img => !img.disabled).length}/{MAX_IMAGES_PER_MESSAGE}
              </span>
              {attachedImages.filter(img => !img.disabled).length === MAX_IMAGES_PER_MESSAGE && attachedImages.some(img => img.disabled) && (
                <span className="text-xs text-yellow-600 font-medium">Limit reached</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {attachedImages.map((img) => (
                <div key={img.id} className={`relative group flex-shrink-0 ${img.disabled ? 'opacity-60' : ''}`}>
                  <img
                    src={img.preview}
                    alt="preview"
                    className={`h-20 w-20 object-cover rounded-lg border-2 shadow-sm transition-all ${
                      img.disabled 
                        ? 'border-muted-foreground/30 grayscale' 
                        : 'border-primary/40 hover:border-primary/80'
                    }`}
                  />
                  {img.disabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <span className="text-xs text-white font-medium">Disabled</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:shadow-xl"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
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
              className="flex-1 min-h-[44px] md:min-h-[50px] text-sm md:text-base"
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
              disabled={attachedImages && attachedImages.filter(img => !img.disabled).length >= MAX_IMAGES_PER_MESSAGE}
              title={attachedImages && attachedImages.filter(img => !img.disabled).length >= MAX_IMAGES_PER_MESSAGE ? `Maximum ${MAX_IMAGES_PER_MESSAGE} images reached` : "Attach photos"}
            >
              <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              type="button"
              onClick={() => setShowDocumentUpload(!showDocumentUpload)}
              size="icon"
              variant="outline"
              className="h-[44px] w-[44px] md:h-[50px] md:w-[50px] flex-shrink-0"
              disabled={false}
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
    </div>
  );
}
