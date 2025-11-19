// AnN add: Message input component on 11/19
// Send message form with Enter key support

"use client";

import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface MessageInputProps {
  conversationId: number;
  senderId: number;
}

export default function MessageInput({
  conversationId,
  senderId,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  // AnN add: Send message on 11/19
  const handleSend = async () => {
    if (!content.trim() || sending) return;

    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          senderId,
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setContent(""); // Clear input on success
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // AnN add: Handle Enter key to send on 11/19
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-amber-200/60 bg-gradient-to-r from-white via-amber-50/30 to-white px-6 py-3 shadow-lg backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          {/* AnN add: Text input on 11/19 */}
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending}
              rows={1}
              className="w-full resize-none rounded-2xl border-2 border-amber-200/60 bg-white px-4 py-3 pr-16 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100/50 disabled:opacity-50 shadow-sm transition-all"
              style={{
                minHeight: "48px",
                maxHeight: "120px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "48px";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            {/* Character count inside input */}
            <span className={`absolute bottom-3 right-3 text-xs font-medium ${
              content.length > 1000 ? "text-red-600" : content.length > 900 ? "text-amber-600" : "text-amber-400"
            }`}>
              {content.length > 0 && `${content.length}/1000`}
            </span>
          </div>

          {/* AnN add: Send button on 11/19 */}
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="shrink-0 h-12 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-sm flex items-center gap-2 transition-all duration-200 active:scale-95"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
          </button>
        </div>

        {/* AnN add: Hint on 11/19 */}
        <div className="mt-1.5 text-xs text-amber-600/70 px-1">
          <span>Press <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-800 font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-800 font-mono">Shift+Enter</kbd> for new line</span>
        </div>
      </div>
    </div>
  );
}
