// AnN add: API Recipe Popup component for reusable recipe detail modal on 11/12
// Extracted from Nick's explore-recipes page to centralize popup logic
// Purpose: Display TheMealDB API recipe details with comments in a modal popup
// Used in: explore-recipes (Nick's work) and profile (favorited recipes tab)

"use client";

import Image from "next/image";
import CommentSection from "@/components/CommentSection";

// AnN add: Interface for API recipe data structure on 11/12
interface APIRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strYoutube?: string;
  ingredients?: Array<{ name: string; measure: string }>;
  // Dynamic ingredient/measure fields from TheMealDB
  [key: string]: string | Array<{ name: string; measure: string }> | undefined;
}

interface APIRecipePopupProps {
  recipe: APIRecipe;
  onClose: () => void;
  showFavoriteButton?: boolean; // Optional: show heart button on image
  isFavorited?: boolean; // Optional: is this recipe favorited
  onFavoriteToggle?: (recipeId: string) => void; // Optional: toggle favorite callback
}

// AnN add: Helper to extract YouTube video ID from URL on 11/12
// Supports: youtube.com/watch?v=ID and youtu.be/ID formats
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// AnN add: Helper to parse ingredients from TheMealDB API format on 11/12
// TheMealDB stores ingredients as strIngredient1-20 and strMeasure1-20
function getIngredients(recipe: APIRecipe): string[] {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && typeof ingredient === 'string' && ingredient.trim()) {
      const measureStr = typeof measure === 'string' ? measure.trim() : '';
      ingredients.push(`${measureStr} ${ingredient.trim()}`.trim());
    }
  }
  return ingredients;
}

export default function APIRecipePopup({
  recipe,
  onClose,
  showFavoriteButton = false,
  isFavorited = false,
  onFavoriteToggle,
}: APIRecipePopupProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="popUp-scrollbar bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title and Close Button */}
        <div className="flex-shrink-0 bg-white border-b border-amber-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-amber-900">{recipe.strMeal}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors text-amber-900"
            aria-label="Close popup"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* AnN add: Two-column layout - recipe details left, comments right on 11/12 */}
        <div className="overflow-y-auto flex-1 popUp-scrollbar">
          <div className="grid lg:grid-cols-[1fr,400px] gap-6 p-6">
            {/* Left column: Recipe details */}
            <div>
              {/* Recipe Image with optional Favorite Button */}
              <div className="relative w-full h-96 rounded-xl overflow-hidden mb-6">
                <Image
                  src={recipe.strMealThumb || '/recipe-presets/default.jpg'}
                  alt={recipe.strMeal}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />

                {/* AnN add: Optional favorite button overlay on 11/12 */}
                {showFavoriteButton && onFavoriteToggle && (
                  <button
                    className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                    onClick={() => onFavoriteToggle(recipe.idMeal)}
                    aria-label="Favorite recipe"
                  >
                    <span className={`text-3xl transition-colors ${
                      isFavorited
                        ? 'text-red-500'
                        : 'text-amber-600 hover:text-red-500'
                    }`}>
                      {isFavorited ? '♥' : '♡'}
                    </span>
                  </button>
                )}
              </div>

              {/* Category and Nutritional Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Category */}
                <div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-xl">🍴</span>
                    <span className="font-semibold">Category:</span>
                    <span>{recipe.strCategory}</span>
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
                  {getIngredients(recipe).map((ingredient, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-amber-800">
                      <span className="text-amber-600">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              {recipe.strInstructions && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-3 text-xl">Instructions</h3>
                  <div className="prose max-w-none text-amber-800 whitespace-pre-line">
                    {recipe.strInstructions}
                  </div>
                </div>
              )}

              {/* YouTube Video Player */}
              {recipe.strYoutube && (() => {
                const videoId = getYouTubeVideoId(recipe.strYoutube);
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
            </div>

            {/* Right column: Comments section */}
            <div className="lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(90vh-120px)] lg:overflow-y-auto popUp-scrollbar">
              {/* AnN add: Database-backed comments for API recipes on 11/12 */}
              <CommentSection
                recipeId={recipe.idMeal}
                recipeType="api"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
