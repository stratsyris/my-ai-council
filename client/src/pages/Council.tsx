import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/council/Sidebar";
import ChatInterface from "@/components/council/ChatInterface";

export default function Council() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const { data: conversations = [], refetch: refetchConversations } =
    trpc.council.listConversations.useQuery();

  const { data: currentConversation, refetch: refetchConversation } =
    trpc.council.getConversation.useQuery(
      { conversationId: currentConversationId! },
      { enabled: !!currentConversationId }
    );

  const createConversation = trpc.council.createConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
      refetchConversations();
    },
  });

  const sendMessage = trpc.council.sendMessage.useMutation({
    onSuccess: () => {
      refetchConversation();
      refetchConversations();
    },
  });

  const handleNewConversation = () => {
    createConversation.mutate();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) return;

    await sendMessage.mutateAsync({
      conversationId: currentConversationId,
      content,
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      <ChatInterface
        conversation={currentConversation}
        onSendMessage={handleSendMessage}
        isLoading={sendMessage.isPending}
      />
    </div>
  );
}
