// AnN add: profile header component on 11/13

"use client";

import { useState, useMemo, useEffect } from "react";
import AvatarImage from "@/components/AvatarImage";
import {
  getAvatarPresets,
  resolveAvatarPreset,
  AvatarPreset,
} from "@/lib/avatarPresets";
import { XMarkIcon } from "@heroicons/react/24/outline"; // AnN add: Close icon for avatar picker on 11/18

interface ProfileHeaderProps {
  displayName: string;
  avatarId: string | number; // AnN: Support both string and number for avatar IDs
  recipeCount: number;
  friendCount: number;
  onAvatarChange: (avatarId: string) => void; // AnN: Changed to string to match profile page
  isOwnProfile: boolean; // For future use when showing other users
  onFriendClick?: () => void; // AnN add: Optional callback for friend button click on 11/13
}

export default function ProfileHeader({
  displayName,
  avatarId,
  recipeCount,
  friendCount,
  onAvatarChange,
  isOwnProfile,
  onFriendClick,
}: ProfileHeaderProps) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const avatarPresets = useMemo(() => getAvatarPresets(), []);
  const currentPreset: AvatarPreset = useMemo(
    () => resolveAvatarPreset(typeof avatarId === 'number' ? String(avatarId) : avatarId),
    [avatarId]
  );

  // AnN add: Close avatar picker on ESC key press on 11/18
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAvatarPicker) {
        setShowAvatarPicker(false);
      }
    };

    if (showAvatarPicker) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showAvatarPicker]);

  const avatarButtonClasses = `relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 cursor-pointer ${
    currentPreset.variant === 'emoji' ? currentPreset.bgClass : 'bg-transparent'
  }`;

  const statsButtons = [
    { id: 'recipes', label: 'Recipes', value: recipeCount },
    { id: 'friends', label: 'Friends', value: friendCount },
  ];

  return (
    <div className="mb-10 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Avatar with picker */}
        <div className="relative">
          {isOwnProfile ? (
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className={avatarButtonClasses}
              aria-label="Change avatar"
            >
              <AvatarImage preset={currentPreset} size="large" />
            </button>
          ) : (
            <div className={avatarButtonClasses}>
              <AvatarImage preset={currentPreset} size="large" />
            </div>
          )}

          {/* AnN edit: Avatar picker modal - cleaner design with backdrop on 11/18 */}
          {isOwnProfile && showAvatarPicker && (
            <>
              {/* Backdrop overlay */}
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setShowAvatarPicker(false)}
              />

              {/* Modal content */}
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl rounded-3xl border-2 border-amber-200 bg-white shadow-2xl">
                {/* Header with close button */}
                <div className="flex items-center justify-between border-b border-amber-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-amber-900">Choose Your Avatar</h3>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-amber-100 transition-colors"
                    aria-label="Close avatar picker"
                  >
                    <XMarkIcon className="h-5 w-5 text-amber-700" />
                  </button>
                </div>

                {/* Avatar grid */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {avatarPresets.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          onAvatarChange(option.id);
                          setShowAvatarPicker(false);
                        }}
                        className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 hover:scale-105 ${
                          String(avatarId) === option.id
                            ? 'bg-amber-200 ring-2 ring-amber-400'
                            : 'bg-amber-50 hover:bg-amber-100'
                        }`}
                      >
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full ${
                            option.variant === 'emoji' ? option.bgClass : 'bg-transparent'
                          }`}
                        >
                          <AvatarImage preset={option} size="medium" />
                        </div>
                        <span className="text-xs font-medium text-amber-800 text-center">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Display name and stats */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-amber-900">{displayName}</h1>

          {/* Stats buttons */}
          <div className="flex gap-3">
            {statsButtons.map((stat) => (
              <button
                key={stat.id}
                type="button"
                onClick={() => {
                  // AnN add: Open friend list modal when friend button clicked on 11/13
                  if (stat.id === 'friends' && onFriendClick) {
                    onFriendClick();
                  }
                }}
                className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {stat.label}: {stat.value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}