"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/app/i18n";
import { useGuests } from "@/app/context/GuestContext";
import { aggregateGuestNames } from "@/app/lib/guestUtils";
import type { LeaderboardRow } from "@/app/lib/database.types";

type LoadState = "loading" | "loaded" | "error";

export default function LeaderboardPanel() {
  const { t } = useLanguage();
  const guestGroup = useGuests();
  const [scores, setScores] = useState<LeaderboardRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  // Aggregated group name for "you" highlighting
  const groupName = useMemo(
    () => (guestGroup ? aggregateGuestNames(guestGroup.guests) : null),
    [guestGroup]
  );

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setScores(data.scores);
        setLoadState("loaded");
      } catch {
        setLoadState("error");
      }
    };
    fetchScores();
  }, []);

  if (loadState === "loading") {
    return (
      <div className="text-cream text-center">
        <p className="text-xs sm:text-sm opacity-80 animate-blink">
          {t("leaderboardLoading")}
        </p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="text-cream text-center">
        <p className="text-coral text-xs sm:text-sm">
          {t("leaderboardError")}
        </p>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="text-cream text-center">
        <p className="text-xs sm:text-sm opacity-80">
          {t("leaderboardEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="text-cream">
      {/* Table header */}
      <div className="flex gap-2 text-amber text-[10px] sm:text-xs px-2" style={{ marginBottom: '0.75rem' }}>
        <span className="w-6 text-center">{t("leaderboardRank")}</span>
        <span className="flex-1">{t("leaderboardName")}</span>
        <span className="w-14 text-right">{t("leaderboardScore")}</span>
      </div>

      {/* Score rows */}
      {scores.map((entry, index) => {
        const isMe = groupName !== null && entry.name === groupName;
        return (
          <div
            key={entry.id}
            className={`
              flex gap-2 text-[10px] sm:text-xs py-2 px-2
              ${isMe ? "text-amber" : "text-cream opacity-80"}
              ${index < scores.length - 1 ? "border-b border-cream/10" : ""}
            `}
          >
            <span className="w-6 text-center">{index + 1}</span>
            <span className="flex-1 truncate">
              {entry.name}
              {isMe && (
                <span className="text-amber/60 ml-1">
                  {t("leaderboardYou")}
                </span>
              )}
            </span>
            <span className="w-14 text-right">{entry.score}</span>
          </div>
        );
      })}
    </div>
  );
}
