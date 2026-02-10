"use client";

import { useMemo, useState } from "react";
import { BarChart, LineChart } from "@/components/charts/simple-charts";
import { storage } from "@/lib/storage/session";
import { defaultStatsState, type StatsState } from "@/features/stats/types";
import { accuracyPercent } from "@/features/stats/calc";

const readStats = (): StatsState =>
  typeof window === "undefined" ? defaultStatsState : storage.get<StatsState>("stats", defaultStatsState);

export default function EstadisticasPage() {
  const [stats, setStats] = useState<StatsState>(readStats);

  const lineData = useMemo(
    () => Object.entries(stats.daily).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([label, value]) => ({ label, value })),
    [stats.daily],
  );

  const barData = useMemo(
    () => Object.values(stats.games).map((game) => ({ label: game.slug, value: accuracyPercent(game.wins, game.played) })),
    [stats.games],
  );

  const avgAccuracy = accuracyPercent(stats.totalWins, stats.totalPlayed);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Estadísticas</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><p>Partidas totales</p><p className="text-3xl font-bold">{stats.totalPlayed}</p></div>
        <div className="rounded-xl border bg-white p-4"><p>Tiempo total</p><p className="text-3xl font-bold">{Math.round(stats.totalTimeMs / 1000)}s</p></div>
        <div className="rounded-xl border bg-white p-4"><p>Acierto medio</p><p className="text-3xl font-bold">{avgAccuracy}%</p></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LineChart data={lineData.length ? lineData : [{ label: "Hoy", value: 0 }]} />
        <BarChart data={barData.length ? barData : [{ label: "Sin datos", value: 0 }]} />
      </div>

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
