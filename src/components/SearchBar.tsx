// AnN add: Reusable SearchBar component for recipe search on 11/12
// Purpose: Provide a styled search input with clear button
// Used in: explore-recipes page (can be reused elsewhere)

"use client";

import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search recipes...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-amber-200 bg-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 text-amber-900 placeholder-amber-400 transition-all"
      />

      {/* Clear Button (only show when there's text) */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors"
          aria-label="Clear search"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
}
