// AnN add: Community page showing all users on 11/4
// Thu will add friend request functionality later
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"; // Viet add: import router to navigate to other's profile
import UserCard, { CommunityUser } from '@/components/UserCard';

export default function CommunityPage() {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Viet add: define router to navigate to other page

  useEffect(() => {
    fetchUsers();
  }, []);

  // AnN add: Fetch all users from API on 11/4
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem('gatherUser');
      const userData = stored ? JSON.parse(stored) : null;

      const response = await fetch('/api/users/all', {
        headers: {
          'x-user-id': userData?.id?.toString() || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
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
            // AnN add: User cards with centered layout on 11/4
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onAvatarClick={(userId) => {
                  // Viet add: Navigate to other's profile
                  router.push(`/other-profile?userId=${userId}`);
                }}
                onButtonClick={(userId) => {
                  alert('Friend system coming soon!');
                  // TODO: Thu will implement friend request logic here
                }}
                buttonText="Add Friend"
              />
            ))
          )}
      </div>
    </section>
  );
}
