//EXPLORE RECIPES WITH API CALLS

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import APIRecipePopup from '@/components/APIRecipePopup'; // AnN add: Reusable API recipe popup component on 11/12
import SearchBar from '@/components/SearchBar'; // AnN add: Search bar component for finding recipes on 11/12

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
  strTags?: string | null;  // Comma-separated tags ("Pasta,Curry") or null if none
  strInstructions?: string; // Cooking instructions has ? because it might not actually exist
  strYoutube?: string;      // Youtube link has ? because it might not actually exist
  // AnN add: Dynamic fields for compatibility with APIRecipePopup on 11/12
  [key: string]: string | null | undefined;
}

// AnN edit: Removed getYouTubeVideoId helper function on 11/12
// Now included in APIRecipePopup component to avoid duplication

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
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set());

  // AnN add: Search state on 11/12
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // AnN edit: Removed Nick's temporary localStorage comment state on 11/12
  // Now using database-backed CommentSection component instead

  // AnN add: Search TheMealDB API by recipe name on 11/12
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // If search is empty, clear search results and show random recipes
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Search the entire TheMealDB API database
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.meals || []); // meals will be null if no results
    } catch (err) {
      console.error('Error searching recipes:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // AnN add: Display either search results or random recipes on 11/12
  const displayedRecipes = searchQuery.trim() ? searchResults : recipes;

  // Load likes from localStorage
  useEffect(() => {
    const storedLikes = localStorage.getItem('favoritedRecipes');
    if (storedLikes) {
      setFavoritedRecipes(new Set(JSON.parse(storedLikes)));
    }
  }, []);

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

  // AnN edit: Removed getIngredients and getYouTubeVideoId helpers on 11/12
  // These functions are now in APIRecipePopup component to avoid duplication

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
        
        /* Step 2: Fetch recipes until we have 15 valid ones with images
         * Keep fetching until we collect 15 unique meals that have valid images
         */
        const validMeals: Meal[] = [];
        const seenIds = new Set<string>();
        
        /* Step 3: Loop through random API calls until we have 15 unique meals with images
         * For each iteration:
         *   1. Fetch a random meal from the API
         *   2. Check if the meal exists, has a valid image (strMealThumb), and isn't a duplicate
         *   3. If valid, add it to our collection and track its ID
         *   4. Continue until we have exactly 15 meals
         */
        while (validMeals.length < 15) {
          const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
          const data = await response.json();
          const meal = data.meals[0];
          
          // Check if meal has a valid image and hasn't been added yet
          if (meal && meal.strMealThumb && !seenIds.has(meal.idMeal)) {
            validMeals.push(meal);
            seenIds.add(meal.idMeal);
          }
        }
        
        // Step 4: Now we have found enough unique meals with pictures --> set those meals as the recipes to display
        setRecipes(validMeals);
        
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

  // Add this function to handle saving to FavoriteAPIRecipe table
  const saveFavoriteAPIRecipe = async (apiId: string) => {
    try {
      // Get current user from localStorage
      const stored = localStorage.getItem('gatherUser') || localStorage.getItem('user');
      if (!stored) {
        console.error('User not logged in');
        return false;
      }

      const userData = JSON.parse(stored);
      const userId = userData.id;

      if (!userId) {
        console.error('User ID not found');
        return false;
      }

      const favoriteRecipeData = {
        userId: userId,
        apiId: apiId
      };

      const response = await fetch('/api/favorite-api-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(favoriteRecipeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save favorite recipe:', errorData.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving favorite recipe:', error);
      return false;
    }
  };

  // Add this function to remove from FavoriteAPIRecipe table
  const removeFavoriteAPIRecipe = async (apiId: string) => {
    try {
      // Get current user from localStorage
      const stored = localStorage.getItem('gatherUser') || localStorage.getItem('user');
      if (!stored) {
        console.error('User not logged in');
        return false;
      }

      const userData = JSON.parse(stored);
      const userId = userData.id;

      if (!userId) {
        console.error('User ID not found');
        return false;
      }

      const response = await fetch('/api/favorite-api-recipes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          apiId: apiId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to remove favorite recipe:', errorData.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing favorite recipe:', error);
      return false;
    }
  };

  // Update the existing toggleLike function
  const toggleFavorite = async (apiId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when clicking like button
    }
    
    // Check if user is logged in
    const stored = localStorage.getItem('gatherUser') || localStorage.getItem('user');
    if (!stored) {
      alert('Please log in to like recipes');
      return;
    }

    const userData = JSON.parse(stored);
    if (!userData.id) {
      alert('Please log in to like recipes');
      return;
    }

    // Handle favorite functionality
    const isCurrentlyFavorited = favoritedRecipes.has(apiId);
    try {
      if (isCurrentlyFavorited) {
        // Remove from favorites
        const success = await removeFavoriteAPIRecipe(apiId);
        if (success) {
          setFavoritedRecipes(prev => {
            const newLikes = new Set(prev);
            newLikes.delete(apiId);
            localStorage.setItem('favoritedRecipes', JSON.stringify([...newLikes]));
            return newLikes;
          });
        }
      } else {
        // Add to favorites
        const success = await saveFavoriteAPIRecipe(apiId);
        if (success) {
          setFavoritedRecipes(prev => {
            const newLikes = new Set(prev);
            newLikes.add(apiId);
            localStorage.setItem('favoritedRecipes', JSON.stringify([...newLikes]));
            return newLikes;
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // AnN edit: Removed Nick's temporary localStorage comment handlers on 11/12
  // Comment functionality now handled by CommentSection component with database persistence

  // COMPONENT RENDERING - What gets displayed to the user
  return (
    <section className="px-6 py-8">

      {/* PAGE HEADER - Title and description */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">Explore Recipes</h1>
        <p className="text-amber-700">Discover delicious recipes from around the world</p>
      </div>

      {/* AnN add: Search bar for filtering recipes on 11/12 */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search recipes by name..."
          onSearch={handleSearch}
        />
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
        ) : isSearching ? (
          /* AnN add: Searching state on 11/12 */
          <div className="col-span-full">
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4 animate-pulse">🔍</div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">Searching...</h3>
              <p className="text-amber-700">Finding recipes for you</p>
            </div>
          </div>
        ) : displayedRecipes.length > 0 ? (
          displayedRecipes.map((recipe, index) => (
            <div
              key={`${recipe.idMeal}-${index}`}
              className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
              onClick={() => openRecipePopUp(recipe)}
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                aria-label="Favorite recipe"
                onClick={(e) => toggleFavorite(recipe.idMeal, e)}
              >
                <span className={`text-2xl transition-colors ${
                  favoritedRecipes.has(recipe.idMeal) 
                    ? 'text-red-500' 
                    : 'text-amber-600 hover:text-red-500'
                }`}>
                  {favoritedRecipes.has(recipe.idMeal) ? '♥' : '♡'}
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

                {/* AnN edit: Removed cuisine and tags to match user recipes on 10/30 */}
                <div className="mb-4">
                  {/* Category only */}
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-lg">🍴</span>
                    <span className="text-sm">{recipe.strCategory}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* AnN add: No results message on 11/12 */
          <div className="col-span-full">
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">No recipes found</h3>
              <p className="text-amber-700">Try searching for a different recipe name</p>
            </div>
          </div>
        )}
      </div>

      {/* AnN edit: Moved Nick's popup code to APIRecipePopup component for easier management on 11/12 */}
      {/* Nick's original popup (lines 447-603) extracted to /components/APIRecipePopup.tsx */}
      {/* Benefits: Reusable across explore and profile pages, maintains single source of truth for API recipe display */}
      {isPopUpOpen && selectedRecipe && (
        <APIRecipePopup
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recipe={selectedRecipe as any} // AnN: Type cast needed for TheMealDB API compatibility
          onClose={closePopUp}
          showFavoriteButton={true}
          isFavorited={favoritedRecipes.has(selectedRecipe.idMeal)}
          onFavoriteToggle={toggleFavorite}
        />
      )}
    </section>
  );
}
