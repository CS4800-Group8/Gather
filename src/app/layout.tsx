import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.company}`,
  description: siteConfig.description,
  // can put in a logo here eventually
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
