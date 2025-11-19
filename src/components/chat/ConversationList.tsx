// AnN add: Conversation list component on 11/19
// Shows all user's conversations with last message preview

"use client";

import { useState, useEffect } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { usePolling } from "@/hooks/usePolling";
import AvatarImage from "@/components/AvatarImage";
import { resolveAvatarPreset } from "@/lib/avatarPresets"; // AnN add: Fix avatar rendering on 11/19

interface Conversation {
  id: number;
  otherUser: {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    avatarId: string;
  };
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
  } | null;
  updatedAt: string;
}

interface ConversationListProps {
  userId: number;
  selectedConversationId: number | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationList({
  userId,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // AnN add: Fetch conversations on 11/19
  const fetchConversations = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // AnN add: Poll conversations every 5 seconds on 11/19
  usePolling(fetchConversations, 5000, !!userId);

  // AnN add: Update parent when selected conversation data changes (avatar, name, etc.) on 11/19
  useEffect(() => {
    if (selectedConversationId && conversations.length > 0) {
      const updatedConversation = conversations.find(c => c.id === selectedConversationId);
      if (updatedConversation) {
        onSelectConversation(updatedConversation);
      }
    }
  }, [conversations, selectedConversationId, onSelectConversation]);

  // AnN add: Format timestamp to relative time on 11/19
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-amber-600">Loading conversations...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-amber-600" />
        </div>
        <p className="text-sm text-amber-600">No conversations yet</p>
        <p className="text-xs text-amber-500 mt-1">
          Visit a friend&apos;s profile to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => {
        const isUnread = false; // AnN todo: Add unread message tracking later
        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`group relative w-full px-4 py-4 flex items-center gap-4 border-b border-amber-100/50 transition-all duration-200 ${
              selectedConversationId === conversation.id
                ? "bg-gradient-to-r from-amber-100/80 to-amber-50/50 shadow-inner"
                : "bg-white hover:bg-amber-50/40"
            }`}
          >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
              <div className={`transition-transform duration-200 ${
                selectedConversationId === conversation.id ? "" : "group-hover:scale-105"
              }`}>
                <AvatarImage
                  preset={resolveAvatarPreset(conversation.otherUser.avatarId)}
                  size="medium"
                />
              </div>
              {/* Online status indicator - placeholder */}
              {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" /> */}
            </div>

            {/* Content */}
            <div className="flex-1 text-left overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className={`font-semibold truncate ${
                  selectedConversationId === conversation.id
                    ? "text-amber-900"
                    : "text-amber-800 group-hover:text-amber-900"
                }`}>
                  {conversation.otherUser.firstname} {conversation.otherUser.lastname}
                </p>
                {conversation.lastMessage && (
                  <span className="text-xs text-amber-600/80 shrink-0 font-medium">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              {conversation.lastMessage ? (
                <p className={`text-sm truncate ${
                  isUnread
                    ? "text-amber-900 font-medium"
                    : "text-amber-600/90"
                }`}>
                  {conversation.lastMessage.senderId === userId && (
                    <span className="text-amber-500">You: </span>
                  )}
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-amber-500/70 italic">Start a conversation...</p>
              )}
            </div>

            {/* Unread badge - placeholder */}
            {isUnread && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
