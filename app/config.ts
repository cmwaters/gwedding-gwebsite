export const SITE_CONFIG = {
  galleryUnlocked: true,
  galleryUrl: "https://photos.app.goo.gl/GVZzFHpuCHtcD9jJA",
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
