// AnN add: Community page showing all users on 11/4
// Thu will add friend request functionality later
'use client';

import { useEffect, useState } from 'react';
import UserCard, { CommunityUser } from '@/components/UserCard';

// Add a local extended type: // Thu added
interface CommunityUserWithButton extends CommunityUser {
  buttonText?: string;
  buttonDisabled?: boolean;
  status?: 'none' | 'pending' | 'accepted' | 'rejected';  
  isRequester?: boolean; 
}

export default function CommunityPage() {
  // const [users, setUsers] = useState<CommunityUser[]>([]);
  const [users, setUsers] = useState<CommunityUserWithButton[]>([]); // Thu added
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Accept version
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
      const { friendships } = await statusResponse.json();

      const userList = (data.users || [])
        .filter((u: any) => u.id !== currentUser.id)
        .map((u: any) => {
          const match = friendships.find(
            (f: any) =>
              (f.requesterId === currentUser.id && f.addresseeId === u.id) ||
              (f.addresseeId === currentUser.id && f.requesterId === u.id)
          );

          if (!match) {
            return { ...u, status: "none" };
          }

          const isRequester = match.requesterId === currentUser.id;

          return {
            ...u,
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


  // Thu added -----------------------------------------------------------------
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
        // ✅ Update the UI immediately
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status: "pending",
                  isRequester: true,
                  buttonText: "Pending",
                  buttonDisabled: true,
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

  const fetchFriendStatuses = async (userId: number) => {
    try {
      const response = await fetch(`/api/friends/status?userId=${userId}`);
      if (!response.ok) return {};

      const data = await response.json();
      const map: Record<number, string> = {};

      // Build lookup: userId -> status
      for (const f of data.friendships) {
        const otherUser =
          f.requesterId === userId ? f.addresseeId : f.requesterId;
        map[otherUser] = f.status;
      }

      return map;
    } catch (error) {
      console.error("Error fetching friend statuses:", error);
      return {};
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


  // ---------------------------------------------------------------------------


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
            // AnN add: User cards with centered layout on 11/4
          //   users.map((user) => (
              
          //     <UserCard
          //       key={user.id}
          //       user={user}

          //       // Viet part
          //       onAvatarClick={(userId) => {
          //         // TODO: Navigate to user profile page
          //         console.log('Avatar clicked - profile view coming soon!');
          //       }}
                

          //       // Thu modified
          //       // onButtonClick={(userId) => {
          //       //   alert('Friend system coming soon!');
          //       //   // TODO: Thu will implement friend request logic here
          //       // }}
          //       onButtonClick={handleAddFriend}
          //       buttonText={user.buttonText || "Add Friend"}
          //       buttonDisabled={user.buttonDisabled || false}
          //     />
          //   ))
          // )}

          // Thu modified: Show different buttons based on friendship status on 11/6
          users.map((user) => {
            if (user.status === "accepted") {
              return (
                <UserCard
                  key={user.id}
                  user={user}
                  buttonText="Friends ✓"
                  buttonDisabled={true}
                />
              );
            }

            if (user.status === "pending" && user.isRequester) {
              return (
                <UserCard
                  key={user.id}
                  user={user}
                  buttonText="Pending"
                  buttonDisabled={true}
                />
              );
            }

            if (user.status === "pending" && !user.isRequester) {
              // This user sent ME a request → show Accept/Reject
              return (
                <UserCard
                  key={user.id}
                  user={user}
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
