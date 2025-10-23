export type AvatarPresetVariant = "emoji" | "image";

export type AvatarPreset = {
  id: string;
  label: string;
  variant: AvatarPresetVariant;
  value: string;
  bgClass: string;
  textClass?: string;
  imageScale?: number;
  imageOffsetY?: number;
};

// AnN add: Centralized avatar preset registry on 10/22
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "melon",
    label: "Melon",
    variant: "emoji",
    value: "🍉",
    bgClass: "bg-green-500",
    textClass: "text-4xl",
  },
  {
    id: "orange",
    label: "Orange",
    variant: "emoji",
    value: "🍊",
    bgClass: "bg-orange-500",
    textClass: "text-4xl",
  },
  {
    id: "lemon",
    label: "Lemon",
    variant: "emoji",
    value: "🍋",
    bgClass: "bg-yellow-400",
    textClass: "text-4xl",
  },
  {
    id: "grape",
    label: "Grape",
    variant: "emoji",
    value: "🍇",
    bgClass: "bg-purple-500",
    textClass: "text-4xl",
  },
  {
    id: "caramel-flan",
    label: "Caramel Flan",
    variant: "image",
    value: "/avatars/flan1_square.png", // AnN fix: Updated to perfectly square 918x918 image on 10/23
    bgClass: "bg-[#4b2a17]",
    imageScale: 1.25, // AnN fix: Aggressive scale to hide export halo on 10/23
    imageOffsetY: -0.04,
  },
];

export const DEFAULT_AVATAR_ID = "melon";

const AVATAR_PRESET_MAP: Record<string, AvatarPreset> = AVATAR_PRESETS.reduce<
  Record<string, AvatarPreset>
>((acc, preset) => {
  acc[preset.id] = preset;
  return acc;
}, {});

const LEGACY_EMOJI_TO_ID: Record<string, string> = {
  "🍉": "melon",
  "🍊": "orange",
  "🍋": "lemon",
  "🍇": "grape",
};

export const getAvatarPresets = () => AVATAR_PRESETS;

export const getAvatarPresetById = (id?: string | null) =>
  (id && AVATAR_PRESET_MAP[id]) || null;

// AnN add: Helper keeps old emoji-based values working on 10/22
export const resolveAvatarPreset = (
  avatarId?: string | null,
  legacyAvatar?: string | null
): AvatarPreset => {
  if (avatarId && AVATAR_PRESET_MAP[avatarId]) {
    return AVATAR_PRESET_MAP[avatarId];
  }

  if (legacyAvatar && LEGACY_EMOJI_TO_ID[legacyAvatar]) {
    const mappedId = LEGACY_EMOJI_TO_ID[legacyAvatar];
    return AVATAR_PRESET_MAP[mappedId];
  }

  return AVATAR_PRESET_MAP[DEFAULT_AVATAR_ID];
};

export const normalizeAvatarId = (value?: string | null) => {
  if (!value) return DEFAULT_AVATAR_ID;
  if (AVATAR_PRESET_MAP[value]) return value;
  if (LEGACY_EMOJI_TO_ID[value]) {
    return LEGACY_EMOJI_TO_ID[value];
  }
  return DEFAULT_AVATAR_ID;
};
