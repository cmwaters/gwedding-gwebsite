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


  // Endless mode — no villa, obstacles forever
  private endless: boolean = false;

  // Finish line
  private villaTriggered: boolean = false; // Has the villa background started appearing
  private villaTileOffset: number = 0; // Offset from backgroundX where villa tile starts

  // Difficulty scaling
  private currentSpawnInterval: number; // Current max spawn interval
  private doubleSpawnTimer: number = 0; // Countdown for delayed second ball

  // FPS tracking
  private fps: number = 60;
  private frameCount: number = 0;
  private fpsLastTime: number = 0;

  // Background scrolling
  private backgroundImage: HTMLImageElement | null = null;
  private backgroundLoaded: boolean = false;
  private backgroundX: number = 0;

  // Pre-scaled offscreen canvases (avoid re-scaling large images every frame)
  private bgScaled: HTMLCanvasElement | null = null;
  private villaScaled: HTMLCanvasElement | null = null;
  private scaledTileW: number = 0;
  private scaledTileH: number = 0;

  // Villa (finish line)
  private villaImage: HTMLImageElement | null = null;
  private villaLoaded: boolean = false;

  // Couple sprite (Cal & Euge at the villa)
  private coupleImage: HTMLImageElement | null = null;
  private coupleLoaded: boolean = false;
  private coupleX: number = 0; // X position where couple stands (set when arriving)
  private coupleOffsetFromVilla: number = 0; // Fixed offset from villa position (set once)

  // Callback when game ends (gameover or won)
  public onGameEnd: ((result: "gameover" | "won", score: number) => void) | null = null;

  // Mobile detection — slower balls, dog closer to left
  private isMobile: boolean;

  private get groundY(): number {
    // Fixed offset from bottom of canvas - matches background image
    return this.canvas.height - GAME_CONFIG.background.groundOffset;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;

    this.isMobile = canvas.width < 600;

    this.dog = new Dog(canvas.width, this.groundY);
    // Apply mobile dog position immediately
    if (this.isMobile) {
      this.dog.updateScale(canvas.width, this.groundY, GAME_CONFIG.mobile.startX);
    }

    this.obstacles = [];
    this.gameState = "idle";
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.lastTime = 0;
    this.obstacleTimer = 0;
    this.nextObstacleTime = this.getRandomSpawnTime();
    this.currentSpeed = this.isMobile ? GAME_CONFIG.mobile.speed : GAME_CONFIG.obstacles.speed;
    this.currentSpawnInterval = GAME_CONFIG.obstacles.maxSpawnInterval;
    this.animationFrameId = null;
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
      this.buildScaledTile(this.backgroundImage!, "bg");
    };
    this.backgroundImage.src = "/background.png";

    // Load villa image for finish line
    this.villaImage = new Image();
    this.villaImage.onload = () => {
      this.villaLoaded = true;
      this.buildScaledTile(this.villaImage!, "villa");
    };
    this.villaImage.src = "/villa.png";

    // Load couple sprite (Cal & Euge)
    this.coupleImage = new Image();
    this.coupleImage.onload = () => {
      this.coupleLoaded = true;
    };
    this.coupleImage.src = "/cal_and_euge.png";
  }

  /** Pre-render an image at the fixed 0.5x scale into an offscreen canvas.
   *  This turns every per-frame drawImage from a scale-and-blit into a
   *  simple 1:1 blit, which is dramatically faster on most GPUs / CPUs. */
  private buildScaledTile(img: HTMLImageElement, target: "bg" | "villa"): void {
    const fixedScale = 0.5;
    const w = Math.ceil(img.width * fixedScale);
    const h = Math.ceil(img.height * fixedScale);
    this.scaledTileW = w;
    this.scaledTileH = h;

    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const octx = offscreen.getContext("2d")!;
    octx.imageSmoothingEnabled = false; // keep pixelated look
    octx.drawImage(img, 0, 0, w, h);

    if (target === "bg") {
      this.bgScaled = offscreen;
    } else {
      this.villaScaled = offscreen;
    }
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

    // Touch events
    this.canvas.addEventListener("touchstart", this.handleTouchStart);
    this.canvas.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (["Space", "ArrowUp"].includes(e.code)) {
      e.preventDefault();
    }

    // Only handle input when playing — idle/gameover/won are handled by React overlays
    if (this.gameState === "playing") {
      if (e.code === "Space" || e.code === "ArrowUp") {
        this.dog.jump();
      }
    }
  };

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    if (this.gameState === "playing") {
      this.dog.jump();
    }
  };

  /** Shared reset logic for both startGame and returnToIdle */
  private resetState(): void {
    this.obstacles = [];
    this.score = 0;
    this.dog.reset();
    this.villaTriggered = false;
    this.villaTileOffset = 0;
    this.backgroundX = 0;
    this.coupleX = 0;
    this.coupleOffsetFromVilla = 0;
    this.doubleSpawnTimer = 0;
  }

  /** Called externally by React to start/restart the game */
  public startGame(mode: "normal" | "endless" = "normal"): void {
    this.resetState();
    this.endless = mode === "endless";
    this.gameState = "playing";
    this.currentSpeed = this.isMobile ? GAME_CONFIG.mobile.speed : GAME_CONFIG.obstacles.speed;
    this.currentSpawnInterval = GAME_CONFIG.obstacles.maxSpawnInterval;
    this.obstacleTimer = 0;
    this.nextObstacleTime = this.getRandomSpawnTime();
  }

  /** Called externally by React to return to idle (e.g. when showing menu) */
  public returnToIdle(): void {
    this.resetState();
    this.gameState = "idle";
  }

  private spawnObstacle(): void {
    // Random type selection, 50/50 split between low and high arc balls
    const type: ObstacleType = Math.random() > 0.5 ? "low" : "high";
    const dogCenterX = this.dog.position.x + this.dog.width / 2;
    this.obstacles.push(new Obstacle(type, this.currentSpeed, this.canvas.width, this.groundY, dogCenterX));
  }

  private update(deltaTime: number): void {
    // Handle "arriving" state: dog walks toward Cal & Euge
    if (this.gameState === "arriving") {
      const normalizedDelta = deltaTime / 16.67;
      const walkSpeed = 2.5; // px per normalized frame

      // Keep dog animation running (walking)
      this.dog.update(deltaTime, normalizedDelta);

      // Move dog rightward toward the couple
      this.dog.position.x += walkSpeed * normalizedDelta;

      // When dog reaches the couple, end the game
      if (this.dog.position.x + this.dog.width >= this.coupleX) {
        this.endGame("won");
      }
      return;
    }

    if (this.gameState !== "playing") return;

    // Normalize deltaTime to 60 FPS (16.67ms per frame)
    // This makes the game speed consistent regardless of actual FPS
    const normalizedDelta = deltaTime / 16.67;

    // Update dog
    this.dog.update(deltaTime, normalizedDelta);

    // Trigger villa background when approaching finish score (skip in endless mode)
    if (!this.endless && !this.villaTriggered && this.score >= GAME_CONFIG.scoring.finishScore - 50 && this.scaledTileW > 0) {
      this.villaTriggered = true;
      const scaledWidth = this.scaledTileW;
      // Find the next tile position that's just past the right edge of screen
      const wrappedX = this.backgroundX % scaledWidth;
      let x = wrappedX;
      if (x > 0) x = x - scaledWidth;
      while (x < this.canvas.width) {
        x += scaledWidth;
      }
      // Store offset from backgroundX (this stays constant)
      this.villaTileOffset = x - this.backgroundX;
      // Store couple offset relative to villa center (scrolls with the villa)
      this.coupleOffsetFromVilla = scaledWidth / 2 + 70;
    }

    // Update couple position to scroll with the villa
    if (this.villaTriggered && this.scaledTileW > 0) {
      const villaX = this.backgroundX + this.villaTileOffset;
      this.coupleX = villaX + this.coupleOffsetFromVilla;
    }

    // Check if villa center is at screen center (win condition — skip in endless mode)
    // Enter "arriving" state instead of immediately ending
    if (!this.endless && this.villaTriggered && this.scaledTileW > 0) {
      const scaledWidth = this.scaledTileW;
      const villaX = this.backgroundX + this.villaTileOffset;
      const villaCenterX = villaX + scaledWidth / 2;
      const screenCenterX = this.canvas.width / 2;

      if (villaCenterX <= screenCenterX) {
        // Transition to "arriving" — background stops, dog walks to couple
        this.gameState = "arriving";
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

        // Double ball chance — increases as spawn interval decreases
        // At maxSpawnInterval (2000ms): 0% chance
        // At minSpawnInterval (800ms or 0ms endless): up to 40% chance
        const maxInt = GAME_CONFIG.obstacles.maxSpawnInterval;
        const progress = Math.max(0, 1 - this.currentSpawnInterval / maxInt);
        const doubleChance = progress * 0.4;
        if (Math.random() < doubleChance) {
          // Schedule a second ball after a short delay (150-300ms)
          this.doubleSpawnTimer = 150 + Math.random() * 150;
        }

        this.obstacleTimer = 0;
        this.nextObstacleTime = this.getRandomSpawnTime();
      }

      // Handle delayed double spawn
      if (this.doubleSpawnTimer > 0) {
        this.doubleSpawnTimer -= deltaTime;
        if (this.doubleSpawnTimer <= 0) {
          this.spawnObstacle();
          this.doubleSpawnTimer = 0;
        }
      }
    }

    // Decrease spawn interval over time (frame independent)
    const minInterval = this.endless
      ? GAME_CONFIG.obstacles.endlessMinSpawnInterval
      : GAME_CONFIG.obstacles.minSpawnInterval;
    this.currentSpawnInterval = Math.max(
      minInterval,
      this.currentSpawnInterval - GAME_CONFIG.obstacles.intervalDecrement * normalizedDelta
    );

    // Increase speed over time (frame independent)
    const maxSpeed = this.endless
      ? (this.isMobile ? GAME_CONFIG.mobile.endlessMaxSpeed : GAME_CONFIG.obstacles.endlessMaxSpeed)
      : (this.isMobile ? GAME_CONFIG.mobile.maxSpeed : GAME_CONFIG.obstacles.maxSpeed);
    this.currentSpeed = Math.min(
      maxSpeed,
      this.currentSpeed + GAME_CONFIG.obstacles.speedIncrement * normalizedDelta
    );

    // Update score (frame independent)
    this.score += GAME_CONFIG.scoring.pointsPerFrame * normalizedDelta;

    // Update background scroll position
    // Background scrolls slower than obstacles for parallax effect
    this.backgroundX -= this.currentSpeed * normalizedDelta * GAME_CONFIG.background.scrollSpeed;

    // Check collisions
    for (const obstacle of this.obstacles) {
      if (checkCollision(this.dog.hitbox, obstacle.hitbox)) {
        this.endGame("gameover");
        break;
      }
    }
  }

  private endGame(result: "gameover" | "won"): void {
    this.gameState = result;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    this.onGameEnd?.(result, Math.floor(this.score));
  }

  private draw(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas with background color (fallback)
    this.ctx.fillStyle = COLORS.skyBlue;
    this.ctx.fillRect(0, 0, width, height);

    // Draw scrolling background
    if (this.bgScaled) {
      this.drawScrollingBackground(width, height);
    }

    // Draw couple sprite (Cal & Euge) — visible as soon as villa is triggered (scrolls in with it)
    if (this.villaTriggered && this.coupleLoaded && this.coupleImage) {
      this.drawCouple();
    }

    // Draw obstacles
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.ctx);
    }

    // Draw dog (in front)
    this.dog.draw(this.ctx);

    // Draw UI (score only when playing)
    this.drawUI();
  }

  private drawScrollingBackground(width: number, height: number): void {
    if (!this.bgScaled) return;

    const scaledWidth = this.scaledTileW;
    const scaledHeight = this.scaledTileH;

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
    // Using pre-scaled offscreen canvases — 1:1 blit, no per-frame scaling
    while (x < width + scaledWidth) {
      // Check if this tile position should be the villa (within 5px tolerance for floating point)
      const isVillaTile = this.villaTriggered &&
                          this.villaScaled &&
                          Math.abs(x - villaX) < 5;

      const tile = isVillaTile ? this.villaScaled! : this.bgScaled;
      this.ctx.drawImage(tile, Math.floor(x), yOffset);

      x += scaledWidth;
    }
  }


  private drawCouple(): void {
    if (!this.coupleImage) return;

    // Scale couple to 1.5x the dog's height
    const coupleHeight = this.dog.height * 1.5;
    const aspectRatio = this.coupleImage.width / this.coupleImage.height;
    const coupleWidth = coupleHeight * aspectRatio;

    // Draw couple on the ground, bottom-aligned with the dog
    const coupleY = this.groundY - coupleHeight;
    this.ctx.drawImage(
      this.coupleImage,
      this.coupleX, coupleY,
      coupleWidth, coupleHeight
    );
  }

  private drawUI(): void {
    const width = this.canvas.width;

    // Only show score/HI when actively playing or arriving
    if (this.gameState !== "playing" && this.gameState !== "arriving") return;

    // Scale font sizes based on canvas size
    const baseFontSize = Math.max(12, Math.min(24, width / 40));
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

    // Endless mode label
    if (this.endless) {
      this.ctx.font = `${tinyFontSize}px ${pixelFont}`;
      this.ctx.fillStyle = COLORS.orange;
      this.ctx.textAlign = "right";
      this.ctx.fillText("ENDLESS", width - 20, 80);
    }

    // FPS warning (only shown when below 60)
    if (this.fps > 0 && this.fps < 60) {
      this.ctx.font = `${tinyFontSize}px ${pixelFont}`;
      this.ctx.fillStyle = COLORS.orange;
      this.ctx.textAlign = "left";
      this.ctx.fillText(`FPS ${this.fps}`, 20, 40);
    }
  }

  private gameLoop = (timestamp: number): void => {
    const rawDelta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Clamp deltaTime to prevent huge jumps when the browser tab loses
    // focus, GC runs, or React re-renders cause a delayed frame.
    // Max ~3 frames at 60 FPS (50ms). Without this cap the background
    // scrolls a large distance in a single frame, causing a visible jump.
    const deltaTime = Math.min(rawDelta, 50);

    // FPS counter (update once per second)
    this.frameCount++;
    if (timestamp - this.fpsLastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsLastTime = timestamp;
    }

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
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
  }

  public resize(width: number, height: number): void {
    // Set canvas to fill the entire viewport
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Recalculate mobile detection
    this.isMobile = width < 600;
    const startX = this.isMobile ? GAME_CONFIG.mobile.startX : GAME_CONFIG.dog.startX;

    // Update dog scale and position
    this.dog.updateScale(width, this.groundY, startX);
  }
}
