// AnN add: API Recipe Card component on 10/31
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/solid';

export interface APIRecipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube: string;
  strTags: string | null;
  ingredients: { name: string; measure: string }[];
}

type APIRecipeCardProps = {
  recipe: APIRecipe;
  onClick: (recipe: APIRecipe) => void;
  onDelete: (apiId: string) => void;
};

export default function APIRecipeCard({ recipe, onClick, onDelete }: APIRecipeCardProps) {
  return (
    <article
      className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
      onClick={() => onClick(recipe)}
    >
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
        aria-label="Unfavorite recipe"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(recipe.idMeal);
        }}
      >
        <HeartIcon className="w-6 h-6 text-red-500 hover:text-red-600 transition-colors" />
      </button>

      <div className="flex gap-6 p-6">
        <div className="relative h-48 w-48 flex-shrink-0 rounded-lg overflow-hidden">
          {recipe.strMealThumb ? (
            <Image
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
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
            <h3 className="text-2xl font-bold text-amber-900 mb-2">{recipe.strMeal}</h3>
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <span className="text-lg">🍴</span>
              <span className="text-sm">{recipe.strCategory}</span>
            </div>
            {recipe.strArea && (
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <span className="text-lg">🌍</span>
                <span className="text-sm">{recipe.strArea}</span>
              </div>
            )}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-amber-900">Ingredients:</p>
                <ul className="text-sm text-amber-800 list-disc list-inside">
                  {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                    <li key={idx}>
                      {ing.name} {ing.measure && `— ${ing.measure}`}
                    </li>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <li className="text-amber-600">...and {recipe.ingredients.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
