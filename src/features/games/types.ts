import type { Difficulty } from "@/lib/constants";

export type GameCategory = "Memoria" | "Atención" | "Tiempo" | "Espacial" | "Lógica";

export type GameResult = {
  gameSlug: string;
  difficulty: Difficulty;
  score: number;
  accuracy: number;
  timeMs: number;
  attempts: number;
  won: boolean;
  playedAt: string;
};

export type GameDefinition = {
  slug: string;
  title: string;
  shortDescription: string;
  instructions: string;
  category: GameCategory;
  difficulties: Difficulty[];
};
