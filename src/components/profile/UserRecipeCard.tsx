// AnN add: Card component for user's created recipes on 10/23
// AnN edit: Extracted to separate file on 10/31
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

// Viet add: Interface for ingredients and categories
interface Ingredient {
  id: number;
  name: string;
  quantity: string;
}

interface Category {
  id: number;
  name: string;
}

// AnN add: Interface for user's created recipes from database on 10/23
export interface UserRecipe {
  recipeId: number;
  recipeName: string;
  description: string | null;
  photoUrl: string | null;
  instructions?: string | null; // AnN add: Cooking instructions on 10/30
  videoUrl?: string | null; // AnN add: YouTube video link on 10/30
  createdAt: string;
  // Viet add: ingredients and categories to interface
  ingredients?: Ingredient[];
  categories?: Category[];
  source?: 'user';
}

type UserRecipeCardProps = {
  recipe: UserRecipe;
  isOwner: boolean; // Viet add: determine who is the owner of the recipe
  onDelete?: (recipeId: number) => void;
  onClick?: (recipe: UserRecipe) => void;
  // Viet add: include favorite logic
  isFavorited?: boolean;
  onFavoriteToggle?: (recipeId: string | number, source: 'api' | 'user') => void;
};

export default function UserRecipeCard({ 
  recipe, 
  isOwner, 
  onDelete, 
  onClick,
  // Viet add: isFavorited and onFavoriteToggle
  isFavorited = false,
  onFavoriteToggle,
}: UserRecipeCardProps) {
  return (
    <article
      className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
      onClick={() => onClick?.(recipe)}
    >
      {/* Viet add: can't delete recipe if not owner */}
      {isOwner && (
        <button
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label="Delete recipe"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(recipe.recipeId);
          }}
        >
          <TrashIcon className="w-5 h-5 text-amber-600 hover:text-red-500 transition-colors" />
        </button>
      )}

      {/* Viet add: If not owner, show favorite/unfavorite button */}
      {/* AnN fix: Simplified logic - onDelete for unfavoriting own favorites, onFavoriteToggle for toggling others' recipes */}
      {!isOwner && (onDelete || onFavoriteToggle) && (
        <button
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
          aria-label={onDelete ? "Unfavorite recipe" : "Toggle favorite"}
          onClick={(e) => {
            e.stopPropagation();
            // If onDelete provided (own favorites tab), use it to unfavorite
            if (onDelete) {
              onDelete(recipe.recipeId);
            }
            // Otherwise use onFavoriteToggle to add/remove from favorites
            else {
              onFavoriteToggle?.(recipe.recipeId, 'user');
            }
          }}
        >
          {isFavorited || onDelete ? (
            <HeartIcon className="w-6 h-6 text-red-500 hover:text-red-600 transition-colors" />
          ) : (
            <span className="text-xl text-amber-600 hover:text-red-500 transition-colors">♡</span>
          )}
        </button>
      )}

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-3 sm:p-6">
        <div className="relative w-full sm:h-48 sm:w-48 sm:flex-shrink-0 h-40 rounded-lg overflow-hidden">
          {recipe.photoUrl ? (
            <Image
              src={recipe.photoUrl}
              alt={recipe.recipeName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-amber-900 mb-2">{recipe.recipeName}</h3>
            {recipe.description && (
              <p className="text-sm text-amber-700 line-clamp-3">{recipe.description}</p>
            )}
            {/* Viet add: ingredients and categories display */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-amber-900">Ingredients:</p>
                <ul className="text-xs sm:text-sm text-amber-800 list-disc list-inside">
                  {recipe.ingredients.map((ri) => (
                    <li key={ri.id}>
                      {ri.name} — {ri.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recipe.categories && recipe.categories.length > 0 && (
              <div className='flex flex-col gap-1'>
                <p className="text-sm font-semibold text-amber-900">Categories:</p>
                <div>
                  {recipe.categories.map((rc) => (
                    <span
                      key={rc.id}
                      className='bg-amber-100 border border-amber-300 px-2 py-1 sm:px-3 sm:py-2 rounded-xl text-xs mr-2'>
                      {rc.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-amber-600 mt-3">
              Created: {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
