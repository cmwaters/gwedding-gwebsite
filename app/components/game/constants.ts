import { GameConfig } from "./types";

/** Canvas-only colors (UI uses Tailwind tokens from globals.css) */
export const COLORS = {
  orange: "#FF9F1C",
  white: "#FFFFFF",
  skyBlue: "#00cdf4",
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
    width: 80,
    height: 62,
  },
  obstacles: {
    minSpawnInterval: 800, // Minimum time between obstacles (gets harder)
    maxSpawnInterval: 2000, // Starting time between obstacles
    speed: 8,
    maxSpeed: 14, // Keep constant speed
    speedIncrement: 0.01, 
    intervalDecrement: 1, // How much to decrease spawn interval per second
    ballRadius: 14, // Soccer ball radius
    endlessMinSpawnInterval: 0, // Tighter minimum for endless mode
    endlessMaxSpeed: 25, // Faster cap for endless mode
    lowArc: {
      peakHeight: 50, // Low bounce - dog must jump over
      bounceCount: 3, // Number of bounces across screen
    },
    highArc: {
      peakHeight: 150, // High bounce - sails over dog's head, stay on ground
      bounceCount: 2, // Number of bounces across screen
    },
  },
  scoring: {
    pointsPerFrame: 0.25,
    finishScore: 350,
  },
  background: {
    scrollSpeed: 0.6, // Multiplier for parallax effect (slower than obstacles)
    groundOffset: 105, // Fixed pixels from bottom of screen for ground position
  },
  mobile: {
    startX: 15, // Dog far left — maximum reaction time
    speed: 3, // Much slower initial ball speed
    maxSpeed: 6, // Lower speed cap
    endlessMaxSpeed: 9, // Faster cap for endless mode on mobile
  },
};

export const STORAGE_KEYS = {
  highScore: "villa-bettoni-high-score",
  villaBeaten: "villa-bettoni-beaten",
} as const;
