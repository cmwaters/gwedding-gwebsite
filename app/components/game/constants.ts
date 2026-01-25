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
} as const;

export const GAME_CONFIG: GameConfig = {
  canvas: {
    width: 800,
    height: 300,
  },
  physics: {
    gravity: 0.6,
    jumpVelocity: -13,
    groundY: 250, // Ground line position from top
  },
  dog: {
    startX: 80,
    width: 60,
    height: 40,
    duckWidth: 80,
    duckHeight: 25,
  },
  obstacles: {
    minSpawnInterval: 1500,
    maxSpawnInterval: 3000,
    speed: 6,
    maxSpeed: 14,
    speedIncrement: 0.001,
    ground: {
      width: 40,
      height: 40,
    },
    air: {
      width: 50,
      height: 30,
      minY: 180, // Minimum Y position (higher on screen)
      maxY: 200, // Maximum Y position
    },
  },
  scoring: {
    pointsPerFrame: 0.15,
  },
};

export const STORAGE_KEYS = {
  highScore: "villa-bettoni-high-score",
} as const;
