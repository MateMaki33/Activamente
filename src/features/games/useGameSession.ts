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

    const recentForGame = nextStats.recentResults
      .filter((item) => item.gameSlug === result.gameSlug)
      .slice(0, 5);

    const winRate = recentForGame.length
      ? recentForGame.filter((item) => item.won).length / recentForGame.length
      : 0;
    const avgAccuracy = recentForGame.length
      ? recentForGame.reduce((sum, item) => sum + item.accuracy, 0) / recentForGame.length
      : 0;

    return {
      suggestion:
        recentForGame.length >= 4
          ? winRate >= 0.85 && avgAccuracy >= 80
            ? "Puedes probar una dificultad mayor."
            : winRate <= 0.35 && avgAccuracy <= 55
              ? "Tal vez te convenga bajar una dificultad."
              : ""
          : "",
    };
  };

  return { saveResult };
};
