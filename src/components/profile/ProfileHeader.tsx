// AnN add: profile header component on 11/13

"use client";

import { useState, useMemo } from "react";
import AvatarImage from "@/components/AvatarImage";
import {
  getAvatarPresets,
  resolveAvatarPreset,
  AvatarPreset,
} from "@/lib/avatarPresets";

interface ProfileHeaderProps {
  displayName: string;
  avatarId: string | number; // AnN: Support both string and number for avatar IDs
  recipeCount: number;
  friendCount: number;
  onAvatarChange: (avatarId: string) => void; // AnN: Changed to string to match profile page
  isOwnProfile: boolean; // For future use when showing other users
}

export default function ProfileHeader({
  displayName,
  avatarId,
  recipeCount,
  friendCount,
  onAvatarChange,
  isOwnProfile,
}: ProfileHeaderProps) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const avatarPresets = useMemo(() => getAvatarPresets(), []);
  const currentPreset: AvatarPreset = useMemo(
    () => resolveAvatarPreset(typeof avatarId === 'number' ? String(avatarId) : avatarId),
    [avatarId]
  );

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

          {/* Avatar picker dropdown - only show for own profile */}
          {isOwnProfile && showAvatarPicker && (
            <div className="absolute left-0 top-36 z-20 rounded-2xl border-2 border-amber-200 bg-white/95 backdrop-blur p-4 shadow-xl">
              <p className="text-xs font-semibold text-amber-800 mb-3 text-center">
                Choose Your Avatar
              </p>
              <div className="flex gap-3">
                {avatarPresets.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onAvatarChange(option.id);
                      setShowAvatarPicker(false);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 hover:scale-110 ${
                      String(avatarId) === option.id
                        ? 'bg-amber-200 ring-2 ring-amber-400'
                        : 'bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full ${
                        option.variant === 'emoji' ? option.bgClass : 'bg-transparent'
                      }`}
                    >
                      <AvatarImage preset={option} size="medium" />
                    </div>
                    <span className="text-xs font-medium text-amber-800">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
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
                  console.log(`Clicked on ${stat.id}`);
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