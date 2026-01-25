import { Hitbox, ObstacleType, Position } from "../types";
import { COLORS, GAME_CONFIG } from "../constants";

export class Obstacle {
  public position: Position;
  public type: ObstacleType;
  public width: number;
  public height: number;
  public speed: number;
  private initialY: number; // Starting Y position for cosine wave
  private distanceTraveled: number; // Track distance for cosine wave calculation
  private canvasWidth: number; // Store canvas width for frequency calculation

  constructor(type: ObstacleType, speed: number, canvasWidth: number, groundY: number) {
    this.type = type;
    this.speed = speed;
    this.distanceTraveled = 0;
    this.canvasWidth = canvasWidth;

    if (type === "ground") {
      this.width = GAME_CONFIG.obstacles.ground.width;
      this.height = GAME_CONFIG.obstacles.ground.height;
      this.position = {
        x: canvasWidth,
        y: groundY - this.height,
      };
      this.initialY = this.position.y;
    } else {
      // Air obstacle
      this.width = GAME_CONFIG.obstacles.air.width;
      this.height = GAME_CONFIG.obstacles.air.height;
      
      // Start high up when entering the screen (will descend via cosine wave)
      const dogHeight = GAME_CONFIG.dog.height;
      const amplitude = GAME_CONFIG.obstacles.air.amplitude;
      
      // Bird starts at its highest point (will descend to dog level)
      // Center point is offset above dog's head
      const centerY = groundY - dogHeight - GAME_CONFIG.obstacles.air.centerOffset;
      const startY = centerY - amplitude; // Start amplitude above center
      
      this.position = {
        x: canvasWidth,
        y: startY,
      };
      this.initialY = centerY; // Center of the wave is offset
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

  update(normalizedDelta: number = 1): void {
    // Move obstacle horizontally
    const moveAmount = this.speed * normalizedDelta;
    this.position.x -= moveAmount;
    this.distanceTraveled += moveAmount;
    
    // Apply cosine wave motion to air obstacles
    if (this.type === "air") {
      // Cosine wave parameters
      // Bird should complete half a cosine wave from screen edge to dog position
      // Dog is at ~100px from left, so bird travels (canvasWidth - 100) pixels
      const travelDistance = this.canvasWidth - GAME_CONFIG.dog.startX;
      const frequency = Math.PI / travelDistance; // Half cosine wave across the travel distance
      const amplitude = GAME_CONFIG.obstacles.air.amplitude;
      
      // Cosine wave: starts at -amplitude (high), descends to +amplitude (low)
      // position.y = initialY - amplitude * cos(x)
      this.position.y = this.initialY - amplitude * Math.cos(this.distanceTraveled * frequency);
    }
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
      const textureWidth = 6;
      const textureMargin = 8;
      ctx.fillRect(
        this.position.x + textureMargin,
        this.position.y + textureMargin,
        textureWidth,
        this.height - textureMargin * 2
      );
      ctx.fillRect(
        this.position.x + this.width - textureMargin - textureWidth,
        this.position.y + textureMargin * 1.5,
        textureWidth,
        this.height - textureMargin * 2.5
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
      const wingExtension = 5;
      const wingHeight = 6;
      ctx.fillRect(
        this.position.x - wingExtension,
        this.position.y + this.height / 2 - wingHeight / 2,
        this.width + wingExtension * 2,
        wingHeight
      );
    }
  }
}
