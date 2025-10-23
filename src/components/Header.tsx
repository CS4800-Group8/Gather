"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";
import {
  DEFAULT_AVATAR_ID,
  resolveAvatarPreset,
  normalizeAvatarId,
} from "@/lib/avatarPresets";
import AvatarImage from "./AvatarImage"; // AnN add: Use centralized avatar component on 10/23

const navLinks = siteConfig.nav;

// An fix: Made buttons darker and improved contrast
const baseNavClasses =
  "pill-button bg-[#ffdca0] text-amber-700 shadow-[0_6px_12px_rgba(255,195,120,0.25)] hover:bg-[#ffc873] hover:text-amber-800";
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
    avatar?: string;
    avatarId?: string;
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
  const displayName = primaryName || user?.username || "Gather member";

  // AnN add: Resolve avatar preset mappings with new config on 10/22
  const normalizedAvatarId = user
    ? normalizeAvatarId(user.avatarId ?? user.avatar ?? DEFAULT_AVATAR_ID)
    : DEFAULT_AVATAR_ID;
  const avatarPreset = user
    ? resolveAvatarPreset(normalizedAvatarId, user?.avatar ?? null)
    : null;
  // AnN fix: avatarBgClass now only used for fallback letter avatars on 10/23
  const avatarBgClass = avatarPreset?.bgClass ?? "bg-amber-500";

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
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-amber-300 bg-amber-100/95 backdrop-blur-md shadow-md">
      <div className="mx-auto flex w-full max-w-6xl flex-row items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
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

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
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
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${avatarPreset?.variant === 'emoji' ? avatarBgClass : 'bg-white'} shadow-[0_12px_24px_rgba(255,183,88,0.32)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400`}
                >
                  {avatarPreset ? (
                    // AnN fix: Only show bgClass for emoji, not images on 10/23
                    <AvatarImage preset={avatarPreset} size="small" />
                  ) : (
                    <span className="text-base font-semibold text-white">
                      {initialSource.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-[#ffeede]/90 bg-white/95 p-3 text-sm text-amber-700 shadow-[0_22px_44px_rgba(255,183,88,0.26)]">
                    <Link
                      href="/profile"
                      className="block w-full rounded-2xl bg-amber-100 px-4 py-3 text-left hover:bg-amber-200 transition-colors mb-2"
                    >
                      <p className="text-base font-semibold capitalize text-amber-800">
                        {displayName.toLowerCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-amber-600">
                        @{user?.username ?? "gatherer"}
                      </p>
                      <p className="mt-1 break-words text-xs text-amber-500">{user?.email}</p>
                    </Link>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfile(false);
                        // TODO: Navigate to settings page when backend implements it
                        console.log('Settings clicked');
                      }}
                      className="w-full rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-200 transition-colors mb-2"
                    >
                      Settings
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-200 transition-colors"
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
                {/*
                <Link
                  href="/signup"
                  className={isActive("/signup") ? activeNavClasses : baseNavClasses}
                >
                  Sign up
                </Link>
                */}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
