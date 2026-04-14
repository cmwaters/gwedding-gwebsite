"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Screen } from "../config";
import { useLanguage } from "../i18n";
import { useGuests } from "../context/GuestContext";
import { aggregateGuestNames } from "../lib/guestUtils";
import RetroMenu from "./menu/RetroMenu";
import GameSubmenu, { GameResult } from "./menu/GameSubmenu";
import GameCanvas, { GameCanvasHandle, DifficultyConfig } from "./game/GameCanvas";
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
  const [hasBeatenVilla, setHasBeatenVilla] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [playerHighScore, setPlayerHighScore] = useState<number | null>(null);
  const isEndlessRef = useRef(false);
  const gameRef = useRef<GameCanvasHandle>(null);

  // Check localStorage on mount for villa-beaten unlock
  useEffect(() => {
    try {
      if (localStorage.getItem("villa-bettoni-beaten") === "1") {
        setHasBeatenVilla(true);
      }
    } catch {}
  }, []);

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
    (result: "gameover" | "won", score: number, finishScore: number) => {
      const submitted = groupName !== null && score > 0;

      // Submit score then fetch updated leaderboard to show rank
      if (submitted) {
        setPlayerRank(null);
        setPlayerHighScore(null);
        fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupName, score }),
        })
          .then(() => fetch("/api/leaderboard"))
          .then((r) => r.json())
          .then((data) => {
            const scores: { name: string; score: number }[] = data.scores ?? [];
            const idx = scores.findIndex((e) => e.name === groupName);
            if (idx !== -1) {
              setPlayerRank(idx + 1);
              setPlayerHighScore(scores[idx].score);
            }
          })
          .catch((err) => console.error("Score submit/rank fetch failed:", err));
      }

      // Calculate progress percentage for normal mode
      const progressPct = Math.min(100, Math.round((score / finishScore) * 100));

      // If they won normal mode, unlock endless
      if (result === "won" && !isEndlessRef.current) {
        setHasBeatenVilla(true);
      }

      setGameResult({
        type: result,
        score,
        wasEndless: isEndlessRef.current,
        scoreSubmitted: submitted,
        progressPct,
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
    setPlayerRank(null);
    setPlayerHighScore(null);
    gameRef.current?.startGame();
    setScreen("playing");
  }, []);

  const handleStartEndless = useCallback(() => {
    isEndlessRef.current = true;
    setGameResult(null);
    setPlayerRank(null);
    setPlayerHighScore(null);
    setScreen("playing");

    // Fetch leaderboard to calibrate difficulty: max difficulty reached at 70% of the
    // top competitor's score (excluding current player if they hold #1).
    const startWithCalibration = async () => {
      let difficulty: DifficultyConfig | undefined;
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        const scores: { name: string; score: number }[] = data.scores ?? [];

        // Find the reference score — top score excluding self if at #1
        let refScore: number | null = null;
        if (scores.length > 0) {
          if (scores[0].name === groupName && scores.length > 1) {
            refScore = scores[1].score; // Current player is #1 — use #2
          } else if (scores[0].name !== groupName) {
            refScore = scores[0].score;
          }
        }

        if (refScore !== null && refScore > 0) {
          // Target: reach max difficulty at 70% of the reference score
          // Score accrues at 0.25 pts/frame, so frames = score / 0.25
          // speedIncrement  = (maxSpeed - startSpeed) / frames = 14 * 0.25 / targetScore = 3.5 / targetScore
          // intervalDecrement = (2000 - 600) / frames            = 1400 * 0.25 / targetScore = 350 / targetScore
          const targetScore = Math.max(200, refScore * 0.7);
          difficulty = {
            speedIncrement: 3.5 / targetScore,
            intervalDecrement: 350 / targetScore,
          };
        }

        // Pass scores to game engine for flag rendering
        gameRef.current?.setLeaderboardScores(scores, groupName);

        // Sync server high score so HUD matches leaderboard from the start of the run
        const playerEntry = scores.find((e) => e.name === groupName);
        if (playerEntry) {
          gameRef.current?.syncHighScore(playerEntry.score);
        }
      } catch (err) {
        console.error("Difficulty calibration fetch failed:", err);
      }
      gameRef.current?.startEndless(difficulty);
    };

    startWithCalibration();
  }, [groupName]);

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
          hasBeatenVilla={hasBeatenVilla}
          playerRank={playerRank}
          playerHighScore={playerHighScore}
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
