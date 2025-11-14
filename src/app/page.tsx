"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import UserRecipePopup from '@/components/UserRecipePopup';
import SearchBar from '@/components/SearchBar';
import { UserRecipe } from '@/components/UserRecipeCard';

interface User {
  id: number;
  firstname: string | null;
  lastname: string | null;
  username: string;
}

interface HomePageRecipe extends UserRecipe {
  user: User;
}

export default function HomePage() {
  const [recipes, setRecipes] = useState<HomePageRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<HomePageRecipe | null>(null);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<HomePageRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const router = useRouter();

  // Fetch all user recipes
  const fetchUserRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recipes/all');
      
      if (!response.ok) throw new Error('Failed to load recipes');
      
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoritedUserRecipes');
    if (storedFavorites) {
      setFavoritedRecipes(new Set(JSON.parse(storedFavorites)));
    }
    fetchUserRecipes();
  }, []);

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.recipes || []);
    } catch (err) {
      console.error('Error searching recipes:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedRecipes = searchQuery.trim() ? searchResults : recipes;

  // Open recipe popup
  const openRecipePopUp = (recipe: HomePageRecipe) => {
    setSelectedRecipe(recipe);
    setIsPopUpOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close popup
  const closePopUp = () => {
    setIsPopUpOpen(false);
    setSelectedRecipe(null);
    document.body.style.overflow = 'unset';
  };

  // Navigate to user profile
  const navigateToUserProfile = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/other-profile?userId=${userId}`);
  };

  // Toggle favorite
  const toggleFavorite = async (recipeId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
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

    const isCurrentlyFavorited = favoritedRecipes.has(recipeId);
    
    try {
      if (isCurrentlyFavorited) {
        // Remove from favorites
        const success = await removeFavoriteRecipe(recipeId, userData.id);
        if (success) {
          setFavoritedRecipes(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(recipeId);
            localStorage.setItem('favoritedUserRecipes', JSON.stringify([...newFavorites]));
            return newFavorites;
          });
        }
      } else {
        // Add to favorites
        const success = await saveFavoriteRecipe(recipeId, userData.id);
        if (success) {
          setFavoritedRecipes(prev => {
            const newFavorites = new Set(prev);
            newFavorites.add(recipeId);
            localStorage.setItem('favoritedUserRecipes', JSON.stringify([...newFavorites]));
            return newFavorites;
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Save favorite recipe to database
  const saveFavoriteRecipe = async (recipeId: number, userId: number) => {
    try {
      const response = await fetch('/api/favorite-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          recipeId: recipeId
        }),
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

  // Remove favorite recipe from database
  const removeFavoriteRecipe = async (recipeId: number, userId: number) => {
    try {
      const response = await fetch('/api/favorite-recipes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          recipeId: recipeId
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

  return (
    <section className="px-6 py-8">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">Community Recipes</h1>
        <p className="text-amber-700">Discover delicious recipes from our community</p>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search community recipes..."
          onSearch={handleSearch}
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* RECIPE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          // Loading skeleton cards
          Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="glass-card overflow-hidden">
              {/* Skeleton Image */}
              <div className="relative w-full h-64 bg-gradient-to-br from-amber-100 to-amber-200 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-amber-400 text-4xl">🍽️</div>
                </div>
              </div>
              
              {/* Skeleton Content */}
              <div className="p-6">
                <div className="h-7 bg-amber-200 rounded-md mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-5 bg-amber-100 rounded-md w-3/4 animate-pulse"></div>
                  <div className="h-5 bg-amber-100 rounded-md w-1/2 animate-pulse"></div>
                </div>
                <div className="flex gap-2 mt-5">
                  <div className="h-7 w-20 bg-amber-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : isSearching ? (
          // Searching state
          <div className="col-span-full">
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4 animate-pulse">🔍</div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">Searching...</h3>
              <p className="text-amber-700">Finding recipes for you</p>
            </div>
          </div>
        ) : displayedRecipes.length > 0 ? (
          // Recipe cards
          displayedRecipes.map((recipe) => (
            <div
              key={recipe.recipeId}
              className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
              onClick={() => openRecipePopUp(recipe)}
            >
              {/* Favorite Button */}
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                aria-label="Favorite recipe"
                onClick={(e) => toggleFavorite(recipe.recipeId, e)}
              >
                <span className={`text-2xl transition-colors ${
                  favoritedRecipes.has(recipe.recipeId) 
                    ? 'text-red-500' 
                    : 'text-amber-600 hover:text-red-500'
                }`}>
                  {favoritedRecipes.has(recipe.recipeId) ? '♥' : '♡'}
                </span>
              </button>

              {/* Recipe Image */}
              <div className="relative w-full h-64 overflow-hidden">
                {recipe.photoUrl ? (
                  <Image
                    src={recipe.photoUrl}
                    alt={recipe.recipeName}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}
              </div>

              {/* Recipe Content */}
              <div className="p-6">
                {/* Recipe Name */}
                <h3 className="text-xl font-bold text-amber-900 mb-3 line-clamp-2">
                  {recipe.recipeName}
                </h3>

                {/* Category */}
                {recipe.categories && recipe.categories.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <span className="text-lg">🍴</span>
                      <span className="text-sm">{recipe.categories[0].name}</span>
                      {recipe.categories.length > 1 && (
                        <span className="text-xs text-amber-600">
                          +{recipe.categories.length - 1} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Owner and Date */}
                <div className="flex justify-between items-center text-sm text-amber-600 mt-4 pt-4 border-t border-amber-200">
                  <button
                    onClick={(e) => navigateToUserProfile(recipe.user.id, e)}
                    className="hover:text-amber-800 hover:underline transition-colors"
                  >
                    By {recipe.user.firstname || recipe.user.lastname || recipe.user.username}
                  </button>
                  <span>
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No results
          <div className="col-span-full">
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">No recipes found</h3>
              <p className="text-amber-700">Try searching for a different recipe</p>
            </div>
          </div>
        )}
      </div>

      {/* RECIPE POPUP */}
      {isPopUpOpen && selectedRecipe && (
        <UserRecipePopup
          recipe={selectedRecipe}
          onClose={closePopUp}
        />
      )}
    </section>
  );
}