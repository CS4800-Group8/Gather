import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.company}`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="relative min-h-screen font-sans text-amber-900 antialiased">
        <div className="pointer-events-none fixed inset-x-0 top-[-200px] z-0 flex justify-center">
          <div className="h-56 w-[34rem] rounded-full bg-[rgba(255,221,162,0.15)] blur-[120px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-10 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
