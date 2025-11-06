// Signup page with form validations and error handling.

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_AVATAR_ID, resolveAvatarPreset } from "@/lib/avatarPresets";

export default function SignupPage() {

  const router = useRouter();
  
  {/* State to store form data */}
  const [formData, setFormData] = useState({
    username: '',
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  {/* State to store error messages */}
  const [errors, setErrors] = useState({
    username: '',
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation functions

  // Validate username // DONE
  const validateUsername = (username: string) => {
    if (!username) return 'Username is required';

    // Thu modified ----------------------------------------------------------------------
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    // -----------------------------------------------------------------------------------
    return '';
  };

  // Thu added --------------------------------------------------------------------------
  const validateLastname = (lastname: string) => {
    if (!lastname) return 'Lastname is required';
    if (!/^[a-zA-Z]+$/.test(lastname)) {
      return 'Lastname can only contain letters';
    }
    return '';
  };

  const validateFirstname = (firstname: string) => {
    if (!firstname) return 'Firstname is required';
    if (!/^[a-zA-Z]+$/.test(firstname)) {
      return 'Firstname can only contain letters';
    }
    return '';
  };

  // --------------------------------------------------------------------------

  // Validate email format // DONE
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Validate password strength // DONE
  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    // Thu added from An's file ----------------------------------------------------------
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    // -----------------------------------------------------------------------------------
    return '';
  };

  // Validate confirm password // DONE
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
      case 'firstname':
        error = validateFirstname(value);
        break;
      case 'lastname':
        error = validateLastname(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
      firstname: validateFirstname(formData.firstname),
      lastname: validateLastname(formData.lastname),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) return;

    try {
      // Send request to API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          username: formData.username.toLowerCase(), // Viet fix: lowercase username input when sign up
          email: formData.email.toLowerCase(), // Viet fix: lowercase email input when sign up
          password: formData.password,
          confirmPassword: formData.confirmPassword, // An fix: Added missing confirmPassword field
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // API returned an error (e.g., username/email taken)
        alert(data.error || "Signup failed. Please try again.");
        return;
      }

      // An add: Auto-login after successful signup
      console.log("Created user:", data);

      // Collect the signup payload once for storage helpers
      // AnN add: Seed new profiles with default preset id on 10/22
      const defaultAvatarPreset = resolveAvatarPreset(DEFAULT_AVATAR_ID);
      const hydratedUser = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        email: formData.email,
        avatarId: defaultAvatarPreset.id,
        avatar: defaultAvatarPreset.value,
      };

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(hydratedUser));
      localStorage.setItem('gatherUser', JSON.stringify(hydratedUser)); // An add: Keep legacy and new keys aligned
      document.cookie = `gatherUser=${encodeURIComponent(JSON.stringify(hydratedUser))}; path=/; sameSite=Lax`; // An add: Sync cookie with local storage for header hydration
      window.dispatchEvent(new Event('gather:user-updated')); // An add: Notify the header that a new user is ready

      // Redirect to homepage (logged in)
      router.push("/");

    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again later.");
    }
};

  return (
    <div className="flex flex-col items-center gap-8">
      <section className="glass-card w-full max-w-lg px-6 py-7 shadow-[0_14px_32px_rgba(255,195,120,0.16)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-amber-800 sm:text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-amber-500">Join our recipe community today!</p>

        </div>

        {/* <form className="mt-6"> */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">

            {/* First Name */}
            <label className="text-sm font-medium text-amber-700">
              First name
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="your first name"
                required
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.firstname && (
              <span className="mt-1 block text-xs text-red-600">{errors.firstname}</span>
            )}
            </label>

            {/* Last Name */}
            <label className="text-sm font-medium text-amber-700">
              Last name
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="your last name"
                required
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.lastname && (
              <span className="mt-1 block text-xs text-red-600">{errors.lastname}</span>
            )}
            </label>

            {/* Username */}
            <label className="sm:col-span-2 text-sm font-medium text-amber-700">
              Username
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="choose a username"
                required
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.username && (
              <span className="mt-1 block text-xs text-red-600">{errors.username}</span>
            )}
            </label>

            {/* Email */}
            <label className="sm:col-span-2 text-sm font-medium text-amber-700">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your email"
                required
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.email && (
              <span className="mt-1 block text-xs text-red-600">{errors.email}</span>
            )}
            </label>

            {/* Password */}
            <label className="text-sm font-medium text-amber-700">
              Password
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="create a password"
                required
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.password && (
              <span className="mt-1 block text-xs text-red-600">{errors.password}</span>
            )}
            </label>

            {/* Confirm Password */}
            <label className="text-sm font-medium text-amber-700">
              Confirm password
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="confirm your password"
                required
                className="mt-1.5 w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 placeholder:text-amber-500/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              {errors.confirmPassword && (
              <span className="mt-1 block text-xs text-red-600">{errors.confirmPassword}</span>
            )}
            </label>
          </div>

          {/* Submit Button */}
          {/* <button
            type="button"
            className="pill-button mt-6 w-full justify-center bg-gradient-to-r from-[#ffc873] via-[#ffb551] to-[#ffa53c] text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(255,165,60,0.24)] transition hover:from-[#ffb551] hover:via-[#ffa53c] hover:to-[#ff9435] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb551]"
          >
            Create account
          </button> */}
          {/* Nick */}
          <button
            type="submit"
            className="pill-button w-full justify-center bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffdca0]"
          >
            Create Account
          </button>
        </form>

        {/* Link to Sign In */}
        <p className="mt-5 text-center text-sm text-amber-600">
          Already have an account?{" "}
          <a href="/signin" className="font-semibold text-amber-700 hover:underline">
            Sign in
          </a>
        </p>
      </section>
    </div>
  );
}
