"use client";

import { storage } from "@/lib/storage/session";
import type { GameResult } from "@/features/games/types";
import { applyGameResult } from "@/features/stats/calc";
import { defaultStatsState, type StatsState } from "@/features/stats/types";
import { evaluateAchievements, type UnlockedAchievement } from "@/features/achievements/evaluate";

export const useGameSession = () => {
  const saveResult = (result: GameResult) => {
    const stats = storage.get<StatsState>("stats", defaultStatsState);
    const nextStats = applyGameResult(stats, result);
    storage.set("stats", nextStats);

    const unlocked = storage.get<UnlockedAchievement[]>("achievements", []);
    const nextUnlocked = evaluateAchievements(nextStats, unlocked);
    storage.set("achievements", nextUnlocked);

    const perf = storage.get<Record<string, number[]>>("performance", {});
    const current = perf[result.gameSlug] ?? [];
    const value = Math.round(result.accuracy);
    const updated = [...current, value].slice(-3);
    perf[result.gameSlug] = updated;
    storage.set("performance", perf);

    return {
      suggestion:
        updated.length === 3
          ? updated.every((x) => x > 85)
            ? "Puedes probar una dificultad mayor."
            : updated.every((x) => x < 50)
              ? "Tal vez te convenga bajar una dificultad."
              : ""
          : ""
    };
  };

  return { saveResult };
};
