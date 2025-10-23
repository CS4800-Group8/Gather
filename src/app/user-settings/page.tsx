'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  avatar?: string;
}

export default function UserSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem('gatherUser') || localStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('gatherUser');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('gather:user-updated'));
      document.cookie = 'gatherUser=; path=/; max-age=0';
    } catch (error) {
      console.error('Failed to clear user data on sign out', error);
    }
    router.push('/signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-16 pt-12">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 text-center">
            <div className="text-amber-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-16 pt-12">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 text-center">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Not Signed In</h2>
            <p className="text-amber-600 mb-6">Please sign in to access settings.</p>
            <Link
              href="/signin"
              className="pill-button bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ') || 'Not set';

  return (
    <div className="min-h-screen pb-16 pt-12">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900">Account Settings</h1>
          <p className="mt-2 text-amber-600">Manage your account information and preferences</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          {/* Profile Information Section */}
          <section>
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-amber-600">Full Name</p>
                  <p className="text-amber-900">{fullName}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-amber-600">Username</p>
                  <p className="text-amber-900">@{user.username || 'Not set'}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-amber-600">Email Address</p>
                  <p className="text-amber-900">{user.email || 'Not set'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section>
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Security</h2>
            <div className="p-4 bg-amber-50 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Password</p>
                  <p className="text-amber-900">••••••••</p>
                </div>
                <Link
                  href="/change-password"
                  className="mt-2 sm:mt-0 pill-button bg-amber-100 text-amber-700 hover:bg-amber-200"
                >
                  Change Password
                </Link>
              </div>
            </div>
          </section>

          {/* Account Actions Section */}
          <section>
            <h2 className="text-xl font-semibold text-amber-800 mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full pill-button bg-amber-100 text-amber-700 hover:bg-amber-200 justify-center text-center"
              >
                Sign Out
              </button>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}