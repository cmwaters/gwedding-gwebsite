"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Screen } from "../config";
import { useLanguage } from "../i18n";
import RetroMenu from "./menu/RetroMenu";
import InstructionsOverlay from "./menu/InstructionsOverlay";
import GameResultOverlay from "./menu/GameResultOverlay";
import GameCanvas, { GameCanvasHandle } from "./game/GameCanvas";
import RetroPanel from "./menu/RetroPanel";
import SchedulePanel from "./menu/panels/SchedulePanel";
import TravelPanel from "./menu/panels/TravelPanel";
import RsvpPanel from "./menu/panels/RsvpPanel";
import InfoPanel from "./menu/panels/InfoPanel";
import GalleryPanel from "./menu/panels/GalleryPanel";

export default function HomeContent() {
  const { t } = useLanguage();
  const [screen, setScreen] = useState<Screen>("menu");
  const [lastScore, setLastScore] = useState(0);
  const [isEndless, setIsEndless] = useState(false);
  const gameRef = useRef<GameCanvasHandle>(null);

  const panelConfig: Record<string, { title: string; content: React.ReactNode }> = {
    schedule: { title: t("panelSchedule"), content: <SchedulePanel /> },
    travel: { title: t("panelTravelStay"), content: <TravelPanel /> },
    rsvp: { title: t("panelRsvp"), content: <RsvpPanel /> },
    info: { title: t("panelInfo"), content: <InfoPanel /> },
    gallery: { title: t("panelGallery"), content: <GalleryPanel /> },
  };

  const handleGameEnd = useCallback(
    (result: "gameover" | "won", score: number) => {
      setLastScore(score);
      setScreen(result);
    },
    []
  );

  const handleMenuSelect = useCallback((selected: Screen) => {
    setScreen(selected);
  }, []);

  const handleStartPlaying = useCallback(() => {
    setScreen("playing");
  }, []);

  const handleRestart = useCallback(() => {
    setIsEndless(false);
    gameRef.current?.startGame();
    setScreen("playing");
  }, []);

  const handleStartEndless = useCallback(() => {
    setIsEndless(true);
    gameRef.current?.startEndless();
    setScreen("playing");
  }, []);

  const handleBackToMenu = useCallback(() => {
    setIsEndless(false);
    gameRef.current?.returnToIdle();
    setScreen("menu");
  }, []);

  // ESC key — return to menu from any overlay (but not while playing)
  useEffect(() => {
    if (screen === "playing" || screen === "menu") return;

    const handleBack = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.code === "Escape" || e.code === "Backspace") {
        e.preventDefault();
        if (screen === "gameover" || screen === "won") {
          setIsEndless(false);
          gameRef.current?.returnToIdle();
        }
        setScreen("menu");
      }
    };

    window.addEventListener("keydown", handleBack);
    return () => window.removeEventListener("keydown", handleBack);
  }, [screen]);

  const panel = panelConfig[screen] ?? null;
  const isGameResult = screen === "gameover" || screen === "won";

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

      {/* Instructions */}
      {screen === "instructions" && (
        <InstructionsOverlay gameRef={gameRef} onStart={handleStartPlaying} />
      )}

      {/* Game Over / Won */}
      {isGameResult && (
        <GameResultOverlay
          result={screen as "gameover" | "won"}
          score={lastScore}
          isEndless={isEndless}
          onRestart={handleRestart}
          onMenu={handleBackToMenu}
          onEndless={handleStartEndless}
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
