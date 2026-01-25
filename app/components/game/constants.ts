import { GameConfig } from "./types";

export const COLORS = {
  // Citrus Colors
  lemon: "#FFD93D",
  orange: "#FF9F1C",
  tangerine: "#FF6B35",
  grapefruit: "#FF4D6D",
  lime: "#C5E063",
  citrusLight: "#FFF3B0",

  // Forget-Me-Not Blues
  forgetMeNot: "#7EC8E3",
  forgetMeNotDeep: "#5BA4C9",
  forgetMeNotLight: "#B8E1F2",
  periwinkle: "#9DB4FF",

  // Neutrals
  white: "#FFFFFF",
  retroCream: "#FFF8E7",
  charcoal: "#2D2D2D",
  black: "#000000",
  
  // Background
  skyBlue: "#48c7e0",
} as const;

export const GAME_CONFIG: GameConfig = {
  canvas: {
    width: 800,
    height: 300,
  },
  physics: {
    gravity: 1.2,
    jumpVelocity: -18,
    groundY: 250, // Ground line position from top
  },
  dog: {
    startX: 100,
    width: 64,
    height: 64,
    duckWidth: 64,
    duckHeight: 64,
  },
  obstacles: {
    minSpawnInterval: 600, // Minimum time between obstacles (gets harder)
    maxSpawnInterval: 3000, // Starting time between obstacles
    speed: 8,
    maxSpeed: 12, // Keep constant speed
    speedIncrement: 0.01, 
    intervalDecrement: 4, // How much to decrease spawn interval per second
    ground: {
      width: 40,
      height: 40,
    },
    air: {
      width: 50,
      height: 30,
      amplitude: 30, // How much the bird swoops up/down
      centerOffset: 80, // How high above dog the center of the wave is
    },
  },
  scoring: {
    pointsPerFrame: 0.25,
  },
  follower: {
    delay: 200, // Delay in milliseconds
    offsetX: -70, // Position behind dog (in pixels)
  },
  background: {
    scrollSpeed: 0.6, // Multiplier for parallax effect (slower than obstacles)
    groundOffset: 105, // Fixed pixels from bottom of screen for ground position
  },
};

export const STORAGE_KEYS = {
  highScore: "villa-bettoni-high-score",
} as const;
