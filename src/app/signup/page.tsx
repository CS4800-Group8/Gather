'use client';

import { useState } from 'react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  // Validation functions
  const validateUsername = (username: string) => {
    if (!username) return 'Username is required';
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return 'Username can only contain letters and numbers';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear success message when user starts typing
    if (successMessage) setSuccessMessage('');

    // Real-time validation
    let error = '';
    switch (name) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also revalidate confirm password if it's filled
        if (formData.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
          }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      case 'dob':
        error = !value ? 'Date of birth is required' : '';
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      dob: !formData.dob ? 'Date of birth is required' : '',
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    // If validation passes, show success message
    setSuccessMessage('All validations passed! Ready to submit.');
    console.log('Form data ready to submit:', {
      username: formData.username,
      email: formData.email,
      dob: formData.dob,
      password: formData.password,
    });

    // TODO: Call API route to create user in database
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <section className="glass-card w-full max-w-md px-8 py-10">
        <h1 className="text-2xl font-semibold text-amber-700">Create Account</h1>
        <p className="mt-2 text-sm text-amber-500">Join our recipe community today!</p>

        {successMessage && (
          <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Username */}
          <label className="block text-sm font-medium text-amber-700">
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe123"
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
            {errors.username && (
              <span className="mt-1 block text-xs text-red-600">{errors.username}</span>
            )}
          </label>

          {/* Email */}
          <label className="block text-sm font-medium text-amber-700">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-red-600">{errors.email}</span>
            )}
          </label>

          {/* Date of Birth */}
          <label className="block text-sm font-medium text-amber-700">
            Date of Birth
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
            {errors.dob && (
              <span className="mt-1 block text-xs text-red-600">{errors.dob}</span>
            )}
          </label>

          {/* Password */}
          <label className="block text-sm font-medium text-amber-700">
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
            {errors.password && (
              <span className="mt-1 block text-xs text-red-600">{errors.password}</span>
            )}
          </label>

          {/* Confirm Password */}
          <label className="block text-sm font-medium text-amber-700">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
            {errors.confirmPassword && (
              <span className="mt-1 block text-xs text-red-600">{errors.confirmPassword}</span>
            )}
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="pill-button w-full justify-center bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffdca0]"
          >
            Create Account
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-6 text-center text-sm text-amber-600">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-amber-700 hover:underline">
            Log in
          </a>
        </p>
      </section>
    </div>
  );
}

