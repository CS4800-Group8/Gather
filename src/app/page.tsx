/**
 * page.tsx (Home Page)
 *   - The landing page for "/".
 *   - Explains that the main content area will be filled by a recipes API.
 *   - Take note of the "Badge" can use it later to signify if a user wants to like or favorite something
 *   - Take note of <p> allows to turn the information displayed into segments for better styling (use style= {{ style-you-want }})
 */

"use client";

import React from "react";

export default function HomePage() {
  const [search, setSearch] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSuccess(true);
    } else {
      setSuccess(false);
    }
  };

  return (
    <>

      {/* WELCOME BANNER WITH THE BADGE */}
      <div className="hero">
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
      </div>
      
      {/* SEARCH BAR PLACEHOLDER */}
      <div className="hero" style={{ marginBottom: 24 }}>
        <h2>Search Recipes</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSuccess(false); }}
            placeholder="Search for a recipe or ingredient..."
            className="badge"
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            className="badge"
            style={{ padding: "8px 16px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none" }}
          >
            🔎︎
          </button>
        </form>
        {success && (
          <p style={{ color: "#16a34a", fontWeight: 500 }}>Search successful! Showing results for: <span style={{ fontWeight: 700 }}>{search}</span></p>
        )}
      </div>
      
      {/* NOTES AREA FOR NOW / TODO */}
      <div className="hero">
        <h2>Notes</h2>
        <p>
          <strong>TODO:</strong> Implement a search query to search for ingredients
        </p>
        <p>
          Search would return ingredients, ex: Search clam returns dishes with clams in them
        </p>
      </div>

      {/* DATABASE NOTES */}
      <div className="hero">
        <h2>Neon Database</h2>
        <p>
          To connect Neon (a serverless Postgres database) to this project:
        </p>
        <ol style={{ paddingLeft: 20 }}>
          <li>Sign up at <a href="https://neon.tech">neon.tech</a> and create a database.</li>
          <li>Copy your database connection string from the Neon dashboard.</li>
          <li>Install the PostgreSQL client for Node.js by running <code>npm install pg</code>.</li>
          <li>Add your Neon connection string to <code>.env.local</code> as <code>DATABASE_URL</code>.</li>
          <li>Create API routes in <code>src/app/api/</code> to interact with Neon using the <code>pg</code> client.</li>
        </ol>
      </div>
            

    </>
  );
}
