import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
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
  const [selectedChairman, setSelectedChairman] = useState<string>("google/gemini-3-pro-preview");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hasAutoCreated = useRef(false);

  const { data: conversations = [], refetch: refetchConversations } =
    trpc.council.listConversations.useQuery();

  const { data: currentConversation, refetch: refetchConversation } =
    trpc.council.getConversation.useQuery(
      { conversationId: currentConversationId! },
      { 
        enabled: !!currentConversationId,
        retry: false
      }
    );

  // Handle conversation not found errors
  useEffect(() => {
    if (currentConversation === undefined && currentConversationId) {
      // Query returned but no data - conversation not found
      // This will be handled by the error effect below
    }
  }, [currentConversation, currentConversationId]);

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

  const handleChairmanChange = (chairmanModel: string) => {
    setSelectedChairman(chairmanModel);
  };

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
      chairmanModel: selectedChairman,
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

  const renameConversation = trpc.council.renameConversation.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  const handleRenameConversation = (id: string, title: string) => {
    renameConversation.mutate({ conversationId: id, title });
  };

  const bulkDeleteConversations = trpc.council.bulkDeleteConversations.useMutation({
    onSuccess: () => {
      setCurrentConversationId(null);
      refetchConversations();
    },
  });

  const handleBulkDeleteConversations = (ids: string[]) => {
    bulkDeleteConversations.mutate({ conversationIds: ids });
  };

  // Auto-create first conversation on mount if none exist
  useEffect(() => {
    if (!hasAutoCreated.current && conversations.length === 0 && !createConversation.isPending) {
      hasAutoCreated.current = true;
      createConversation.mutate();
    }
  }, [conversations.length, createConversation.isPending]);

  // Auto-load first conversation if one is available
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      // Only set if the conversation exists in our list
      const firstConversation = conversations[0];
      if (firstConversation) {
        setCurrentConversationId(firstConversation.id);
      }
    }
  }, [conversations, currentConversationId]);

  // Clear current conversation if it's no longer in the list
  useEffect(() => {
    if (currentConversationId && !conversations.find(c => c.id === currentConversationId)) {
      setCurrentConversationId(null);
    }
  }, [conversations, currentConversationId]);

  // Handle conversation not found errors
  useEffect(() => {
    if (currentConversationId && currentConversation === undefined && conversations.length > 0) {
      // If we have conversations but the current one is not found, clear it
      const conversationExists = conversations.some(c => c.id === currentConversationId);
      if (!conversationExists) {
        setCurrentConversationId(null);
      }
    }
  }, [currentConversation, currentConversationId, conversations]);

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
          onDeleteConversation={handleDeleteConversation}
          onBulkDeleteConversations={handleBulkDeleteConversations}
          onRenameConversation={handleRenameConversation}
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
          onBulkDeleteConversations={handleBulkDeleteConversations}
          onRenameConversation={handleRenameConversation}
        />
      )}
      <ChatInterface
        conversation={currentConversation}
        onSendMessage={handleSendMessage}
        isLoading={sendMessage.isPending}
        onOpenSidebar={() => setSidebarOpen(true)}
        isMobile={isMobile}
        selectedChairman={selectedChairman}
        onChairmanChange={handleChairmanChange}
      />
    </div>
  );
}
