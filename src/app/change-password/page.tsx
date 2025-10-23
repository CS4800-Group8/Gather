'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Validate password strength (same as sign-up)
  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  // Validate confirm password
  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Handle input changes with real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update form state
    if (name === 'currentPassword') setCurrentPassword(value);
    if (name === 'newPassword') setNewPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);

    // Real-time validation
    let error = '';
    switch (name) {
      case 'newPassword':
        error = validatePassword(value);
        // Also revalidate confirm password if it's filled
        if (confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(confirmPassword, value),
          }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, newPassword);
        break;
      default:
        break;
    }
    
    if (name === 'newPassword' || name === 'confirmPassword') {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate all fields
    const newErrors = {
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) return;

    // Additional validation
    if (currentPassword === newPassword) {
      setErrorMessage('New password must be different from current password');
      return;
    }

    if (!currentPassword) {
      setErrorMessage('Current password is required');
      return;
    }

    setIsLoading(true);

    try {
      // Get user data for the API call
      const stored = localStorage.getItem('gatherUser') || localStorage.getItem('user');
      if (!stored) {
        setErrorMessage('You must be signed in to change your password');
        setIsLoading(false);
        return;
      }

      const userData = JSON.parse(stored);
      
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to change password. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({ newPassword: '', confirmPassword: '' });

      // Update local storage with latest user data
      const updatedUser = {
        ...userData,
        ...data.user
      };
      localStorage.setItem('gatherUser', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Redirect to settings after success
      setTimeout(() => {
        router.push('/user-settings');
      }, 2000);

    } catch (error) {
      console.error('Password change error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 pt-12">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-900">Change Password</h1>
          <p className="mt-2 text-amber-600">Update your password to keep your account secure</p>
        </div>

        <div className="glass-card px-6 py-7 shadow-[0_14px_32px_rgba(255,195,120,0.16)]">
          {errorMessage && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-sm font-medium text-amber-700">
              Current Password
              <input
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={handleChange}
                placeholder="enter your current password"
                required
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </label>

            <label className="text-sm font-medium text-amber-700">
              New Password
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={handleChange}
                placeholder="enter your new password"
                required
                minLength={8}
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.newPassword && (
                <span className="mt-1 block text-xs text-red-600">{errors.newPassword}</span>
              )}
              {/* Removed the default help text - it will only show when there's an error */}
            </label>

            <label className="text-sm font-medium text-amber-700">
              Confirm New Password
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="confirm your new password"
                required
                minLength={8}
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.confirmPassword && (
                <span className="mt-1 block text-xs text-red-600">{errors.confirmPassword}</span>
              )}
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 pill-button bg-white text-amber-700 border border-amber-300 hover:bg-amber-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 pill-button bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}