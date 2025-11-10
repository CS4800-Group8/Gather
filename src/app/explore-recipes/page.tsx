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

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle youtube.com/watch?v=VIDEO_ID format
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/VIDEO_ID format
  const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  
  return null;
};

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
  
  // Comments state
  const [comments, setComments] = useState<{[key: string]: Array<{id: number, username: string, text: string, timestamp: string}>}>({});
  const [newComment, setNewComment] = useState('');

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

  // Handle posting a new comment
  const handlePostComment = (recipeId: string) => {
    if (!newComment.trim()) return;
    
    // Check if user is logged in
    const stored = localStorage.getItem('gatherUser') || localStorage.getItem('user');
    if (!stored) {
      alert('Please log in to comment');
      return;
    }

    const userData = JSON.parse(stored);
    const username = userData.username || 'Anonymous';

    // Create new comment object
    const comment = {
      id: Date.now(),
      username: username,
      text: newComment,
      timestamp: new Date().toLocaleString()
    };

    // Add comment to state
    setComments(prev => ({
      ...prev,
      [recipeId]: [...(prev[recipeId] || []), comment]
    }));

    // Clear input
    setNewComment('');
  };

  // Handle deleting a comment (only if its your comment)
  const handleDeleteComment = (recipeId: string, commentId: number) => {
    setComments(prev => ({
      ...prev,
      [recipeId]: prev[recipeId].filter(c => c.id !== commentId)
    }));
  };

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
                
                {/* Favorite Button on Image */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                  onClick={() => toggleFavorite(selectedRecipe.idMeal)}
                  aria-label="Favorite recipe"
                >
                  <span className={`text-3xl transition-colors ${
                    favoritedRecipes.has(selectedRecipe.idMeal) 
                      ? 'text-red-500' 
                      : 'text-amber-600 hover:text-red-500'
                  }`}>
                    {favoritedRecipes.has(selectedRecipe.idMeal) ? '♥' : '♡'}
                  </span>
                </button>
              </div>

              {/* AnN edit: Removed cuisine and tags, kept category and nutrition on 10/30 */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Category only */}
                <div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-xl">🍴</span>
                    <span className="font-semibold">Category:</span>
                    <span>{selectedRecipe.strCategory}</span>
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

              {/* YouTube Video Player */}
              {selectedRecipe.strYoutube && (() => {
                const videoId = getYouTubeVideoId(selectedRecipe.strYoutube);
                return videoId ? (
                  <div className="mb-6">
                    <h3 className="font-bold text-amber-900 mb-3 text-xl flex items-center gap-2">
                      <span>▶️</span>
                      Video Tutorial
                    </h3>
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Comments/Discussion Section */}
              <div className="border-t border-amber-200 pt-6">
                <h3 className="font-bold text-amber-900 mb-4 text-xl flex items-center gap-2">
                  <span>💬</span>
                  Discussion ({(comments[selectedRecipe.idMeal] || []).length})
                </h3>

                {/* Comment Input */}
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this recipe..."
                    className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-amber-100 resize-none text-amber-900 placeholder-amber-500"
                    rows={3}
                  />
                  <div className="flex justify-end items-center mt-2">
                    <button
                      onClick={() => handlePostComment(selectedRecipe.idMeal)}
                      disabled={!newComment.trim()}
                      className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {(comments[selectedRecipe.idMeal] || []).length === 0 ? (
                    <div className="text-center py-8 text-amber-600">
                      <p className="text-lg">No comments yet</p>
                      <p className="text-sm mt-2">Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    (comments[selectedRecipe.idMeal] || []).map((comment) => {
                      // Check if current user is the comment author
                      const stored = localStorage.getItem('gatherUser') || localStorage.getItem('user');
                      const currentUsername = stored ? JSON.parse(stored).username : null;
                      const isOwnComment = currentUsername === comment.username;

                      return (
                        <div 
                          key={comment.id}
                          className="bg-amber-50 rounded-lg p-4 hover:bg-amber-100 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                                {comment.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-amber-900">{comment.username}</p>
                                <p className="text-xs text-amber-600">{comment.timestamp}</p>
                              </div>
                            </div>
                            {isOwnComment && (
                              <button
                                onClick={() => handleDeleteComment(selectedRecipe.idMeal, comment.id)}
                                className="text-red-500 hover:text-red-700 transition-colors px-2"
                                aria-label="Delete comment"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          <p className="text-amber-800 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
