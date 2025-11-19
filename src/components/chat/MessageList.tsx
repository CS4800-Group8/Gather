// AnN add: Message list component on 11/19
// Shows all messages in a conversation with auto-scroll

"use client";

import { useState, useEffect, useRef } from "react";
import { HandRaisedIcon } from "@heroicons/react/24/outline";
import { usePolling } from "@/hooks/usePolling";
import AvatarImage from "@/components/AvatarImage";
import { resolveAvatarPreset } from "@/lib/avatarPresets"; // AnN add: Fix avatar rendering on 11/19

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender: {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    avatarId: string;
  };
}

interface MessageListProps {
  conversationId: number;
  currentUserId: number;
}

export default function MessageList({
  conversationId,
  currentUserId,
}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // AnN add: Auto-scroll to bottom when new messages arrive on 11/19
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // AnN add: Check if user is near bottom of scroll on 11/19
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const threshold = 100; // pixels from bottom
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;

    return height - position < threshold;
  };

  // AnN fix: Only auto-scroll when new messages arrive AND user is near bottom on 11/19
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessageCountRef.current;
    const lastMessage = messages[messages.length - 1];
    const isOwnMessage = lastMessage?.senderId === currentUserId;

    // Auto-scroll if: (1) new messages arrived AND user is near bottom, OR (2) user sent the message
    if (hasNewMessages && (isNearBottom() || isOwnMessage)) {
      scrollToBottom();
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, currentUserId]);

  // AnN add: Fetch messages on 11/19
  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // AnN add: Poll messages every 3 seconds for real-time updates on 11/19
  usePolling(fetchMessages, 3000, !!conversationId);

  // AnN add: Format timestamp on 11/19
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-amber-600">Loading messages...</div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto py-6 px-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZjdlZCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-gradient-to-b from-transparent to-amber-50/20"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg">
              <HandRaisedIcon className="h-12 w-12 text-amber-600" />
            </div>
            <p className="text-lg font-medium text-amber-900 mb-1">Start the conversation</p>
            <p className="text-sm text-amber-600">Send a message to break the ice!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-4xl pb-6">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showAvatar =
              index === 0 || messages[index - 1].senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={`flex gap-3 items-end ${isCurrentUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* AnN add: Avatar on left for other user on 11/19 */}
                {!isCurrentUser && (
                  <div className="w-8 shrink-0">
                    {showAvatar && (
                      <AvatarImage
                        preset={resolveAvatarPreset(message.sender.avatarId)}
                        size="small"
                      />
                    )}
                  </div>
                )}

                {/* AnN add: Message bubble on 11/19 */}
                <div
                  className={`group max-w-[70%] rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                    isCurrentUser
                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                      : "bg-white text-amber-900 border border-amber-200/60"
                  }`}
                >
                  {!isCurrentUser && showAvatar && (
                    <p className="text-xs font-bold mb-1 text-amber-800">
                      {message.sender.firstname}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity ${
                      isCurrentUser ? "text-amber-100" : "text-amber-600"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>

                {/* AnN add: Avatar on right for current user on 11/19 */}
                {isCurrentUser && (
                  <div className="w-8 shrink-0">
                    {showAvatar && (
                      <AvatarImage
                        preset={resolveAvatarPreset(message.sender.avatarId)}
                        size="small"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
