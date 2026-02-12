export type GameState = "idle" | "playing" | "arriving" | "gameover" | "won";

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

export type DogState = "running" | "jumping";

export type ObstacleType = "low" | "high";

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
  };
  obstacles: {
    minSpawnInterval: number;
    maxSpawnInterval: number;
    speed: number;
    maxSpeed: number;
    speedIncrement: number;
    intervalDecrement: number;
    ballRadius: number;
    endlessMinSpawnInterval: number;
    endlessMaxSpeed: number;
    lowArc: {
      peakHeight: number; // how high the ball bounces (from ground) - dog must jump
      bounceCount: number; // number of bounces across screen
    };
    highArc: {
      peakHeight: number; // how high the ball bounces - dog stays on ground
      bounceCount: number;
    };
  };
  scoring: {
    pointsPerFrame: number;
    finishScore: number;
  };
  background: {
    scrollSpeed: number;
    groundOffset: number;
  };
  mobile: {
    startX: number;
    speed: number;
    maxSpeed: number;
    endlessMaxSpeed: number;
  };
}
