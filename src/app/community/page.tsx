// AnN add: Community page showing all users on 11/4
// Thu will add friend request functionality later
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"; // Viet add: import router to navigate to other's profile
import UserCard, { CommunityUser } from '@/components/UserCard';

// Define proper types for API responses
interface ApiUser {
  id: number;
  username: string;
  firstname: string | null;
  lastname: string | null;
  avatarId: string | null;
  _count?: {
    recipes: number;
  };
}

interface Friendship {
  requesterId: number;
  addresseeId: number;
  status: 'pending' | 'accepted' | 'rejected';
}

// Add a local extended type: // Thu added
interface CommunityUserWithButton extends CommunityUser {
  buttonText?: string;
  buttonDisabled?: boolean;
  status?: 'none' | 'pending' | 'accepted' | 'rejected';  
  isRequester?: boolean; 
}

export default function CommunityPage() {
  const [users, setUsers] = useState<CommunityUserWithButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Viet add: define router to navigate to other page

  // AnN add: Fetch users on mount and when returning to tab on 11/6
  useEffect(() => {
    fetchUsers();

    // AnN add: Refresh when window regains focus on 11/6
    const handleFocus = () => {
      fetchUsers();
    };

    // AnN add: Refresh when tab becomes visible on 11/6
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUsers();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('gatherUser');
      const currentUser = stored ? JSON.parse(stored) : null;

      if (!currentUser?.id) return;

      // Fetch all users
      const response = await fetch('/api/users/all', {
        headers: { 'x-user-id': currentUser.id.toString() }
      });

      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();

      // Fetch friendship statuses
      const statusResponse = await fetch(`/api/friends/status?userId=${currentUser.id}`);
      const { friendships }: { friendships: Friendship[] } = await statusResponse.json();

      const userList = (data.users || [])
        .filter((u: ApiUser) => u.id !== currentUser.id)
        .map((u: ApiUser) => {
          const match = friendships.find(
            (f: Friendship) =>
              (f.requesterId === currentUser.id && f.addresseeId === u.id) ||
              (f.addresseeId === currentUser.id && f.requesterId === u.id)
          );

          // Convert null values to empty strings to match CommunityUser interface
          const processedUser = {
            ...u,
            firstname: u.firstname || '',
            lastname: u.lastname || '',
            recipeCount: u._count?.recipes || 0
          };

          if (!match) {
            return { ...processedUser, status: "none" as const };
          }

          const isRequester = match.requesterId === currentUser.id;

          return {
            ...processedUser,
            status: match.status,
            isRequester,
          };
        });

      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: number) => {
    try {
      const stored = localStorage.getItem('gatherUser');
      const currentUser = stored ? JSON.parse(stored) : null;

      if (!currentUser?.id) {
        alert('You must be logged in to add friends.');
        return;
      }

      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: currentUser.id,
          addresseeId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the UI immediately
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status: "pending",
                  isRequester: true,
                }
              : u
          )
        );
      } else {
        alert(data.error || data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Something went wrong while sending friend request.");
    }
  };

  // AnN add: Cancel friend request (undo) on 11/6
  const handleCancelRequest = async (userId: number) => {
    const stored = localStorage.getItem('gatherUser');
    const currentUser = stored ? JSON.parse(stored) : null;

    if (!currentUser?.id) return;

    const response = await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterId: currentUser.id,
        addresseeId: userId,
        action: 'reject', // Deletes the friendship record
      }),
    });

    if (response.ok) {
      // Return to "Add Friend" state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: 'none', isRequester: false } : u
        )
      );
    }
  };

  // Thu added: Accept and reject friend request handler on 11/6
  const handleAcceptFriend = async (userId: number) => {
    const stored = localStorage.getItem('gatherUser');
    const currentUser = stored ? JSON.parse(stored) : null;

    if (!currentUser?.id) return;

    const response = await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterId: userId,
        addresseeId: currentUser.id,
        action: 'accept',
      }),
    });

    if (response.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: 'accepted' } : u
        )
      );
    }
  };

  const handleRejectFriend = async (userId: number) => {
    const stored = localStorage.getItem('gatherUser');
    const currentUser = stored ? JSON.parse(stored) : null;

    if (!currentUser?.id) return;

    const response = await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterId: userId,
        addresseeId: currentUser.id,
        action: 'reject',
      }),
    });

    if (response.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: 'none' } : u
        )
      );
    }
  };

  return (
    <section className="py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">
          Community
        </h1>
        <p className="text-amber-700">
          {loading ? 'Loading...' : `${users.length} ${users.length === 1 ? 'member' : 'members'} in our community`}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* User grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton cards
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="glass-card p-6 flex flex-col items-center"
              >
                {/* Avatar skeleton */}
                <div className="w-32 h-32 rounded-full bg-amber-200 animate-pulse mb-4" />
                {/* Name skeleton */}
                <div className="h-5 bg-amber-200 rounded animate-pulse w-32 mb-2" />
                {/* Username skeleton */}
                <div className="h-4 bg-amber-100 rounded animate-pulse w-24 mb-3" />
                {/* Recipe count skeleton */}
                <div className="h-4 bg-amber-100 rounded animate-pulse w-20 mb-4" />
                {/* Button skeleton */}
                <div className="h-10 bg-amber-200 rounded animate-pulse w-32" />
              </div>
            ))
          ) : users.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <p className="text-amber-700 text-lg">No other users yet. Invite your friends!</p>
            </div>
          ) : (
            // Thu modified: Show different buttons based on friendship status on 11/6
            users.map((user) => {
              if (user.status === "accepted") {
                return (
                  <UserCard
                    key={user.id}
                    user={user}
                    onAvatarClick={(userId) => {
                      // Viet add: Navigate to other's profile
                      router.push(`/other-profile?userId=${userId}`);
                    }}
                    buttonText="Friends ✓"
                    buttonDisabled={true}
                  />
                );
              }

              if (user.status === "pending" && user.isRequester) {
                // AnN add: Allow canceling friend request on 11/6
                return (
                  <UserCard
                    key={user.id}
                    user={user}
                    onAvatarClick={(userId) => {
                      // Viet add: Navigate to other's profile
                      router.push(`/other-profile?userId=${userId}`);
                    }}
                    onButtonClick={handleCancelRequest}
                    buttonText="Pending"
                    buttonDisabled={false}
                  />
                );
              }

              if (user.status === "pending" && !user.isRequester) {
                // This user sent ME a request → show Accept/Reject
                return (
                  <UserCard
                    key={user.id}
                    user={user}
                    onAvatarClick={(userId) => {
                      // Viet add: Navigate to other's profile
                      router.push(`/other-profile?userId=${userId}`);
                    }}
                    onAccept={() => handleAcceptFriend(user.id)}
                    onReject={() => handleRejectFriend(user.id)}
                  />
                );
              }

              // Default: no friendship yet
              return (
                <UserCard
                  key={user.id}
                  user={user}
                  onAvatarClick={(userId) => {
                    // Viet add: Navigate to other's profile
                    router.push(`/other-profile?userId=${userId}`);
                  }}
                  onButtonClick={handleAddFriend}
                  buttonText="Add Friend"
                />
              );
            })
          )}
      </div>
    </section>
  );
}