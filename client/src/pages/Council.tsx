import { useState, useEffect } from "react";
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
      console.log('[createConversation] Success:', data);
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
    onMutate: (variables) => {
      console.log('[sendMessage] Mutation started with:', variables);
    },
    onSuccess: (data) => {
      console.log('[sendMessage] Success:', data);   // Refetch conversation immediately and then poll for updates
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
        
        // Create conversation and wait for it to complete
        const newConversation = await createConversation.mutateAsync();
        console.log('[handleSendMessage] New conversation created:', newConversation);
        
        if (!newConversation || !newConversation.id) {
          console.error('[handleSendMessage] Invalid response:', newConversation);
          throw new Error(`Failed to create conversation: received ${JSON.stringify(newConversation)}`);
        }
        
        const conversationId = newConversation.id;
        console.log('[handleSendMessage] Got conversation ID:', conversationId);
        
        // Update state with new conversation ID
        setCurrentConversationId(conversationId);
        
        // Wait for state update to complete before sending message
        // This ensures the conversation is properly set up
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('[handleSendMessage] Sending message to conversation:', conversationId);
        
        // Send the message with the new conversation ID
        await sendMessage.mutateAsync({
          conversationId: conversationId,
          content,
          chairmanModel: selectedChairman || 'google/gemini-3-pro-preview',
          imageUrls,
        });
      } catch (error) {
        console.error("Error creating conversation or sending message:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        setConfigError(errorMessage);
      }
      return;
    }

    console.log('[handleSendMessage] Using existing conversation:', currentConversationId);
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

  if (configError === "OPENROUTER_API_KEY") {
    return <ConfigurationGuide />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onBulkDeleteConversations={handleBulkDeleteConversations}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {isMobile && (
        <MobileSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onBulkDeleteConversations={handleBulkDeleteConversations}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
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
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
            <p className="text-sm">{configError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
