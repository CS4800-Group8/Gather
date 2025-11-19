// AnN add: Conversation header component on 11/19
// Shows who you're chatting with - avatar, name, status

"use client";


import { ChevronLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import AvatarImage from "@/components/AvatarImage";
import { resolveAvatarPreset } from "@/lib/avatarPresets";

interface ConversationHeaderProps {
  conversation: {
    id: number;
    otherUser: {
      id: number;
      firstname: string;
      lastname: string;
      username: string;
      avatarId: string;
    };
  };
  onBack?: () => void; // For mobile - return to conversation list
}

export default function ConversationHeader({
  conversation,
  onBack,
}: ConversationHeaderProps) {
  const { otherUser } = conversation;

  // AnN refactor: No fetching needed - data comes from parent's polling on 11/19

  return (
    <div className="h-16 border-b border-amber-200/60 bg-white/95 backdrop-blur-sm px-6 shadow-sm flex items-center">
      <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
        {/* AnN add: Back button for mobile on 11/19 */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden shrink-0 p-2 -ml-2 hover:bg-amber-50 rounded-full transition-colors"
            aria-label="Back to conversations"
          >
            <ChevronLeftIcon className="h-6 w-6 text-amber-700" />
          </button>
        )}

        {/* AnN add: Avatar with online status on 11/19 */}
        <div className="relative shrink-0">
          <AvatarImage
            preset={resolveAvatarPreset(otherUser.avatarId)}
            size="medium"
          />
          {/* Online status indicator - placeholder */}
          {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" /> */}
        </div>

        {/* AnN add: User info on 11/19 */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-amber-900 truncate">
            {otherUser.firstname} {otherUser.lastname}
          </h2>
          <p className="text-xs text-amber-600">
            @{otherUser.username}
            {/* AnN todo: Add "Active now" / "Active 5m ago" status later */}
          </p>
        </div>

        {/* AnN add: Info button - placeholder for future features on 11/19 */}
        <button
          className="shrink-0 p-2 hover:bg-amber-50 rounded-full transition-colors"
          aria-label="Conversation info"
        >
          <InformationCircleIcon className="h-6 w-6 text-amber-600" />
        </button>
      </div>
    </div>
  );
}
