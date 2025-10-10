"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";

const navLinks = siteConfig.nav;

// An fix: Made buttons darker and improved contrast
const baseNavClasses =
  "pill-button bg-white/90 text-amber-600 shadow-none hover:bg-white hover:text-amber-700";
const activeNavClasses =
  "pill-button bg-amber-600 text-white shadow-md hover:bg-amber-700";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // An fix: Check if user is logged in
  const [user, setUser] = useState<{
    firstname?: string | null;
    lastname?: string | null;
    username?: string | null;
    email?: string;
  } | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored =
          localStorage.getItem("gatherUser") ??
          localStorage.getItem("user");

        setUser(stored ? JSON.parse(stored) : null);
      } catch (error) {
        console.error("failed to parse stored user", error);
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("gather:user-updated", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("gather:user-updated", loadUser);
    };
  }, []);

  useEffect(() => {
    // An fix: close the profile popover when navigating
    setShowProfile(false);
  }, [pathname]);

  // An fix: safe fallbacks keep avatar and name from breaking when fields are missing
  const nameParts = [user?.firstname, user?.lastname].filter(
    (part): part is string => Boolean(part && part.trim())
  );
  const primaryName = nameParts.join(" ");
  const initialSource = primaryName || user?.username || "A";
  const avatarInitial = initialSource.charAt(0).toUpperCase();
  const displayName = primaryName || user?.username || "Gather member";

  const handleSignOut = () => {
    try {
      localStorage.removeItem("gatherUser");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("gather:user-updated"));
      document.cookie = "gatherUser=; path=/; max-age=0";
    } catch (error) {
      console.error("failed to clear user data on sign out", error);
    }
    setShowProfile(false);
    router.push("/signin"); // An add: After sign out, send users to the sign-in screen
  };

  return (
    <header className="sticky top-6 z-50 mx-auto w-full max-w-6xl px-6 lg:px-8">
      <div className="glass-card flex flex-col gap-4 px-6 py-5 shadow-none md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3cf] text-[#ffb86b]">
            <span className="text-xl">🥗</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-amber-700 md:text-xl">
              {siteConfig.name}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.32em] text-amber-900/40">
              {siteConfig.company}
            </span>
          </div>
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className={isActive("/") ? activeNavClasses : baseNavClasses}
            >
              Home
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? activeNavClasses : baseNavClasses}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              // An fix: Compact avatar toggles a quick profile menu
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfile((current) => !current)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-base font-semibold text-white shadow-[0_12px_24px_rgba(255,183,88,0.32)] transition hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                >
                  {avatarInitial}
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-3 w-60 rounded-3xl border border-[#ffeede]/90 bg-white/95 p-4 text-sm text-amber-700 shadow-[0_22px_44px_rgba(255,183,88,0.26)]">
                    <p className="text-lg font-semibold capitalize text-amber-800">
                      {displayName.toLowerCase()}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-amber-400">
                      @{user?.username ?? "gatherer"}
                    </p>
                    <p className="mt-2 break-words text-xs text-amber-500">{user?.email}</p>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="pill-button mt-4 w-full justify-center bg-[#ffe7b2] text-amber-700 shadow-none transition hover:bg-[#ffdca0]"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // An fix: Show sign in/up buttons when not logged in - only active state shines
              <>
                <Link
                  href="/signin"
                  className={isActive("/signin") ? activeNavClasses : baseNavClasses}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className={isActive("/signup") ? activeNavClasses : baseNavClasses}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
