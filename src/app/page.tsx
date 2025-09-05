/**
 * page.tsx (Home Page)
 *   - The landing page for "/".
 *   - Explains that the main content area will be filled by a recipes API.
 *   - Take note of the "Badge" can use it later to signify if a user wants to like or favorite something
 *   - Take note of <p> allows to turn the information displayed into segments for better styling (use style= {{ style-you-want }})
 */

export default function HomePage() {
  return (
    <section className="hero">
      <h2>Welcome to Recipe Finder</h2>
      <p>
        Built by <strong>NVMA Tech</strong>. This main area is intentionally
        minimal so you can wire up your API data.
      </p>
      <p>
        <span className="badge">API Placeholder</span> This section will be
        filled with results from a recipes API (e.g., search box, results grid,
        filters, etc.). For now, it just confirms the page renders.
      </p>
      <p style={{ marginTop: 10 }}>
        Use the toolbar to visit <strong>My Recipes</strong> or{" "}
        <strong>Explore Recipes</strong>.
      </p>
      
    </section>
  );
}
