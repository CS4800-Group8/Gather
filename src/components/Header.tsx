"use client";
/**
 * Header.tsx
 *   - Renders the floating toolbar on every page.
 *   - Buttons: My Recipes, Explore Recipes, Login (placeholder for now).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";

export default function Header() {
  const pathname = usePathname();

  // Determine if a link is active for styling
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="toolbar-wrap">
      <div className="container">
        <div className="toolbar">
          {/* Brand (title + company) — no logo */}
          <div className="brand">
            <div className="brand__title">
              <Link href="/">
                <span className="brand__name">{siteConfig.name}</span>
              </Link>
              <span className="brand__subtitle">{siteConfig.company}</span>
            </div>
          </div>

          {/* Explicit nav buttons (three Links with href) */}
          <nav className="toolbar__nav">
            {/* My Recipes */}
            <Link
              href="/my-recipes"
              className={`btn btn--accent ${isActive("/my-recipes") ? "is-active" : ""}`}
            >
              My Recipes
            </Link>

            {/* Explore Recipes */}
            <Link
              href="/explore-recipes"
              className={`btn btn--accent ${isActive("/explore-recipes") ? "is-active" : ""}`}
            >
              Explore Recipes
            </Link>

            {/* Visual divider inside toolbar */}
            <div className="toolbar__spacer" />

            {/* Login placeholder (route not implemented yet) */}
            <Link
              href={siteConfig.loginHref}
              className={`btn btn--login`}
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
