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

    // Preload font before starting game
    const preloadFont = async () => {
      try {
        await document.fonts.load('12px "Press Start 2P"');
        console.log('Font loaded successfully');
      } catch (error) {
        console.warn('Font loading failed, continuing anyway:', error);
      }
    };

    const initGame = async () => {
      await preloadFont();

      // Get initial container size
      const { width, height } = container.getBoundingClientRect();
      
      // Initialize canvas size to container size
      canvas.width = width;
      canvas.height = height;

      // Create game engine
      gameRef.current = new GameEngine(canvas);

      // Handle resize
      const handleResize = () => {
        if (gameRef.current && container) {
          const { width, height } = container.getBoundingClientRect();
          gameRef.current.resize(width, height);
        }
      };

      // Initial resize (in case size changed)
      handleResize();
      window.addEventListener("resize", handleResize);

      // Start game loop
      gameRef.current.start();
      setIsLoaded(true);
    };

    initGame();

    return () => {
      window.removeEventListener("resize", () => {});
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-sky-blue"
    >
      <canvas
        ref={canvasRef}
        className={`
          w-full h-full
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
