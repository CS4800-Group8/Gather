// AnN add: Messages page - Facebook Messenger style chat interface on 11/19
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ConversationList from "@/components/chat/ConversationList";
import ConversationHeader from "@/components/chat/ConversationHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("conversationId");

  const [user, setUser] = useState<{
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    avatarId: string;
  } | null>(null);

  const [selectedConversation, setSelectedConversation] = useState<{
    id: number;
    otherUser: {
      id: number;
      firstname: string;
      lastname: string;
      username: string;
      avatarId: string;
    };
  } | null>(null);

  // AnN add: Initialize from URL param on 11/19
  useEffect(() => {
    if (conversationIdParam && user?.id) {
      // Fetch conversation to get full data
      fetch(`/api/conversations?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          const conv = data.conversations.find(
            (c: any) => c.id === parseInt(conversationIdParam)
          );
          if (conv) setSelectedConversation(conv);
        })
        .catch(console.error);
    }
  }, [conversationIdParam, user?.id]);

  // AnN add: Load current user from localStorage on 11/19
  useEffect(() => {
    const stored = localStorage.getItem("gatherUser") ?? localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-amber-700">Please sign in to view messages</p>
          <a href="/signin" className="mt-4 inline-block pill-button bg-[#ffe7b2] text-amber-700">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-20 flex bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-amber-50/40 overflow-hidden">
      {/* AnN add: Left sidebar - Conversation list on 11/19 */}
      <div className="w-full md:w-80 border-r border-amber-200/60 bg-white/95 backdrop-blur-sm shadow-lg flex flex-col">
        <div className="h-16 border-b border-amber-200/60 px-6 bg-gradient-to-r from-amber-100/40 to-transparent flex-shrink-0 flex items-center">
          <div>
            <h1 className="text-lg font-bold text-amber-900">Messages</h1>
            <p className="text-xs text-amber-600">Stay connected with friends</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList
            userId={user.id}
            selectedConversationId={selectedConversation?.id ?? null}
            onSelectConversation={setSelectedConversation}
          />
        </div>
      </div>

      {/* AnN add: Right main area - Messages + input on 11/19 */}
      <div className="hidden md:flex md:flex-1 flex-col bg-white/60 backdrop-blur-sm">
        {selectedConversation ? (
          <>
            <ConversationHeader
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
            <MessageList
              conversationId={selectedConversation.id}
              currentUserId={user.id}
            />
            <MessageInput
              conversationId={selectedConversation.id}
              senderId={user.id}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-inner">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Your Messages</h2>
              <p className="text-amber-600 max-w-sm">
                Select a conversation from the list to start chatting, or visit the Community page to message someone new.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
