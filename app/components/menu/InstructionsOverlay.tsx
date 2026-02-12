"use client";

import { useEffect } from "react";
import { useLanguage } from "@/app/i18n";
import { GameCanvasHandle } from "../game/GameCanvas";

interface InstructionsOverlayProps {
  gameRef: React.RefObject<GameCanvasHandle | null>;
  onStart: () => void;
}

export default function InstructionsOverlay({ gameRef, onStart }: InstructionsOverlayProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        gameRef.current?.startGame();
        onStart();
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      gameRef.current?.startGame();
      onStart();
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("touchstart", handleTouch, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("touchstart", handleTouch);
    };
  }, [gameRef, onStart]);

  return (
    <div className="absolute inset-0 z-20 bg-cornflower/70 flex flex-col items-center justify-center p-6 sm:p-8 animate-fade-in">
      <h2 className="text-amber text-base sm:text-lg" style={{ marginBottom: '1.5rem' }}>
        {t("howToPlay")}
      </h2>
      <p className="text-cream text-xs sm:text-sm leading-relaxed" style={{ marginBottom: '0.75rem' }}>
        {t("helpLukeReach")}
      </p>
      <p className="text-cream text-xs sm:text-sm leading-relaxed" style={{ marginBottom: '1.75rem' }}>
        {t("villaBettoni")}
      </p>
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p className="text-cream text-xs sm:text-sm opacity-80">
          {t("spaceUpJump")}
        </p>
        <p className="text-cream text-xs sm:text-sm opacity-80">
          {t("tapJumpMobile")}
        </p>
      </div>
      <p className="text-amber text-xs sm:text-sm animate-blink">
        {t("pressSpaceOrTap")}
      </p>
    </div>
  );
}
