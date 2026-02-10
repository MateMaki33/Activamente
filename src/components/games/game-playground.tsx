"use client";

import { useMemo, useState } from "react";
import type { Difficulty } from "@/lib/constants";
import type { GameDefinition } from "@/features/games/types";
import { useGameSession } from "@/features/games/useGameSession";

const randomInt = (max: number) => Math.floor(Math.random() * max);

export const GamePlayground = ({ game }: { game: GameDefinition }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("facil");
  const [prompt, setPrompt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const { saveResult } = useGameSession();

  const options = useMemo(() => {
    const amount = difficulty === "facil" ? 3 : difficulty === "media" ? 4 : 6;
    return Array.from({ length: amount }, (_, i) => i + 1);
  }, [difficulty]);

  const startRound = (eventTime: number) => {
    setStartedAt(Math.round(eventTime));
    const goal = randomInt(options.length) + 1;
    setPrompt(`Selecciona la opción ${goal}`);
    setFeedback("");
    setAttempts(0);
    setHits(0);
  };

  const handleChoose = (value: number, eventTime: number) => {
    if (!startedAt || !prompt) return;
    const target = Number(prompt.split(" ").at(-1));
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (value === target) {
      const nextHits = hits + 1;
      setHits(nextHits);
      const timeMs = Math.max(0, Math.round(eventTime - startedAt));
      const accuracy = Math.round((nextHits / nextAttempts) * 100);
      const result = saveResult({
        gameSlug: game.slug,
        difficulty,
        score: nextHits,
        accuracy,
        timeMs,
        attempts: nextAttempts,
        won: true,
        playedAt: new Date().toISOString(),
      });
      setFeedback(`¡Correcto! Tiempo: ${Math.round(timeMs / 1000)}s · Precisión: ${accuracy}%`);
      setSuggestion(result.suggestion);
      setStartedAt(null);
    } else {
      setFeedback("No era esa opción. Puedes intentar otra vez.");
    }
  };

  return (
    <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-sm">
      <h2 className="text-3xl font-extrabold text-slate-900">{game.title}</h2>
      <p className="mt-2 text-lg text-slate-800">{game.instructions}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {game.difficulties.map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`rounded-lg border px-4 py-2 font-bold capitalize ${difficulty === level ? "border-sky-800 bg-sky-800 text-white" : "border-slate-300 bg-white text-slate-900"}`}
          >
            {level}
          </button>
        ))}
        <button onClick={(event) => startRound(event.timeStamp)} className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white">
          Iniciar ronda
        </button>
      </div>

      {prompt && <p className="mt-6 text-2xl font-bold text-indigo-900">{prompt}</p>}

      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={(event) => handleChoose(option, event.timeStamp)}
            className="min-h-14 rounded-xl border-2 border-indigo-300 bg-white text-xl font-extrabold text-indigo-900 hover:bg-indigo-50"
          >
            {option}
          </button>
        ))}
      </div>

      {feedback && <p className="mt-5 rounded-lg bg-indigo-100 p-3 font-bold text-indigo-900">{feedback}</p>}
      {suggestion && <p className="mt-3 rounded-lg bg-amber-100 p-3 font-semibold text-amber-900">{suggestion}</p>}
    </section>
  );
};
