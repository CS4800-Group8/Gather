/**
 * siteConfig.ts
 *   - Central place for site-wide metadata and nav links.
 *   - Keeps text/links out of components for easy maintenance.
 *   - Easy access to all the data --> change this file to desired information and it will update across the application
 */
export const siteConfig = {
  name: "Gather",
  company: "NVMA Tech",
  description:
    "Bright, simple recipe finder by NVMA Tech. The main content is intentionally minimal so you can plug in your API results.",
  // AnN add: Logo configuration on 12/1
  // To use custom logo: add your logo file to /public/logo/ and set logo path below
  logo: "/logo/nvma-2.png" as string | undefined, // NVMA Tech logo with header-matching background
  logoIcon: "📖", // Fallback icon when no custom logo is set
  // AnN fix: Moved all nav links to siteConfig for consistency on 11/6
  nav: [
    { href: "/", label: "Home" },
    { href: "/explore-recipes", label: "Explore Recipes" },
    { href: "/community", label: "Community" },  // AnN add: Community page on 11/4
    { href: "/messages", label: "Messages" },  // AnN add: Messages/chat page on 11/19
    // AnN removed: Notifications nav link on 11/6 - using bell icon popup instead (Facebook-style)
  ],
  // Placeholder route (not yet implemented) to show where Sign In would go and put outside of nav because not sure if use it...
  signinHref: "/signin",
};
