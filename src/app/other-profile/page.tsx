"use client";

import React, { JSX, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { HeartIcon } from '@heroicons/react/24/solid';

// Profile components
import ProfileHeader from '@/components/profile/ProfileHeader';
import MyRecipesTab from '@/components/profile/MyRecipesTab';
import FavoritesTab from '@/components/profile/FavoritesTab';
import FriendListModal from '@/components/profile/FriendListModal'; // AnN add: Friend list modal on 11/13

// Types
import { UserRecipe } from '@/components/profile/UserRecipeCard';
import { APIRecipe } from '@/components/APIRecipeCard';

// AnN add: Tab type on 11/13
type TabKey = 'my' | 'favorited';

// AnN fix: Type for user profile data to replace 'any' on 11/6
interface OtherUserProfile {
	id: number;
	username: string;
	firstname: string;
	lastname: string;
	avatarId: string;
	_count: {
		recipes: number;
	};
}

// AnN fix: Separate component to use searchParams for Next.js 15 compatibility on 11/6
function OtherProfileContent() {
	const searchParams = useSearchParams();
	const userId = searchParams.get("userId"); // read the ID from URL

	// User data
	const [user, setUser] = useState<OtherUserProfile | null>(null);
	const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
	const [favoritedRecipes, setFavoritedRecipes] = useState<APIRecipe[]>([]);
	const [loadingFavorites, setLoadingFavorites] = useState(false);
	const [friendCount, setFriendCount] = useState(0);

	// Tab state
	const [activeTab, setActiveTab] = useState<TabKey>('my');

	// AnN add: Friend list modal state on 11/13
	const [showFriendList, setShowFriendList] = useState(false);

	// AnN add: Track current user's favorites to show heart state on 11/13
	const [myFavoriteIds, setMyFavoriteIds] = useState<Set<string>>(new Set());

	// AnN add: Fetch user's favorited API recipes on 11/13
	const fetchFavoritedRecipes = async () => {
		if (!userId) return;

		setLoadingFavorites(true);
		try {
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
		} catch (err) {
			console.error('Error fetching favorited recipes:', err);
		} finally {
			setLoadingFavorites(false);
		}
	};

	// AnN add: Fetch user's created recipes on 11/13
	const fetchUserRecipes = async () => {
		try {
			if (!userId) return;

			const response = await fetch(`/api/recipes?userId=${userId}`);
			if (response.ok) {
				const data = await response.json();
				setUserRecipes(data.recipes || []);
			} else {
				console.error("Failed to fetch recipes:", response.status);
			}
		} catch (err) {
			console.error("Error fetching user recipes:", err);
		}
	};

	// AnN add: Fetch friend count on 11/13
	const fetchFriendCount = async () => {
		if (!userId) return;

		try {
			const res = await fetch(`/api/friends/count?userId=${userId}`);
			if (res.ok) {
				const data = await res.json();
				setFriendCount(data.count || 0);
			}
		} catch (err) {
			console.error('Error fetching friend count:', err);
		}
	};

	// AnN add: Fetch current user's favorites to show heart state on 11/13
	const fetchMyFavorites = async () => {
		try {
			const currentUser = JSON.parse(localStorage.getItem('gatherUser') || '{}');
			const myUserId = currentUser?.id;

			if (!myUserId) return;

			const response = await fetch(`/api/favorite-api-recipes?userId=${myUserId}`);
			if (response.ok) {
				const data = await response.json();
				const favoriteIds = data.favoriteRecipes?.map((fav: { apiId: string }) => fav.apiId) || [];
				setMyFavoriteIds(new Set(favoriteIds));
			}
		} catch (err) {
			console.error('Error fetching my favorites:', err);
		}
	};

	// AnN add: Toggle favorite for API recipes on 11/13
	const handleFavoriteToggle = async (recipeId: string) => {
		try {
			const currentUser = JSON.parse(localStorage.getItem('gatherUser') || '{}');
			const myUserId = currentUser?.id;

			if (!myUserId) {
				alert('Please sign in to favorite recipes');
				return;
			}

			const isFavorited = myFavoriteIds.has(recipeId);

			if (isFavorited) {
				// Remove from favorites
				const response = await fetch('/api/favorite-api-recipes', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: myUserId, apiId: recipeId }),
				});

				if (response.ok) {
					setMyFavoriteIds((prev) => {
						const updated = new Set(prev);
						updated.delete(recipeId);
						return updated;
					});
				}
			} else {
				// Add to favorites
				const response = await fetch('/api/favorite-api-recipes', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: myUserId, apiId: recipeId }),
				});

				if (response.ok) {
					setMyFavoriteIds((prev) => new Set(prev).add(recipeId));
				}
			}
		} catch (err) {
			console.error('Error toggling favorite:', err);
		}
	};

	// Fetch user data and all associated data
	useEffect(() => {
		if (!userId) return;

		const fetchUser = async () => {
			try {
				const res = await fetch(`/api/users/${userId}`);
				if (res.ok) {
					const data = await res.json();
					setUser(data.user);
				} else {
					console.error("Failed to fetch user:", res.status);
				}
			} catch (err) {
				console.error("Error fetching user:", err);
			}
		};

		fetchUser();
		fetchUserRecipes();
		fetchFavoritedRecipes();
		fetchFriendCount();
		fetchMyFavorites(); // AnN add: Fetch current user's favorites on 11/13
	}, [userId]);

	// AnN add: No-op handlers for view-only mode on 11/13
	// These are required by components but won't be called since isOwnProfile={false}
	const handleAvatarChange = () => {
		// No-op: Other users can't change this user's avatar
	};

	const handleRecipeDelete = async () => {
		// No-op: Other users can't delete this user's recipes
	};

	const handleUnfavorite = async () => {
		// No-op: Can't unfavorite from another user's list (but can favorite for yourself)
	};

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-amber-700">Loading profile...</p>
			</div>
		);
	}

	const displayName = `${user.firstname} ${user.lastname}`;

	return (
		<div className="min-h-screen pb-16 pt-12">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
				<section className="px-6 py-8">
					{/* AnN add: Replaced hardcoded header with ProfileHeader component on 11/13 */}
					<ProfileHeader
						displayName={displayName}
						avatarId={user.avatarId}
						recipeCount={userRecipes.length}
						friendCount={friendCount}
						onAvatarChange={handleAvatarChange}
						isOwnProfile={false}
						onFriendClick={() => setShowFriendList(true)}
					/>

					{/* AnN add: Tab navigation on 11/13 */}
					<nav className="flex flex-wrap gap-4 mt-8">
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

					{/* AnN add: Tab content area on 11/13 */}
					<div className="mt-8 flex flex-col gap-6">
						{activeTab === 'my' ? (
							<MyRecipesTab
								recipes={userRecipes}
								isOwnProfile={false}
								displayName={displayName}
								onRecipeDelete={handleRecipeDelete}
							/>
						) : activeTab === 'favorited' ? (
							<FavoritesTab
								favorites={favoritedRecipes}
								loading={loadingFavorites}
								isOwnProfile={false}
								displayName={displayName}
								onUnfavorite={handleUnfavorite}
								myFavoriteIds={myFavoriteIds}
								onFavoriteToggle={handleFavoriteToggle}
							/>
						) : null}
					</div>
				</section>
			</div>

			{/* AnN add: Friend list modal on 11/13 */}
			<FriendListModal
				isOpen={showFriendList}
				onClose={() => setShowFriendList(false)}
				userId={user.id}
				displayName={displayName}
				isOwnProfile={false}
			/>
		</div>
	);
}

// AnN add: Tab configuration on 11/13
const tabConfig: Array<{ id: TabKey; label: string; icon: string | JSX.Element }> = [
	{
		id: 'my',
		label: 'My Recipes',
		icon: <Image src="/icons/recipe-book-icon.png" alt="Recipe Book" width={24} height={24} className="inline-block" />
	},
	{ id: 'favorited', label: 'Favorite Recipes', icon: <HeartIcon className="w-6 h-6 text-red-500" /> },
];

// AnN fix: Wrap with Suspense for Next.js 15 compatibility on 11/6
export default function OtherProfilePage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-amber-700">Loading profile...</p></div>}>
			<OtherProfileContent />
		</Suspense>
	);
}
