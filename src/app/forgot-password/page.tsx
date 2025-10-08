export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <section className="glass-card w-full max-w-md px-8 py-10">
        <h1 className="text-2xl font-semibold text-amber-700">Reset Password</h1>
        <p className="mt-2 text-sm text-amber-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form className="mt-8 space-y-4">
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

          {/* Submit Button */}
          <button
            type="button"
            className="pill-button w-full justify-center bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffdca0]"
          >
            Send Reset Link
          </button>
        </form>

        {/* Link back to Login */}
        <p className="mt-6 text-center text-sm text-amber-600">
          Remember your password?{" "}
          <a href="/login" className="font-semibold text-amber-700 hover:underline">
            Log in
          </a>
        </p>
      </section>
    </div>
  );
}

