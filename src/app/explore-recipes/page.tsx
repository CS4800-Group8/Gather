//EXPLORE RECIPES WITH API CALLS

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/* DATABASE INFO
 * 
 * TheMealDB API returns many more fields like:
 * - strInstructions (cooking steps)
 * - strIngredient1-20 (ingredients)
 * - strMeasure1-20 (measurements)
 * - strYoutube (video link)
 * But we don't need them for the card display.
 */
interface Meal {
  idMeal: string;           // Unique ID ("52771") - used for React keys and future saving
  strMeal: string;          // Recipe name ("Spicy Arrabiata Penne")
  strMealThumb: string;     // Image URL ("https://www.themealdb.com/images/media/meals/...")
  strCategory: string;      // Category ("Vegetarian", "Seafood", "Dessert")
  strArea: string;          // Cuisine type ("Italian", "Chinese", "Mexican")
  strTags: string | null;   // Comma-separated tags ("Pasta,Curry") or null if none
}

export default function ExploreRecipesPage() {
  
  /* 
   * STATE MANAGEMENT - Using React hooks to manage component data
   * 
   * 1. recipes: Array of meal objects fetched from API
   *    - Starts empty [], gets populated after API call
   *    - Type: Meal[] (array of Meal interface objects)
   * 
   * 2. loading: Boolean to track if API is still fetching
   *    - Starts true, becomes false after fetch completes
   *    - Used to show skeleton loading cards vs real content
   * 
   * 3. error: String error message or null
   *    - Starts null, gets set if API call fails
   *    - Used to display error message to user
   */
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   /* API FETCHING LOGIC - useEffect runs once when component mounts
   * 
   * TheMealDB API STRUCTURE:
   * - Base URL: https://www.themealdb.com/api/json/v1/
   * - API Key: "1" (free test key for development)
   * - Endpoint: /random.php (returns 1 random recipe)
   * - Full URL: https://www.themealdb.com/api/json/v1/1/random.php
   * 
   * IMPORTANT: TheMealDB's free API doesn't have a "get multiple random meals"
   * endpoint, so we have to call the random endpoint 15 times.
   */
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Step 1: Set loading to true (show skeleton cards) which acts as a loading bar 
        setLoading(true);
        
        /* Step 2: Create array of 15 fetch calls
         * Each item is a fetch promise that:
         *   1. Calls the API: fetch('...')
         *   2. Converts response to JSON: .then(res => res.json())
         *   3. Extracts first meal: .then(data => data.meals[0])
         * 
         * We extract data.meals[0] to get just the meal object itself
         */
        const promises = Array.from({ length: 15 }, () =>
          fetch('https://www.themealdb.com/api/json/v1/1/random.php')
            .then(res => res.json())
            .then(data => data.meals[0])
        );
        
        /* Step 3: Wait for ALL promises to complete
         * 
         * Promise.all(promises) waits for all 15 fetches to finish
         * Returns: [meal1, meal2, meal3, ..., meal15]
         * If ANY promise fails, the whole thing fails (caught by catch block)
         */
        const meals = await Promise.all(promises);
        
        // Step 4: Update state with fetched recipes
        setRecipes(meals);
        
      } catch (err) {
        /* Step 5: Error handling
         * 
         * If ANY fetch fails:
         * - Set error message for user, log error in console, and display an erorr (so the site doesn't crash)
         */
        setError('Failed to load recipes. Please try again.');
        console.error('Error fetching recipes:', err);
        
      } finally {
        /* Step 6: Always run this, success or failure
         * 
         * Set loading to false so:
         * - Skeleton cards disappear
         * - Real content (or error) shows
         */
        setLoading(false);
      }
    };

    // Execute the fetch function when component mounts
    fetchRecipes();
  }, []); // Empty dependency array = run once on mount only



  // COMPONENT RENDERING - What gets displayed to the user
  return (
    <section className="px-6 py-8">
      
      {/* PAGE HEADER - Title and description */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">Explore Recipes</h1>
        <p className="text-amber-700">Discover delicious recipes from around the world</p>
      </div>

      {/* ERROR MESSAGE - Only shows if error state is not null */}
      {error && (
        <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              className="glass-card overflow-hidden"
            >
              {/* Skeleton Image Area */}
              <div className="relative w-full h-64 bg-gradient-to-br from-amber-100 to-amber-200 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-amber-400 text-4xl">🍽️</div>
                </div>
              </div>
              
              {/* Skeleton Content Area */}
              <div className="p-6">
                {/* Skeleton Recipe Name */}
                <div className="h-7 bg-amber-200 rounded-md mb-4 animate-pulse"></div>
                
                {/* Skeleton Recipe Details (2 lines) */}
                <div className="space-y-3">
                  <div className="h-5 bg-amber-100 rounded-md w-3/4 animate-pulse"></div>
                  <div className="h-5 bg-amber-100 rounded-md w-1/2 animate-pulse"></div>
                </div>
                
                {/* Skeleton Tags (2 pills) */}
                <div className="flex gap-2 mt-5">
                  <div className="h-7 w-20 bg-amber-200 rounded-full animate-pulse"></div>
                  <div className="h-7 w-24 bg-amber-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.idMeal}
              className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                aria-label="Save recipe"
              >
                <span className="text-2xl text-amber-600 hover:text-red-500 transition-colors">
                  ♡
                </span>
              </button>

              {/* 
               * - src: Image URL from API (recipe.strMealThumb)
               * - alt: Accessibility text (recipe name)
               * - fill: Makes image fill parent container
               * - object-cover: Crop/fit image to container
               */}
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* CARD CONTENT - Recipe details */}
              <div className="p-6">
                
                {/* Recipe Name */}
                <h3 className="text-xl font-bold text-amber-900 mb-3 line-clamp-2">
                  {recipe.strMeal}
                </h3>

                {/* Recipe Details - Category and Cuisine */}
                <div className="space-y-2 mb-4">
                  {/* Category ("Vegetarian", "Seafood") */}
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-lg">🍴</span>
                    <span className="text-sm">{recipe.strCategory}</span>
                  </div>
                  
                  {/* Cuisine/Area ("Italian", "Chinese") */}
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-lg">🌍</span>
                    <span className="text-sm">{recipe.strArea} Cuisine</span>
                  </div>
                </div>

                {/*
                 * 1. recipe.strTags.split(',') - Split "Pasta,Curry" into ["Pasta", "Curry"]
                 * 2. .slice(0, 2) - Take only first 2 tags (avoid overflow)
                 * 3. .map() - Create a pill for each tag
                 * 4. tag.trim() - Remove extra spaces
                 */}
                {recipe.strTags && (
                  <div className="flex gap-2 flex-wrap">
                    {recipe.strTags.split(',').slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}


 