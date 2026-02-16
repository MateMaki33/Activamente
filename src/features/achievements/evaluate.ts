import { ACHIEVEMENTS } from "@/content/achievements";
import type { StatsState } from "@/features/stats/types";
import { accuracyPercent } from "@/features/stats/calc";

export type UnlockedAchievement = {
  id: string;
  unlockedAt: string;
};

export const evaluateAchievements = (stats: StatsState, unlocked: UnlockedAchievement[]) => {
  const unlockedIds = new Set(unlocked.map((item) => item.id));
  const fresh: UnlockedAchievement[] = [];

  const bestStreak = Math.max(0, ...Object.values(stats.winStreakByGame));
  const totalFastWins = stats.recentResults.filter((item) => item.won && item.timeMs > 0 && item.timeMs <= 30_000).length;

  const checks: Record<string, boolean> = {
    "first-game": stats.totalPlayed >= 1,
    "focused-10": stats.totalPlayed >= 10,
    "streak-3": bestStreak >= 3,
    "streak-5": bestStreak >= 5,
    explorer: stats.uniqueGames.length >= 5,
    mastery: stats.hardWins.length >= 3,
    "sharp-shooter": stats.totalPlayed >= 20 && accuracyPercent(stats.totalWins, stats.totalPlayed) >= 90,
    speedrunner: totalFastWins >= 10,
  };

  for (const achievement of ACHIEVEMENTS) {
    if (checks[achievement.id] && !unlockedIds.has(achievement.id)) {
      fresh.push({ id: achievement.id, unlockedAt: new Date().toISOString() });
    }
  }

  return [...unlocked, ...fresh];
};
