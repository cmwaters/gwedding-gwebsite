export const SITE_CONFIG = {
  galleryUnlocked: false,
  coupleNames: "Cal & Euge",
  venue: "Villa Bettoni",
} as const;

export type Screen =
  | "menu"
  | "instructions"
  | "playing"
  | "gameover"
  | "won"
  | "schedule"
  | "travel"
  | "rsvp"
  | "info"
  | "gallery";
