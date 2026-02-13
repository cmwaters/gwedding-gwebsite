export const SITE_CONFIG = {
  galleryUnlocked: false,
  coupleNames: "Cal & Euge",
  venue: "Villa Bettoni",
} as const;

export type Screen =
  | "menu"
  | "game-submenu"
  | "playing"
  | "schedule"
  | "travel"
  | "rsvp"
  | "info"
  | "gallery";
