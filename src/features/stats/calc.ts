import type { GameResult } from "@/features/games/types";
import type { StatsState } from "@/features/stats/types";
import { defaultStatsState } from "@/features/stats/types";

export const applyGameResult = (stats: StatsState, result: GameResult): StatsState => {
  const next = structuredClone(stats);
  next.totalPlayed += 1;
  next.totalWins += result.won ? 1 : 0;
  next.totalTimeMs += result.timeMs;

  if (!next.uniqueGames.includes(result.gameSlug)) next.uniqueGames.push(result.gameSlug);

  if (result.difficulty === "dificil" && result.won && !next.hardWins.includes(result.gameSlug)) {
    next.hardWins.push(result.gameSlug);
  }

  const streak = next.winStreakByGame[result.gameSlug] ?? 0;
  next.winStreakByGame[result.gameSlug] = result.won ? streak + 1 : 0;

  const game =
    next.games[result.gameSlug] ??
    {
      slug: result.gameSlug,
      played: 0,
      wins: 0,
      totalAccuracy: 0,
      bestTimeMs: null,
      byDifficulty: { facil: 0, media: 0, dificil: 0 },
    };
  game.played += 1;
  game.wins += result.won ? 1 : 0;
  game.totalAccuracy += result.accuracy;
  game.byDifficulty[result.difficulty] += 1;
  if (result.timeMs > 0) {
    game.bestTimeMs = game.bestTimeMs ? Math.min(game.bestTimeMs, result.timeMs) : result.timeMs;
  }
  next.games[result.gameSlug] = game;

  next.recentResults = [result, ...next.recentResults].slice(0, 30);
  return next;
};

export const resetStats = (): StatsState => structuredClone(defaultStatsState);

export const accuracyPercent = (wins: number, played: number) =>
  played === 0 ? 0 : Math.round((wins / played) * 100);
