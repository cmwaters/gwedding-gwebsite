"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "square" | "circle" | "strip";
}

const COLORS = [
  "#FF9F1C", // amber
  "#FF6B6B", // coral
  "#4ECDC4", // teal
  "#FFE66D", // yellow
  "#A855F7", // purple
  "#3B82F6", // blue
  "#EC4899", // pink
  "#22C55E", // green
  "#F97316", // orange
  "#06B6D4", // cyan
];

const PARTICLE_COUNT = 150;
const DURATION = 8000; // ms

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles — burst from top center area
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const shapes: Particle["shape"][] = ["square", "circle", "strip"];
      particles.push({
        x: canvas.width * (0.3 + Math.random() * 0.4),
        y: -10 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    const startTime = performance.now();
    let animFrame: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Physics
        p.vy += 0.06; // gentle gravity
        p.vx *= 0.998; // light air resistance
        p.vx += (Math.random() - 0.5) * 0.15; // slight drift
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out in the last 30%
        if (progress > 0.7) {
          p.opacity = Math.max(0, 1 - (progress - 0.7) / 0.3);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "square") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // strip — elongated rectangle
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2.5);
        }

        ctx.restore();
      }

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      }
    };

    animFrame = requestAnimationFrame(animate);

    // Auto-cleanup after duration
    const timeout = setTimeout(() => {
      cancelAnimationFrame(animFrame);
    }, DURATION + 100);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timeout);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    />
  );
}
