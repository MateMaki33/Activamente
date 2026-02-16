"use client";

import { useMemo, useState } from "react";
import { BarChart } from "@/components/charts/simple-charts";
import { storage } from "@/lib/storage/session";
import { defaultStatsState, type StatsState } from "@/features/stats/types";
import { accuracyPercent } from "@/features/stats/calc";
import { GAME_BY_SLUG, GAMES } from "@/content/games";

const readStats = (): StatsState =>
  typeof window === "undefined" ? defaultStatsState : storage.get<StatsState>("stats", defaultStatsState);

export default function EstadisticasPage() {
  const [stats, setStats] = useState<StatsState>(readStats);

  const gameAccuracyData = useMemo(
    () => Object.values(stats.games).map((game) => ({ label: game.slug, value: accuracyPercent(game.wins, game.played), suffix: "%" })),
    [stats.games],
  );

  const categoryData = useMemo(() => {
    const totals = new Map(GAMES.map((game) => [game.category, { wins: 0, played: 0 }]));

    for (const result of stats.recentResults) {
      const category = GAME_BY_SLUG[result.gameSlug]?.category;
      if (!category) continue;
      const current = totals.get(category) ?? { wins: 0, played: 0 };
      current.played += 1;
      current.wins += result.won ? 1 : 0;
      totals.set(category, current);
    }

    return Array.from(totals.entries()).map(([label, totalsByCategory]) => ({
      label,
      value: accuracyPercent(totalsByCategory.wins, totalsByCategory.played),
      suffix: "%",
    }));
  }, [stats.recentResults]);

  const avgAccuracy = accuracyPercent(stats.totalWins, stats.totalPlayed);
  const avgTimePerGame = stats.totalPlayed ? Math.round(stats.totalTimeMs / stats.totalPlayed / 1000) : 0;
  const bestStreak = Math.max(0, ...Object.values(stats.winStreakByGame));
  const hardModeRate = stats.totalPlayed
    ? Math.round((stats.recentResults.filter((result) => result.difficulty === "dificil").length / stats.totalPlayed) * 100)
    : 0;

  const topGames = useMemo(
    () => Object.values(stats.games)
      .sort((a, b) => b.played - a.played)
      .slice(0, 5),
    [stats.games],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Estadísticas</h1>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border bg-white p-4"><p>Partidas</p><p className="text-3xl font-bold">{stats.totalPlayed}</p></div>
        <div className="rounded-xl border bg-white p-4"><p>Victorias</p><p className="text-3xl font-bold">{stats.totalWins}</p></div>
        <div className="rounded-xl border bg-white p-4"><p>Acierto global</p><p className="text-3xl font-bold">{avgAccuracy}%</p></div>
        <div className="rounded-xl border bg-white p-4"><p>Tiempo medio</p><p className="text-3xl font-bold">{avgTimePerGame}s</p></div>
        <div className="rounded-xl border bg-white p-4"><p>Mejor racha</p><p className="text-3xl font-bold">{bestStreak}</p></div>
        <div className="rounded-xl border bg-white p-4"><p>Partidas en difícil</p><p className="text-3xl font-bold">{hardModeRate}%</p></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BarChart
          title="Acierto por juego"
          ariaLabel="Barras de acierto por juego"
          data={gameAccuracyData.length ? gameAccuracyData : [{ label: "Sin datos", value: 0, suffix: "%" }]}
        />
        <BarChart
          title="Acierto por tipo de juego"
          ariaLabel="Barras de acierto por tipo de juego"
          data={categoryData}
        />
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-2xl font-bold">Top juegos de la sesión</h2>
        <div className="mt-3 space-y-3">
          {topGames.length === 0 ? (
            <p className="text-slate-600">Todavía no hay partidas registradas.</p>
          ) : (
            topGames.map((game) => (
              <article key={game.slug} className="rounded-lg border border-slate-200 p-3">
                <h3 className="text-lg font-semibold">{GAME_BY_SLUG[game.slug]?.title ?? game.slug}</h3>
                <p className="text-sm text-slate-700">
                  Acierto: {accuracyPercent(game.wins, game.played)}% · Jugadas: {game.played} · Mejor tiempo: {game.bestTimeMs ? `${Math.round(game.bestTimeMs / 1000)}s` : "—"}
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <button
        onClick={() => {
          if (window.confirm("¿Seguro que quieres reiniciar estadísticas?")) {
            storage.remove("stats");
            setStats(defaultStatsState);
          }
        }}
        className="rounded-lg border border-red-500 px-5 py-3 font-semibold text-red-700"
      >
        Reiniciar estadísticas
      </button>
    </div>
  );
}
