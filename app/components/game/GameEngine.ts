import { GameState, ObstacleType } from "./types";
import { COLORS, GAME_CONFIG, STORAGE_KEYS } from "./constants";
import { Dog } from "./entities/Dog";
import { Follower } from "./entities/Follower";
import { Obstacle } from "./entities/Obstacle";
import { checkCollision } from "./utils/collision";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dog: Dog;
  private follower: Follower;
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

  // Finish line
  private villaTriggered: boolean = false; // Has the villa background started appearing
  private villaTileOffset: number = 0; // Offset from backgroundX where villa tile starts
  private readonly finishScore: number = 327;

  // Difficulty scaling
  private currentSpawnInterval: number; // Current max spawn interval

  // Background scrolling
  private backgroundImage: HTMLImageElement | null = null;
  private backgroundLoaded: boolean = false;
  private backgroundX: number = 0;

  // Villa (finish line)
  private villaImage: HTMLImageElement | null = null;
  private villaLoaded: boolean = false;

  // Scale factors for responsive design
  private get scaleX(): number {
    return this.canvas.width / GAME_CONFIG.canvas.width;
  }

  private get scaleY(): number {
    return this.canvas.height / GAME_CONFIG.canvas.height;
  }

  private get groundY(): number {
    // Fixed offset from bottom of canvas - matches background image
    return this.canvas.height - GAME_CONFIG.background.groundOffset;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;

    this.dog = new Dog(canvas.width, this.groundY);
    this.follower = new Follower(canvas.width, this.groundY);
    this.obstacles = [];
    this.gameState = "idle";
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.lastTime = 0;
    this.obstacleTimer = 0;
    this.nextObstacleTime = this.getRandomSpawnTime();
    this.currentSpeed = GAME_CONFIG.obstacles.speed; // Fixed speed (not scaled)
    this.currentSpawnInterval = GAME_CONFIG.obstacles.maxSpawnInterval;
    this.animationFrameId = null;
    this.keys = new Set();
    this.isDucking = false;
    this.villaTriggered = false;
    this.villaTileOffset = 0;

    // Load background image
    this.loadBackground();

    this.setupInputListeners();
  }

  private loadBackground(): void {
    this.backgroundImage = new Image();
    this.backgroundImage.onload = () => {
      this.backgroundLoaded = true;
    };
    this.backgroundImage.src = "/background.png";

    // Load villa image for finish line
    this.villaImage = new Image();
    this.villaImage.onload = () => {
      this.villaLoaded = true;
    };
    this.villaImage.src = "/villa.png";
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
    // Use current spawn interval +/- 400ms randomness
    const randomness = (Math.random() - 0.5) * 800; // Random value between -400 and +400
    return Math.max(
      GAME_CONFIG.obstacles.minSpawnInterval,
      this.currentSpawnInterval + randomness
    );
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
    } else if (this.gameState === "won") {
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

    if (this.gameState === "idle" || this.gameState === "gameover" || this.gameState === "won") {
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
    this.currentSpeed = GAME_CONFIG.obstacles.speed; // Fixed speed (not scaled)
    this.currentSpawnInterval = GAME_CONFIG.obstacles.maxSpawnInterval;
    this.obstacleTimer = 0;
    this.nextObstacleTime = this.getRandomSpawnTime();
    this.dog.reset();
    this.follower.reset();
    this.isDucking = false;
    this.villaTriggered = false;
    this.villaTileOffset = 0;
    this.backgroundX = 0;
  }

  private spawnObstacle(): void {
    // Random type selection, 50/50 split between ground and air obstacles
    const type: ObstacleType = Math.random() > 0.5 ? "ground" : "air";
    this.obstacles.push(new Obstacle(type, this.currentSpeed, this.canvas.width, this.groundY));
  }

  private update(deltaTime: number): void {
    if (this.gameState !== "playing") return;

    // Normalize deltaTime to 60 FPS (16.67ms per frame)
    // This makes the game speed consistent regardless of actual FPS
    const normalizedDelta = deltaTime / 16.67;

    // Update dog
    this.dog.update(deltaTime, normalizedDelta);

    // Record dog's position for follower
    this.follower.recordFrame(this.dog.position, this.dog.state, performance.now());

    // Update follower
    this.follower.update(deltaTime, performance.now());

    // Maintain duck state if key is held
    if (this.isDucking && this.dog.isOnGround) {
      this.dog.duck(true);
    }

    // Trigger villa background when approaching finish score
    if (!this.villaTriggered && this.score >= this.finishScore - 50 && this.backgroundImage) {
      this.villaTriggered = true;
      // Calculate tile width
      const scaledWidth = this.backgroundImage.width * 0.5;
      // Find the next tile position that's just past the right edge of screen
      const wrappedX = this.backgroundX % scaledWidth;
      let x = wrappedX;
      if (x > 0) x = x - scaledWidth;
      while (x < this.canvas.width) {
        x += scaledWidth;
      }
      // Store offset from backgroundX (this stays constant)
      this.villaTileOffset = x - this.backgroundX;
    }

    // Check if villa center is at screen center (win condition)
    if (this.villaTriggered && this.backgroundImage) {
      const scaledWidth = this.backgroundImage.width * 0.5;
      // Calculate current villa position from backgroundX and offset
      const villaX = this.backgroundX + this.villaTileOffset;
      const villaCenterX = villaX + scaledWidth / 2;
      const screenCenterX = this.canvas.width / 2;
      
      if (villaCenterX <= screenCenterX) {
        this.winGame();
        return;
      }
    }

    // Update obstacles
    for (const obstacle of this.obstacles) {
      obstacle.speed = this.currentSpeed;
      obstacle.update(normalizedDelta);
    }

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter((obs) => !obs.isOffScreen);

    // Spawn new obstacles only if villa hasn't appeared
    if (!this.villaTriggered) {
      this.obstacleTimer += deltaTime;
      if (this.obstacleTimer >= this.nextObstacleTime) {
        this.spawnObstacle();
        this.obstacleTimer = 0;
        this.nextObstacleTime = this.getRandomSpawnTime();
      }
    }

    // Decrease spawn interval over time (frame independent)
    this.currentSpawnInterval = Math.max(
      GAME_CONFIG.obstacles.minSpawnInterval,
      this.currentSpawnInterval - GAME_CONFIG.obstacles.intervalDecrement * normalizedDelta
    );

    // Increase speed over time (frame independent)
    this.currentSpeed = Math.min(
      GAME_CONFIG.obstacles.maxSpeed,
      this.currentSpeed + GAME_CONFIG.obstacles.speedIncrement * normalizedDelta
    );

    // Update score (frame independent)
    this.score += GAME_CONFIG.scoring.pointsPerFrame * normalizedDelta;

    // Update background scroll position
    // Background scrolls slower than obstacles for parallax effect
    this.backgroundX -= this.currentSpeed * normalizedDelta * GAME_CONFIG.background.scrollSpeed;

    // Check collisions for both dog and follower
    for (const obstacle of this.obstacles) {
      if (checkCollision(this.dog.hitbox, obstacle.hitbox)) {
        this.gameOver();
        break;
      }
      if (checkCollision(this.follower.hitbox, obstacle.hitbox)) {
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

  private winGame(): void {
    this.gameState = "won";
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  private draw(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas with background color (fallback)
    this.ctx.fillStyle = COLORS.skyBlue;
    this.ctx.fillRect(0, 0, width, height);

    // Draw scrolling background
    if (this.backgroundLoaded && this.backgroundImage) {
      this.drawScrollingBackground(width, height);
    }

    const groundY = this.groundY;

    // Draw follower (behind dog, so draw first)
    this.follower.draw(this.ctx);

    // Draw obstacles
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.ctx);
    }

    // Draw dog (in front)
    this.dog.draw(this.ctx);

    // Draw UI
    this.drawUI();
  }

  private drawScrollingBackground(width: number, height: number): void {
    if (!this.backgroundImage) return;

    const imgWidth = this.backgroundImage.width;
    const imgHeight = this.backgroundImage.height;

    // Use a fixed scale - background stays same size relative to dog
    // Draw at native size (or a fixed multiplier)
    const fixedScale = 0.5; // Adjust this if background is too big/small
    const scaledWidth = imgWidth * fixedScale;
    const scaledHeight = imgHeight * fixedScale;

    // Position background so bottom aligns with bottom of canvas
    // This crops the sky when window is smaller
    const yOffset = height - scaledHeight;

    // Calculate starting position for tiling
    const wrappedX = this.backgroundX % scaledWidth;
    let x = wrappedX;
    if (x > 0) {
      x = x - scaledWidth;
    }

    // Calculate villa tile position if triggered
    const villaX = this.villaTriggered ? this.backgroundX + this.villaTileOffset : -99999;

    // Draw tiles to cover the entire canvas width
    // If villa is triggered, replace one tile with villa.png
    while (x < width + scaledWidth) {
      // Check if this tile position should be the villa (within 5px tolerance for floating point)
      const isVillaTile = this.villaTriggered && 
                          this.villaLoaded && 
                          this.villaImage &&
                          Math.abs(x - villaX) < 5;

      if (isVillaTile && this.villaImage) {
        // Draw villa instead of background
        this.ctx.drawImage(
          this.villaImage,
          Math.floor(x), yOffset,
          Math.ceil(scaledWidth) + 1, scaledHeight
        );
      } else {
        // Draw normal background tile
        this.ctx.drawImage(
          this.backgroundImage,
          Math.floor(x), yOffset,
          Math.ceil(scaledWidth) + 1, scaledHeight
        );
      }
      x += scaledWidth;
    }
  }


  private drawUI(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Scale font sizes based on canvas size
    const baseFontSize = Math.max(12, Math.min(24, width / 40));
    const smallFontSize = Math.max(8, Math.min(14, width / 60));
    const tinyFontSize = Math.max(6, Math.min(10, width / 80));

    // Set font once at the beginning
    const pixelFont = '"Press Start 2P", monospace';

    // Score (top right)
    this.ctx.fillStyle = COLORS.white;
    this.ctx.font = `${baseFontSize}px ${pixelFont}`;
    this.ctx.textAlign = "right";
    this.ctx.fillText(`${Math.floor(this.score)}`, width - 20, 40);

    // High score
    this.ctx.font = `${tinyFontSize}px ${pixelFont}`;
    this.ctx.fillStyle = COLORS.white;
    this.ctx.fillText(`HI ${Math.floor(this.highScore)}`, width - 20, 60);

    // Game state messages
    this.ctx.textAlign = "center";

    if (this.gameState === "idle") {
      this.ctx.fillStyle = COLORS.white;
      this.ctx.font = `${Math.floor(baseFontSize * 1.5)}px ${pixelFont}`;
      this.ctx.fillText("Run to Villa Bettoni!", width / 2, height / 2 - 40);
      this.ctx.font = `${smallFontSize}px ${pixelFont}`;
      this.ctx.fillText("Press SPACE or tap to start", width / 2, height / 2);
      this.ctx.font = `${tinyFontSize}px ${pixelFont}`;
      this.ctx.fillText("SPACE/UP = Jump | DOWN = Duck", width / 2, height / 2 + 30);
    }

    if (this.gameState === "gameover") {
      this.ctx.fillStyle = COLORS.white;
      this.ctx.font = `${Math.floor(baseFontSize * 1.5)}px ${pixelFont}`;
      this.ctx.fillText("GAME OVER", width / 2, height / 2 - 40);
      this.ctx.font = `${smallFontSize}px ${pixelFont}`;
      this.ctx.fillText(`Score: ${Math.floor(this.score)}`, width / 2, height / 2);
      this.ctx.fillText("Press SPACE to retry", width / 2, height / 2 + 40);
    }

    if (this.gameState === "won") {
      this.ctx.fillStyle = COLORS.white;
      this.ctx.font = `${Math.floor(baseFontSize * 1.5)}px ${pixelFont}`;
      this.ctx.fillText("YOU MADE IT!", width / 2, height / 2 - 60);
      this.ctx.font = `${Math.floor(baseFontSize * 1.2)}px ${pixelFont}`;
      this.ctx.fillText("Welcome to Villa Bettoni!", width / 2, height / 2 - 20);
      this.ctx.font = `${smallFontSize}px ${pixelFont}`;
      this.ctx.fillText(`Final Score: ${Math.floor(this.score)}`, width / 2, height / 2 + 20);
      this.ctx.font = `${tinyFontSize}px ${pixelFont}`;
      this.ctx.fillText("Press SPACE to play again", width / 2, height / 2 + 50);
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
    // Set canvas to fill the entire viewport
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    // Update dog and follower scale
    this.dog.updateScale(width, this.groundY);
    this.follower.updateScale(this.groundY);
  }
}
