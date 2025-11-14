// AnN add: Favorites tab component on 11/13
// Purpose: Display user's favorited API recipes with unfavorite and view functionality
// Used in: profile/page.tsx (own profile) and user/[id]/page.tsx (other user profile)

"use client";

import { useState } from "react";
import APIRecipeCard, { APIRecipe } from "@/components/APIRecipeCard";
import UserRecipeCard, { UserRecipe } from "@/components/profile/UserRecipeCard";
import APIRecipePopup from "@/components/APIRecipePopup";
import UserRecipePopup from "@/components/profile/UserRecipePopup"; // Viet add: popup for user-created favorite recipes
import PopupModal from "@/components/PopupModal";

interface FavoritesTabProps {
  favorites: (APIRecipe | UserRecipe)[];
  loading: boolean;
  isOwnProfile: boolean;
  displayName: string;
  onUnfavorite: (recipeId: string | number, source?: 'api' | 'user') => Promise<void>;
  // AnN add: Optional handlers for viewing other profiles on 11/13
  myFavoriteIds?: Set<string>; // Current user's favorites (for heart state)
  onFavoriteToggle?: (recipeId: string | number, source: 'api' | 'user') => Promise<void>; // Toggle favorite
}

export default function FavoritesTab({
  favorites,
  loading,
  isOwnProfile,
  displayName,
  onUnfavorite,
  myFavoriteIds = new Set(),
  onFavoriteToggle,
}: FavoritesTabProps) {
  // AnN add: API recipe popup state on 11/13
  const [showAPIRecipePopup, setShowAPIRecipePopup] = useState(false);
  const [selectedAPIRecipe, setSelectedAPIRecipe] = useState<APIRecipe | null>(null);

  // Viet add: popup state for user-created favorites
  const [selectedUserRecipe, setSelectedUserRecipe] = useState<UserRecipe | null>(null);

  // AnN add: Unfavorite confirmation modal state on 11/13
  const [showUnfavoriteConfirm, setShowUnfavoriteConfirm] = useState(false);
  const [recipeToUnfavorite, setRecipeToUnfavorite] = useState<{ id: string | number; source?: 'api' | 'user' } | null>(null); // Viet fix: store both recipe ID and source type

  // AnN add: Open API recipe detail popup on 11/13
  const handleOpenAPIRecipePopup = (recipe: APIRecipe) => {
    setSelectedAPIRecipe(recipe);
    setShowAPIRecipePopup(true);
    document.body.style.overflow = 'hidden';
  };

  // AnN add: Close API recipe detail popup on 11/13
  const handleCloseAPIRecipePopup = () => {
    setShowAPIRecipePopup(false);
    setSelectedAPIRecipe(null);
    document.body.style.overflow = 'unset';
  };

  // Viet add: open handlers for user-created recipe popup
  const handleOpenUserRecipePopup = (recipe: UserRecipe) => {
    setSelectedUserRecipe(recipe);
    document.body.style.overflow = "hidden"; 
  };

  // Viet add: close handlers for user-created recipe popup
  const handleCloseUserRecipePopup = () => {
    setSelectedUserRecipe(null);
    document.body.style.overflow = "unset";
  };

  // AnN add: Show unfavorite confirmation modal on 11/13
  const handleUnfavoriteClick = (recipeId: string | number, source?: 'api' | 'user') => {
    setRecipeToUnfavorite({ id: recipeId, source }); // store both
    setShowUnfavoriteConfirm(true);
  };

  // AnN add: Cancel unfavorite operation on 11/13
  const handleUnfavoriteCancel = () => {
    setShowUnfavoriteConfirm(false);
    setRecipeToUnfavorite(null);
  };

  // AnN add: Confirm and execute unfavorite operation on 11/13
  const handleUnfavoriteConfirm = async () => {
    if (!recipeToUnfavorite) return;

    try {
      await onUnfavorite(recipeToUnfavorite.id, recipeToUnfavorite.source); // uses both fields
    } finally {
      setShowUnfavoriteConfirm(false);
      setRecipeToUnfavorite(null);
    }
  };

  return (
    <>
      {/* Recipe Grid or Loading/Empty State */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
            Loading your favorite recipes...
          </article>
        ) : favorites.length > 0 ? (
          favorites.map((recipe) => {
            // Viet fix: detect whether this is an API recipe or a user-created recipe
            const isAPIRecipe = "idMeal" in recipe;
            
            return isAPIRecipe ? (
              <APIRecipeCard
                key={recipe.idMeal}
                recipe={recipe}
                onClick={handleOpenAPIRecipePopup}
                onDelete={isOwnProfile ? () => handleUnfavoriteClick(recipe.idMeal, recipe.source) : undefined}
                // Viet add: show heart toggle if viewing other user's favorites
                isFavorited={myFavoriteIds.has(recipe.idMeal)}
                onFavoriteToggle={
                  !isOwnProfile
                    ? (id) => onFavoriteToggle?.(id, recipe.source || 'api')
                    : undefined
                }
              />
            ) : (
              <UserRecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                isOwner={false}
                isFavorited={myFavoriteIds.has(recipe.recipeId.toString())}
                onDelete={isOwnProfile 
                  ? () => handleUnfavoriteClick(recipe.recipeId, recipe.source || 'user')
                  : undefined
                }
                // Viet add: always pass favorite handler for other profiles
                onFavoriteToggle={(id) =>
                  onFavoriteToggle?.(id, recipe.source || 'user')
                }
                onClick={() => handleOpenUserRecipePopup(recipe)} // Viet add: open popup
              />
            );
          })
        ) : (
          <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
            {isOwnProfile
              ? "No favorite recipes yet. Like recipes from the Explore page to see them here!"
              : `${displayName} hasn't favorited any recipes yet.`}
          </article>
        )}
      </div>

      {/* API Recipe Detail Popup */}
      {showAPIRecipePopup && selectedAPIRecipe && (
        <APIRecipePopup
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recipe={selectedAPIRecipe as any}  // AnN: Type cast needed for TheMealDB API compatibility
          onClose={handleCloseAPIRecipePopup}
        />
      )}

      {/* Viet add: User-created Recipe Popup */}
      {selectedUserRecipe && (
        <UserRecipePopup
          recipe={selectedUserRecipe}
          onClose={handleCloseUserRecipePopup}
        />
      )}

      {/* Unfavorite Confirmation Modal */}
      {isOwnProfile && (
        <PopupModal isOpen={showUnfavoriteConfirm} onClose={handleUnfavoriteCancel}>
          <div className='flex flex-col items-center text-amber-800 gap-5 p-6'>
            {/* Title */}
            <h3 className='text-xl font-semibold text-amber-900'>Remove from Favorites?</h3>

            {/* Message */}
            <p className='text-center text-amber-700 text-sm'>
              Are you sure you want to remove this recipe from your favorites?
            </p>

            {/* Buttons */}
            <div className='flex gap-3 w-full mt-2'>
              <button
                onClick={handleUnfavoriteCancel}
                className='flex-1 px-4 py-2 rounded-lg border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleUnfavoriteConfirm}
                className='flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors'
              >
                Remove
              </button>
            </div>
          </div>
        </PopupModal>
      )}
    </>
  );
}
