'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function SignInForm() {
  const router = useRouter();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const identifier = emailOrUsername.trim().toLowerCase(); // Viet fix: lowercase the username/email input
      let loginEmail = identifier;

      if (identifier && !identifier.includes('@')) {
        try {
          // An fix: Resolve usernames to emails so the existing API keeps working
          const lookup = await fetch('/api/users');
          if (lookup.ok) {
            const users: Array<{ username?: string; email?: string }> = await lookup.json();
            const match = users.find(
              (entry: { username?: string; email?: string }) =>
                entry.username?.toLowerCase() === identifier.toLowerCase()
            );
            if (match?.email) {
              loginEmail = match.email;
            }
          }
        } catch (lookupError) {
          console.error('Username lookup failed', lookupError);
        }
      }

      if (!loginEmail) {
        // An add: Guard against empty identifier before calling the API
        setErrorMessage('Email or username is required.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: loginEmail, // An add: Allow username or email to pass straight through
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Sign in failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // An fix: Save user data to localStorage for logged-in state
      // AnN: Set default melon avatar if user doesn't have one
      const storedUser = {
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        username: data.user.username,
        email: data.user.email,
        avatar: '🍉', // Default melon avatar for new/existing users
      };

      localStorage.setItem('gatherUser', JSON.stringify(storedUser));
      localStorage.setItem('user', JSON.stringify(storedUser));
      document.cookie = `gatherUser=${encodeURIComponent(JSON.stringify(storedUser))}; path=/; sameSite=Lax`; // An add: Mirror local storage in a cookie for refreshes
      window.dispatchEvent(new Event('gather:user-updated'));

      // Success - redirect to home
      setIsLoading(false);
      router.push('/');
    } catch (error) {
      console.error('Sign in error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <section className="glass-card w-full max-w-lg px-6 py-7 shadow-[0_14px_32px_rgba(255,195,120,0.16)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-amber-800 sm:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-amber-500">Sign in to continue to your account</p>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="text-sm font-medium text-amber-700">
            Email or Username
            <input
              type="text"
              name="emailOrUsername"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="your email or username"
              required
              className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <label className="text-sm font-medium text-amber-700">
            Password
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="pill-button w-full justify-center bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffdca0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
        </form>

        {/* Link to Signup */}
        <p className="mt-5 text-center text-sm text-amber-600">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-semibold text-amber-700 hover:underline">
            Sign up
          </a>
        </p>
      </section>
    </div>
  );
}

export default function SignInPage() {
  return <SignInForm />;
}
