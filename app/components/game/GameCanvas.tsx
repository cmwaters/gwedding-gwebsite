"use client";

import { useEffect, useRef, useState } from "react";
import { GameEngine } from "./GameEngine";
import { GAME_CONFIG } from "./constants";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize canvas size
    canvas.width = GAME_CONFIG.canvas.width;
    canvas.height = GAME_CONFIG.canvas.height;

    // Create game engine
    gameRef.current = new GameEngine(canvas);

    // Handle resize
    const handleResize = () => {
      if (gameRef.current && container) {
        const { width, height } = container.getBoundingClientRect();
        gameRef.current.resize(width, height);
      }
    };

    // Initial resize
    handleResize();
    window.addEventListener("resize", handleResize);

    // Start game loop
    gameRef.current.start();
    setIsLoaded(true);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-retro-cream"
    >
      <canvas
        ref={canvasRef}
        className={`
          border-4 border-charcoal rounded-lg shadow-lg
          transition-opacity duration-300
          ${isLoaded ? "opacity-100" : "opacity-0"}
        `}
        style={{
          imageRendering: "pixelated",
          touchAction: "none",
        }}
      />
    </div>
  );
}
