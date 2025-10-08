export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <section className="glass-card w-full max-w-md px-8 py-10">
        <h1 className="text-2xl font-semibold text-amber-700">Log in</h1>
        <p className="mt-2 text-sm text-amber-500">Enter your credentials to continue.</p>

        {/* Swap this mock form for your real authentication handler when it’s ready. */}
        <form className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-amber-700">
            Email
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
          </label>
          <label className="block text-sm font-medium text-amber-700">
            Password
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-2xl border border-[#ffeede] bg-white/96 px-4 py-3 text-sm text-amber-700 focus:border-[#ffe1b8] focus:outline-none focus:ring-2 focus:ring-[#ffe8ce]"
            />
          </label>
          <button
            type="button"
            className="pill-button w-full justify-center bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffdca0]"
          >
            Sign in
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
        <p className="mt-6 text-center text-sm text-amber-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-semibold text-amber-700 hover:underline">
            Sign up
          </a>
        </p>
      </section>
    </div>
  );
}
