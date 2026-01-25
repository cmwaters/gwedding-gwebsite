import { DogState, Hitbox, Position, Velocity } from "../types";
import { COLORS, GAME_CONFIG } from "../constants";

export class Dog {
  public position: Position;
  public velocity: Velocity;
  public state: DogState;
  private animationFrame: number;
  private animationTimer: number;

  constructor() {
    this.position = {
      x: GAME_CONFIG.dog.startX,
      y: GAME_CONFIG.physics.groundY - GAME_CONFIG.dog.height,
    };
    this.velocity = { vx: 0, vy: 0 };
    this.state = "running";
    this.animationFrame = 0;
    this.animationTimer = 0;
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
    return this.position.y >= GAME_CONFIG.physics.groundY - this.height;
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
        this.position.y = GAME_CONFIG.physics.groundY - this.height;
      }
    } else if (this.state === "ducking" && this.isOnGround) {
      this.state = "running";
      // Adjust Y position back when standing
      this.position.y = GAME_CONFIG.physics.groundY - this.height;
    }
  }

  update(deltaTime: number): void {
    // Apply gravity
    this.velocity.vy += GAME_CONFIG.physics.gravity;
    this.position.y += this.velocity.vy;

    // Ground collision
    const groundY = GAME_CONFIG.physics.groundY - this.height;
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
    ctx.fillStyle = COLORS.orange;

    // Draw based on state
    if (this.state === "ducking") {
      // Wider, shorter rectangle for ducking
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    } else {
      // Normal body
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );

      // Simple leg animation (two frames)
      const legWidth = 8;
      const legHeight = 10;
      const legY = this.position.y + this.height;

      if (this.state === "running") {
        if (this.animationFrame === 0) {
          // Frame 1: legs apart
          ctx.fillRect(this.position.x + 10, legY - 5, legWidth, legHeight);
          ctx.fillRect(
            this.position.x + this.width - 18,
            legY - 5,
            legWidth,
            legHeight
          );
        } else {
          // Frame 2: legs together
          ctx.fillRect(this.position.x + 15, legY - 5, legWidth, legHeight);
          ctx.fillRect(
            this.position.x + this.width - 23,
            legY - 5,
            legWidth,
            legHeight
          );
        }
      } else if (this.state === "jumping") {
        // Legs tucked when jumping
        ctx.fillRect(this.position.x + 12, legY - 8, legWidth, 6);
        ctx.fillRect(this.position.x + this.width - 20, legY - 8, legWidth, 6);
      }

      // Simple eye
      ctx.fillStyle = COLORS.charcoal;
      ctx.fillRect(this.position.x + this.width - 12, this.position.y + 8, 5, 5);
    }
  }

  reset(): void {
    this.position = {
      x: GAME_CONFIG.dog.startX,
      y: GAME_CONFIG.physics.groundY - GAME_CONFIG.dog.height,
    };
    this.velocity = { vx: 0, vy: 0 };
    this.state = "running";
    this.animationFrame = 0;
    this.animationTimer = 0;
  }
}
