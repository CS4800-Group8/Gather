// Thu add: Reusable rating section component on 11/13
// Works for both API recipes (explore, favorites) and user recipes (profile posts)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AvatarImage from './AvatarImage';
import { resolveAvatarPreset } from '@/lib/avatarPresets';

interface Rating {
  id: number;
  value: number;
  createdAt: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    avatarId: string;
  };
}

interface RatingSectionProps {
  recipeId: string;
  recipeType: 'api' | 'user';
  onClose?: () => void; // AnN add: Close popup before navigation on 11/25
}

export default function RatingSection({ recipeId, recipeType, onClose }: RatingSectionProps) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);

  // Load current user
  useEffect(() => {
    const stored = localStorage.getItem('gatherUser');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUserId(user.id);
    }
  }, []);

  // Fetch ratings on mount
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);

        // ✅ Fetch dynamically for both recipe types and include current user if available
        const response = await fetch(
          `/api/ratings?${recipeType === 'api' ? `apiId=${recipeId}` : `recipeId=${recipeId}`}${
            currentUserId ? `&userId=${currentUserId}` : ''
          }`
        );

        if (response.ok) {
          const data = await response.json();
          setRatings(data.ratings || []);
          setAverageRating(data.average || 0);
          if (data.userRating) setUserRating(data.userRating.value);
        } else {
          console.error('Failed to fetch ratings');
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) fetchRatings();
  }, [recipeId, recipeType, currentUserId]);

  // Handle rating submission
  const handlePostRating = async (score: number) => {
    if (!currentUserId) {
      alert('Please log in to rate recipes');
      return;
    }

    setPosting(true);
    try {
      const body =
        recipeType === 'api'
          ? { userId: currentUserId, apiId: recipeId, value: score }
          : { userId: currentUserId, recipeId: Number(recipeId), value: score };

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Immediately refresh ratings
        const refreshed = await fetch(
          `/api/ratings?${recipeType === 'api' ? `apiId=${recipeId}` : `recipeId=${recipeId}`}${
            currentUserId ? `&userId=${currentUserId}` : ''
          }`
        );
        if (refreshed.ok) {
          const data = await refreshed.json();
          setRatings(data.ratings || []);
          setAverageRating(data.average || 0);
          setUserRating(score);
        }
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error posting rating:', error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-6 bg-amber-50/30 rounded-xl h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-bold text-amber-900 text-xl">Ratings</h3>
        <span className="px-3 py-1 text-sm font-semibold bg-amber-200 text-amber-900 rounded-full">
          {ratings.length}
        </span>
      </div>

      {/* Average rating display */}
      <div className="mb-6 text-amber-800 font-medium">
        {ratings.length > 0 ? (
          <p>
            Average rating:{" "}
            <span className="font-semibold text-amber-900">
              {averageRating.toFixed(1)}/5
            </span>
          </p>
        ) : (
          <p>No ratings yet</p>
        )}
      </div>

      {/* Rating input */}
      {currentUserId ? (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => handlePostRating(i)}
                disabled={posting}
                className="focus:outline-none"
              >
                <span
                  className={`text-3xl transition ${
                    userRating && i <= userRating
                      ? 'text-amber-600'
                      : 'text-amber-300 hover:text-amber-400'
                  }`}
                >
                  {userRating && i <= userRating ? '★' : '☆'}
                </span>
              </button>
            ))}
          </div>
          {userRating && (
            <span className="text-amber-700 font-medium">
              Your rating: {userRating}/5
            </span>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-amber-50 rounded-xl text-center">
          <p className="text-amber-700">Please log in to rate this recipe</p>
        </div>
      )}

      {/* Rating list */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-amber-600">Loading ratings...</p>
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-amber-600">No ratings yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => {
            const avatarPreset = resolveAvatarPreset(rating.user.avatarId);

            return (
              <div
                key={rating.id}
                className="flex gap-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition"
              >
                <button
                  onClick={() => {
                    // AnN add: Close popup before navigation on 11/25
                    if (onClose) onClose();
                    router.push(
                      rating.user.id === currentUserId
                        ? '/profile'
                        : `/other-profile?userId=${rating.user.id}`
                    );
                  }}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  <AvatarImage preset={avatarPreset} size="small" />
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <button
                      onClick={() => {
                        // AnN add: Close popup before navigation on 11/25
                        if (onClose) onClose();
                        router.push(
                          rating.user.id === currentUserId
                            ? '/profile'
                            : `/other-profile?userId=${rating.user.id}`
                        );
                      }}
                      className="font-semibold text-amber-900 hover:text-amber-700 hover:underline transition-colors"
                    >
                      {rating.user.firstname} {rating.user.lastname}
                    </button>
                    <span className="text-sm text-amber-700">
                      {rating.value}/5
                    </span>
                  </div>
                  <p className="text-xs text-amber-600">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
