// AnN add: Favorites tab component on 11/13
// Purpose: Display user's favorited API recipes with unfavorite and view functionality
// Used in: profile/page.tsx (own profile) and user/[id]/page.tsx (other user profile)

"use client";

import { useState } from "react";
import APIRecipeCard, { APIRecipe } from "@/components/APIRecipeCard";
import APIRecipePopup from "@/components/APIRecipePopup";
import PopupModal from "@/components/PopupModal";

interface FavoritesTabProps {
  favorites: APIRecipe[];
  loading: boolean;
  isOwnProfile: boolean;
  displayName: string;
  onUnfavorite: (recipeId: string) => Promise<void>;
}

export default function FavoritesTab({
  favorites,
  loading,
  isOwnProfile,
  displayName,
  onUnfavorite,
}: FavoritesTabProps) {
  // AnN add: API recipe popup state on 11/13
  const [showAPIRecipePopup, setShowAPIRecipePopup] = useState(false);
  const [selectedAPIRecipe, setSelectedAPIRecipe] = useState<APIRecipe | null>(null);

  // AnN add: Unfavorite confirmation modal state on 11/13
  const [showUnfavoriteConfirm, setShowUnfavoriteConfirm] = useState(false);
  const [recipeToUnfavorite, setRecipeToUnfavorite] = useState<string | null>(null);

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

  // AnN add: Show unfavorite confirmation modal on 11/13
  const handleUnfavoriteClick = (recipeId: string) => {
    setRecipeToUnfavorite(recipeId);
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
      await onUnfavorite(recipeToUnfavorite);
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
          favorites.map((recipe) => (
            <APIRecipeCard
              key={recipe.idMeal}
              recipe={recipe}
              onClick={handleOpenAPIRecipePopup}
              onDelete={isOwnProfile ? handleUnfavoriteClick : undefined}
            />
          ))
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
          showFavoriteButton={false}
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
