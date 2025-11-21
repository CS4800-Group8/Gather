"use client";

import React, { JSX, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { HeartIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon, UserPlusIcon, UserMinusIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'; // AnN add: Icons for buttons on 11/19

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
	const router = useRouter(); // AnN add: Router for navigation on 11/19
	const userId = searchParams.get("userId"); // read the ID from URL

	// Viet add: get logged-in user's ID for saving favorites
	const currentUser = JSON.parse(localStorage.getItem('gatherUser') || '{}');
	const myUserId = currentUser?.id;

	// User data
	const [user, setUser] = useState<OtherUserProfile | null>(null);
	const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
	const [favoritedAPIRecipes, setFavoritedAPIRecipes] = useState<APIRecipe[]>([]);

	// Viet add: store user-created favorite recipes
	const [favoritedUserRecipes, setFavoritedUserRecipes] = useState<UserRecipe[]>([]);

	const [loadingFavorites, setLoadingFavorites] = useState(false);
	const [friendCount, setFriendCount] = useState(0);

	// Tab state
	const [activeTab, setActiveTab] = useState<TabKey>('my');

	// AnN add: Friend list modal state on 11/13
	const [showFriendList, setShowFriendList] = useState(false);

	// AnN add: Friend status state on 11/19
	const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'accepted'>('none');
	const [isRequester, setIsRequester] = useState(false); // Track if current user sent the request
	const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);

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
			const favoriteAPIIds = data.favoriteAPIRecipes?.map((fav: { apiId: string }) => fav.apiId) || [];

			if (favoriteAPIIds.length === 0) {
				setFavoritedAPIRecipes([]);
				setLoadingFavorites(false);
				return;
			}

			// Fetch full recipe details from TheMealDB for each apiId
			const recipePromises = favoriteAPIIds.map(async (apiId: string) => {
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

			setFavoritedAPIRecipes(parsedRecipes);
		} catch (err) {
			console.error('Error fetching favorited recipes:', err);
		} finally {
			setLoadingFavorites(false);
		}
	};

	// Viet add: Fetch user-created favorited recipes
	const fetchFavoritedUserRecipes = async () => {
		try {
			const currentUser = JSON.parse(localStorage.getItem('gatherUser') || '{}');
			const myUserId = currentUser?.id;
			if (!myUserId) return;

			const response = await fetch(`/api/favorite-recipes?userId=${userId}`);
			if (response.ok) {
				const data = await response.json();
				// Each favorite includes "recipe" relation from Prisma
				const favorites = data.favoriteRecipes?.map((fav: { recipe: UserRecipe }) => fav.recipe) || [];
				setFavoritedUserRecipes(favorites);
			}
		} catch (err) {
			console.error('Error fetching favorited user recipes:', err);
		}
	};

	// AnN add: Fetch user's created recipes on 11/13
	const fetchUserRecipes = async () => {
		try {
			if (!userId) return;

			const response = await fetch(`/api/recipes?userId=${userId}`);
			if (response.ok) {
				const data = await response.json();
				setUserRecipes(
					(data.recipes || []).map((r: UserRecipe) => ({
						...r,
						source: 'user' as const,
					}))
				);
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

	// Viet fix: fetch both API favorites and user-created favorites
	const fetchMyFavorites = async () => {
		try {
			const currentUser = JSON.parse(localStorage.getItem('gatherUser') || '{}');
			const myUserId = currentUser?.id;

			if (!myUserId) return;

			// Fetch API-based favorites
			const apiRes = await fetch(`/api/favorite-api-recipes?userId=${myUserId}`);
			const apiData = apiRes.ok ? await apiRes.json() : { favoriteRecipes: [] };
			const APIIds = apiData.favoriteRecipes?.map((fav: { apiId: string }) => fav.apiId) || [];

			// Viet add: Fetch user-created favorites from DB
			const userRes = await fetch(`/api/favorite-recipes?userId=${myUserId}`);
			const userData = userRes.ok ? await userRes.json() : { favoriteRecipes: [] };
			const userIds =
				userData.favoriteRecipes?.map((fav: { recipeId: number }) => fav.recipeId.toString()) || [];

			// Combine both API + user-created recipe IDs
			const allIds = [...APIIds, ...userIds];
			setMyFavoriteIds(new Set(allIds));	
		} catch (err) {
			console.error("Error fetching my favorites:", err);
		}
	};

	// Viet fix: handle favorites for both API and user-created recipes
	const handleFavoriteToggle = async (
		recipeId: string | number,
		source: 'api' | 'user'
		) => {
		try {
			const currentUser = JSON.parse(localStorage.getItem('gatherUser') || '{}');
			const myUserId = currentUser?.id;

			if (!myUserId) {
				alert('Please sign in to favorite recipes');
				return;
			}

			const recipeIdStr = recipeId.toString();
			const isFavorited = myFavoriteIds.has(recipeIdStr);

			// Detect type: API recipes have string IDs, user recipes have numeric IDs
			const apiEndpoint =
				source === 'api'
					? '/api/favorite-api-recipes'
					: '/api/favorite-recipes';

			const bodyData =
				source === 'api'
					? { userId: myUserId, apiId: recipeIdStr }
					: { userId: myUserId, recipeId: Number(recipeId) };

			// Add or remove favorite
			const response = await fetch(apiEndpoint, {
				method: isFavorited ? 'DELETE' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bodyData),
			});

			if (response.ok) {
				setMyFavoriteIds((prev) => {
					const updated = new Set(prev);
					if (isFavorited) {
						updated.delete(recipeIdStr);
					} else {
						updated.add(recipeIdStr);
					}
					return updated;
				});
			}
		} catch (err) {
			console.error('Error toggling favorite:', err);
		}
	};

	// AnN add: Fetch friend status on 11/19
	const fetchFriendStatus = async () => {
		if (!userId || !myUserId) return;

		try {
			const response = await fetch(`/api/friends/status?userId=${myUserId}`);
			if (response.ok) {
				const data = await response.json();
				const friendships = data.friendships || [];

				// Find friendship between current user and viewed user
				const friendship = friendships.find(
					(f: { requesterId: number; addresseeId: number; status: string }) =>
						(f.requesterId === myUserId && f.addresseeId === parseInt(userId)) ||
						(f.addresseeId === myUserId && f.requesterId === parseInt(userId))
				);

				if (friendship) {
					setFriendStatus(friendship.status);
					setIsRequester(friendship.requesterId === myUserId);
				} else {
					setFriendStatus('none');
					setIsRequester(false);
				}
			}
		} catch (err) {
			console.error('Error fetching friend status:', err);
		}
	};

	// AnN add: Add friend handler on 11/19
	const handleAddFriend = async () => {
		if (!myUserId || !userId) return;

		try {
			const response = await fetch('/api/friends/request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					requesterId: myUserId,
					addresseeId: parseInt(userId),
				}),
			});

			if (response.ok) {
				setFriendStatus('pending');
				setIsRequester(true);
			} else {
				const data = await response.json();
				alert(data.error || 'Failed to send friend request');
			}
		} catch (error) {
			console.error('Error adding friend:', error);
			alert('Something went wrong while sending friend request.');
		}
	};

	// AnN add: Cancel friend request handler on 11/19
	const handleCancelRequest = async () => {
		if (!myUserId || !userId) return;

		const response = await fetch('/api/friends/respond', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				requesterId: myUserId,
				addresseeId: parseInt(userId),
				action: 'reject',
			}),
		});

		if (response.ok) {
			setFriendStatus('none');
			setIsRequester(false);
		}
	};

	// AnN add: Unfriend handler on 11/19
	const handleUnfriend = async () => {
		if (!myUserId || !userId) return;

		const response = await fetch('/api/friends/respond', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				requesterId: myUserId,
				addresseeId: parseInt(userId),
				action: 'reject',
			}),
		});

		if (response.ok) {
			setFriendStatus('none');
			setIsRequester(false);
			setShowUnfriendConfirm(false);
			// Update friend count
			setFriendCount(prev => Math.max(0, prev - 1));
		}
	};

	// AnN add: Message handler - Create conversation and navigate on 11/19
	const handleMessage = async () => {
		if (!myUserId || !userId) {
			alert('You must be logged in to send messages.');
			return;
		}

		try {
			// Create or get existing conversation
			const response = await fetch('/api/conversations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId1: myUserId,
					userId2: parseInt(userId),
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to create conversation');
			}

			const data = await response.json();
			const conversationId = data.conversation.id;

			// Navigate to messages page with conversation selected
			router.push(`/messages?conversationId=${conversationId}`);
		} catch (error) {
			console.error('Error creating conversation:', error);
			alert('Failed to open conversation. Please try again.');
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
		fetchFavoritedUserRecipes(); // Viet add: load user-created favorite recipes
		fetchFriendCount();
		fetchMyFavorites(); // AnN add: Fetch current user's favorites on 11/13
		fetchFriendStatus(); // AnN add: Fetch friend status on 11/19
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
					{/* AnN add: Profile header with action buttons on the right (Facebook style) on 11/19 */}
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
						<div className="flex-1">
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
						</div>

						{/* AnN add: Friend and Message action buttons on the right on 11/19 */}
						<div className="flex gap-2 flex-wrap md:flex-nowrap md:pt-4">
						{/* Friend button - changes based on status */}
						{friendStatus === 'none' && (
							<button
								onClick={handleAddFriend}
								className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md font-semibold text-sm transition-all min-w-[120px]"
							>
								<UserPlusIcon className="h-5 w-5" />
								Add Friend
							</button>
						)}
						{friendStatus === 'pending' && isRequester && (
							<button
								onClick={handleCancelRequest}
								className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 font-semibold text-sm transition-all min-w-[140px]"
							>
								<ClockIcon className="h-5 w-5" />
								Request Sent
							</button>
						)}
						{friendStatus === 'pending' && !isRequester && (
							<button
								className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-amber-200 text-amber-800 rounded-lg font-semibold text-sm min-w-[120px]"
								disabled
							>
								<ClockIcon className="h-5 w-5" />
								Pending
							</button>
						)}
						{friendStatus === 'accepted' && (
							<button
								onClick={() => setShowUnfriendConfirm(true)}
								className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md font-semibold text-sm transition-all min-w-[120px]"
							>
								<UserIcon className="h-5 w-5" />
								Friends
							</button>
						)}

						{/* Message button - always visible */}
						<button
							onClick={handleMessage}
							className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-white text-amber-700 border-2 border-amber-300 rounded-lg hover:bg-amber-50 font-semibold text-sm transition-all min-w-[120px]"
						>
							<ChatBubbleLeftIcon className="h-5 w-5" />
							Message
						</button>
						</div>
					</div>

					{/* AnN add: Unfriend confirmation modal on 11/19 */}
					{showUnfriendConfirm && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
							<div className="glass-card p-8 max-w-md w-full mx-4 text-center">
								<h3 className="text-xl font-bold text-amber-900 mb-3">
									Unfriend {user.firstname} {user.lastname}?
								</h3>
								<p className="text-sm text-amber-700 mb-6">
									You can send them a friend request again later.
								</p>

								<div className="flex gap-3 justify-center">
									<button
										onClick={() => setShowUnfriendConfirm(false)}
										className="px-6 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-medium transition-all"
									>
										Cancel
									</button>
									<button
										onClick={handleUnfriend}
										className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-all"
									>
										Unfriend
									</button>
								</div>
							</div>
						</div>
					)}

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
								// Viet add: pass favorite state and handler
								myFavoriteIds={myFavoriteIds}
								onFavoriteToggle={handleFavoriteToggle}
							/>
						) : activeTab === 'favorited' ? (
							<FavoritesTab
								favorites={[...favoritedAPIRecipes, ...favoritedUserRecipes]} // Viet fix: combine both API and user-created favorite recipes
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
