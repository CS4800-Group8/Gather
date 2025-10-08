export default function SignupPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <section className="glass-card w-full max-w-md px-8 py-10">
        <h1 className="text-2xl font-semibold text-amber-700">Create Account</h1>
        <p className="mt-2 text-sm text-amber-500">Join our recipe community today!</p>

        <form className="mt-8 space-y-4">
          {/* Username */}
          <label className="block text-sm font-medium text-amber-700">
            Username
            <input
              type="text"
              placeholder="johndoe"
              required
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
          </label>

          {/* Email */}
          <label className="block text-sm font-medium text-amber-700">
            Email
            <input
              type="email"
              placeholder="you@example.com"
              required
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
          </label>

          {/* Date of Birth */}
          <label className="block text-sm font-medium text-amber-700">
            Date of Birth
            <input
              type="date"
              required
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
          </label>

          {/* Password */}
          <label className="block text-sm font-medium text-amber-700">
            Password
            <input
              type="password"
              placeholder="••••••••"
              required
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
          </label>

          {/* Confirm Password */}
          <label className="block text-sm font-medium text-amber-700">
            Confirm Password
            <input
              type="password"
              placeholder="••••••••"
              required
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
          </label>

          {/* Submit Button */}
          <button
            type="button"
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

