"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/app/i18n";
import MenuItem from "./MenuItem";

interface GameResultOverlayProps {
  result: "gameover" | "won";
  score: number;
  isEndless: boolean;
  onRestart: () => void;
  onMenu: () => void;
  onEndless: () => void;
}

export default function GameResultOverlay({ result, score, isEndless, onRestart, onMenu, onEndless }: GameResultOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useLanguage();

  const actions = [onRestart, onMenu, onEndless];
  const menuCount = actions.length;

  // Reset selection when overlay mounts
  useEffect(() => {
    setSelectedIndex(0);
  }, [result]);

  const handleSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      actions[index]();
    },
    [onRestart, onMenu, onEndless]
  );

  // Arrow key / enter navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev <= 0 ? menuCount - 1 : prev - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev >= menuCount - 1 ? 0 : prev + 1));
          break;
        case "Enter":
        case "Space":
          e.preventDefault();
          handleSelect(selectedIndex);
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, handleSelect, menuCount]);

  return (
    <div className="absolute inset-0 z-20 bg-cornflower/70 flex flex-col items-center justify-center p-6 sm:p-8 animate-fade-in">
      <h2 className="text-amber text-base sm:text-lg" style={{ marginBottom: '1.5rem' }}>
        {isEndless
          ? t("endlessGameOver")
          : result === "won"
            ? t("youMadeIt")
            : t("gameOver")
        }
      </h2>
      {result === "won" && !isEndless && (
        <p className="text-cream text-xs sm:text-sm leading-relaxed" style={{ marginBottom: '1rem' }}>
          {t("lukeReachedVilla")}
        </p>
      )}
      <p className="text-cream text-xs sm:text-sm" style={{ marginBottom: '1.75rem' }}>
        {t("score")}: {score}
      </p>
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p className="text-cream text-xs sm:text-sm opacity-80">
          {t("spaceUpJump")}
        </p>
        <p className="text-cream text-xs sm:text-sm opacity-80">
          {t("tapJumpMobile")}
        </p>
      </div>
      <nav className="w-full max-w-sm">
        <MenuItem
          label={t("retry")}
          isSelected={selectedIndex === 0}
          onClick={() => handleSelect(0)}
        />
        <MenuItem
          label={t("menu")}
          isSelected={selectedIndex === 1}
          onClick={() => handleSelect(1)}
        />
        <MenuItem
          label={t("endless")}
          isSelected={selectedIndex === 2}
          onClick={() => handleSelect(2)}
        />
      </nav>
      <p className="text-cream/60 text-xs sm:text-sm text-center" style={{ marginTop: '1.5rem' }}>
        {t("menuFooter")}
      </p>
    </div>
  );
}
