"use client";

import Image from "next/image";
import React from "react";
import { UserRecipe } from "@/components/profile/UserRecipeCard";
import CommentSection from "@/components/CommentSection"; // AnN add: Database-backed comment component on 11/12
import RatingSection from "@/components/RatingSection"; // Thu added // 11/13


interface UserRecipePopupProps {
  recipe: UserRecipe;
  onClose: () => void;
}

// Helper for YouTube videos
function getYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/i
  );
  return match ? match[1] : null;
}

export default function UserRecipePopup({ recipe, onClose }: UserRecipePopupProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* AnN edit: Changed max-w-4xl to max-w-6xl for wider layout matching APIRecipePopup on 11/12 */}
      <div
        className="popUp-scrollbar bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-amber-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-amber-900">
            {recipe.recipeName}
          </h2>
          <button
            onClick={onClose}
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

        {/* AnN edit: Two-column layout - recipe details left, comments right on 11/12 */}
        <div className="overflow-y-auto flex-1 popUp-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,350px] lg:grid-cols-[1fr,400px] gap-4 md:gap-6 p-4 md:p-6">
            {/* Left column: Recipe details */}
            <div>
              {recipe.photoUrl && (
                <div className="relative w-full h-48 sm:h-64 md:h-96 rounded-xl overflow-hidden mb-6">
                  <Image
                    src={recipe.photoUrl}
                    alt={recipe.recipeName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 896px"
                  />
                </div>
              )}

              {recipe.description && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-2 text-xl">Description</h3>
                  <p className="text-amber-800">{recipe.description}</p>
                </div>
              )}

              {recipe.categories && recipe.categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-2 text-xl">Category</h3>
                  <div className="flex gap-2 flex-wrap">
                    {recipe.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-3 text-xl">Ingredients</h3>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {recipe.ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-center gap-2 text-amber-800">
                        <span className="text-amber-600">•</span>
                        {ing.quantity} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.instructions && (
                <div className="mb-6">
                  <h3 className="font-bold text-amber-900 mb-3 text-xl">Instructions</h3>
                  <div className="prose max-w-none text-amber-800 whitespace-pre-line">
                    {recipe.instructions}
                  </div>
                </div>
              )}

              {recipe.videoUrl &&
                (() => {
                  const videoId = getYouTubeVideoId(recipe.videoUrl);
                  return videoId ? (
                    <div className="mb-6">
                      <h3 className="font-bold text-amber-900 mb-3 text-xl flex items-center gap-2">
                        <span>▶️</span>Video Tutorial
                      </h3>
                      <div
                        className="relative w-full"
                        style={{ paddingBottom: "56.25%" }}
                      >
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-xl"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : null;
                })()}

              <p className="text-sm text-amber-600 mt-6">
                Created: {new Date(recipe.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Right column: Comments section */}
            <div className="lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(90vh-120px)] lg:overflow-y-auto popUp-scrollbar">
              {/* Thu added: Rating section for API recipes on 11/13 */}
              <RatingSection
                recipeId={recipe.recipeId.toString()}
                recipeType="user"
                onClose={onClose}
              />

              <CommentSection
                recipeId={recipe.recipeId.toString()}
                recipeType="user"
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
