"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { GameEngine } from "./GameEngine";

export interface GameCanvasHandle {
  startGame: () => void;
  startEndless: () => void;
  returnToIdle: () => void;
}

interface GameCanvasProps {
  onGameEnd?: (result: "gameover" | "won", score: number) => void;
}

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  function GameCanvas({ onGameEnd }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<GameEngine | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Expose startGame and returnToIdle to parent via ref
    useImperativeHandle(ref, () => ({
      startGame: () => {
        gameRef.current?.startGame("normal");
      },
      startEndless: () => {
        gameRef.current?.startGame("endless");
      },
      returnToIdle: () => {
        gameRef.current?.returnToIdle();
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Preload font before starting game
      const preloadFont = async () => {
        try {
          await document.fonts.load('12px "Press Start 2P"');
          console.log("Font loaded successfully");
        } catch (error) {
          console.warn("Font loading failed, continuing anyway:", error);
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
        const engine = new GameEngine(canvas);
        gameRef.current = engine;

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

        // Wire up callback before starting
        engine.onGameEnd = onGameEnd ?? null;

        // Start game loop (renders idle state — background + dog)
        engine.start();
        setIsLoaded(true);

        // Store handleResize for cleanup
        (container as unknown as Record<string, () => void>).__handleResize = handleResize;
      };

      initGame();

      return () => {
        const storedResize = (container as unknown as Record<string, () => void>).__handleResize;
        if (storedResize) {
          window.removeEventListener("resize", storedResize);
        }
        if (gameRef.current) {
          gameRef.current.destroy();
        }
      };
    }, []);

    // Wire up onGameEnd callback whenever it changes
    useEffect(() => {
      if (gameRef.current) {
        gameRef.current.onGameEnd = onGameEnd ?? null;
      }
    }, [onGameEnd]);

    return (
      <div ref={containerRef} className="w-full h-full bg-sky-blue">
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
);

export default GameCanvas;
