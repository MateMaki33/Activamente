import type { Difficulty } from "@/lib/constants";
import type { GameResult } from "@/features/games/types";

export type GameAggregate = {
  slug: string;
  played: number;
  wins: number;
  totalAccuracy: number;
  bestTimeMs: number | null;
  byDifficulty: Record<Difficulty, number>;
};

export type StatsState = {
  totalPlayed: number;
  totalWins: number;
  totalTimeMs: number;
  uniqueGames: string[];
  hardWins: string[];
  winStreakByGame: Record<string, number>;
  games: Record<string, GameAggregate>;
  recentResults: GameResult[];
};

export const defaultStatsState: StatsState = {
  totalPlayed: 0,
  totalWins: 0,
  totalTimeMs: 0,
  uniqueGames: [],
  hardWins: [],
  winStreakByGame: {},
  games: {},
  recentResults: [],
};
