import { Hitbox, ObstacleType, Position } from "../types";
import { COLORS, GAME_CONFIG } from "../constants";

export class Obstacle {
  public position: Position;
  public type: ObstacleType;
  public width: number;
  public height: number;
  public speed: number;

  constructor(type: ObstacleType, speed: number) {
    this.type = type;
    this.speed = speed;

    if (type === "ground") {
      this.width = GAME_CONFIG.obstacles.ground.width;
      this.height = GAME_CONFIG.obstacles.ground.height;
      this.position = {
        x: GAME_CONFIG.canvas.width,
        y: GAME_CONFIG.physics.groundY - this.height,
      };
    } else {
      // Air obstacle
      this.width = GAME_CONFIG.obstacles.air.width;
      this.height = GAME_CONFIG.obstacles.air.height;
      // Random Y position for air obstacles
      const minY = GAME_CONFIG.obstacles.air.minY;
      const maxY = GAME_CONFIG.obstacles.air.maxY;
      this.position = {
        x: GAME_CONFIG.canvas.width,
        y: minY + Math.random() * (maxY - minY),
      };
    }
  }

  get hitbox(): Hitbox {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  get isOffScreen(): boolean {
    return this.position.x < -100;
  }

  update(): void {
    this.position.x -= this.speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS.charcoal;

    if (this.type === "ground") {
      // Draw a simple cactus-like shape
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
      // Add some texture
      ctx.fillStyle = COLORS.retroCream;
      ctx.fillRect(
        this.position.x + 8,
        this.position.y + 8,
        6,
        this.height - 16
      );
      ctx.fillRect(
        this.position.x + this.width - 14,
        this.position.y + 12,
        6,
        this.height - 20
      );
    } else {
      // Draw a bird-like shape for air obstacles
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
      // Wings
      ctx.fillRect(
        this.position.x - 5,
        this.position.y + this.height / 2 - 3,
        this.width + 10,
        6
      );
    }
  }
}
