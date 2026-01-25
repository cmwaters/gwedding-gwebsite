import { GameState, ObstacleType } from "./types";
import { COLORS, GAME_CONFIG, STORAGE_KEYS } from "./constants";
import { Dog } from "./entities/Dog";
import { Obstacle } from "./entities/Obstacle";
import { checkCollision } from "./utils/collision";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dog: Dog;
  private obstacles: Obstacle[];
  private gameState: GameState;
  private score: number;
  private highScore: number;
  private lastTime: number;
  private obstacleTimer: number;
  private nextObstacleTime: number;
  private currentSpeed: number;
  private animationFrameId: number | null;

  // Input state
  private keys: Set<string>;
  private isDucking: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;

    this.dog = new Dog();
    this.obstacles = [];
    this.gameState = "idle";
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.lastTime = 0;
    this.obstacleTimer = 0;
    this.nextObstacleTime = this.getRandomSpawnTime();
    this.currentSpeed = GAME_CONFIG.obstacles.speed;
    this.animationFrameId = null;
    this.keys = new Set();
    this.isDucking = false;

    this.setupInputListeners();
  }

  private loadHighScore(): number {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem(STORAGE_KEYS.highScore);
    return stored ? parseInt(stored, 10) : 0;
  }

  private saveHighScore(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.highScore, Math.floor(this.highScore).toString());
  }

  private getRandomSpawnTime(): number {
    const { minSpawnInterval, maxSpawnInterval } = GAME_CONFIG.obstacles;
    return minSpawnInterval + Math.random() * (maxSpawnInterval - minSpawnInterval);
  }

  private setupInputListeners(): void {
    // Keyboard events
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Touch events
    this.canvas.addEventListener("touchstart", this.handleTouchStart);
    this.canvas.addEventListener("touchend", this.handleTouchEnd);

    // Prevent scrolling on touch
    this.canvas.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (["Space", "ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(e.code)) {
      e.preventDefault();
    }

    this.keys.add(e.code);

    if (this.gameState === "idle" || this.gameState === "gameover") {
      if (e.code === "Space" || e.code === "ArrowUp") {
        this.startGame();
      }
    } else if (this.gameState === "playing") {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        this.dog.jump();
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        this.isDucking = true;
        this.dog.duck(true);
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);

    if (e.code === "ArrowDown" || e.code === "KeyS") {
      this.isDucking = false;
      this.dog.duck(false);
    }
  };

  private touchStartY: number = 0;

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    this.touchStartY = e.touches[0].clientY;

    if (this.gameState === "idle" || this.gameState === "gameover") {
      this.startGame();
    } else if (this.gameState === "playing") {
      this.dog.jump();
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - this.touchStartY;

    // Swipe down to duck
    if (deltaY > 30 && this.gameState === "playing") {
      this.dog.duck(true);
      setTimeout(() => this.dog.duck(false), 500);
    }

    this.isDucking = false;
  };

  private startGame(): void {
    this.gameState = "playing";
    this.score = 0;
    this.obstacles = [];
    this.currentSpeed = GAME_CONFIG.obstacles.speed;
    this.obstacleTimer = 0;
    this.nextObstacleTime = this.getRandomSpawnTime();
    this.dog.reset();
    this.isDucking = false;
  }

  private spawnObstacle(): void {
    // Random type selection, with slight bias toward ground obstacles
    const type: ObstacleType = Math.random() > 0.35 ? "ground" : "air";
    this.obstacles.push(new Obstacle(type, this.currentSpeed));
  }

  private update(deltaTime: number): void {
    if (this.gameState !== "playing") return;

    // Update dog
    this.dog.update(deltaTime);

    // Maintain duck state if key is held
    if (this.isDucking && this.dog.isOnGround) {
      this.dog.duck(true);
    }

    // Update obstacles
    for (const obstacle of this.obstacles) {
      obstacle.speed = this.currentSpeed;
      obstacle.update();
    }

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter((obs) => !obs.isOffScreen);

    // Spawn new obstacles
    this.obstacleTimer += deltaTime;
    if (this.obstacleTimer >= this.nextObstacleTime) {
      this.spawnObstacle();
      this.obstacleTimer = 0;
      this.nextObstacleTime = this.getRandomSpawnTime();
    }

    // Increase speed over time
    this.currentSpeed = Math.min(
      GAME_CONFIG.obstacles.maxSpeed,
      this.currentSpeed + GAME_CONFIG.obstacles.speedIncrement * deltaTime
    );

    // Update score
    this.score += GAME_CONFIG.scoring.pointsPerFrame;

    // Check collisions
    for (const obstacle of this.obstacles) {
      if (checkCollision(this.dog.hitbox, obstacle.hitbox)) {
        this.gameOver();
        break;
      }
    }
  }

  private gameOver(): void {
    this.gameState = "gameover";
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  private draw(): void {
    const { width, height } = GAME_CONFIG.canvas;

    // Clear canvas
    this.ctx.fillStyle = COLORS.retroCream;
    this.ctx.fillRect(0, 0, width, height);

    // Draw ground line
    this.ctx.fillStyle = COLORS.charcoal;
    this.ctx.fillRect(0, GAME_CONFIG.physics.groundY, width, 2);

    // Draw obstacles
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.ctx);
    }

    // Draw dog
    this.dog.draw(this.ctx);

    // Draw UI
    this.drawUI();
  }

  private drawUI(): void {
    const { width } = GAME_CONFIG.canvas;

    // Score
    this.ctx.fillStyle = COLORS.charcoal;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = "right";
    this.ctx.fillText(`${Math.floor(this.score)}`, width - 20, 30);

    // High score
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillStyle = COLORS.orange;
    this.ctx.fillText(`HI ${Math.floor(this.highScore)}`, width - 20, 50);

    // Game state messages
    this.ctx.textAlign = "center";

    if (this.gameState === "idle") {
      this.ctx.fillStyle = COLORS.charcoal;
      this.ctx.font = '20px "Press Start 2P", monospace';
      this.ctx.fillText("Run to Villa Bettoni!", width / 2, 100);
      this.ctx.font = '12px "Press Start 2P", monospace';
      this.ctx.fillText("Press SPACE or tap to start", width / 2, 140);
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillStyle = COLORS.orange;
      this.ctx.fillText("SPACE/UP = Jump | DOWN = Duck", width / 2, 170);
    }

    if (this.gameState === "gameover") {
      this.ctx.fillStyle = COLORS.grapefruit;
      this.ctx.font = '20px "Press Start 2P", monospace';
      this.ctx.fillText("GAME OVER", width / 2, 100);
      this.ctx.font = '12px "Press Start 2P", monospace';
      this.ctx.fillStyle = COLORS.charcoal;
      this.ctx.fillText(`Score: ${Math.floor(this.score)}`, width / 2, 130);
      this.ctx.fillText("Press SPACE to retry", width / 2, 160);
    }
  }

  private gameLoop = (timestamp: number): void => {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  public start(): void {
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.canvas.removeEventListener("touchend", this.handleTouchEnd);
  }

  public resize(width: number, height: number): void {
    // Maintain aspect ratio
    const aspectRatio = GAME_CONFIG.canvas.width / GAME_CONFIG.canvas.height;
    let newWidth = width;
    let newHeight = width / aspectRatio;

    if (newHeight > height) {
      newHeight = height;
      newWidth = height * aspectRatio;
    }

    this.canvas.width = GAME_CONFIG.canvas.width;
    this.canvas.height = GAME_CONFIG.canvas.height;
    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;
  }
}
