export default function SignupPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <section className="glass-card w-full max-w-lg px-6 py-7 shadow-[0_14px_32px_rgba(255,195,120,0.16)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-amber-800 sm:text-3xl">Create your account</h1>
        </div>

        <form className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-amber-700">
              First name
              <input
                type="text"
                placeholder="Enter first name"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#ffeede] bg-white/95 px-4 py-2.5 text-sm text-amber-800 shadow-[0_3px_12px_rgba(255,210,150,0.18)] focus:border-[#ffd59f] focus:outline-none focus:ring-2 focus:ring-[#ffe6c6]"
              />
            </label>

            <label className="text-sm font-medium text-amber-700">
              Last name
              <input
                type="text"
                placeholder="Enter last name"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#ffeede] bg-white/95 px-4 py-2.5 text-sm text-amber-800 shadow-[0_3px_12px_rgba(255,210,150,0.18)] focus:border-[#ffd59f] focus:outline-none focus:ring-2 focus:ring-[#ffe6c6]"
              />
            </label>

            <label className="sm:col-span-2 text-sm font-medium text-amber-700">
              Username
              <input
                type="text"
                placeholder="Choose a username"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#ffeede] bg-white/95 px-4 py-2.5 text-sm text-amber-800 shadow-[0_3px_12px_rgba(255,210,150,0.18)] focus:border-[#ffd59f] focus:outline-none focus:ring-2 focus:ring-[#ffe6c6]"
              />
            </label>

            <label className="sm:col-span-2 text-sm font-medium text-amber-700">
              Email
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#ffeede] bg-white/95 px-4 py-2.5 text-sm text-amber-800 shadow-[0_3px_12px_rgba(255,210,150,0.18)] focus:border-[#ffd59f] focus:outline-none focus:ring-2 focus:ring-[#ffe6c6]"
              />
            </label>

            <label className="text-sm font-medium text-amber-700">
              Password
              <input
                type="password"
                placeholder="Create a password"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#ffeede] bg-white/95 px-4 py-2.5 text-sm text-amber-800 shadow-[0_3px_12px_rgba(255,210,150,0.18)] focus:border-[#ffd59f] focus:outline-none focus:ring-2 focus:ring-[#ffe6c6]"
              />
            </label>

            <label className="text-sm font-medium text-amber-700">
              Confirm password
              <input
                type="password"
                placeholder="Confirm your password"
                required
                className="mt-1.5 w-full rounded-2xl border border-[#ffeede] bg-white/95 px-4 py-2.5 text-sm text-amber-800 shadow-[0_3px_12px_rgba(255,210,150,0.18)] focus:border-[#ffd59f] focus:outline-none focus:ring-2 focus:ring-[#ffe6c6]"
              />
            </label>
          </div>

          <button
            type="button"
            className="pill-button mt-6 w-full justify-center bg-gradient-to-r from-[#ffc873] via-[#ffb551] to-[#ffa53c] text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(255,165,60,0.24)] transition hover:from-[#ffb551] hover:via-[#ffa53c] hover:to-[#ff9435] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb551]"
          >
            Create account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-amber-600">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-amber-700 hover:underline">
            Log in
          </a>
        </p>
      </section>
    </div>
  );
}
