'use client';

import Image from 'next/image';
import { JSX, useEffect, useMemo, useState } from 'react';
import PopupModal from '@/components/PopupModal'; // Viet add: Use popup modal to display create recipe
import { HeartIcon } from '@heroicons/react/24/solid'; // AnN add: Heart icon for favorited tab on 11/8

import {
  DEFAULT_AVATAR_ID,
  AvatarPreset,
  getAvatarPresets,
  normalizeAvatarId,
  resolveAvatarPreset,
} from '@/lib/avatarPresets';
import AvatarImage from '@/components/AvatarImage'; // AnN add: Use centralized avatar component on 10/23
import UserRecipeCard, { UserRecipe } from '@/components/UserRecipeCard'; // AnN add: Extracted component on 10/31
import APIRecipeCard, { APIRecipe } from '@/components/APIRecipeCard'; // AnN add: Extracted component on 10/31
import UserRecipePopup from "@/components/UserRecipePopup"; // Viet add: get User Recipe Popup from component

// AnN edit: Keep all tabs for teammates to implement later on 10/30
type TabKey = 'my' | 'favorited';

// AnN edit: Removed Meal interface - no longer needed on 10/30

// AnN add: Helper function to extract YouTube video ID from URL on 10/30
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
};

// Viet add: Interface for ingredients and categories (kept in profile page for form state)
interface Ingredient {
  id: number;
  name: string;
  quantity: string;
}
interface Category {
  id: number;
  name: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('my');
  const [displayName, setDisplayName] = useState('username');
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState(''); // Viet add: store recipe name to database
  const [newDescription, setNewDescription] = useState(''); // Viet add: store description to database
  // Ingredients
  const [ingredient, setIngredient] = useState(''); // Viet add: store current input ingredient to database
  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // Viet add: store every ingredients to database
  const [quantity, setQuantity] = useState(''); // Viet add: store quantity to database
  // Categories
  const [category, setCategory] = useState(''); // Viet add: store current input category to database
  const [categories, setCategories] = useState<Category[]>([]); // Viet add: store every category to database

  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]); // AnN add: Store user's database recipes on 10/23
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // AnN add: Show delete confirmation modal on 10/23
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null); // AnN add: Store recipe ID to delete on 10/23
  const [createRecipeError, setCreateRecipeError] = useState(''); // AnN add: Error message for recipe creation on 10/23
  const [uploading, setUploading] = useState(false); // AnN add: S3 upload status on 10/29
  const [uploadError, setUploadError] = useState(''); // AnN add: S3 upload error on 10/29
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // AnN add: Store selected file before upload on 10/29
  const [previewUrl, setPreviewUrl] = useState<string>(''); // AnN add: Local preview URL on 10/29
  const [newInstructions, setNewInstructions] = useState(''); // AnN add: Store cooking instructions on 10/30
  const [newVideoUrl, setNewVideoUrl] = useState(''); // AnN add: Store YouTube video URL on 10/30
  const [selectedUserRecipe, setSelectedUserRecipe] = useState<UserRecipe | null>(null); // AnN add: Selected recipe for detail popup on 10/30
  const [showUserRecipePopup, setShowUserRecipePopup] = useState(false); // AnN add: Show user recipe detail popup on 10/30
  const [favoritedRecipes, setFavoritedRecipes] = useState<APIRecipe[]>([]); // AnN add: Store favorited API recipes on 10/31
  const [loadingFavorites, setLoadingFavorites] = useState(false); // AnN add: Loading state for favorited recipes on 10/31
  const [selectedAPIRecipe, setSelectedAPIRecipe] = useState<APIRecipe | null>(null); // AnN add: Selected API recipe for detail popup on 10/31
  const [showAPIRecipePopup, setShowAPIRecipePopup] = useState(false); // AnN add: Show API recipe detail popup on 10/31
  const [showUnfavoriteConfirm, setShowUnfavoriteConfirm] = useState(false); // AnN add: Show unfavorite confirmation on 11/4
  const [recipeToUnfavorite, setRecipeToUnfavorite] = useState<string | null>(null); // AnN add: Store API recipe ID to unfavorite on 11/4

  // Thu add: Friend count for profile stats on 11/6
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    const fetchFriends = async () => {
      const user = JSON.parse(localStorage.getItem('gatherUser') || '{}');
      const res = await fetch(`/api/friends/count?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setFriendCount(data.count);
      }
    };
    fetchFriends();
  }, []);

  // -------------------------------------------------


  const avatarPresets = useMemo(() => getAvatarPresets(), []);
  const currentPreset: AvatarPreset = useMemo(
    () => resolveAvatarPreset(avatarId),
    [avatarId]
  );

  // AnN add: Fetch user's created recipes from database on 10/23
  const fetchUserRecipes = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('gatherUser') || '{}');
      const userId = user?.id;

      if (!userId) return;

      const response = await fetch('/api/recipes', {
        headers: { 'x-user-id': userId.toString() }
      });

      if (response.ok) {
        const data = await response.json();
        setUserRecipes(data.recipes || []);
      }
    } catch (err) {
      console.error('Error fetching user recipes:', err);
    }
  };

  // AnN add: Fetch favorited API recipes on 10/31
  const fetchFavoritedRecipes = async () => {
    try {
      setLoadingFavorites(true);
      const user = JSON.parse(localStorage.getItem('gatherUser') || '{}');
      const userId = user?.id;

      if (!userId) {
        setLoadingFavorites(false);
        return;
      }

      // Get favorite apiIds from database
      const response = await fetch(`/api/favorite-api-recipes?userId=${userId}`);

      if (!response.ok) {
        setLoadingFavorites(false);
        return;
      }

      const data = await response.json();
      const favoriteApiIds = data.favoriteRecipes?.map((fav: { apiId: string }) => fav.apiId) || [];

      if (favoriteApiIds.length === 0) {
        setFavoritedRecipes([]);
        setLoadingFavorites(false);
        return;
      }

      // Fetch full recipe details from TheMealDB for each apiId
      const recipePromises = favoriteApiIds.map(async (apiId: string) => {
        try {
          const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${apiId}`);
          const recipeData = await res.json();
          return recipeData.meals?.[0] || null;
        } catch {
          return null;
        }
      });

      const recipes = await Promise.all(recipePromises);
      const validRecipes = recipes.filter((r): r is NonNullable<typeof r> => r !== null);

      // Parse ingredients for each recipe
      const parsedRecipes: APIRecipe[] = validRecipes.map((meal) => {
        const ingredients: { name: string; measure: string }[] = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredients.push({ name: ingredient.trim(), measure: measure?.trim() || '' });
          }
        }

        return {
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strCategory: meal.strCategory || '',
          strArea: meal.strArea || '',
          strInstructions: meal.strInstructions || '',
          strMealThumb: meal.strMealThumb || '',
          strYoutube: meal.strYoutube || '',
          strTags: meal.strTags || null,
          ingredients,
        };
      });

      setFavoritedRecipes(parsedRecipes);
      setLoadingFavorites(false);
    } catch (err) {
      console.error('Error fetching favorited recipes:', err);
      setLoadingFavorites(false);
    }
  };

  // AnN add: Fetch all recipes on page load on 10/23
  useEffect(() => {
    fetchUserRecipes();
    fetchFavoritedRecipes(); // AnN add: Fetch favorited recipes on page load too (so tab switching is instant) on 10/31
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
  // AnN edit: Updated to save to database on 11/1
  const handleAvatarChange = async (newAvatarId: string) => {
    const nextPreset = resolveAvatarPreset(newAvatarId);
    setAvatarId(nextPreset.id);
    setShowAvatarPicker(false);

    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('gatherUser');
      if (stored) {
        const userData = JSON.parse(stored);
        const userId = userData.id;

        // Update localStorage (instant UI update)
        userData.avatarId = nextPreset.id;
        userData.avatar = nextPreset.value;
        localStorage.setItem('gatherUser', JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('gather:user-updated'));

        // Save to database (persist across devices)
        if (userId) {
          await fetch('/api/user/avatar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, avatarId: nextPreset.id }),
          });
        }
      }
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  // AnN edit: Removed getRecipesForTab and currentRecipes - no longer needed on 10/30

  // AnN edit: Made stats dynamic - posts shows real count, others TODO on 11/4
  const statsButtons = [
    { id: 'posts', label: '# posts', value: userRecipes.length },  // Real count of user's recipes
    // { id: 'friends', label: '# friends', value: 0 },  // TODO: After friend system implementation

    // Thu modified: Fetch real friend count on 11/6
    { id: 'friends', label: '# friends', value: friendCount },
  ];

  const avatarButtonBase =
    "flex h-32 w-32 items-center justify-center rounded-full text-7xl transition-transform duration-200 cursor-pointer hover:scale-105";

  const avatarButtonClasses = `${avatarButtonBase} border-4 border-amber-400 bg-white shadow-[0_24px_48px_rgba(255,183,88,0.28)] hover:border-amber-500`;

  // Viet Add: Submits new recipe to the API and closes the modal on success
  const handleCreateRecipe = async () => {
    // AnN add: Validate required fields on 10/23
    if (!newRecipeName.trim()) {
      setCreateRecipeError('Please enter a recipe name');
      return;
    }
    if (!newDescription.trim()) {
      setCreateRecipeError('Please enter a description');
      return;
    }
    // AnN add: Require photo upload on 10/29
    if (!selectedFile) {
      setCreateRecipeError('Please upload a photo for your recipe');
      return;
    }

    setCreateRecipeError(''); // Clear any previous errors
    setUploading(true); // AnN add: Show uploading state on 10/29

    try {
      // AnN edit: Upload to S3 only when posting on 10/29
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      const photoUrlToUse = uploadData.imageUrl;
      console.log('Photo uploaded to S3:', photoUrlToUse);

      // Get current user
      const user = JSON.parse(localStorage.getItem('gatherUser') || '{}');
      const userId = user?.id; 

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
          photoUrl: photoUrlToUse,  // AnN edit: Use uploaded S3 URL on 10/29
          instructions: newInstructions || null, // AnN add: Send instructions on 10/30
          videoUrl: newVideoUrl || null, // AnN add: Send video URL on 10/30
          // Viet add: ingredients and categories
          ingredients: ingredients.map(i => ({ id: i.id, quantity: i.quantity })),
          categoryIds: categories.map(c => c.id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error || 'Failed to create recipe');
        setCreateRecipeError(data.error || 'Failed to create recipe');
      } else {
        console.log('Recipe created:', data.recipe);

        // AnN add: Refresh recipe list after creating on 10/23
        await fetchUserRecipes();

        // AnN edit: Use handleCloseModal to reset all form state on 10/29
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error submitting recipe:', error);
      setCreateRecipeError('Failed to create recipe. Please try again.');
    } finally {
      setUploading(false); // AnN add: Clear uploading state on 10/29
    }
  };

  // Viet add: Handle add ingredient
  const handleAddIngredient = async () => {
    const name = ingredient.trim();
    const qty = quantity.trim();

    if (!name) {
      setCreateRecipeError('Please enter an ingredient name');
      return;
    }

    try {
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity: qty }),
      });

      const data = await res.json();

      // Handle ingredient exists already
      if (res.status === 409 && data.id) {
        setIngredients((prev) => [
          ...prev,
          { id: data.id, name, quantity: qty },
        ]);
      }

      // Handle new ingredient
      else if (res.ok) {
        setIngredients((prev) => [
          ...prev,
          { id: data.id, name: data.name, quantity: qty },
        ]);
      }

      // Handle other errors
      else {
        setCreateRecipeError(data.error || 'Failed to add ingredient');
        return;
      }

      // Clear input fields & error message
      setIngredient('');
      setQuantity('');
      setCreateRecipeError('');
    } catch (err) {
      console.error(err);
      setCreateRecipeError('Network error while adding ingredient');
    }
  };

  // Viet add: Handle add category
  const handleAddCategory = async () => {
    const name = category.trim();

    if (!name) {
      setCreateRecipeError('Please enter a category name');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      // Category already exists
      if (res.status === 409 && data.id) {
        setCategories((prev) => [
          ...prev,
          { id: data.id, name }, 
        ]);
      }

      // Category successfully created
      else if (res.ok) {
        setCategories((prev) => [
          ...prev,
          { id: data.id, name: data.name },
        ]);
      }

      // Other errors
      else {
        setCreateRecipeError(data.error || 'Failed to add category');
        return;
      }

      // Clear input and error message
      setCategory('');
      setCreateRecipeError('');
    } catch (err) {
      console.error(err);
      setCreateRecipeError('Network error while adding category');
    }
  };

  // Viet add: Handle removing an ingredient
  const handleRemoveIngredient = (id: number) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  // Viet add: Handle removing a category
  const handleRemoveCategory = (id: number) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // AnN add: Handle modal close and reset form state on 10/29
  const handleCloseModal = () => {
    setShowModal(false);
    setNewRecipeName('');
    setNewDescription('');
    setNewInstructions(''); // AnN add: Reset instructions on 10/30
    setNewVideoUrl(''); // AnN add: Reset video URL on 10/30
    setUploadError('');
    setCreateRecipeError('');
    setSelectedFile(null);
    setIngredient('');
    setQuantity('');
    setCategory('');
    setIngredients([]);
    setCategories([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clean up memory
    }
    setPreviewUrl('');
  };

  // AnN add: Open user recipe detail popup on 10/30
  const handleOpenUserRecipePopup = (recipe: UserRecipe) => {
    setSelectedUserRecipe(recipe);
    setShowUserRecipePopup(true);
    document.body.style.overflow = 'hidden';
  };

  // AnN add: Close user recipe detail popup on 10/30
  const handleCloseUserRecipePopup = () => {
    setShowUserRecipePopup(false);
    setSelectedUserRecipe(null);
    document.body.style.overflow = 'unset';
  };

  // AnN add: Open API recipe detail popup on 10/31
  const handleOpenAPIRecipePopup = (recipe: APIRecipe) => {
    setSelectedAPIRecipe(recipe);
    setShowAPIRecipePopup(true);
    document.body.style.overflow = 'hidden';
  };

  // AnN add: Close API recipe detail popup on 10/31
  const handleCloseAPIRecipePopup = () => {
    setShowAPIRecipePopup(false);
    setSelectedAPIRecipe(null);
    document.body.style.overflow = 'unset';
  };

  // AnN add: Show unfavorite confirmation on 11/4
  const handleUnfavoriteAPIRecipe = (apiId: string) => {
    setRecipeToUnfavorite(apiId);
    setShowUnfavoriteConfirm(true);
  };

  // AnN add: Cancel unfavorite on 11/4
  const handleUnfavoriteCancel = () => {
    setShowUnfavoriteConfirm(false);
    setRecipeToUnfavorite(null);
  };

  // AnN add: Confirm unfavorite API recipe on 11/4
  const confirmUnfavoriteAPIRecipe = async () => {
    if (!recipeToUnfavorite) return;

    try {
      const user = JSON.parse(localStorage.getItem('gatherUser') || '{}');
      const userId = user?.id;

      if (!userId) return;

      const response = await fetch('/api/favorite-api-recipes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, apiId: recipeToUnfavorite }),
      });

      if (response.ok) {
        // Remove from state
        setFavoritedRecipes((prev) => prev.filter((recipe) => recipe.idMeal !== recipeToUnfavorite));

        // Also update localStorage if used by explore page
        const storedLikes = localStorage.getItem('favoritedRecipes');
        if (storedLikes) {
          const likes = JSON.parse(storedLikes);
          const updatedLikes = likes.filter((id: string) => id !== recipeToUnfavorite);
          localStorage.setItem('favoritedRecipes', JSON.stringify(updatedLikes));
        }

        // Close confirmation modal
        setShowUnfavoriteConfirm(false);
        setRecipeToUnfavorite(null);
      }
    } catch (err) {
      console.error('Error unfavoriting recipe:', err);
    }
  };

  // AnN edit: Store file and show preview (upload only on Post) on 10/29
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (4MB for Vercel compatibility)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image must be less than 4MB');
      return;
    }

    setUploadError('');
    setCreateRecipeError(''); // AnN add: Clear recipe error when photo uploaded on 10/29

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Store file and create local preview
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    console.log('Photo selected, will upload when you click Post');
  };

  // AnN add: Handle delete recipe with confirmation on 10/23
  const handleDeleteClick = (recipeId: number) => {
    setRecipeToDelete(recipeId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      const user = JSON.parse(localStorage.getItem('gatherUser') || '{}');
      const userId = user?.id;

      const response = await fetch('/api/recipes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
        },
        body: JSON.stringify({
          recipeId: recipeToDelete,
        }),
      });

      if (response.ok) {
        console.log('Recipe deleted successfully');
        // Refresh recipe list
        await fetchUserRecipes();
      } else {
        const data = await response.json();
        console.error(data.error || 'Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    } finally {
      setShowDeleteConfirm(false);
      setRecipeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setRecipeToDelete(null);
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
          <PopupModal isOpen={showModal} onClose={handleCloseModal}>

            <div className='flex flex-col justify-between items-start text-amber-600 gap-5'>
              {/* HEADER */}
              <div className='flex justify-between items-center w-full gap-4'>
                <button
                  className="border-2 border-gray-300 bg-white text-gray-600 hover:text-red-500 hover:border-red-400 hover:bg-red-50 rounded-lg px-3 py-1.5 text-2xl font-bold leading-none shadow-sm hover:shadow-md transition-all"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  &times;
                </button>

                <p className='text-xl font-bold'>Create Recipe</p>

                <button
                  onClick={handleCreateRecipe}
                  disabled={uploading}
                  className='border-2 border-amber-400 bg-amber-100 text-amber-900 font-semibold shadow-md rounded-lg px-6 py-2 hover:bg-amber-200 hover:border-amber-500 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'>
                  {uploading ? 'Posting...' : 'Post'}
                </button>
              </div>

              {/* AnN add: Error message display on 10/23 */}
              {createRecipeError && (
                <div className='w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='text-sm text-red-600 text-center'>{createRecipeError}</p>
                </div>
              )}

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

              {/* AnN edit: File upload for recipe photos (S3) on 10/29 */}
              <div className='flex flex-col w-full gap-2'>
                <p className='text-sm font-semibold'>Recipe Photo</p>

                {/* Upload error message */}
                {uploadError && (
                  <div className='px-3 py-2 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-xs text-red-600'>{uploadError}</p>
                  </div>
                )}

                {/* File input */}
                <div className='flex flex-col gap-3'>
                  <label
                    htmlFor="photo-upload"
                    className={`flex flex-col items-center justify-center w-full h-20 border-2 rounded-lg cursor-pointer transition-all ${
                      uploading
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-400'
                    }`}
                  >
                    <div className='flex flex-col items-center justify-center py-2'>
                      {previewUrl ? (
                        <>
                          <svg className="h-6 w-6 text-green-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className='text-xs text-amber-700 font-medium'>Photo selected</p>
                          <p className='text-[10px] text-amber-600'>Click to change</p>
                        </>
                      ) : (
                        <>
                          <svg className="h-6 w-6 text-amber-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className='text-xs text-amber-700 font-medium'>Click to upload photo</p>
                          <p className='text-[10px] text-amber-600'>PNG, JPG up to 4MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>

                  {/* Preview selected image */}
                  {previewUrl && (
                    <div className='relative w-full h-36 rounded-lg overflow-hidden border border-amber-300'>
                      <Image
                        src={previewUrl}
                        alt="Recipe preview"
                        fill
                        className="object-cover"
                        sizes="400px"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Recipe Name */}
              <div className='flex flex-col w-full gap-2 justify-center'>
                <p className='text-sm font-semibold'>Recipe Name</p>
                <input type="text"
                value={newRecipeName}
                onChange={(e) => setNewRecipeName(e.target.value)}
                className="text-md py-2 px-4 border-2 border-amber-300 rounded-xl w-full focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all hover:border-amber-400"
                placeholder="Enter recipe name"
                />
              </div>
              
              {/* Viet add: Ingredients & Quantity */}   
              <div className='flex flex-col w-full text-md gap-3'>
                <div className='flex gap-5'>
                  <div className='flex flex-col gap-2'>
                    <p className='text-sm font-semibold'>Ingredients</p>
                    <input 
                    className='border-2 border-amber-300 px-4 py-2 text-sm rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none hover:border-amber-400 transition-all' 
                    type="text" 
                    placeholder='Ingredient name'
                    value={ingredient}
                    onChange={(e) => setIngredient(e.target.value)}/>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <p className='text-sm font-semibold'>Quantity</p>
                    <input 
                    className='border-2 border-amber-300 px-4 py-2 text-sm rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none hover:border-amber-400 transition-all' 
                    type="text" 
                    placeholder='Quantity number'
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}/>
                  </div>
                </div>
                <button 
                className='bg-amber-100 border-2 border-amber-300 p-1 rounded-xl w-auto shadow-md text-sm text-amber-900 hover:bg-amber-200 hover:border-amber-500 transition-all'
                onClick={handleAddIngredient}>
                +Add
                </button>
              </div>
              
              {/* Viet add: Category */}
              <div className='flex w-full gap-5 items-center'>
                <p className='text-sm font-semibold'>Categories</p>
                <div>
                  <input 
                  type='text'
                  className='border-2 border-amber-300 px-3 py-1 text-sm rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none hover:border-amber-400 transition-all'
                  placeholder='Category name'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}/>
                  <button 
                  className='bg-amber-100 border-2 border-amber-300 p-1 rounded-full w-[30px] shadow-lg text-sm text-amber-900 hover:bg-amber-200 hover:border-amber-500 transition-all'
                  onClick={handleAddCategory}>
                    +
                  </button>
                </div>
              </div>

              {/* Instruction */}
              <div className='flex flex-col gap-2 w-full'>
                <p className='text-sm font-semibold'>Description</p>
                <textarea
                  name="instruction"
                  id="instruction"
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="border-2 border-amber-300 rounded-xl p-3 w-full text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all hover:border-amber-400 resize-none"
                  placeholder="Describe your recipe..."
                />
              </div>

              {/* AnN add: Instructions textarea on 10/30 */}
              <div className='flex flex-col gap-2 w-full'>
                <p className='text-sm font-semibold'>Instructions</p>
                <textarea
                  name="instructions"
                  id="instructions"
                  rows={5}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="border-2 border-amber-300 rounded-xl p-3 w-full text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all hover:border-amber-400 resize-none"
                  placeholder="1. First step...&#10;2. Second step...&#10;3. Third step..."
                />
              </div>

              {/* AnN add: YouTube video URL input on 10/30 */}
              <div className='flex flex-col gap-2 w-full'>
                <p className='text-sm font-semibold'>YouTube Video</p>
                <input
                  type='text'
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className='border-2 border-amber-300 px-4 py-2 text-sm rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none hover:border-amber-400 transition-all'
                />
              </div>

            {/* Viet add: Show added ingredients */}
            {ingredients.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-2 items-center'>
                <p className='text-sm font-semibold'>Ingredients:</p>
                {ingredients.map((i) => (
                  <span
                    key={i.id}
                    className='bg-amber-100 border border-amber-300 px-2 py-1 rounded-full text-xs text-amber-900'
                  >
                    {i.name} - {i.quantity}
                    <button 
                    onClick={() => handleRemoveIngredient(i.id)}
                    className='text-red-500 ml-1 hover:text-red-700 font-bold'>
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Viet add: Show added categories */}
            {categories.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-2 items-center'>
                <p className='text-sm font-semibold'>Categories:</p>
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className='bg-amber-100 border border-amber-300 px-2 py-1 rounded-full text-xs text-amber-900'
                  >
                    {c.name}
                    <button 
                    onClick={() => handleRemoveCategory(c.id)}
                    className='text-red-500 ml-1 hover:text-red-700 font-bold'>
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            </div>
          </PopupModal>

          {/* AnN add: Delete confirmation modal on 10/23 */}
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

          {/* Unfavorite confirmation modal */}
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
                  onClick={confirmUnfavoriteAPIRecipe}
                  className='flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors'
                >
                  Remove
                </button>
              </div>
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
                  <span aria-hidden="true" className="text-xl flex items-center justify-center">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* AnN edit: Show content based on active tab on 10/30 */}
          <div className="mt-8 flex flex-col gap-6">
            {activeTab === 'my' ? (
              // My Recipes tab - show user's created recipes
              userRecipes.length > 0 ? (
                userRecipes.map((recipe) => (
                  <UserRecipeCard
                    key={recipe.recipeId}
                    recipe={recipe}
                    isOwner={true}
                    onDelete={handleDeleteClick}
                    onClick={handleOpenUserRecipePopup}
                  />
                ))
              ) : (
                <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
                  No recipes here yet—start cooking up something delicious!
                </article>
              )
            ) : activeTab === 'favorited' ? (
              // AnN add: Favorited API recipes tab on 10/31
              loadingFavorites ? (
                <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
                  Loading your favorite recipes...
                </article>
              ) : favoritedRecipes.length > 0 ? (
                favoritedRecipes.map((recipe) => (
                  <APIRecipeCard
                    key={recipe.idMeal}
                    recipe={recipe}
                    onClick={handleOpenAPIRecipePopup}
                    onDelete={handleUnfavoriteAPIRecipe}
                  />
                ))
              ) : (
                <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
                  No favorite recipes yet. Like recipes from the Explore page to see them here!
                </article>
              )
            ) : (
              <article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
                Placeholder
              </article>
            )}
          </div>
        </section>

        {/* Viet move: User Recipe Detail Popup to components/ AnN add: Recipe Detail Popup */}
        {showUserRecipePopup && selectedUserRecipe && (
          <UserRecipePopup
            recipe={selectedUserRecipe}
            onClose={handleCloseUserRecipePopup}
          />
        )}

        {/* AnN add: API Recipe Detail Popup on 10/31 */}
        {showAPIRecipePopup && selectedAPIRecipe && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCloseAPIRecipePopup}>
            <div className="popUp-scrollbar bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex-shrink-0 bg-white border-b border-amber-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-amber-900">{selectedAPIRecipe.strMeal}</h2>
                <button onClick={handleCloseAPIRecipePopup} className="w-10 h-10 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors text-amber-900" aria-label="Close popup">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="overflow-y-auto flex-1 popUp-scrollbar p-6">
                {selectedAPIRecipe.strMealThumb && (<div className="relative w-full h-96 rounded-xl overflow-hidden mb-6"><Image src={selectedAPIRecipe.strMealThumb} alt={selectedAPIRecipe.strMeal} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" /></div>)}
                <div className="mb-6"><h3 className="font-bold text-amber-900 mb-2 text-xl">Category</h3><div className="flex gap-2 flex-wrap"><span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded-full">{selectedAPIRecipe.strCategory}</span>{selectedAPIRecipe.strArea && <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded-full">{selectedAPIRecipe.strArea}</span>}</div></div>
                {selectedAPIRecipe.ingredients && selectedAPIRecipe.ingredients.length > 0 && (<div className="mb-6"><h3 className="font-bold text-amber-900 mb-3 text-xl">Ingredients</h3><ul className="grid md:grid-cols-2 gap-2">{selectedAPIRecipe.ingredients.map((ing, idx) => (<li key={idx} className="flex items-center gap-2 text-amber-800"><span className="text-amber-600">•</span>{ing.measure} {ing.name}</li>))}</ul></div>)}
                {selectedAPIRecipe.strInstructions && (<div className="mb-6"><h3 className="font-bold text-amber-900 mb-3 text-xl">Instructions</h3><div className="prose max-w-none text-amber-800 whitespace-pre-line">{selectedAPIRecipe.strInstructions}</div></div>)}
                {selectedAPIRecipe.strYoutube && (() => {const videoId = getYouTubeVideoId(selectedAPIRecipe.strYoutube); return videoId ? (<div className="mb-6"><h3 className="font-bold text-amber-900 mb-3 text-xl flex items-center gap-2"><span>▶️</span>Video Tutorial</h3><div className="relative w-full" style={{paddingBottom: '56.25%'}}><iframe className="absolute top-0 left-0 w-full h-full rounded-xl" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div></div>) : null;})()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// AnN edit: Keep all tabs for teammates to implement saved/liked later on 10/30
const tabConfig: Array<{ id: TabKey; label: string; icon: string | JSX.Element }> = [
  { id: 'my', label: 'My Recipes', icon: '🍜' },
  { id: 'favorited', label: 'Favorite Recipes', icon: <HeartIcon className="w-6 h-6 text-red-500" /> },
];

// AnN edit: Removed RecipeCard component and Meal interface - no longer needed on 10/30
// AnN edit: Extracted UserRecipeCard and APIRecipeCard to separate components on 10/31
