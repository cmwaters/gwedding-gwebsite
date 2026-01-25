export type GameState = "idle" | "playing" | "gameover";

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DogState = "running" | "jumping" | "ducking";

export type ObstacleType = "ground" | "air";

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  physics: {
    gravity: number;
    jumpVelocity: number;
    groundY: number;
  };
  dog: {
    startX: number;
    width: number;
    height: number;
    duckWidth: number;
    duckHeight: number;
  };
  obstacles: {
    minSpawnInterval: number;
    maxSpawnInterval: number;
    speed: number;
    maxSpeed: number;
    speedIncrement: number;
    ground: {
      width: number;
      height: number;
    };
    air: {
      width: number;
      height: number;
      minY: number;
      maxY: number;
    };
  };
  scoring: {
    pointsPerFrame: number;
  };
}
