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
        Start by navigating to <strong>My Recipes</strong> or{" "}
        <strong>Explore Recipes</strong> using the buttons above.
      </p>
    </section>
  );
}
