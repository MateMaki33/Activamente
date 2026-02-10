import { ACHIEVEMENTS } from "@/content/achievements";
import type { StatsState } from "@/features/stats/types";

export type UnlockedAchievement = {
  id: string;
  unlockedAt: string;
};

export const evaluateAchievements = (stats: StatsState, unlocked: UnlockedAchievement[]) => {
  const unlockedIds = new Set(unlocked.map((item) => item.id));
  const fresh: UnlockedAchievement[] = [];

  const checks: Record<string, boolean> = {
    "first-game": stats.totalPlayed >= 1,
    consistency: stats.playedDates.length >= 5,
    "streak-3": Object.values(stats.winStreakByGame).some((streak) => streak >= 3),
    explorer: stats.uniqueGames.length >= 5,
    mastery: stats.hardWins.length >= 3,
  };

  for (const achievement of ACHIEVEMENTS) {
    if (checks[achievement.id] && !unlockedIds.has(achievement.id)) {
      fresh.push({ id: achievement.id, unlockedAt: new Date().toISOString() });
    }
  }

  return [...unlocked, ...fresh];
};
