import { Hitbox, ObstacleType, Position } from "../types";
import { GAME_CONFIG } from "../constants";

// Shared sprite across all Obstacle instances
let sharedSprite: HTMLImageElement | null = null;
let spriteLoaded = false;

function loadSharedSprite(): HTMLImageElement {
  if (!sharedSprite) {
    sharedSprite = new Image();
    sharedSprite.onload = () => {
      spriteLoaded = true;
    };
    sharedSprite.src = "/soccer_ball.png";
  }
  return sharedSprite;
}

export class Obstacle {
  public position: Position;
  public type: ObstacleType;
  public speed: number;
  private radius: number;
  private groundY: number;
  private distanceTraveled: number;
  private canvasWidth: number;
  private peakHeight: number;
  private bounceCount: number;
  private rotation: number; // Ball spin
  private sprite: HTMLImageElement;

  constructor(type: ObstacleType, speed: number, canvasWidth: number, groundY: number, dogX: number) {
    this.type = type;
    this.speed = speed;
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;
    this.radius = GAME_CONFIG.obstacles.ballRadius;
    this.rotation = 0;
    this.sprite = loadSharedSprite();

    const config = type === "low"
      ? GAME_CONFIG.obstacles.lowArc
      : GAME_CONFIG.obstacles.highArc;

    this.peakHeight = config.peakHeight;
    this.bounceCount = config.bounceCount;

    // Calculate phase offset so a bounce peak aligns with the dog's X position.
    // The ball spawns at x = canvasWidth and travels left. When it reaches dogX
    // it will have traveled (canvasWidth - dogX) pixels.
    //
    // bounce = |sin(distanceTraveled * frequency)|
    // frequency = (bounceCount * PI) / totalTravel
    // Peaks of |sin| occur at PI/2 + n*PI.
    //
    // For low arcs (peakHeight 50): ball rolls along the ground at the dog
    //   → trough at dog position, the dog must jump over it.
    // For high arcs (peakHeight 150): ball is at peak height over the dog
    //   → peak at dog position, safe if you stay on the ground, hit if you jump.
    const totalTravel = canvasWidth + 100;
    const frequency = (this.bounceCount * Math.PI) / totalTravel;
    const distAtDog = canvasWidth - dogX;
    const period = Math.PI / frequency; // half-period of |sin|

    if (type === "low") {
      // Put a trough (ground level) at the dog position
      const rawOffset = -distAtDog;
      this.distanceTraveled = ((rawOffset % period) + period) % period;
    } else {
      // High arc: put a peak (max height) at the dog position
      const rawOffset = (Math.PI / 2) / frequency - distAtDog;
      this.distanceTraveled = ((rawOffset % period) + period) % period;
    }

    this.position = {
      x: canvasWidth,
      y: groundY - this.radius, // Will be corrected on first update
    };
  }

  get width(): number {
    return this.radius * 2;
  }

  get height(): number {
    return this.radius * 2;
  }

  get hitbox(): Hitbox {
    return {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  get isOffScreen(): boolean {
    return this.position.x < -100;
  }

  update(normalizedDelta: number = 1): void {
    const moveAmount = this.speed * normalizedDelta;
    this.position.x -= moveAmount;
    this.distanceTraveled += moveAmount;

    // Spin the ball (proportional to speed)
    this.rotation -= 0.15 * normalizedDelta;

    // Bouncing arc using |sin(x)|
    // The ball completes bounceCount full bounces across the screen width
    const totalTravel = this.canvasWidth + 100; // total distance ball travels
    const frequency = (this.bounceCount * Math.PI) / totalTravel;
    const bounce = Math.abs(Math.sin(this.distanceTraveled * frequency));

    // Y position: ground level minus the bounce height
    this.position.y = this.groundY - this.radius - bounce * this.peakHeight;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    const size = this.radius * 2;

    if (spriteLoaded && this.sprite.complete) {
      // Draw the soccer ball sprite, centered on position
      ctx.drawImage(
        this.sprite,
        -this.radius, -this.radius,
        size, size
      );
    } else {
      // Fallback: simple circle while image loads
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = "#2D2D2D";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}
