// AnN add: Friend list modal component on 11/13
// Shows a user's friends in a modal popup

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PopupModal from '@/components/PopupModal';
import AvatarImage from '@/components/AvatarImage';
import { resolveAvatarPreset } from '@/lib/avatarPresets';

interface Friend {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  avatarId: string;
}

interface FriendListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  displayName: string;
  isOwnProfile: boolean;
}

export default function FriendListModal({
  isOpen,
  onClose,
  userId,
  displayName,
  isOwnProfile,
}: FriendListModalProps) {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch friends when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/friends?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFriends(data.friends || []);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [isOpen, userId]);

  // Navigate to friend's profile
  const handleFriendClick = (friendId: number) => {
    onClose(); // Close modal first

    // Get current user to check if clicking own profile
    const currentUser = JSON.parse(localStorage.getItem('gatherUser') || '{}');
    const currentUserId = currentUser?.id;

    if (friendId === currentUserId) {
      router.push('/profile');
    } else {
      router.push(`/other-profile?userId=${friendId}`);
    }
  };

  return (
    <PopupModal isOpen={isOpen} onClose={onClose}>
      {/* Close button - positioned relative to PopupModal container */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl font-bold transition-all hover:scale-110 shadow-lg"
        aria-label="Close"
      >
        ×
      </button>

      <div className="flex flex-col w-full max-w-3xl max-h-[600px]">
        {/* Header - minimal, no borders */}
        <div className="px-6 py-4 pb-6">
          <h2 className="text-2xl font-bold text-amber-900">
            {isOwnProfile ? 'Your Friends' : `${displayName}'s Friends`}
          </h2>
        </div>

        {/* Friend List - Responsive Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-amber-600">Loading friends...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-amber-600">
                {isOwnProfile
                  ? "You don't have any friends yet. Visit the Community page to add friends!"
                  : `${displayName} doesn't have any friends yet.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
              {friends.map((friend) => {
                const avatarPreset = resolveAvatarPreset(friend.avatarId);

                return (
                  <button
                    key={friend.id}
                    onClick={() => handleFriendClick(friend.id)}
                    className="flex flex-col items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all hover:shadow-md cursor-pointer border-2 border-transparent hover:border-amber-300 w-full"
                    title={`View ${friend.firstname}'s profile`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <AvatarImage preset={avatarPreset} size="large" />
                    </div>

                    {/* Name */}
                    <div className="text-center w-full">
                      <p className="font-semibold text-amber-900 text-base truncate">
                        {friend.firstname} {friend.lastname}
                      </p>
                      <p className="text-sm text-amber-600 truncate">@{friend.username}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PopupModal>
  );
}
