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

  const { data: conversations = [], refetch: refetchConversations } =
    trpc.council.listConversations.useQuery();

  const { data: currentConversation, refetch: refetchConversation } =
    trpc.council.getConversation.useQuery(
      { conversationId: currentConversationId! },
      { 
        enabled: !!currentConversationId,
        retry: false,
        staleTime: 5000,
        gcTime: 10000
      }
    );

  // Load saved Chairman preference on mount
  const { data: savedPreference } = trpc.council.getChairmanPreference.useQuery();

  useEffect(() => {
    if (savedPreference?.chairmanModel) {
      setSelectedChairman(savedPreference.chairmanModel);
    }
  }, [savedPreference]);

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

  const updateChairmanPref = trpc.council.updateChairmanPreference.useMutation();

  const handleChairmanChange = (chairmanModel: string) => {
    setSelectedChairman(chairmanModel);
    // Save preference to database
    updateChairmanPref.mutate({ chairmanModel });
  };

  const sendMessage = trpc.council.sendMessage.useMutation({
    onSuccess: () => {
      // Refetch conversation immediately and then poll for updates
      // since council orchestration can take 10-30+ seconds
      refetchConversation();
      refetchConversations();
      
      // Poll for updates every 2 seconds for up to 60 seconds
      // to ensure we catch the response when it's ready
      let pollCount = 0;
      const pollInterval = setInterval(() => {
        pollCount++;
        refetchConversation();
        if (pollCount >= 30) {
          clearInterval(pollInterval);
        }
      }, 2000);
      
      setConfigError(null);
    },
    onError: (error) => {
      console.error("Send message error:", error);
      if (error instanceof TRPCClientError) {
        const message = error.message;
        if (message.includes("OPENROUTER_API_KEY")) {
          setConfigError("OPENROUTER_API_KEY");
        } else {
          setConfigError(message || "Failed to send message. Please try again.");
        }
      } else {
        setConfigError("An unexpected error occurred. Please try again.");
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

  const handleSendMessage = async (content: string, imageUrls?: string[]) => {
    // If no conversation exists, create one first
    if (!currentConversationId) {
      try {
        console.log('[handleSendMessage] No conversation ID, creating new conversation');
        const newConversation = await createConversation.mutateAsync();
        console.log('[handleSendMessage] New conversation created:', newConversation);
        
        if (!newConversation?.id) {
          throw new Error('Failed to create conversation: no ID returned');
        }
        
        // Send message to the newly created conversation
        console.log('[handleSendMessage] Sending message to new conversation:', newConversation.id);
        await sendMessage.mutateAsync({
          conversationId: newConversation.id,
          content,
          chairmanModel: selectedChairman || 'google/gemini-3-pro-preview',
          imageUrls,
        });
        
        // Update current conversation ID after successful send
        setCurrentConversationId(newConversation.id);
      } catch (error) {
        console.error("Error creating conversation or sending message:", error);
        setConfigError(error instanceof Error ? error.message : 'Failed to send message');
      }
      return;
    }

    console.log('[handleSendMessage] selectedChairman:', selectedChairman, 'conversationId:', currentConversationId);
    try {
      await sendMessage.mutateAsync({
        conversationId: currentConversationId,
        content,
        chairmanModel: selectedChairman || 'google/gemini-3-pro-preview',
        imageUrls,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Error is already handled in onError callback
    }
  };

  const isProcessing = sendMessage.isPending || createConversation.isPending;

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

  // Removed auto-creation logic - users should explicitly click "New Conversation"

  // DO NOT auto-load conversations
  // Users should explicitly click "New Conversation" or select from sidebar
  // This prevents new conversations from loading old test data

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
        isLoading={isProcessing}
        onOpenSidebar={() => setSidebarOpen(true)}
        isMobile={isMobile}
        selectedChairman={selectedChairman}
        onChairmanChange={handleChairmanChange}
      />
      {configError && configError !== "OPENROUTER_API_KEY" && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-sm z-50">
          <p className="text-sm font-medium">Error</p>
          <p className="text-xs mt-1 break-words">{configError}</p>
        </div>
      )}
    </div>
  );
}
