'use client';

import { useEffect, useMemo, useState } from 'react';

type TabKey = 'my' | 'saved' | 'liked';

type RecipeCardData = {
  id: string;
  title: string;
  author: string;
  summary: string;
  tags: string[];
  mood: 'warm' | 'fresh' | 'sweet';
};

// AnN edit: Reworked profile page to showcase recipe cards on 14/10
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('my');
  const [displayName, setDisplayName] = useState('username');
  const [avatarBadge, setAvatarBadge] = useState<'A' | 'B' | 'C'>('A');

  // AnN add: mock recipes to visualize layout for each tab on 14/10
  const recipeCollections: Record<TabKey, RecipeCardData[]> = useMemo(
    () => ({
      my: [
        {
          id: 'my-1',
          title: 'Citrus Sunrise Parfait',
          author: 'Me',
          summary:
            'A bright layered yogurt parfait with tangy citrus curd and toasted granola crunch.',
          tags: ['breakfast', 'quick', 'citrus'],
          mood: 'fresh',
        },
        {
          id: 'my-2',
          title: 'Miso Mushroom Ramen',
          author: 'Me',
          summary:
            'Umami-packed broth with caramelized mushrooms, ramen noodles, and a soft-boiled egg.',
          tags: ['noodles', 'comfort', 'savory'],
          mood: 'warm',
        },
        {
          id: 'my-3',
          title: 'Charred Corn Elote Cups',
          author: 'Me',
          summary:
            'Street-style elote with smoky corn, creamy lime sauce, and crunchy chili pepitas.',
          tags: ['snack', 'corn', 'shareable'],
          mood: 'warm',
        },
        {
          id: 'my-4',
          title: 'Lemongrass Coconut Curry',
          author: 'Me',
          summary:
            'Silky coconut curry bursting with lemongrass, kaffir lime, and roasted veggies.',
          tags: ['dinner', 'thai-inspired', 'veggie'],
          mood: 'fresh',
        },
        {
          id: 'my-5',
          title: 'Honeycomb Crunch Cheesecake',
          author: 'Me',
          summary:
            'No-bake cheesecake with honeycomb shards, vanilla bean filling, and oat crust.',
          tags: ['dessert', 'no-bake', 'sweet'],
          mood: 'sweet',
        },
      ],
      saved: [
        {
          id: 'saved-1',
          title: 'Tamarind Glazed Cauliflower',
          author: 'Chef Tao',
          summary:
            'Roasted cauliflower tossed in tangy tamarind glaze with fresh herbs for brightness.',
          tags: ['vegan', 'roasted', 'bold'],
          mood: 'fresh',
        },
        {
          id: 'saved-2',
          title: 'Cozy Apple Chai Crumble',
          author: 'Bake Club',
          summary:
            'Spiced apple filling spiked with chai and a buttery almond streusel topping.',
          tags: ['dessert', 'autumn', 'spiced'],
          mood: 'warm',
        },
        {
          id: 'saved-3',
          title: 'Herby Feta Stuffed Peppers',
          author: 'Gather Eats',
          summary:
            'Sweet peppers roasted with lemony feta filling and a drizzle of hot honey.',
          tags: ['appetizer', 'feta', 'shareable'],
          mood: 'fresh',
        },
        {
          id: 'saved-4',
          title: 'Matcha Ripple Ice Cream',
          author: 'Scoops Lab',
          summary:
            'Creamy vanilla bean base swirled with earthy matcha ribbons and white chocolate chips.',
          tags: ['frozen', 'matcha', 'sweet'],
          mood: 'sweet',
        },
        {
          id: 'saved-5',
          title: 'Sticky Ginger Soy Salmon',
          author: 'Weeknight Wonders',
          summary:
            'Quick-broiled salmon lacquered in ginger soy glaze with charred scallions.',
          tags: ['seafood', 'quick', 'savory'],
          mood: 'warm',
        },
      ],
      liked: [
        {
          id: 'liked-1',
          title: 'Roasted Beet Citrus Salad',
          author: 'Veggie Muse',
          summary:
            'Ruby beets paired with oranges, whipped feta, pistachios, and a pink peppercorn vinaigrette.',
          tags: ['salad', 'colorful', 'seasonal'],
          mood: 'fresh',
        },
        {
          id: 'liked-2',
          title: 'Brown Butter Mochi Bars',
          author: 'Sweet Bits',
          summary:
            'Chewy mochi bars with nutty brown butter, toasted sesame, and a caramel drizzle.',
          tags: ['mochi', 'bake', 'sweet'],
          mood: 'sweet',
        },
        {
          id: 'liked-3',
          title: 'Smoky Harissa Shakshuka',
          author: 'Spice Trail',
          summary:
            'Tomato-pepper skillet with poached eggs, harissa heat, and cool lemon yogurt.',
          tags: ['brunch', 'egg', 'spiced'],
          mood: 'warm',
        },
        {
          id: 'liked-4',
          title: 'Ube Coconut Crepe Cake',
          author: 'Layered Love',
          summary:
            'Paper-thin crepes layered with ube pastry cream and toasted coconut flakes.',
          tags: ['crepe', 'ube', 'dessert'],
          mood: 'sweet',
        },
      ],
    }),
    []
  );

  // AnN add: Pull lightweight profile info from localStorage if available on 14/10
  useEffect(() => {
    try {
      const stored =
        typeof window !== 'undefined'
          ? localStorage.getItem('user') || localStorage.getItem('gatherUser')
          : null;

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as { username?: string; avatar?: 'A' | 'B' | 'C' };
      if (parsed.username && parsed.username.trim().length > 0) {
        setDisplayName(parsed.username);
      }
      if (parsed.avatar && ['A', 'B', 'C'].includes(parsed.avatar)) {
        setAvatarBadge(parsed.avatar);
      }
    } catch (error) {
      console.warn('Unable to hydrate profile header from storage', error);
    }
  }, []);

  const statsButtons = useMemo(
    () => [
      { id: 'posts', label: '# posts', value: recipeCollections.my.length },
      { id: 'friends', label: '# friends', value: 18 },
      { id: 'likes', label: '# likes', value: recipeCollections.liked.length * 12 },
    ],
    [recipeCollections]
  );

  const currentRecipes = recipeCollections[activeTab];
  const smallCards = currentRecipes.slice(0, 3);
  const longCards = currentRecipes.slice(3);

  return (
    <div className="min-h-screen bg-yellow-50 pb-16 pt-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-yellow-200/60 bg-white px-6 py-8 shadow-sm sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              {/* AnN edit: Simplified avatar styling for upcoming avatar set on 14/10 */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#ffdca0] bg-[#fff2db] text-3xl font-semibold uppercase text-[#aa6a25] shadow-[0_10px_26px_rgba(255,220,160,0.35)] sm:h-28 sm:w-28">
                {avatarBadge}
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#46280f] sm:text-4xl">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-[#c27a3b] sm:text-base">
                  Sharing flavor-filled stories one plate at a time.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="self-start rounded-full border-2 border-yellow-300 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-amber-800 transition hover:bg-[#fff0c7]"
            >
              Settings
            </button>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {statsButtons.map((stat) => (
              <button
                key={stat.id}
                type="button"
                className="rounded-full border-2 border-yellow-300 bg-yellow-100 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-amber-800 transition hover:-translate-y-0.5 hover:bg-[#fff0c7] hover:shadow-sm"
              >
                {stat.label}: {stat.value}
              </button>
            ))}
          </div>
        </header>

        <section className="rounded-3xl border border-yellow-200/60 bg-white px-6 py-8 shadow-sm sm:px-8 lg:px-12">
          <nav className="flex flex-wrap gap-4">
            {tabConfig.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-semibold uppercase tracking-wide transition sm:px-7 ${
                    isActive
                      ? 'border-[#f5c272] bg-[#fff0c7] text-[#5b3717] shadow-[0_12px_24px_rgba(245,194,114,0.35)]'
                      : 'border-[#caa977] text-[#5a391b] hover:bg-[#fff0c7]'
                  }`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 flex flex-col gap-8">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {smallCards.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} layout="compact" />
              ))}
            </div>

            <div className="flex flex-col gap-6">
              {longCards.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} layout="wide" />
              ))}

              {smallCards.length === 0 && longCards.length === 0 && (
                <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
                  No recipes here yet—start cooking up something delicious!
                </article>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const tabConfig: Array<{ id: TabKey; label: string; icon: string }> = [
  { id: 'my', label: 'My Recipe', icon: '🍜' },
  { id: 'saved', label: 'Saved Recipe', icon: '🍴' },
  { id: 'liked', label: 'Liked', icon: '❤️' },
];

type RecipeCardProps = {
  recipe: RecipeCardData;
  layout: 'compact' | 'wide';
};

function RecipeCard({ recipe, layout }: RecipeCardProps) {
  const palette = moodPalette[recipe.mood];

  if (layout === 'wide') {
    return (
      <article className="flex flex-col gap-6 rounded-3xl border-2 border-[#e3c89e] bg-white p-6 shadow-[0_12px_28px_rgba(255,223,186,0.35)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(255,204,150,0.45)] md:flex-row md:p-8">
        <div
          aria-hidden="true"
          className="h-48 w-full rounded-3xl md:h-auto md:min-h-[200px] md:w-64"
          style={{
            background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.accent} 100%)`,
            boxShadow: '0 18px 38px rgba(201, 169, 119, 0.28)',
          }}
        >
          <div className="flex h-full w-full items-center justify-center text-5xl text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.25)]">
            {palette.emoji}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-[#42270f]">{recipe.title}</h3>
            <p className="text-sm uppercase tracking-wide text-[#c27a3b]">
              by {recipe.author}
            </p>
          </div>
          <p className="text-base text-[#4c2c12d9]">{recipe.summary}</p>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#e5f8f3] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d5f57]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-3xl border-2 border-[#e3c89e] bg-white shadow-[0_10px_24px_rgba(255,223,186,0.3)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(255,204,150,0.4)]">
      <div
        aria-hidden="true"
        className="flex min-h-[150px] flex-1 items-center justify-center rounded-t-3xl text-4xl text-white"
        style={{
          background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.accent} 100%)`,
        }}
      >
        {palette.emoji}
      </div>
      <div className="flex flex-col gap-3 px-5 py-5">
        <div>
          <h3 className="text-lg font-semibold text-[#42270f]">{recipe.title}</h3>
          <p className="text-xs uppercase tracking-wide text-[#c27a3b]">
            by {recipe.author}
          </p>
        </div>
        <p className="text-sm text-[#4c2c12d9]">{recipe.summary}</p>
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#e5f8f3] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d5f57]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

const moodPalette: Record<
  RecipeCardData['mood'],
  { emoji: string; bg: string; accent: string }
> = {
  warm: { emoji: '🍜', bg: '#ffd6a5', accent: '#ff9f68' },
  fresh: { emoji: '🥗', bg: '#b7f0d8', accent: '#60c3ab' },
  sweet: { emoji: '🍰', bg: '#f6d6ff', accent: '#d9a6ff' },
};
