'use client';

export default function MyRecipesPage() {
  // Skeleton placeholder cards - 1 row of 3 cards
  const skeletonCards = Array.from({ length: 3 }, (_, i) => i);

  return (
    <section className="px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">My Recipes</h1>
        <p className="text-amber-700">Your personal collection of recipes</p>
      </div>

      {/* Recipe Cards Grid - 1 row with 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skeletonCards.map((index) => (
          <div
            key={index}
            className="glass-card overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
          >
            {/* Image Placeholder with animation */}
            <div className="relative w-full h-64 bg-gradient-to-br from-amber-100 to-amber-200 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-amber-400 text-4xl">🍽️</div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              {/* Recipe Name Placeholder */}
              <div className="h-7 bg-amber-200 rounded-md mb-4 animate-pulse"></div>

              {/* Recipe Facts Placeholders */}
              <div className="space-y-3">
                <div className="h-5 bg-amber-100 rounded-md w-3/4 animate-pulse"></div>
                <div className="h-5 bg-amber-100 rounded-md w-1/2 animate-pulse"></div>
              </div>

              {/* Tags/Stats Placeholders */}
              <div className="flex gap-2 mt-5">
                <div className="h-7 w-20 bg-amber-200 rounded-full animate-pulse"></div>
                <div className="h-7 w-24 bg-amber-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
