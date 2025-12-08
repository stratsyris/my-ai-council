import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Sidebar from "@/components/council/Sidebar";
import ChatInterface from "@/components/council/ChatInterface";
import MobileSidebar from "@/components/council/MobileSidebar";
import ConfigurationGuide from "@/components/council/ConfigurationGuide";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TRPCClientError } from "@trpc/client";

export default function Council() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Check authentication first
  const { isAuthenticated, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const { data: conversations = [], refetch: refetchConversations } =
    trpc.council.listConversations.useQuery(undefined, {
      enabled: isAuthenticated && !authLoading,
    });

  const { data: currentConversation, refetch: refetchConversation } =
    trpc.council.getConversation.useQuery(
      { conversationId: currentConversationId! },
      { enabled: !!currentConversationId && isAuthenticated && !authLoading }
    );

  const createConversation = trpc.council.createConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
      refetchConversations();
      setSidebarOpen(false);
      setConfigError(null);
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        const message = error.message;
        if (message.includes("OPENROUTER_API_KEY")) {
          setConfigError("OPENROUTER_API_KEY");
        } else {
          setConfigError(message);
        }
      }
    },
  });

  const sendMessage = trpc.council.sendMessage.useMutation({
    onSuccess: () => {
      refetchConversation();
      refetchConversations();
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        const message = error.message;
        if (message.includes("OPENROUTER_API_KEY")) {
          setConfigError("OPENROUTER_API_KEY");
        } else {
          setConfigError(message);
        }
      }
    },
  });

  const handleNewConversation = () => {
    createConversation.mutate();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) return;

    await sendMessage.mutateAsync({
      conversationId: currentConversationId,
      content,
    });
  };

  const deleteConversation = trpc.council.deleteConversation.useMutation({
    onSuccess: () => {
      setCurrentConversationId(null);
      refetchConversations();
    },
  });

  const handleDeleteConversation = (id: string) => {
    deleteConversation.mutate({ conversationId: id });
  };

  // Auto-load last conversation on mount, only after auth is confirmed
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId, isAuthenticated, authLoading]);

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show configuration guide if API key is missing
  if (configError === "OPENROUTER_API_KEY") {
    return <ConfigurationGuide missingKeys={["OPENROUTER_API_KEY"]} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isMobile ? (
        <MobileSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      ) : (
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}
      <ChatInterface
        conversation={currentConversation}
        onSendMessage={handleSendMessage}
        isLoading={sendMessage.isPending}
        onOpenSidebar={() => setSidebarOpen(true)}
        isMobile={isMobile}
      />
    </div>
  );
}
