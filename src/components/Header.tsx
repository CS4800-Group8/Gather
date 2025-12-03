"use client";

import Link from "next/link";
import Image from "next/image"; // AnN add: For custom logo support on 12/1
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";
import {
  DEFAULT_AVATAR_ID,
  resolveAvatarPreset,
  normalizeAvatarId,
} from "@/lib/avatarPresets";
import AvatarImage from "./AvatarImage"; // An add: Use centralized avatar component on 10/23
import NotiCard from "./NotiCard"; // AnN add: Notification card component on 11/6
import UserRecipePopup from "./profile/UserRecipePopup"; // AnN add: Recipe popup for notification click on 11/25
import { UserRecipe } from "./profile/UserRecipeCard"; // AnN add: Recipe type for popup on 11/25
import { BellIcon, ChatBubbleLeftRightIcon, HomeIcon, MagnifyingGlassCircleIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline"; // AnN add: Modern bell icon on 11/6, chat icon on 11/19, bottom nav icons on 11/21, UserIcon for sign in on 11/21
import { HomeIcon as HomeIconSolid, MagnifyingGlassCircleIcon as MagnifyingGlassCircleIconSolid, UserGroupIcon as UserGroupIconSolid, ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from "@heroicons/react/24/solid"; // AnN add: Solid icons for active state on bottom nav on 11/21
import { usePolling } from "@/hooks/usePolling"; // AnN add: Reusable polling hook on 11/19

const navLinks = siteConfig.nav;

// AnN add: Notification type interface on 11/6
interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    avatarId: string;
  } | null;
  relatedRecipeId?: number | null; // AnN add: For recipe click on 11/25
}

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
    id?: number;
    firstname?: string | null;
    lastname?: string | null;
    username?: string | null;
    email?: string;
    avatar?: string;
    avatarId?: string;
  } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  // AnN add: Notification state on 11/6
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // AnN add: Mobile menu state on 11/18
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // AnN add: Recipe popup state for notification click on 11/25
  const [selectedRecipe, setSelectedRecipe] = useState<UserRecipe | null>(null);
  const [showRecipePopup, setShowRecipePopup] = useState(false);

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
    setShowNotifications(false);
    setShowMobileMenu(false); // AnN add: Close mobile menu on navigation on 11/18
  }, [pathname]);

  // AnN add: Prevent body scroll when modals are open on 11/18
  useEffect(() => {
    if (showMobileMenu || showNotifications || showProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu, showNotifications, showProfile]);

  // AnN add: ESC key support for mobile modals on 11/18
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNotifications) setShowNotifications(false);
        if (showProfile) setShowProfile(false);
        if (showMobileMenu) setShowMobileMenu(false);
      }
    };

    if (showNotifications || showProfile || showMobileMenu) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showNotifications, showProfile, showMobileMenu]);

  // AnN refactor: Extract notification fetching logic on 11/19
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        const unread = (data.notifications || []).filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // AnN refactor: Use reusable polling hook on 11/19
  // Polls every 5 seconds when user is logged in
  usePolling(fetchNotifications, 5000, !!user?.id);

  // AnN add: Poll for new messages to show red dot indicator on 20/11
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const checkNewMessages = async () => {
    if (!user?.id) return;

    const lastViewed = localStorage.getItem("lastViewedMessages");
    if (!lastViewed) {
      // If user has never visited messages, don't show notification
      return;
    }

    try {
      const response = await fetch(
        `/api/messages/has-new?userId=${user.id}&lastViewed=${lastViewed}`
      );
      if (response.ok) {
        const data = await response.json();
        setHasNewMessages(data.hasNew || false);
      }
    } catch (error) {
      console.error("Error checking new messages:", error);
    }
  };

  // Poll every 5 seconds when user is logged in
  usePolling(checkNewMessages, 5000, !!user?.id);

  // AnN add: Additional optimizations for immediate updates on 11/6
  useEffect(() => {
    if (!user?.id) return;

    // Refresh when window regains focus
    const handleFocus = () => {
      fetchNotifications();
    };

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]);

  // An add: Resolve avatar preset mappings with new config on 10/22
  const normalizedAvatarId = user
    ? normalizeAvatarId(user.avatarId ?? user.avatar ?? DEFAULT_AVATAR_ID)
    : DEFAULT_AVATAR_ID;
  const avatarPreset = user
    ? resolveAvatarPreset(normalizedAvatarId, user?.avatar ?? null)
    : null;
  // An fix: avatarBgClass now only used for fallback letter avatars on 10/23
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

  // AnN add: Notification handlers on 11/6 - Reuses Thu's friend API
  const handleMarkNotificationRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleAcceptFriend = async (userId: number, notificationId: number) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: userId,
          addresseeId: user.id,
          action: "accept",
        }),
      });

      if (response.ok) {
        // Mark notification as read and remove it
        await handleMarkNotificationRead(notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectFriend = async (userId: number, notificationId: number) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: userId,
          addresseeId: user.id,
          action: "reject",
        }),
      });

      if (response.ok) {
        // Remove notification from list
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  // AnN add: Handle recipe click from notification on 11/25
  const handleRecipeClick = async (recipeId: number) => {
    if (!recipeId) return;

    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRecipe(data.recipe);
        setShowRecipePopup(true);
        setShowNotifications(false); // Close notifications panel
      } else {
        console.error("Failed to fetch recipe");
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-amber-300 bg-amber-100/95 backdrop-blur-md shadow-md">
      <div className="mx-auto flex w-full max-w-6xl flex-row items-center justify-between gap-4 px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
        {/* AnN edit: Responsive logo - centered on mobile, top-aligned on desktop on 11/18 */}
        {/* AnN update: Support custom logo with fallback icon on 12/1 */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#fff3cf] overflow-hidden">
            {siteConfig.logo ? (
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                fill
                className="object-contain p-2"
                priority
              />
            ) : (
              <span className="text-2xl sm:text-3xl">{siteConfig.logoIcon || "🥗"}</span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-base sm:text-lg md:text-xl font-semibold text-amber-700">
              {siteConfig.name}
            </span>
            <span className="hidden sm:block text-xs font-medium uppercase tracking-[0.32em] text-amber-900/40">
              {siteConfig.company}
            </span>
          </div>
        </Link>

        {/* AnN add: Desktop navigation (hidden on mobile) on 11/18 */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-2">
            {navLinks.map((item) => {
              // AnN fix: Hide Home, Community, and Notifications when not logged in on 11/6
              // Keep Explore Recipes visible for everyone
              if (!user && item.href !== "/explore-recipes") {
                return null;
              }

              // AnN add: Render Messages as icon only on 11/19
              // AnN add: Show red dot when new messages on 20/11
              if (item.href === "/messages") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full ${
                      isActive(item.href)
                        ? "bg-amber-600 text-white shadow-md hover:bg-amber-700"
                        : "bg-[#ffdca0] text-amber-700 shadow-[0_6px_12px_rgba(255,195,120,0.25)] hover:bg-[#ffc873]"
                    } transition`}
                  >
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                    {/* AnN add: Red pulsing dot when new messages on 20/11 */}
                    {/* AnN fix: Hide dot when user is on messages page on 20/11 */}
                    {hasNewMessages && !isActive(item.href) && (
                      <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive(item.href) ? activeNavClasses : baseNavClasses}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* AnN add: Bell icon with notification popup on 11/6 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications((current) => !current);
                      setShowProfile(false);
                    }}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#ffdca0] text-amber-700 shadow-[0_6px_12px_rgba(255,195,120,0.25)] hover:bg-[#ffc873] transition"
                  >
                    {/* AnN add: Modern bell icon on 11/6 */}
                    <BellIcon className="h-6 w-6" />
                    {/* Unread badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* AnN edit: Responsive notification popup - fixed position on mobile for proper alignment on 11/18 */}
                  {showNotifications && (
                    <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-auto mt-0 sm:mt-3 w-auto sm:w-96 max-h-[32rem] overflow-hidden rounded-3xl border border-[#ffeede]/90 bg-white/95 shadow-[0_22px_44px_rgba(255,183,88,0.26)]">
                      {/* Header */}
                      <div className="border-b border-amber-200 p-4">
                        <h3 className="text-xl font-bold text-amber-900">Notifications</h3>
                      </div>

                      {/* Notification List */}
                      <div className="max-h-96 overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center">
                            <p className="text-sm text-amber-600">No notifications yet</p>
                          </div>
                        ) : (
                          <>
                            {/* Today */}
                            {notifications.some((n) => {
                              const today = new Date();
                              const notifDate = new Date(n.createdAt);
                              return notifDate.toDateString() === today.toDateString();
                            }) && (
                              <>
                                <p className="px-2 py-2 text-xs font-semibold text-amber-700">Today</p>
                                {notifications
                                  .filter((n) => {
                                    const today = new Date();
                                    const notifDate = new Date(n.createdAt);
                                    return notifDate.toDateString() === today.toDateString();
                                  })
                                  .map((notification) => (
                                    <NotiCard
                                      key={notification.id}
                                      id={notification.id}
                                      type={notification.type}
                                      message={notification.message}
                                      createdAt={notification.createdAt}
                                      isRead={notification.isRead}
                                      relatedUser={notification.relatedUser}
                                      relatedRecipeId={notification.relatedRecipeId}
                                      onMarkRead={handleMarkNotificationRead}
                                      onAccept={handleAcceptFriend}
                                      onReject={handleRejectFriend}
                                      onRecipeClick={handleRecipeClick}
                                    />
                                  ))}
                              </>
                            )}

                            {/* Earlier */}
                            {notifications.some((n) => {
                              const today = new Date();
                              const notifDate = new Date(n.createdAt);
                              return notifDate.toDateString() !== today.toDateString();
                            }) && (
                              <>
                                <p className="px-2 py-2 text-xs font-semibold text-amber-700">Earlier</p>
                                {notifications
                                  .filter((n) => {
                                    const today = new Date();
                                    const notifDate = new Date(n.createdAt);
                                    return notifDate.toDateString() !== today.toDateString();
                                  })
                                  .map((notification) => (
                                    <NotiCard
                                      key={notification.id}
                                      id={notification.id}
                                      type={notification.type}
                                      message={notification.message}
                                      createdAt={notification.createdAt}
                                      isRead={notification.isRead}
                                      relatedUser={notification.relatedUser}
                                      relatedRecipeId={notification.relatedRecipeId}
                                      onMarkRead={handleMarkNotificationRead}
                                      onAccept={handleAcceptFriend}
                                      onReject={handleRejectFriend}
                                      onRecipeClick={handleRecipeClick}
                                    />
                                  ))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* An fix: Compact avatar toggles a quick profile menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile((current) => !current);
                      setShowNotifications(false);
                    }}
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${avatarPreset?.variant === 'emoji' ? avatarBgClass : 'bg-white'} shadow-[0_12px_24px_rgba(255,183,88,0.32)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400`}
                >
                  {avatarPreset &&
                    // An fix: Only show bgClass for emoji, not images on 10/23
                    <AvatarImage preset={avatarPreset} size="small" />}
                </button>

                {/* AnN edit: Responsive profile popup - simple layout on 11/18 */}
                {showProfile && (
                  <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-auto mt-0 sm:mt-3 w-auto sm:w-64 rounded-3xl border border-[#ffeede]/90 bg-white/95 p-3 text-sm text-amber-700 shadow-[0_22px_44px_rgba(255,183,88,0.26)]">
                    <Link href="/profile" onClick={() => setShowProfile(false)}>
                      <p className="w-full rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-200 transition-colors mb-2 justify-center text-center">
                        {user?.username ?? "gatherer"}
                      </p>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfile(false);
                        router.push("/user-settings");
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
              </>
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

        {/* AnN add: Mobile menu button and icons (visible on mobile only) on 11/18 */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <>
              {/* Bell icon for mobile */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications((current) => !current);
                    setShowProfile(false);
                    setShowMobileMenu(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#ffdca0] text-amber-700 shadow-[0_6px_12px_rgba(255,195,120,0.25)] hover:bg-[#ffc873] transition"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* AnN edit: Mobile notification popup with backdrop on 11/18 */}
                {showNotifications && (
                  <>
                    {/* Backdrop overlay for mobile */}
                    <div
                      className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                      onClick={() => setShowNotifications(false)}
                      aria-label="Close notifications"
                      role="button"
                    />
                    <div
                      className="fixed left-4 right-4 top-20 w-auto max-h-[32rem] overflow-hidden rounded-3xl border border-[#ffeede]/90 bg-white shadow-[0_22px_44px_rgba(255,183,88,0.26)] z-40"
                      onClick={(e) => e.stopPropagation()}
                    >
                    <div className="border-b border-amber-200 p-4">
                      <h3 className="text-xl font-bold text-amber-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-sm text-amber-600">No notifications yet</p>
                        </div>
                      ) : (
                        <>
                          {notifications.some((n) => {
                            const today = new Date();
                            const notifDate = new Date(n.createdAt);
                            return notifDate.toDateString() === today.toDateString();
                          }) && (
                            <>
                              <p className="px-2 py-2 text-xs font-semibold text-amber-700">Today</p>
                              {notifications
                                .filter((n) => {
                                  const today = new Date();
                                  const notifDate = new Date(n.createdAt);
                                  return notifDate.toDateString() === today.toDateString();
                                })
                                .map((notification) => (
                                  <NotiCard
                                    key={notification.id}
                                    id={notification.id}
                                    type={notification.type}
                                    message={notification.message}
                                    createdAt={notification.createdAt}
                                    isRead={notification.isRead}
                                    relatedUser={notification.relatedUser}
                                    relatedRecipeId={notification.relatedRecipeId}
                                    onMarkRead={handleMarkNotificationRead}
                                    onAccept={handleAcceptFriend}
                                    onReject={handleRejectFriend}
                                    onRecipeClick={handleRecipeClick}
                                  />
                                ))}
                            </>
                          )}
                          {notifications.some((n) => {
                            const today = new Date();
                            const notifDate = new Date(n.createdAt);
                            return notifDate.toDateString() !== today.toDateString();
                          }) && (
                            <>
                              <p className="px-2 py-2 text-xs font-semibold text-amber-700">Earlier</p>
                              {notifications
                                .filter((n) => {
                                  const today = new Date();
                                  const notifDate = new Date(n.createdAt);
                                  return notifDate.toDateString() !== today.toDateString();
                                })
                                .map((notification) => (
                                  <NotiCard
                                    key={notification.id}
                                    id={notification.id}
                                    type={notification.type}
                                    message={notification.message}
                                    createdAt={notification.createdAt}
                                    isRead={notification.isRead}
                                    relatedUser={notification.relatedUser}
                                    relatedRecipeId={notification.relatedRecipeId}
                                    onMarkRead={handleMarkNotificationRead}
                                    onAccept={handleAcceptFriend}
                                    onReject={handleRejectFriend}
                                    onRecipeClick={handleRecipeClick}
                                  />
                                ))}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* AnN add: Mobile bottom navigation bar - always visible on 11/21 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-amber-300 bg-amber-100/95 backdrop-blur-md shadow-[0_-4px_12px_rgba(255,183,88,0.15)]">
        <nav className="flex items-center justify-around px-2 py-2">
          {/* Home - only show when logged in */}
          {user && (
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors hover:bg-amber-200/50 min-w-[60px]"
            >
              {isActive("/") ? (
                <HomeIconSolid className="h-6 w-6 text-amber-700" />
              ) : (
                <HomeIcon className="h-6 w-6 text-amber-600" />
              )}
              <span className={`text-xs font-medium ${isActive("/") ? "text-amber-900" : "text-amber-700"}`}>
                Home
              </span>
            </Link>
          )}

          {/* Explore */}
          <Link
            href="/explore-recipes"
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors hover:bg-amber-200/50 min-w-[60px]"
          >
            {isActive("/explore-recipes") ? (
              <MagnifyingGlassCircleIconSolid className="h-6 w-6 text-amber-700" />
            ) : (
              <MagnifyingGlassCircleIcon className="h-6 w-6 text-amber-600" />
            )}
            <span className={`text-xs font-medium ${isActive("/explore-recipes") ? "text-amber-900" : "text-amber-700"}`}>
              Explore
            </span>
          </Link>

          {/* Community - only show when logged in */}
          {user && (
            <Link
              href="/community"
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors hover:bg-amber-200/50 min-w-[60px]"
            >
              {isActive("/community") ? (
                <UserGroupIconSolid className="h-6 w-6 text-amber-700" />
              ) : (
                <UserGroupIcon className="h-6 w-6 text-amber-600" />
              )}
              <span className={`text-xs font-medium ${isActive("/community") ? "text-amber-900" : "text-amber-700"}`}>
                Community
              </span>
            </Link>
          )}

          {/* Messages - only show when logged in */}
          {user && (
            <Link
              href="/messages"
              className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors hover:bg-amber-200/50 min-w-[60px]"
            >
              {isActive("/messages") ? (
                <ChatBubbleLeftRightIconSolid className="h-6 w-6 text-amber-700" />
              ) : (
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-amber-600" />
              )}
              {/* Red dot for new messages */}
              {hasNewMessages && !isActive("/messages") && (
                <span className="absolute top-1 right-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
              )}
              <span className={`text-xs font-medium ${isActive("/messages") ? "text-amber-900" : "text-amber-700"}`}>
                Messages
              </span>
            </Link>
          )}

          {/* Profile - only show when logged in */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfile((current) => !current);
                  setShowNotifications(false);
                }}
                className="flex items-center justify-center p-2 rounded-xl transition-colors hover:bg-amber-200/50"
              >
                <div className="flex items-center justify-center" style={{ width: '36px', height: '36px' }}>
                  {avatarPreset && (
                    <div style={{ transform: 'scale(0.82)', transformOrigin: 'center' }}>
                      <AvatarImage preset={avatarPreset} size="small" />
                    </div>
                  )}
                </div>
              </button>

              {/* Profile popup for mobile bottom nav */}
              {showProfile && (
                <>
                  {/* Backdrop overlay */}
                  <div
                    className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                    onClick={() => setShowProfile(false)}
                    aria-label="Close profile menu"
                    role="button"
                  />
                  <div
                    className="fixed left-4 right-4 top-20 w-auto rounded-3xl border border-[#ffeede]/90 bg-white p-3 text-sm text-amber-700 shadow-[0_22px_44px_rgba(255,183,88,0.26)] z-40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href="/profile" onClick={() => setShowProfile(false)}>
                      <p className="w-full rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-200 transition-colors mb-2 justify-center text-center">
                        {user?.username ?? "gatherer"}
                      </p>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfile(false);
                        router.push("/user-settings");
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
                </>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors hover:bg-amber-200/50 min-w-[60px]"
            >
              <UserIcon className="h-6 w-6 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                Sign In
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>

    {/* AnN add: Recipe popup for notification click on 11/25 - OUTSIDE header for proper z-index */}
    {showRecipePopup && selectedRecipe && (
      <UserRecipePopup
        recipe={selectedRecipe}
        onClose={() => {
          setShowRecipePopup(false);
          setSelectedRecipe(null);
        }}
      />
    )}
    </>
  );
}