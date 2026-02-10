"use client";

import { useMemo, useState } from "react";
import { GameCard } from "@/components/ui/game-card";
import type { GameDefinition, GameCategory } from "@/features/games/types";

const categories: (GameCategory | "Todas")[] = ["Todas", "Memoria", "Atención", "Tiempo", "Espacial", "Lógica"];

export const GamesCatalog = ({ games }: { games: GameDefinition[] }) => {
  const [filter, setFilter] = useState<(typeof categories)[number]>("Todas");

  const filtered = useMemo(
    () => (filter === "Todas" ? games : games.filter((game) => game.category === filter)),
    [games, filter],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtros de juegos">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`rounded-lg border px-4 py-2 font-semibold ${filter === category ? "bg-sky-700 text-white" : "bg-white"}`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
};
