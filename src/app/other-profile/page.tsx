"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveAvatarPreset } from "@/lib/avatarPresets";
import AvatarImage from '@/components/AvatarImage';
import UserRecipeCard, { UserRecipe } from '@/components/UserRecipeCard';
import UserRecipePopup from "@/components/UserRecipePopup";

export default function OtherProfilePage() {
	const searchParams = useSearchParams();
	const userId = searchParams.get("userId"); // read the ID from URL
	const [user, setUser] = useState<any>(null);
	const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
	const [selectedUserRecipe, setSelectedUserRecipe] = useState<UserRecipe | null>(null);
	const [showUserRecipePopup, setShowUserRecipePopup] = useState(false);

	// User's stats
	const statsButtons = [
		{ id: 'posts', label: '# posts', value: userRecipes.length },  // Real count of user's recipes
		{ id: 'friends', label: '# friends', value: 0 },  // TODO: After friend system implementation
		{ id: 'likes', label: '# likes', value: 0 },  // TODO: Count favorites received
	];

	// Fetch that user recipes
	const fetchUserRecipes = async () => {
		try {
			if (!userId) return; // userId from URL

			const response = await fetch(`/api/recipes?userId=${userId}`); // use query param
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

	// Fetch that user id
	useEffect(() => {
		if (!userId) return;
		fetchUserRecipes();

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
	}, [userId]);

	if (!user) return <div>Loading profile...</div>;

	// Get user avatar
	const preset = resolveAvatarPreset(user.avatarId);

	// AnN code: Open user recipe detail popup on 10/30
	const handleOpenUserRecipePopup = (recipe: UserRecipe) => {
		setSelectedUserRecipe(recipe);
		setShowUserRecipePopup(true);
		document.body.style.overflow = 'hidden';
	};

	// AnN code: Close user recipe detail popup on 10/30
	const handleCloseUserRecipePopup = () => {
		setShowUserRecipePopup(false);
		setSelectedUserRecipe(null);
		document.body.style.overflow = 'unset';
	};
	
	return (
		<>
			<div className="min-h-screen pb-16 pt-12">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
					<section className="px-6 py-8">
						{/* Profile header */}
						<div className="mb-10 flex items-center justify-between">
							<div className="flex items-center gap-6">
								<div className="relative border-4 rounded-full border-amber-400 hover:scale-105 hover:border-amber-500 transition-all">
									<AvatarImage preset={preset} size="large" />
								</div>
								<div className="flex flex-col gap-4">
									<h1 className="text-4xl font-bold text-amber-900">
										{user.firstname} {user.lastname}
									</h1>
									<div className="flex gap-3">
										{statsButtons.map((stat) => (
											<button
												key={stat.id}
												type="button"
												onClick={() => {
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
					</section>

					{/* User Recipes */}
					<section>
						<h2 className="flex justify-center text-2xl font-bold text-amber-900 mb-6 border-b-4 border-amber-300 pb-2">🍜 {user.firstname}&apos;s Recipes</h2>
						{userRecipes.length === 0 ? (
							<article className="rounded-3xl border-2 border-dashed border-[#caa977] bg-[#fff9ed] px-6 py-12 text-center text-sm font-medium text-[#8a6134]">
                  This user doesn't have any recipes uploaded yet.
              </article>
						) : (
							<div className="flex flex-col gap-6">
								{userRecipes.map((recipe) => (
									<UserRecipeCard 
									key={recipe.recipeId} 
									recipe={recipe}
									isOwner={false}
									onClick={handleOpenUserRecipePopup}
									/>
								))}
							</div>
						)}
					</section>
				</div>
			</div>

			{/* Recipe Detail Popup */}
			{showUserRecipePopup && selectedUserRecipe && (
				<UserRecipePopup
					recipe={selectedUserRecipe}
					onClose={handleCloseUserRecipePopup}
				/>
			)}
		</>
	);
}
