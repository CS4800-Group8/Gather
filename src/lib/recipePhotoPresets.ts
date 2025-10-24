// AnN add: Recipe photo preset system (like avatar presets) on 10/23

export type RecipePhotoPreset = {
  id: string;
  label: string;
  photoUrl: string;
};

export const RECIPE_PHOTO_PRESETS: RecipePhotoPreset[] = [
  {
    id: "beef-pho",
    label: "Beef Pho",
    photoUrl: "/recipe-presets/beef_pho.png",
  },
  {
    id: "chicken-pho",
    label: "Chicken Pho",
    photoUrl: "/recipe-presets/chicken_pho.jpg",
  },
  {
    id: "matcha-boba",
    label: "Matcha Boba",
    photoUrl: "/recipe-presets/matcha-boba.jpg",
  },
  {
    id: "pizza",
    label: "Pizza",
    photoUrl: "/recipe-presets/pizza.png",
  },
  {
    id: "steak",
    label: "Steak",
    photoUrl: "/recipe-presets/steak.jpg",
  },
  {
    id: "avocado",
    label: "Avocado",
    photoUrl: "/recipe-presets/avocado.jpg",
  },
  {
    id: "banhmi",
    label: "Banh Mi",
    photoUrl: "/recipe-presets/banhmi.jpg",
  },
  {
    id: "bunbohue",
    label: "Bun Bo Hue",
    photoUrl: "/recipe-presets/bunbohue.jpg",
  },
  {
    id: "bundau",
    label: "Bun Dau",
    photoUrl: "/recipe-presets/bundau.jpg",
  },
  {
    id: "strawberry",
    label: "Strawberry",
    photoUrl: "/recipe-presets/strawberry.jpg",
  },
];

export const DEFAULT_RECIPE_PHOTO = RECIPE_PHOTO_PRESETS[0].photoUrl;
