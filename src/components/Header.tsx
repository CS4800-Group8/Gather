"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="container header__inner">
        <div className="brand">
          <Link href="/" className="brand__title">
            <span className="badge">{siteConfig.company}</span>
          </Link>
          <Link href="/">
            <h1 className="brand__title" style={{ fontSize: 18, margin: 0 }}>
              {siteConfig.name}
            </h1>
          </Link>
        </div>

        <nav className="nav" aria-label="Primary">
          {siteConfig.nav.map((item, idx) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const primary = idx === 1; // make "Explore Recipes" pop a bit
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn ${primary ? "btn--primary" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
