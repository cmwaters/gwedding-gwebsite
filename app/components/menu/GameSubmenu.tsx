"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/app/i18n";
import MenuItem from "./MenuItem";
import LeaderboardPanel from "./panels/LeaderboardPanel";

export interface GameResult {
  type: "gameover" | "won";
  score: number;
  wasEndless: boolean;
  scoreSubmitted: boolean;
}

interface GameSubmenuProps {
  gameResult: GameResult | null;
  onStartNormal: () => void;
  onStartEndless: () => void;
  onMenu: () => void;
}

export default function GameSubmenu({
  gameResult,
  onStartNormal,
  onStartEndless,
  onMenu,
}: GameSubmenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [subView, setSubView] = useState<"menu" | "leaderboard">("menu");
  const { t } = useLanguage();

  const menuActions = [onStartNormal, onStartEndless, () => setSubView("leaderboard"), onMenu];
  const menuCount = menuActions.length;

  // Reset selection when game result changes (new game ended) or component mounts
  useEffect(() => {
    setSelectedIndex(0);
    setSubView("menu");
  }, [gameResult]);

  const handleSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      menuActions[index]();
    },
    [onStartNormal, onStartEndless, onMenu]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // If viewing leaderboard, ESC/Backspace goes back to menu view
      if (subView === "leaderboard") {
        if (e.code === "Escape" || e.code === "Backspace") {
          e.preventDefault();
          setSubView("menu");
        }
        return; // Let leaderboard handle its own scrolling
      }

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
        case "Escape":
        case "Backspace":
          e.preventDefault();
          onMenu();
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, handleSelect, menuCount, subView, onMenu]);

  // Leaderboard sub-view
  if (subView === "leaderboard") {
    return (
      <div className="absolute inset-0 z-20 bg-cornflower/70 flex flex-col items-center overflow-y-auto p-6 sm:p-8 animate-fade-in">
        <div className="w-full max-w-sm" style={{ marginTop: '2rem' }}>
          <h2 className="text-amber text-base sm:text-lg text-center" style={{ marginBottom: '1.5rem' }}>
            {t("panelLeaderboard")}
          </h2>
          <LeaderboardPanel />
          <button
            onClick={() => setSubView("menu")}
            className="text-cream text-xs sm:text-sm hover:text-amber transition-colors cursor-pointer bg-transparent border-none min-h-[44px] flex items-center justify-center w-full"
            style={{ marginTop: '1.5rem' }}
          >
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  // Menu view (pre-game or post-game)
  return (
    <div className="absolute inset-0 z-20 bg-cornflower/70 flex flex-col items-center justify-center p-6 sm:p-8 animate-fade-in">
      {/* Game result header (only shown after a game) */}
      {gameResult && (
        <>
          <h2 className="text-amber text-base sm:text-lg" style={{ marginBottom: '1.5rem' }}>
            {gameResult.wasEndless
              ? t("endlessGameOver")
              : gameResult.type === "won"
                ? t("youMadeIt")
                : t("gameOver")
            }
          </h2>
          {gameResult.type === "won" && !gameResult.wasEndless && (
            <p className="text-cream text-xs sm:text-sm leading-relaxed" style={{ marginBottom: '1rem' }}>
              {t("lukeReachedVilla")}
            </p>
          )}
          <p className="text-cream text-xs sm:text-sm" style={{ marginBottom: gameResult.scoreSubmitted ? '0.5rem' : '1.75rem' }}>
            {t("score")}: {gameResult.score}
          </p>
          {gameResult.scoreSubmitted && (
            <p className="text-amber/60 text-[10px] sm:text-xs" style={{ marginBottom: '1.25rem' }}>
              {t("scoreSubmitted")}
            </p>
          )}
        </>
      )}

      {/* Instructions (always shown) */}
      {!gameResult && (
        <>
          <h2 className="text-amber text-base sm:text-lg" style={{ marginBottom: '1.5rem' }}>
            {t("howToPlay")}
          </h2>
          <p className="text-cream text-xs sm:text-sm leading-relaxed" style={{ marginBottom: '0.75rem' }}>
            {t("helpLukeReach")}
          </p>
          <p className="text-cream text-xs sm:text-sm leading-relaxed" style={{ marginBottom: '1.75rem' }}>
            {t("villaBettoni")}
          </p>
        </>
      )}

      {/* Controls hint */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p className="text-cream text-xs sm:text-sm opacity-80">
          {t("spaceUpJump")}
        </p>
        <p className="text-cream text-xs sm:text-sm opacity-80">
          {t("tapJumpMobile")}
        </p>
      </div>

      {/* Menu items */}
      <nav className="w-full max-w-sm">
        <MenuItem
          label={t("start")}
          isSelected={selectedIndex === 0}
          onClick={() => handleSelect(0)}
        />
        <MenuItem
          label={t("endless")}
          isSelected={selectedIndex === 1}
          onClick={() => handleSelect(1)}
        />
        <MenuItem
          label={t("menuLeaderboard")}
          isSelected={selectedIndex === 2}
          onClick={() => handleSelect(2)}
        />
        <MenuItem
          label={t("menu")}
          isSelected={selectedIndex === 3}
          onClick={() => handleSelect(3)}
        />
      </nav>

      {/* Footer hint */}
      <p className="text-cream/60 text-xs sm:text-sm text-center" style={{ marginTop: '1.5rem' }}>
        {t("menuFooter")}
      </p>
    </div>
  );
}
