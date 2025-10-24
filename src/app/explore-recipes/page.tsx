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
  strInstructions?: string; // Cooking instructions has ? because it might not actually exist
  strYoutube?: string;      // Youtube link has ? because it might not actually exist
  // Dynamic ingredient/measure(1-20)
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
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
  
  // PopUp state
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  
  // Likes state (stored in localStorage)
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());

  // Load likes from localStorage
  useEffect(() => {
    const storedLikes = localStorage.getItem('likedRecipes');
    if (storedLikes) {
      setLikedRecipes(new Set(JSON.parse(storedLikes)));
    }
  }, []);

  // Toggle like functionality
  const toggleLike = (recipeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when clicking like button
    }
    
    setLikedRecipes(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(recipeId)) {
        newLikes.delete(recipeId);
      } else {
        newLikes.add(recipeId);
      }
      localStorage.setItem('likedRecipes', JSON.stringify([...newLikes]));
      return newLikes;
    });
  };

  // Open popUp with full recipe details
  const openRecipePopUp = async (recipe: Meal) => {
    // Fetch full recipe details if not already loaded
    if (!recipe.strInstructions) {
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`
        );
        const data = await response.json();
        setSelectedRecipe(data.meals[0]);
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        setSelectedRecipe(recipe);
      }
    } else {
      setSelectedRecipe(recipe);
    }
    setIsPopUpOpen(true);
    // Prevent background scroll when popUp is open
    document.body.style.overflow = 'hidden';
  };

  // Close popUp
  const closePopUp = () => {
    setIsPopUpOpen(false);
    setSelectedRecipe(null);
    // Restore background scroll
    document.body.style.overflow = 'unset';
  };

  // Get ingredients list
  const getIngredients = (meal: Meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof Meal];
      const measure = meal[`strMeasure${i}` as keyof Meal];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure} ${ingredient}`.trim());
      }
    }
    return ingredients;
  };

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
        
        // Step 4: filter already loaded recipes --> true random can give duplicate meals
        const uniqueMeals = meals.filter((meal, index, self) =>
          index === self.findIndex((m) => m.idMeal === meal.idMeal)
        );
        
        setRecipes(uniqueMeals);
        
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
          recipes.map((recipe, index) => (
            <div
              key={`${recipe.idMeal}-${index}`}
              className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
              onClick={() => openRecipePopUp(recipe)}
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                aria-label="Save recipe"
                onClick={(e) => toggleLike(recipe.idMeal, e)}
              >
                <span className={`text-2xl transition-colors ${
                  likedRecipes.has(recipe.idMeal) 
                    ? 'text-red-500' 
                    : 'text-amber-600 hover:text-red-500'
                }`}>
                  {likedRecipes.has(recipe.idMeal) ? '♥' : '♡'}
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

      {/* RECIPE POPUP */}
      {isPopUpOpen && selectedRecipe && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closePopUp}
        >
          <div 
            className="popUp-scrollbar bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PopUp Header with Close Button */}
            <div 
              className="flex-shrink-0 bg-white border-b border-amber-200 px-6 py-4 flex justify-between items-center z-10"
              onWheel={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-amber-900">{selectedRecipe.strMeal}</h2>
              <button
                onClick={closePopUp}
                className="w-10 h-10 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors text-amber-900"
                aria-label="Close popup"
              >
                <svg 
                  width="24" 
                  height="24" 
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
            </div>

            {/* PopUp Content - makes it scrollable Area */}
            <div className="overflow-y-auto flex-1 popUp-scrollbar p-6"
              style={{ borderRadius: '0 0 1rem 1rem' }}
            >
              {/* Recipe Image */}
              <div className="relative w-full h-96 rounded-xl overflow-hidden mb-6">
                <Image
                  src={selectedRecipe.strMealThumb}
                  alt={selectedRecipe.strMeal}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
                
                {/* Like Button on Image */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                  onClick={() => toggleLike(selectedRecipe.idMeal)}
                  aria-label="Like recipe"
                >
                  <span className={`text-3xl transition-colors ${
                    likedRecipes.has(selectedRecipe.idMeal) 
                      ? 'text-red-500' 
                      : 'text-amber-600 hover:text-red-500'
                  }`}>
                    {likedRecipes.has(selectedRecipe.idMeal) ? '♥' : '♡'}
                  </span>
                </button>
              </div>

              {/* Recipe Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Category & Cuisine */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-xl">🍴</span>
                    <span className="font-semibold">Category:</span>
                    <span>{selectedRecipe.strCategory}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-xl">🌍</span>
                    <span className="font-semibold">Cuisine:</span>
                    <span>{selectedRecipe.strArea}</span>
                  </div>
                </div>

                {/* Nutritional Info (Mock data - TheMealDB doesn't provide this) */}
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-bold text-amber-900 mb-2">Nutritional Info (Estimated)</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-amber-800">
                    <div>🔥 Calories: ~450 kcal</div>
                    <div>🥩 Protein: ~25g</div>
                    <div>🍞 Carbs: ~45g</div>
                    <div>🧈 Fat: ~15g</div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">*Estimates may vary</p>
                </div>
              </div>

              {/* Tags */}
              {selectedRecipe.strTags && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-2">Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedRecipe.strTags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="font-bold text-amber-900 mb-3 text-xl">Ingredients</h3>
                <ul className="grid md:grid-cols-2 gap-2">
                  {getIngredients(selectedRecipe).map((ingredient, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-amber-800">
                      <span className="text-amber-600">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              {selectedRecipe.strInstructions && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-3 text-xl">Instructions</h3>
                  <div className="prose max-w-none text-amber-800 whitespace-pre-line">
                    {selectedRecipe.strInstructions}
                  </div>
                </div>
              )}

              {/* YouTube Link */}
              {selectedRecipe.strYoutube && (
                <div className="mb-6">
                  <a
                    href={selectedRecipe.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span>▶️</span>
                    Watch Video Tutorial
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
