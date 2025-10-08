"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";

const navLinks = siteConfig.nav;

// Shared styles keep every pill aligned with the pastel palette.
const baseNavClasses =
  "pill-button bg-white/90 text-amber-500 shadow-none hover:bg-white hover:text-amber-600";
const activeNavClasses =
  "pill-button bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffdca0]";
const loginClasses =
  "pill-button bg-[#ffe7b2] text-amber-700 shadow-none hover:bg-[#ffd28a]";

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
            <Link href="/login" className={baseNavClasses}>
              Login
            </Link>
            <Link href="/signup" className={loginClasses}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
