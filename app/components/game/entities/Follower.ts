import { DogState, Hitbox, Position } from "../types";
import { COLORS, GAME_CONFIG } from "../constants";

interface RecordedFrame {
  position: Position;
  state: DogState;
  timestamp: number;
}

export class Follower {
  public position: Position;
  public state: DogState;
  private animationFrame: number;
  private animationTimer: number;
  private groundY: number;
  private recordedFrames: RecordedFrame[] = [];

  // Person dimensions (taller and narrower than dog)
  private readonly width: number = 30;
  private readonly height: number = 60;
  private readonly duckWidth: number = 40;
  private readonly duckHeight: number = 35;

  constructor(canvasWidth: number, groundY: number) {
    this.groundY = groundY;
    
    this.position = {
      x: GAME_CONFIG.dog.startX + GAME_CONFIG.follower.offsetX,
      y: this.groundY - this.height,
    };
    this.state = "running";
    this.animationFrame = 0;
    this.animationTimer = 0;
  }

  get currentWidth(): number {
    return this.state === "ducking" ? this.duckWidth : this.width;
  }

  get currentHeight(): number {
    return this.state === "ducking" ? this.duckHeight : this.height;
  }

  get hitbox(): Hitbox {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.currentWidth,
      height: this.currentHeight,
    };
  }

  // Record a frame from the dog
  recordFrame(position: Position, state: DogState, timestamp: number): void {
    this.recordedFrames.push({
      position: { ...position },
      state,
      timestamp,
    });

    // Keep only the last 5 seconds of recording
    const cutoffTime = timestamp - 5000;
    this.recordedFrames = this.recordedFrames.filter(
      (frame) => frame.timestamp > cutoffTime
    );
  }

  // Update follower position based on recorded frames
  update(deltaTime: number, currentTimestamp: number): void {
    // Find the frame that should be played back (with delay)
    const playbackTime = currentTimestamp - GAME_CONFIG.follower.delay;
    
    // Find the closest recorded frame to playback time
    let closestFrame: RecordedFrame | null = null;
    let minDiff = Infinity;

    for (const frame of this.recordedFrames) {
      const diff = Math.abs(frame.timestamp - playbackTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestFrame = frame;
      }
    }

    if (closestFrame) {
      this.state = closestFrame.state;
      
      // Simple position copy with horizontal offset and height adjustment
      this.position.x = closestFrame.position.x + GAME_CONFIG.follower.offsetX;
      this.position.y = closestFrame.position.y + (GAME_CONFIG.dog.height - this.currentHeight);
    }

    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer > 100) {
      this.animationFrame = (this.animationFrame + 1) % 2;
      this.animationTimer = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw with a different color to distinguish from the dog
    ctx.fillStyle = COLORS.forgetMeNot;

    // Draw based on state
    if (this.state === "ducking") {
      // Wider, shorter rectangle for ducking person
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.currentWidth,
        this.currentHeight
      );
    } else {
      // Tall narrow body for person
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.currentWidth,
        this.currentHeight
      );

      // Simple leg animation (two frames) - scaled for person
      const legWidth = 6;
      const legHeight = 12;
      const legY = this.position.y + this.currentHeight;

      if (this.state === "running") {
        if (this.animationFrame === 0) {
          // Frame 1: legs apart
          ctx.fillRect(this.position.x + 6, legY - 5, legWidth, legHeight);
          ctx.fillRect(
            this.position.x + this.currentWidth - 12,
            legY - 5,
            legWidth,
            legHeight
          );
        } else {
          // Frame 2: legs together
          ctx.fillRect(this.position.x + 9, legY - 5, legWidth, legHeight);
          ctx.fillRect(
            this.position.x + this.currentWidth - 15,
            legY - 5,
            legWidth,
            legHeight
          );
        }
      } else if (this.state === "jumping") {
        // Legs tucked when jumping
        ctx.fillRect(this.position.x + 8, legY - 8, legWidth, 6);
        ctx.fillRect(this.position.x + this.currentWidth - 14, legY - 8, legWidth, 6);
      }

      // Simple head/face
      ctx.fillStyle = COLORS.charcoal;
      ctx.fillRect(this.position.x + this.currentWidth / 2 - 2, this.position.y + 5, 4, 4);
    }
  }

  reset(): void {
    this.position = {
      x: GAME_CONFIG.dog.startX + GAME_CONFIG.follower.offsetX,
      y: this.groundY - this.height,
    };
    this.state = "running";
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.recordedFrames = [];
  }

  updateScale(groundY: number): void {
    this.groundY = groundY;
  }
}
