// AnN add: User card component for Community page on 11/4
'use client';

import { useState } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import AvatarImage from '@/components/AvatarImage';
import { resolveAvatarPreset } from '@/lib/avatarPresets';

// Interface for user data
export interface CommunityUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  avatarId: string;
  _count: {
    recipes: number;
  };
}

// type UserCardProps = {
//   user: CommunityUser;
//   onAvatarClick?: (userId: number) => void;
//   onButtonClick?: (userId: number) => void;
//   buttonText?: string;  // Thu can customize: "Add Friend", "Pending", "Friends ✓"
//   buttonDisabled?: boolean;
// };

type UserCardProps = {
  user: CommunityUser;
  onAvatarClick?: (userId: number) => void;
  onButtonClick?: (userId: number) => void;
  buttonText?: string;
  buttonDisabled?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onMessageClick?: (userId: number) => void;  // AnN add: Message button handler on 11/19
};

export default function UserCard({
  user,
  onAvatarClick,
  onButtonClick,
  buttonText = "Add Friend",
  buttonDisabled = false,
  onAccept, // Thu added
  onReject, // Thu added
  onMessageClick, // AnN add: Message button handler on 11/19
}: UserCardProps) {

  const isAcceptRejectMode = !!onAccept && !!onReject; // Thu added
  // AnN add: Unfriend confirmation popup state on 11/7
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);

  // AnN add: Handle unfriend button click on 11/7
  const handleButtonClick = () => {
    // If it's a "Friends ✓" button, show confirmation popup
    if (buttonText === 'Friends ✓') {
      setShowUnfriendConfirm(true);
    } else {
      // Otherwise, trigger normal button action (Add Friend, Pending)
      onButtonClick?.(user.id);
    }
  };

  // AnN add: Confirm unfriend action on 11/7
  const handleConfirmUnfriend = () => {
    setShowUnfriendConfirm(false);
    onButtonClick?.(user.id);
  };

  return (
    <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
      {/* Large centered avatar */}
      <div
        className="mb-4 cursor-pointer"
        onClick={() => onAvatarClick?.(user.id)}
      >
        <AvatarImage
          preset={resolveAvatarPreset(user.avatarId)}
          size="large"
        />
      </div>

      {/* User name */}
      <h3 className="font-semibold text-lg text-amber-900 mb-1">
        {user.firstname} {user.lastname}
      </h3>

      {/* Username */}
      <p className="text-sm text-amber-600 mb-3">
        @{user.username}
      </p>

      {/* Recipe count */}
      <p className="text-sm text-amber-700 mb-4">
        🍜 {user._count.recipes} {user._count.recipes === 1 ? 'recipe' : 'recipes'}
      </p>

      {/* Action buttons */}
      {/* AnN fix: Updated to match amber theme on 11/6 */}
      <div className="flex flex-col gap-2 w-full">
        {isAcceptRejectMode ? (
          <div className="flex gap-3">
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-all"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-medium transition-all"
            >
              Reject
            </button>
          </div>
        ) : (
          <button
            className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors ${
              buttonText === 'Friends ✓'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : buttonText === 'Pending'
                ? 'bg-amber-200 text-amber-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
            onClick={handleButtonClick}
            disabled={buttonDisabled}
          >
            {buttonText}
          </button>
        )}

        {/* AnN add: Message button on 11/19 */}
        {onMessageClick && (
          <button
            onClick={() => onMessageClick(user.id)}
            className="px-8 py-2 rounded-lg text-sm font-medium bg-white text-amber-700 border-2 border-amber-300 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" /> Message
          </button>
        )}
      </div>

      {/* AnN add: Unfriend confirmation popup on 11/7 */}
      {showUnfriendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
            <h3 className="text-xl font-bold text-amber-900 mb-3">
              Unfriend {user.firstname} {user.lastname}?
            </h3>
            <p className="text-sm text-amber-700 mb-6">
              You can send them a friend request again later.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowUnfriendConfirm(false)}
                className="px-6 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnfriend}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-all"
              >
                Unfriend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
