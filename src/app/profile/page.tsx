'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import PopupModal from '@/components/PopupModal'; // Viet add: Use popup modal to display create recipe
import {
  DEFAULT_AVATAR_ID,
  AvatarPreset,
  getAvatarPresets,
  normalizeAvatarId,
  resolveAvatarPreset,
} from '@/lib/avatarPresets';
import AvatarImage from '@/components/AvatarImage'; // AnN add: Use centralized avatar component on 10/23

type TabKey = 'my' | 'saved' | 'liked';

// Recipe interface - supports both MealDB API and user-created recipes
interface Meal {
  idMeal: string;           // Recipe ID
  strMeal: string;          // Recipe name
  strMealThumb: string;     // Recipe image URL
  strCategory: string;      // Category (e.g., "Vegetarian", "Seafood")
  strArea: string;          // Cuisine type (e.g., "Italian", "Chinese")
  strTags: string | null;   // Tags (only for MealDB recipes, not used for user recipes)
  strYoutube?: string;      // YouTube URL for video tutorials (optional)
}

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle youtube.com/watch?v=VIDEO_ID format
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/VIDEO_ID format
  const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  
  return null;
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('my');
  const [displayName, setDisplayName] = useState('username');
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  
  // Recipe detail popup state
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

  const avatarPresets = useMemo(() => getAvatarPresets(), []);
  const currentPreset: AvatarPreset = useMemo(
    () => resolveAvatarPreset(avatarId),
    [avatarId]
  );

  // AnN add: Fetch recipes and hydrate avatar picker on 10/22
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const promises = Array.from({ length: 8 }, () =>
          fetch('https://www.themealdb.com/api/json/v1/1/random.php')
            .then(res => res.json())
            .then(data => data.meals[0])
        );
        const meals = await Promise.all(promises);
        setRecipes(meals);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Load user profile from localStorage
  useEffect(() => {
    try {
      const stored =
        typeof window !== 'undefined'
          ? localStorage.getItem('user') || localStorage.getItem('gatherUser')
          : null;

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as { firstname?: string; lastname?: string; username?: string; avatar?: string; avatarId?: string };
      // AnN fix: Prefer full name when available on 10/23
      const first = parsed.firstname?.trim();
      const last = parsed.lastname?.trim();
      const normalizedFirst = first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
      const normalizedLast = last ? last.charAt(0).toUpperCase() + last.slice(1) : '';
      if (normalizedFirst && normalizedLast) {
        setDisplayName(`${normalizedFirst} ${normalizedLast}`);
      } else if (normalizedFirst) {
        setDisplayName(normalizedFirst);
      } else if (normalizedLast) {
        setDisplayName(normalizedLast);
      } else if (parsed.username && parsed.username.trim().length > 0) {
        const normalizedUsername =
          parsed.username.charAt(0).toUpperCase() + parsed.username.slice(1);
        setDisplayName(normalizedUsername);
      }
      const storedAvatarId = normalizeAvatarId(parsed.avatarId ?? parsed.avatar);
      setAvatarId(storedAvatarId);
    } catch (error) {
      console.warn('Unable to hydrate profile header from storage', error);
    }
  }, []);

  // AnN add: Persist selected avatar preset id on 10/22
  const handleAvatarChange = (newAvatarId: string) => {
    const nextPreset = resolveAvatarPreset(newAvatarId);
    setAvatarId(nextPreset.id);
    setShowAvatarPicker(false);

    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('gatherUser');
      if (stored) {
        const userData = JSON.parse(stored);
        userData.avatarId = nextPreset.id;
        userData.avatar = nextPreset.value;
        localStorage.setItem('gatherUser', JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('gather:user-updated'));
      }
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const getRecipesForTab = () => {
    if (activeTab === 'my') return recipes.slice(0, 5);
    if (activeTab === 'saved') return recipes.slice(0, 5);
    if (activeTab === 'liked') return recipes.slice(0, 4);
    return [];
  };

  const currentRecipes = getRecipesForTab();

  // TODO: Backend team will connect these stats to real data
  const statsButtons = [
    { id: 'posts', label: '# posts', value: 5 },
    { id: 'friends', label: '# friends', value: 18 },
    { id: 'likes', label: '# likes', value: 48 },
  ];

  const avatarButtonBase =
    "flex h-32 w-32 items-center justify-center rounded-full text-7xl transition-transform duration-200 cursor-pointer hover:scale-105";

  const avatarButtonClasses = `${avatarButtonBase} border-4 border-amber-400 bg-white shadow-[0_24px_48px_rgba(255,183,88,0.28)] hover:border-amber-500`;

  // Open recipe detail popup
  const openRecipeDetail = (recipe: Meal) => {
    setSelectedRecipe(recipe);
    setIsDetailPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close recipe detail popup
  const closeRecipeDetail = () => {
    setIsDetailPopupOpen(false);
    setSelectedRecipe(null);
    document.body.style.overflow = 'unset';
  };

  // Viet Add: Submits new recipe to the API and closes the modal on success
  const handleCreateRecipe = async () => {
    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('gatherUser') || '{}');
      const userId = user?.id || 1; // Replace with actual auth system later

      // Send POST request to API with recipe data
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
        },
        body: JSON.stringify({
          recipeName: newRecipeName,
          description: newDescription,
          youtubeUrl: newYoutubeUrl || undefined, // Include YouTube URL if provided
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error || 'Failed to create recipe');
      } else {
        console.log('Recipe created:', data.recipe);

        // Close modal after done
        setShowModal(false);
        setNewRecipeName('');
        setNewDescription('');
        setNewYoutubeUrl('');
      }
    } catch (error) {
      console.error('Error submitting recipe:', error);
    }
  };

  return (
    <div className="min-h-screen pb-16 pt-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <section className="px-6 py-8">
          {/* Profile header */}
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* AnN add: Avatar badge renders emoji or image from preset config on 10/22 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className={avatarButtonClasses}
                  aria-label="Change avatar"
                >
                  {/* AnN fix: Only show bgClass for emoji, not images on 10/23 */}
                  <AvatarImage preset={currentPreset} size="large" />
                </button>

                {/* Avatar picker dropdown */}
                {showAvatarPicker && (
                  <div className="absolute left-0 top-36 z-20 rounded-2xl border-2 border-amber-200 bg-white/95 backdrop-blur p-4 shadow-xl">
                    <p className="text-xs font-semibold text-amber-800 mb-3 text-center">Choose Your Avatar</p>
                    <div className="flex gap-3">
                      {avatarPresets.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleAvatarChange(option.id)}
                          className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 hover:scale-110 ${
                            avatarId === option.id
                              ? 'bg-amber-200 ring-2 ring-amber-400'
                              : 'bg-amber-50 hover:bg-amber-100'
                          }`}
                        >
                          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${option.variant === 'emoji' ? option.bgClass : 'bg-transparent'}`}>
                            {/* AnN fix: Only show bgClass for emoji, not images on 10/23 */}
                            <AvatarImage preset={option} size="medium" />
                          </div>
                          <span className="text-xs font-medium text-amber-800">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold text-amber-900">
                  {displayName}
                </h1>
                {/* Stats buttons - clickable for backend team */}
                <div className="flex gap-3">
                  {statsButtons.map((stat) => (
                    <button
                      key={stat.id}
                      type="button"
                      onClick={() => {
                        // TODO: Backend team will implement functionality
                        console.log(`Clicked on ${stat.id}`);
                      }}
                      className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      {stat.label}: {stat.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Create Recipe Button */}
          <button
            type="button"
            onClick={() => {
              //Navigate to open modal
              setShowModal(true)
              console.log('Create recipe clicked');
            }}
            className="mb-8 flex w-full items-center gap-3 rounded-full border-2 border-amber-300 bg-white px-4 py-3 text-left transition-all hover:bg-amber-50 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl">
              ✨
            </div>
            <span className="text-base text-amber-600 font-normal">What&apos;s your recipe idea, {displayName}?</span>
          </button>

          {/* Create Recipe Tab */}
          <PopupModal isOpen={showModal} onClose={() => setShowModal(false)}>

            <div className='flex flex-col justify-between items-start text-amber-600 gap-5'>
              {/* HEADER */}
              <div className='flex justify-around items-center w-full gap-16'>
                <button
                  className="text-gray-500 hover:text-red-500 text-2xl"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>

                <p className='text-xl font-bold'>Create Recipe</p>  

                <button
                  onClick={handleCreateRecipe}
                  className='border border-gray-400 shado-md rounded-lg px-2 py-1 hover:opacity-70 hover:-translate-y-1 transition-all'>
                  Post
                </button>    
              </div>

              {/* Profile */}
              <div className='flex w-full justify-between gap-10'>
                <div className='flex gap-5 items-center'>
                  <div className='h-15 w-15 flex items-center justify-center rounded-full border-2 border-amber-400 text-white
                  hover:-translate-y-1 transition-all'>
                    <AvatarImage preset={currentPreset} size="small" />
                  </div>
                  <p className='text-md font-bold'>{displayName}</p>
                </div>
              </div>

              {/* Recipe Name */}
              <div className='flex flex-col w-full gap-2 justify-center'>
                <input type="text" 
                value={newRecipeName}
                onChange={(e) => setNewRecipeName(e.target.value)}
                className="text-md py-1 px-3 border rounded-xl w-full hover:opacity-70 hover:border-gray-400"
                placeholder="Recipe name"
                />
              </div>
              
              {/* Ingredients & Quantity */}
              {/*
              <div className='flex flex-col w-full text-md'>
                <div className='flex gap-5'>
                  <div className='flex flex-col justify-center'>
                    <p>Ingredients</p>
                    <input className='border mb-3 px-2 py-1 text-sm rounded-xl hover:opacity-70 hover:border-gray-400' type="text" placeholder='Ingredients' />
                    <input className='border mb-3 px-2 py-1 text-sm rounded-xl hover:opacity-70 hover:border-gray-400' type="text" />
                  </div>
                  <div className='flex flex-col'>
                    <p>Quantity</p>
                    <input className='border mb-3 px-2 py-1 text-sm rounded-xl hover:opacity-70 hover:border-gray-400' type="text" placeholder='Quantity' />
                    <input className='border mb-3 px-2 py-1 text-sm rounded-xl hover:opacity-70 hover:border-gray-400' type="text" />
                  </div>
                </div>
                <button className='border p-1 rounded-xl w-[50px] text-sm hover:border-gray-400 hover:opacity-70 transition-all'>+Add</button>
              </div>*/}
              
              {/* Instruction */}
              <div className='flex flex-col gap-2 w-full'>
                <p>Description</p>
                <textarea 
                  name="instruction"
                  id="instruction"
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="border rounded-xl p-2 w-full text-sm hover:opacity-70 hover:border-gray-400"
                />
              </div>

              {/* Media Upload Section - Placeholder for Backend Team */}
              <div className='flex flex-col gap-3 w-full'>
                <p className='font-semibold'>Add Media (Optional)</p>
                
                {/* Image Upload Placeholder */}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer 
                hover:border-amber-400 hover:bg-amber-50 transition-all group">
                  <div className='flex flex-col items-center gap-2'>
                    <div className='text-4xl group-hover:scale-110 transition-transform'>📸</div>
                    <span className="text-sm text-amber-700 font-medium">Upload Recipe Image</span>
                    <span className="text-xs text-gray-500">Click to browse or drag and drop</span>
                  </div>
                  {/* TODO: Backend team - Add file input functionality here with DB connectoin*/}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={() => {
                      // TODO: image upload
                      console.log('Image upload clicked - Backend team implement here');
                    }}
                  />
                </label>

                {/* YouTube URL Placeholder */}
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg'>▶️</span>
                    <p className='text-sm'>YouTube Video Tutorial</p>
                  </div>
                  <input 
                    type="url"
                    value={newYoutubeUrl}
                    onChange={(e) => setNewYoutubeUrl(e.target.value)}
                    className="text-sm py-2 px-3 border rounded-xl w-full hover:opacity-70 hover:border-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className='text-xs text-gray-500'>Paste a YouTube link to add a video tutorial</p>
                </div>
              </div>

              {/* Category 
              <div className='flex w-full gap-10'>
                <p>Categories</p>
                <select 
                name="category" 
                id="category"
                className='border rounded-md px-20 hover:border-gray-400'>
                </select>
              </div>*/}
            </div>
          </PopupModal>

          {/* Recipe tabs */}
          <nav className="flex flex-wrap gap-4">
            {tabConfig.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-6 py-3 text-base font-bold transition ${
                    isActive
                      ? 'border-amber-400 bg-amber-100 text-amber-900 shadow-md'
                      : 'border-amber-300 bg-white text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Recipe cards with loading state */}
          <div className="mt-8 flex flex-col gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="glass-card overflow-hidden"
                >
                  <div className="flex gap-6 p-6">
                    <div className="h-48 w-48 flex-shrink-0 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 animate-pulse">
                      <div className="flex h-full w-full items-center justify-center text-amber-400 text-4xl">
                        🍽️
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="h-8 bg-amber-200 rounded-md animate-pulse"></div>
                      <div className="h-5 bg-amber-100 rounded-md w-3/4 animate-pulse"></div>
                      <div className="h-5 bg-amber-100 rounded-md w-1/2 animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="h-7 w-20 bg-amber-200 rounded-full animate-pulse"></div>
                        <div className="h-7 w-24 bg-amber-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : currentRecipes.length > 0 ? (
              // AnN fix: Added index to prevent duplicate key errors on 10/23
              currentRecipes.map((recipe, index) => (
                <RecipeCard key={`${recipe.idMeal}-${index}`} recipe={recipe} onClick={() => openRecipeDetail(recipe)} />
              ))
            ) : (
              <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
                No recipes here yet—start cooking up something delicious!
              </article>
            )}
          </div>
        </section>
      </div>

      {/* RECIPE DETAIL POPUP */}
      {isDetailPopupOpen && selectedRecipe && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeRecipeDetail}
        >
          <div 
            className="popUp-scrollbar bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PopUp */}
            <div className="flex-shrink-0 bg-white border-b border-amber-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-amber-900">{selectedRecipe.strMeal}</h2>
              <button
                onClick={closeRecipeDetail}
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

            {/* PopUp Content - Scrollable Area */}
            <div className="overflow-y-auto flex-1 popUp-scrollbar p-6">
              {/* Recipe Image */}
              <div className="relative w-full h-96 rounded-xl overflow-hidden mb-6">
                <Image
                  src={selectedRecipe.strMealThumb}
                  alt={selectedRecipe.strMeal}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>

              {/* Recipe Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-xl">🍴</span>
                    <span className="font-semibold">Category:</span>
                    <span>{selectedRecipe.strCategory}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-xl">🌍</span>
                    <span className="font-semibold">Cuisine:</span>
                    <span>{selectedRecipe.strArea}</span>
                  </div>
                </div>
              </div>

              {/* YouTube Video Player */}
              {selectedRecipe.strYoutube && (() => {
                const videoId = getYouTubeVideoId(selectedRecipe.strYoutube);
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
          </div>
        </div>
      )}
    </div>
  );
}

const tabConfig: Array<{ id: TabKey; label: string; icon: string }> = [
  { id: 'my', label: 'My Recipes', icon: '🍜' },
  { id: 'saved', label: 'Saved Recipes', icon: '🍴' },
  { id: 'liked', label: 'Liked', icon: '❤️' },
];

type RecipeCardProps = {
  recipe: Meal;
  onClick?: () => void;
};

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <article 
      className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
      onClick={onClick}
    >
      <button
        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
        aria-label="Save recipe"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-2xl text-amber-600 hover:text-red-500 transition-colors">
          ♡
        </span>
      </button>

      <div className="flex gap-6 p-6">
        {/* AnN fix: Changed img to Image for better performance on 10/17 */}
        <div className="relative h-48 w-48 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="192px"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">{recipe.strMeal}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="text-lg">🍴</span>
                <span className="text-sm">{recipe.strCategory}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <span className="text-lg">🌍</span>
                <span className="text-sm">{recipe.strArea} Cuisine</span>
              </div>
            </div>
          </div>
          {/* YouTube Tutorial Tag */}
          {recipe.strYoutube && (
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                <span>▶️</span>
                Video Tutorial
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
