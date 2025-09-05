/**
 * ----------------------------------------------------------------------------
 * layout.tsx (Root Layout)
 * Purpose:
 *   - Provides the shared outer structure for **every page**.
 *   - Loads global CSS and draws the floating Toolbar (Header) on all pages.
 *   - Wraps the page content in a padded .container for consistent spacing.
 *
 * Notes:
 *   - The "metadata" export sets the browser tab title/description.
 *   - We intentionally do not declare icons to avoid missing favicon lookups.
 * ----------------------------------------------------------------------------
 */

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.company}`,
  description: siteConfig.description,
  // no "icons" so Next won't look for /favicon.ico automatically
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container main">{children}</main>
      </body>
    </html>
  );
}
