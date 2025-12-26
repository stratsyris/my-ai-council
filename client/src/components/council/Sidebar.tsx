import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: string;
  title: string | null;
  createdAt: Date;
  messageCount: number;
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onBulkDeleteConversations?: (ids: string[]) => void;
  onRenameConversation: (id: string, title: string) => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onBulkDeleteConversations,
  onRenameConversation,
}: SidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, conversationId: string, currentTitle: string | null) => {
    e.stopPropagation();
    setEditingId(conversationId);
    setEditTitle(currentTitle || "");
  };

  const handleSaveRename = (conversationId: string) => {
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
      setEditingId(null);
      setEditTitle("");
    }
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleToggleSelect = (e: React.ChangeEvent<HTMLInputElement>, conversationId: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectButtonClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(conversations.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onBulkDeleteConversations) {
      onBulkDeleteConversations(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    }
  };

  return (
    <>
      <div className="w-64 border-r bg-muted/30 flex flex-col h-screen">
        <div className="p-4 border-b space-y-2">
          <Button
            onClick={onNewConversation}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
          
          {selectedIds.size > 0 && (
            <Button
              onClick={() => setBulkDeleteOpen(true)}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedIds.size} ({selectedIds.size === conversations.length ? "All" : "Selected"})
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-2 space-y-2 pr-4">
            {selectedIds.size > 0 && (
              <div className="p-2 bg-muted rounded flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.size === conversations.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                  title="Select all conversations"
                />
                <span className="text-xs text-muted-foreground">
                  {selectedIds.size} / {conversations.length} selected
                </span>
              </div>
            )}

            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "w-full p-3 rounded-lg transition-colors flex items-start gap-2",
                  currentConversationId === conv.id
                    ? "bg-muted"
                    : "bg-transparent hover:bg-muted/50"
                )}
                onMouseEnter={() => setHoveredConvId(conv.id)}
                onMouseLeave={() => setHoveredConvId(null)}
              >
                {selectedIds.size > 0 && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(conv.id)}
                    onChange={(e) => handleToggleSelect(e, conv.id)}
                    className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm bg-background border rounded"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(conv.id);
                            if (e.key === "Escape") handleCancelRename();
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(conv.id)}
                          className="p-1 hover:bg-green-500/20 rounded"
                          title="Save"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 hover:bg-red-500/20 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => handleDeleteClick(e, conv.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onSelectConversation(conv.id)}
                        className="w-full text-left flex items-start gap-2 mb-2"
                      >
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {conv.title || "New Conversation"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {conv.messageCount} messages
                          </div>
                        </div>
                      </button>
                      
                      {hoveredConvId === conv.id && selectedIds.size === 0 && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => handleSelectButtonClick(e, conv.id)}
                            className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded transition-colors"
                            title="Select conversation"
                          >
                            <input type="checkbox" className="w-4 h-4" readOnly />
                            Select
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, conv.id, conv.title)}
                            className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-500/10 rounded transition-colors"
                            title="Rename conversation"
                          >
                            <Edit2 className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, conv.id)}
                            className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                      {hoveredConvId === conv.id && selectedIds.size > 0 && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => handleEditClick(e, conv.id, conv.title)}
                            className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-500/10 rounded transition-colors"
                            title="Rename conversation"
                          >
                            <Edit2 className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, conv.id)}
                            className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Conversations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} conversation{selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
