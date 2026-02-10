"use client";

import { useMemo, useState } from "react";
import { ACHIEVEMENTS } from "@/content/achievements";
import { storage } from "@/lib/storage/session";
import type { UnlockedAchievement } from "@/features/achievements/evaluate";

const readAchievements = (): UnlockedAchievement[] =>
  typeof window === "undefined" ? [] : storage.get<UnlockedAchievement[]>("achievements", []);

export default function LogrosPage() {
  const [unlocked] = useState<UnlockedAchievement[]>(readAchievements);

  const unlockedSet = useMemo(() => new Set(unlocked.map((item) => item.id)), [unlocked]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Logros</h1>
      <p className="text-slate-700">Desbloquea metas jugando con constancia y variando desafíos.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedSet.has(achievement.id);
          return (
            <article key={achievement.id} className={`rounded-xl border p-4 ${isUnlocked ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-200"}`}>
              <p className="text-3xl" aria-hidden>{achievement.icon}</p>
              <h2 className="mt-2 text-2xl font-bold">{achievement.title}</h2>
              <p className="text-slate-700">{achievement.description}</p>
              <p className="mt-2 font-semibold">{isUnlocked ? "Desbloqueado" : "Bloqueado"}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
