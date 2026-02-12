import { DogState, Hitbox, Position, Velocity } from "../types";
import { COLORS, GAME_CONFIG } from "../constants";

export class Dog {
  public position: Position;
  public velocity: Velocity;
  public state: DogState;
  private animationFrame: number;
  private animationTimer: number;
  private groundY: number;
  private startX: number;

  // Sprite
  private sprite: HTMLImageElement | null = null;
  private spriteLoaded: boolean = false;

  // Sprite dimensions (310x960 total, four 310x240 frames stacked vertically)
  // Frame 0-2: Running, Frame 3: Jumping
  private readonly frameWidth: number = 310;
  private readonly frameHeight: number = 240;

  constructor(canvasWidth: number = GAME_CONFIG.canvas.width, groundY: number = GAME_CONFIG.physics.groundY) {
    this.groundY = groundY;
    this.startX = GAME_CONFIG.dog.startX;

    this.position = {
      x: this.startX,
      y: this.groundY - GAME_CONFIG.dog.height,
    };
    this.velocity = { vx: 0, vy: 0 };
    this.state = "running";
    this.animationFrame = 0;
    this.animationTimer = 0;

    // Load sprite
    this.loadSprite();
  }

  private loadSprite(): void {
    this.sprite = new Image();
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    };
    this.sprite.src = "/viszla.png";
  }

  updateScale(canvasWidth: number, groundY: number, startX?: number): void {
    this.groundY = groundY;
    if (startX !== undefined) {
      this.startX = startX;
      this.position.x = startX;
    }
    // Keep position consistent
    this.position.y = this.groundY - this.height;
  }

  get width(): number {
    return GAME_CONFIG.dog.width;
  }

  get height(): number {
    return GAME_CONFIG.dog.height;
  }

  get isOnGround(): boolean {
    return this.position.y >= this.groundY - this.height;
  }

  get hitbox(): Hitbox {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  jump(): void {
    if (this.isOnGround && this.state !== "jumping") {
      this.velocity.vy = GAME_CONFIG.physics.jumpVelocity;
      this.state = "jumping";
    }
  }

  update(deltaTime: number, normalizedDelta: number = 1): void {
    // Apply gravity
    this.velocity.vy += GAME_CONFIG.physics.gravity * normalizedDelta;
    this.position.y += this.velocity.vy * normalizedDelta;

    // Ground collision
    const groundY = this.groundY - this.height;
    if (this.position.y >= groundY) {
      this.position.y = groundY;
      this.velocity.vy = 0;

      // Return to running state if we were jumping
      if (this.state === "jumping") {
        this.state = "running";
      }
    }

    // Update animation (cycle through 3 running frames)
    this.animationTimer += deltaTime;
    if (this.animationTimer > 100) {
      this.animationFrame = (this.animationFrame + 1) % 3;
      this.animationTimer = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.spriteLoaded || !this.sprite) {
      // Fallback: draw orange rectangle while loading
      ctx.fillStyle = COLORS.orange;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      return;
    }

    // Determine which frame to use based on state
    let frameIndex: number;
    switch (this.state) {
      case "running":
        // Cycle through frames 0, 1, 2
        frameIndex = this.animationFrame;
        break;
      case "jumping":
        // Frame 3 for jumping
        frameIndex = 3;
        break;
      default:
        frameIndex = 0;
    }

    // Source Y position based on frame index
    const sourceY = frameIndex * this.frameHeight;

    // Draw the sprite scaled to the dog's dimensions
    ctx.drawImage(
      this.sprite,
      0, sourceY, this.frameWidth, this.frameHeight, // Source rect
      this.position.x, this.position.y, this.width, this.height // Destination rect
    );
  }

  reset(): void {
    this.position = {
      x: this.startX,
      y: this.groundY - GAME_CONFIG.dog.height,
    };
    this.velocity = { vx: 0, vy: 0 };
    this.state = "running";
    this.animationFrame = 0;
    this.animationTimer = 0;
  }
}
