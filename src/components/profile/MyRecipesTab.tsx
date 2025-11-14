// AnN add: My Recipes tab component on 11/13
// Purpose: Display user's created recipes with delete and view functionality
// Used in: profile/page.tsx (own profile) and user/[id]/page.tsx (other user profile)

"use client";

import { useState } from "react";
import UserRecipeCard, { UserRecipe } from "@/components/profile/UserRecipeCard";
import UserRecipePopup from "@/components/profile/UserRecipePopup";
import PopupModal from "@/components/PopupModal";

interface MyRecipesTabProps {
  recipes: UserRecipe[];
  isOwnProfile: boolean;
  displayName: string;
  onRecipeDelete: (recipeId: number) => Promise<void>;
  // Viet add: allow showing favorite state and toggling it
  myFavoriteIds?: Set<string>;
  onFavoriteToggle?: (id: string | number, source: 'api' | 'user') => Promise<void>;
}

export default function MyRecipesTab({
  recipes,
  isOwnProfile,
  displayName,
  onRecipeDelete,
  // Viet add: new favorite props
  myFavoriteIds = new Set(),
  onFavoriteToggle,
}: MyRecipesTabProps) {
  // AnN add: User recipe popup state on 11/13
  const [showUserRecipePopup, setShowUserRecipePopup] = useState(false);
  const [selectedUserRecipe, setSelectedUserRecipe] = useState<UserRecipe | null>(null);

  // AnN add: Delete confirmation modal state on 11/13
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);

  // AnN add: Open user recipe detail popup on 11/13
  const handleOpenUserRecipePopup = (recipe: UserRecipe) => {
    setSelectedUserRecipe(recipe);
    setShowUserRecipePopup(true);
    document.body.style.overflow = 'hidden';
  };

  // AnN add: Close user recipe detail popup on 11/13
  const handleCloseUserRecipePopup = () => {
    setShowUserRecipePopup(false);
    setSelectedUserRecipe(null);
    document.body.style.overflow = 'unset';
  };

  // AnN add: Show delete confirmation modal on 11/13
  const handleDeleteClick = (recipeId: number) => {
    setRecipeToDelete(recipeId);
    setShowDeleteConfirm(true);
  };

  // AnN add: Cancel delete operation on 11/13
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setRecipeToDelete(null);
  };

  // AnN add: Confirm and execute delete operation on 11/13
  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      await onRecipeDelete(recipeToDelete);
    } finally {
      setShowDeleteConfirm(false);
      setRecipeToDelete(null);
    }
  };

  return (
    <>
      {/* Recipe Grid or Empty State */}
      <div className="flex flex-col gap-6">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <UserRecipeCard
              key={recipe.recipeId}
              recipe={recipe}
              isOwner={isOwnProfile}
              onDelete={isOwnProfile ? handleDeleteClick : undefined}
              onClick={handleOpenUserRecipePopup}
              // Viet add: pass favorite state and toggle handler for other users' recipes
              isFavorited={myFavoriteIds.has(recipe.recipeId.toString())}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))
        ) : (
          <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
            {isOwnProfile
              ? "No recipes here yet—start cooking up something delicious!"
              : `${displayName} hasn't created any recipes yet.`}
          </article>
        )}
      </div>

      {/* User Recipe Detail Popup */}
      {showUserRecipePopup && selectedUserRecipe && (
        <UserRecipePopup
          recipe={selectedUserRecipe}
          onClose={handleCloseUserRecipePopup}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isOwnProfile && (
        <PopupModal isOpen={showDeleteConfirm} onClose={handleDeleteCancel}>
          <div className='flex flex-col items-center text-amber-800 gap-5 p-6'>
            {/* Title */}
            <h3 className='text-xl font-semibold text-amber-900'>Delete Recipe?</h3>

            {/* Message */}
            <p className='text-center text-amber-700 text-sm'>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className='flex gap-3 w-full mt-2'>
              <button
                onClick={handleDeleteCancel}
                className='flex-1 px-4 py-2 rounded-lg border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className='flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </PopupModal>
      )}
    </>
  );
}
