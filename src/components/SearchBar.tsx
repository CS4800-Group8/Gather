// AnN add: Reusable SearchBar component for recipe search on 11/12
// Purpose: Provide a styled search input with clear button
// Used in: explore-recipes page (can be reused elsewhere)

"use client";

import { useState, useEffect, useRef } from "react";
import PopupModal from "@/components/PopupModal"; // Viet add: use PopupModal for filter
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"; // AnN edit: Changed to FunnelIcon and MagnifyingGlassIcon for better UX on 20/11

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string, selectedCategories: string[], selectedIngredients: string[]) => void; // Viet edit: Updated onSearch to include selected categories & ingredients
  className?: string;
  source?: "api" | "db"; // Viet add: new prop to decide filter source
}

interface APICategory {
  strCategory: string;
}

interface APIIngredient {
  strIngredient: string;
}

interface DBCategory {
  categoryName: string;
}

interface DBIngredient {
  ingredientName: string;
}

export default function SearchBar({
  placeholder = "Search recipes...",
  onSearch,
  className = "",
  source = "db", // Viet add: default to "db"
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  // Viet add: Popup and filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // AnN add: Debounce timer to prevent excessive API calls on 20/11
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // AnN add: Cleanup debounce timer on unmount on 20/11
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Viet add: Fetch categories and ingredients when popup opens
  useEffect(() => {
    if (isFilterOpen) {
      const fetchFilters = async () => {
        try {
          if (source === "api") {
            // Viet add: Fetch from TheMealDB
            const [catRes, ingRes] = await Promise.all([
              fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list"),
              fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list"),
            ]);
            const catData: { meals: APICategory[] } = await catRes.json();
            const ingData: { meals: APIIngredient[] } = await ingRes.json();

            setCategories(catData.meals.map((c) => c.strCategory));
            setIngredients(ingData.meals.map((i) => i.strIngredient));
          } else {
            // Viet add: Fetch from DB
            const [catRes, ingRes] = await Promise.all([
              fetch("/api/categories"),
              fetch("/api/ingredients"),
            ]);
            const catData: DBCategory[] = await catRes.json();
            const ingData: DBIngredient[] = await ingRes.json();

            setCategories(catData.map((c) => c.categoryName));
            setIngredients(ingData.map((i) => i.ingredientName));
          }
        } catch (err) {
          console.error("Error fetching filters:", err);
        }
      };
      fetchFilters();
    }
  }, [isFilterOpen, source]);

  // AnN edit: Debounced input handler to prevent excessive API calls on 20/11
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value); // Update UI immediately for responsiveness

    // Clear existing timeout
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timeout - only call onSearch after user stops typing for 300ms
    debounceTimer.current = setTimeout(() => {
      onSearch(value, selectedCategories, selectedIngredients);
    }, 300);
  };

  // Viet add: Handle checkbox toggling for category and ingredient
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

   // Viet add: Apply filters and close popup
  const applyFilters = () => {
    setIsFilterOpen(false);
    onSearch(query, selectedCategories, selectedIngredients);
  };

  // AnN edit: Unified clear function - clears both query and filters on 20/11
  const clearAll = () => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedIngredients([]);
    setIsFilterOpen(false);
    onSearch("", [], []); // Reset to show all recipes
  };

  return (
    <div className={`relative ${className}`}>
      {/* AnN edit: Modern Heroicons search icon on 20/11 */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">
        <MagnifyingGlassIcon className="h-5 w-5" />
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-amber-200 bg-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 text-amber-900 placeholder-amber-400 transition-all"
      />

      {/* AnN edit: Unified clear button - replaces X icon and shows for both query and filters on 20/11 */}
      {(query || selectedCategories.length > 0 || selectedIngredients.length > 0) && (
        <button
          onClick={clearAll}
          className="absolute right-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors text-xs font-medium"
          aria-label="Clear search and filters"
        >
          {selectedCategories.length > 0 || selectedIngredients.length > 0 ? "Clear filters" : "Clear"}
        </button>
      )}

      {/* Viet add: Filter button */}
      {/* AnN edit: Changed to FunnelIcon for clearer filter affordance on 20/11 */}
      <button
        onClick={() => setIsFilterOpen(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2
        px-3 py-2 rounded-lg transition-colors hover:bg-amber-100"
      >
        <FunnelIcon className="h-6 w-6 text-amber-600" />
      </button>

      {/* Viet add: Filter Popup */}
      <PopupModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <div className="text-amber-900 px-6 py-4 max-h-[80vh] overflow-y-auto rounded-2xl">
          <button
            onClick={() => setIsFilterOpen(false)}
            className="absolute top-5 right-12 px-2 py-1 text-amber-700 rounded-full hover:text-amber-900 hover:bg-amber-100 text-xl"
          >
            ✖
          </button>

          <h2 className="text-2xl font-bold mb-4 text-center">Filter Recipes</h2>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                    selectedCategories.includes(cat)
                      ? "bg-amber-100 border-amber-400"
                      : "border-amber-200 hover:border-amber-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="accent-amber-500"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ingredients.map((ing) => (
                <label
                  key={ing}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                    selectedIngredients.includes(ing)
                      ? "bg-amber-100 border-amber-400"
                      : "border-amber-200 hover:border-amber-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ing)}
                    onChange={() => toggleIngredient(ing)}
                    className="accent-amber-500"
                  />
                  <span>{ing}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={clearAll}
              className="px-4 py-2 rounded-lg border border-amber-400 text-amber-700 hover:bg-amber-100 transition"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
            >
              Apply
            </button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
}
