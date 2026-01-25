import { DogState, Hitbox, Position, Velocity } from "../types";
import { COLORS, GAME_CONFIG } from "../constants";

export class Dog {
  public position: Position;
  public velocity: Velocity;
  public state: DogState;
  private animationFrame: number;
  private animationTimer: number;
  private groundY: number;
  
  // Sprite
  private sprite: HTMLImageElement | null = null;
  private spriteLoaded: boolean = false;
  
  // Sprite dimensions (64x256 total, four 64x64 frames stacked vertically)
  // Frame 0: Running 1, Frame 1: Running 2, Frame 2: Jumping, Frame 3: Ducking
  private readonly frameWidth: number = 64;
  private readonly frameHeight: number = 64;

  constructor(canvasWidth: number = GAME_CONFIG.canvas.width, groundY: number = GAME_CONFIG.physics.groundY) {
    this.groundY = groundY;
    
    this.position = {
      x: GAME_CONFIG.dog.startX,
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
    this.sprite.src = "/viz_running.png";
  }

  updateScale(canvasWidth: number, groundY: number): void {
    this.groundY = groundY;
    // Keep position consistent
    this.position.y = this.groundY - this.height;
  }

  get width(): number {
    return this.state === "ducking"
      ? GAME_CONFIG.dog.duckWidth
      : GAME_CONFIG.dog.width;
  }

  get height(): number {
    return this.state === "ducking"
      ? GAME_CONFIG.dog.duckHeight
      : GAME_CONFIG.dog.height;
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

  duck(isDucking: boolean): void {
    if (isDucking) {
      if (this.state === "jumping") {
        // Fast fall when ducking in air
        this.velocity.vy = Math.max(this.velocity.vy, 8);
      } else if (this.isOnGround) {
        this.state = "ducking";
        // Adjust Y position so dog stays on ground when ducking
        this.position.y = this.groundY - this.height;
      }
    } else if (this.state === "ducking" && this.isOnGround) {
      this.state = "running";
      // Adjust Y position back when standing
      this.position.y = this.groundY - this.height;
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

    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer > 100) {
      this.animationFrame = (this.animationFrame + 1) % 2;
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
        // Alternate between frames 0 and 1
        frameIndex = this.animationFrame;
        break;
      case "jumping":
        // Frame 2 for jumping
        frameIndex = 2;
        break;
      case "ducking":
        // Frame 3 for ducking
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
      x: GAME_CONFIG.dog.startX,
      y: this.groundY - GAME_CONFIG.dog.height,
    };
    this.velocity = { vx: 0, vy: 0 };
    this.state = "running";
    this.animationFrame = 0;
    this.animationTimer = 0;
  }
}
