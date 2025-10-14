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
  nav: [
    { href: "/my-recipes", label: "My Recipes" },
    { href: "/explore-recipes", label: "Explore Recipes" },
    // You can add more nav items later here…
  ],
  // Placeholder route (not yet implemented) to show where Sign In would go and put outside of nav because not sure if use it...
  signinHref: "/signin",
};
