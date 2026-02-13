"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Screen } from "../config";
import { useLanguage } from "../i18n";
import { useGuests } from "../context/GuestContext";
import { aggregateGuestNames } from "../lib/guestUtils";
import RetroMenu from "./menu/RetroMenu";
import GameSubmenu, { GameResult } from "./menu/GameSubmenu";
import GameCanvas, { GameCanvasHandle } from "./game/GameCanvas";
import RetroPanel from "./menu/RetroPanel";
import SchedulePanel from "./menu/panels/SchedulePanel";
import TravelPanel from "./menu/panels/TravelPanel";
import RsvpPanel from "./menu/panels/RsvpPanel";
import InfoPanel from "./menu/panels/InfoPanel";
import GalleryPanel from "./menu/panels/GalleryPanel";

export default function HomeContent() {
  const { t } = useLanguage();
  const guestGroup = useGuests();
  const [screen, setScreen] = useState<Screen>("menu");
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const isEndlessRef = useRef(false);
  const gameRef = useRef<GameCanvasHandle>(null);

  // Aggregated group name for leaderboard (null for anonymous visitors)
  const groupName = useMemo(
    () => (guestGroup ? aggregateGuestNames(guestGroup.guests) : null),
    [guestGroup]
  );

  const panelConfig: Record<string, { title: string; content: React.ReactNode }> = {
    schedule: { title: t("panelSchedule"), content: <SchedulePanel /> },
    travel: { title: t("panelTravelStay"), content: <TravelPanel /> },
    rsvp: { title: t("panelRsvp"), content: <RsvpPanel /> },
    info: { title: t("panelInfo"), content: <InfoPanel /> },
    gallery: { title: t("panelGallery"), content: <GalleryPanel /> },
  };

  const handleGameEnd = useCallback(
    (result: "gameover" | "won", score: number) => {
      const submitted = groupName !== null && score > 0;

      // Submit score to leaderboard (fire-and-forget)
      if (submitted) {
        fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupName, score }),
        }).catch((err) => console.error("Score submit failed:", err));
      }

      setGameResult({
        type: result,
        score,
        wasEndless: isEndlessRef.current,
        scoreSubmitted: submitted,
      });
      setScreen("game-submenu");
    },
    [groupName]
  );

  const handleMenuSelect = useCallback((selected: Screen) => {
    setScreen(selected);
  }, []);

  const handleStartNormal = useCallback(() => {
    isEndlessRef.current = false;
    setGameResult(null);
    gameRef.current?.startGame();
    setScreen("playing");
  }, []);

  const handleStartEndless = useCallback(() => {
    isEndlessRef.current = true;
    setGameResult(null);
    gameRef.current?.startEndless();
    setScreen("playing");
  }, []);

  const handleBackToMenu = useCallback(() => {
    isEndlessRef.current = false;
    setGameResult(null);
    gameRef.current?.returnToIdle();
    setScreen("menu");
  }, []);

  // ESC key — return to menu from content panels (not playing or game-submenu)
  useEffect(() => {
    if (screen === "playing" || screen === "menu" || screen === "game-submenu") return;

    const handleBack = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.code === "Escape" || e.code === "Backspace") {
        e.preventDefault();
        setScreen("menu");
      }
    };

    window.addEventListener("keydown", handleBack);
    return () => window.removeEventListener("keydown", handleBack);
  }, [screen]);

  const panel = panelConfig[screen] ?? null;

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Game canvas — always mounted */}
      <div className="absolute inset-0">
        <GameCanvas ref={gameRef} onGameEnd={handleGameEnd} />
      </div>

      {/* Menu */}
      {screen === "menu" && (
        <div className="absolute inset-0 z-20">
          <RetroMenu onSelect={handleMenuSelect} />
        </div>
      )}

      {/* Game Submenu (pre-game instructions + post-game results) */}
      {screen === "game-submenu" && (
        <GameSubmenu
          gameResult={gameResult}
          onStartNormal={handleStartNormal}
          onStartEndless={handleStartEndless}
          onMenu={handleBackToMenu}
        />
      )}

      {/* Content panels */}
      {panel && (
        <div className="absolute inset-0 z-20">
          <RetroPanel title={panel.title} onBack={() => setScreen("menu")}>
            {panel.content}
          </RetroPanel>
        </div>
      )}
    </main>
  );
}
