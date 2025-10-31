// AnN add: Card component for user's created recipes on 10/23
// AnN edit: Extracted to separate file on 10/31
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';

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
}

type UserRecipeCardProps = {
  recipe: UserRecipe;
  onDelete: (recipeId: number) => void;
  onClick: (recipe: UserRecipe) => void;
};

export default function UserRecipeCard({ recipe, onDelete, onClick }: UserRecipeCardProps) {
  return (
    <article
      className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
      onClick={() => onClick(recipe)}
    >
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
        aria-label="Delete recipe"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(recipe.recipeId);
        }}
      >
        <TrashIcon className="w-5 h-5 text-amber-600 hover:text-red-500 transition-colors" />
      </button>

      <div className="flex gap-6 p-6">
        <div className="relative h-48 w-48 flex-shrink-0 rounded-lg overflow-hidden">
          {recipe.photoUrl ? (
            <Image
              src={recipe.photoUrl}
              alt={recipe.recipeName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="192px"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">{recipe.recipeName}</h3>
            {recipe.description && (
              <p className="text-sm text-amber-700 line-clamp-3">{recipe.description}</p>
            )}
            {/* Viet add: ingredients and categories display */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-amber-900">Ingredients:</p>
                <ul className="text-sm text-amber-800 list-disc list-inside">
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
                    className='bg-amber-100 border border-amber-300 px-3 py-2 rounded-xl text-xs mr-2'>
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
