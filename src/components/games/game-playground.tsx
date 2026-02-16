"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import type { GameDefinition } from "@/features/games/types";
import { useSettings } from "@/components/layout/settings-provider";
import { useGameSession } from "@/features/games/useGameSession";
import type { Difficulty } from "@/lib/constants";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import confetti from "@hiseb/confetti";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const randomInt = (max: number) => Math.floor(Math.random() * max);

// Fisher–Yates (no sesgo)
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const difficultyLabel: Record<Difficulty, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

const parejasAssets = [
  "/images/games/parejas/carta-1.png",
  "/images/games/parejas/carta-2.png",
  "/images/games/parejas/carta-3.png",
  "/images/games/parejas/carta-4.png",
  "/images/games/parejas/carta-5.png",
  "/images/games/parejas/carta-6.png",
  "/images/games/parejas/carta-7.png",
  "/images/games/parejas/carta-8.png",
  "/images/games/parejas/carta-9.png",
  "/images/games/parejas/carta-10.png",
];

const intrusoAssets = {
  base: "/images/games/intruso/base.png",
  odd: "/images/games/intruso/intruso.png",
};

const stroopColors = [
  { key: "rojo", text: "ROJO", className: "text-red-600", bgClass: "bg-red-500" },
  { key: "azul", text: "AZUL", className: "text-blue-600", bgClass: "bg-blue-500" },
  { key: "verde", text: "VERDE", className: "text-green-600", bgClass: "bg-green-500" },
  { key: "amarillo", text: "AMARILLO", className: "text-yellow-500", bgClass: "bg-yellow-400" },
  { key: "morado", text: "MORADO", className: "text-purple-600", bgClass: "bg-purple-500" },
  { key: "naranja", text: "NARANJA", className: "text-orange-600", bgClass: "bg-orange-500" },
] as const;

const useSoundEffects = () => {
  const { settings } = useSettings();
  const cacheRef = useRef<Record<string, HTMLAudioElement>>({});

  return useCallback(
    (soundFile: string) => {
      if (typeof window === "undefined" || !settings.sounds) return;

      let audio = cacheRef.current[soundFile];
      if (!audio) {
        audio = new Audio(`/sounds/${soundFile}`);
        cacheRef.current[soundFile] = audio;
      }

      audio.currentTime = 0;
      void audio.play().catch(() => {
        // Ignoramos bloqueos de autoplay del navegador.
      });
    },
    [settings.sounds],
  );
};

const fireConfetti = (opts?: { y?: number; count?: number }) => {
  if (typeof window === "undefined") return;

  const x = window.innerWidth * 0.5;
  const y = window.innerHeight * (opts?.y ?? 0.55);
  const count = opts?.count ?? 160;

  confetti({ position: { x, y }, count, size: 1, velocity: 220, fade: true });
  setTimeout(() => confetti({ position: { x, y }, count: Math.round(count * 0.5), size: 1, velocity: 170, fade: true }), 180);
  setTimeout(() => confetti({ position: { x, y }, count: Math.round(count * 0.35), size: 1, velocity: 140, fade: true }), 360);
};

const GameShell = ({
  game,
  difficulty,
  setDifficulty,
  children,
}: {
  game: GameDefinition;
  difficulty: Difficulty;
  setDifficulty: (level: Difficulty) => void;
  children: ReactNode;
}) => (
  <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{game.title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{game.instructions}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {game.difficulties.map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition sm:text-base ${
              difficulty === level
                ? "border-sky-700 bg-sky-700 text-white shadow"
                : "border-slate-300 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
            }`}
          >
            {difficultyLabel[level]}
          </button>
        ))}
      </div>
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const useGameSaver = (game: GameDefinition, difficulty: Difficulty) => {
  const { saveResult } = useGameSession();

  return (payload: { score: number; attempts: number; startedAt: number; won: boolean; accuracy?: number }) => {
    const accuracy = payload.accuracy ?? Math.max(0, Math.round((payload.score / Math.max(payload.attempts, 1)) * 100));
    const result = saveResult({
      gameSlug: game.slug,
      difficulty,
      score: payload.score,
      accuracy,
      timeMs: Date.now() - payload.startedAt,
      attempts: payload.attempts,
      won: payload.won,
      playedAt: new Date().toISOString(),
    });
    return result.suggestion;
  };
};

const ScorePanel = ({ feedback, suggestion }: { feedback: string; suggestion: string }) => (
  <div className="mt-5 space-y-3">
    {feedback && <p className="rounded-2xl bg-slate-100 p-3 font-semibold text-slate-800">{feedback}</p>}
    {suggestion && <p className="rounded-2xl bg-amber-100 p-3 text-amber-900">{suggestion}</p>}
  </div>
);

const Pill = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
    {children}
  </span>
);

/* -------------------- RELOJ -------------------- */

const ClockHand = ({
  heightClass,
  widthClass,
  angle,
  colorClass,
}: {
  heightClass: string;
  widthClass: string;
  angle: number;
  colorClass: string;
}) => (
  <div
    className={`absolute left-1/2 bottom-1/2 ${heightClass} ${widthClass} -translate-x-1/2 origin-bottom rounded-full ${colorClass}`}
    style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
  />
);
const ClockFace = ({ hour, minute }: { hour: number; minute: number }) => {
  const minuteAngle = minute * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;

  const fmtPct = (n: number, decimals = 3) => `${n.toFixed(decimals)}%`;

  return (
    <div className="relative mx-auto mt-6 aspect-square w-full max-w-80 rounded-full border-8 border-slate-300 bg-white shadow-inner">
      {Array.from({ length: 60 }, (_, index) => (
        <span
          key={index}
          className={`absolute left-1/2 top-1/2 block h-1 rounded-full ${
            index % 5 === 0 ? "w-3 bg-slate-500" : "w-1 bg-slate-300"
          }`}
          style={{ transform: `translate(-50%, -50%) rotate(${index * 6}deg) translateY(-150px)` }}
        />
      ))}

      {Array.from({ length: 12 }, (_, index) => {
        const value = index + 1;
        const angle = ((value - 3) * Math.PI) / 6;

        const left = 50 + Math.cos(angle) * 40;
        const top = 50 + Math.sin(angle) * 40;

        return (
          <span
            key={value}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-base font-black text-slate-700 sm:text-lg"
            style={{ left: fmtPct(left), top: fmtPct(top) }}
          >
            {value}
          </span>
        );
      })}

      <ClockHand heightClass="h-24" widthClass="w-2" angle={hourAngle} colorClass="bg-slate-900" />
      <ClockHand heightClass="h-32" widthClass="w-1.5" angle={minuteAngle} colorClass="bg-sky-600" />
      <div className="absolute left-1/2 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800" />
    </div>
  );
};



const RelojGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [target, setTarget] = useState({ hour: 12, minute: 0 });
  const [locked, setLocked] = useState(false);

  const newRound = useCallback(() => {
    setTarget({
      hour: randomInt(12) + 1,
      minute: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][randomInt(12)],
    });
    setHour(12);
    setMinute(0);
    setFeedback("");
    setSuggestion("");
    setAttempts(0);
    setLocked(false);
    setStartedAt(Date.now());
  }, []);

  useEffect(() => {
    newRound();
  }, [difficulty, newRound]);

  const tolerance = difficulty === "facil" ? 12 : difficulty === "media" ? 8 : 5;

  const handleCheck = () => {
    if (locked) return;

    const tries = attempts + 1;
    setAttempts(tries);

    const targetMinutes = (target.hour % 12) * 60 + target.minute;
    const selectedMinutes = (hour % 12) * 60 + minute;
    const diff = Math.abs(targetMinutes - selectedMinutes);
    const correct = Math.min(diff, 720 - diff) <= tolerance;

    if (!correct) {
      playSound("wobble.wav");
      setFeedback("Casi. Ajusta un poco más las manecillas.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }

    playSound("coin_4.wav");
    setFeedback("¡Perfecto! Hora correcta.");
    fireConfetti({ y: 0.5, count: 170 });
    setLocked(true);
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>🎯 {String(target.hour).padStart(2, "0")}:{String(target.minute).padStart(2, "0")}</Pill>
        <Pill>📏 Tolerancia: ±{tolerance} min</Pill>
        <Pill>🧠 Intentos: {attempts}</Pill>
      </div>

      <ClockFace hour={hour} minute={minute} />

      <p className="mt-4 text-center text-base font-semibold text-slate-700 sm:text-lg">
        Seleccionada: {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="font-semibold">Hora</span>
          <input
            type="range"
            min={1}
            max={12}
            value={hour}
            disabled={locked}
            onChange={(e) => setHour(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <div className="mt-1 text-sm font-semibold text-slate-600">{hour}</div>
        </label>

        <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="font-semibold">Minutos</span>
          <input
            type="range"
            min={0}
            max={55}
            step={5}
            value={minute}
            disabled={locked}
            onChange={(e) => setMinute(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <div className="mt-1 text-sm font-semibold text-slate-600">{String(minute).padStart(2, "0")}</div>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleCheck}
          disabled={locked}
          className={`rounded-xl px-5 py-3 font-semibold text-white shadow transition ${
            locked ? "bg-slate-300" : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99]"
          }`}
        >
          Confirmar
        </button>

        <button
          onClick={newRound}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          Nueva hora
        </button>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

/* -------------------- PAREJAS (SOLO IMÁGENES + CARTAS ALTAS) -------------------- */

type PairCard = {
  id: number;
  pairId: number;
  open: boolean;
  matched: boolean;
  image: string;
};

const ParejasGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [selected, setSelected] = useState<number[]>([]);
  const [cards, setCards] = useState<PairCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [won, setWon] = useState(false);

  const newRound = useCallback(() => {
    const pairCount = difficulty === "facil" ? 3 : difficulty === "media" ? 6 : 8;
    const values = shuffle(parejasAssets).slice(0, pairCount);

    const deck: PairCard[] = shuffle(
      values.flatMap((img, idx) => [
        { id: idx * 2, pairId: idx, open: false, matched: false, image: img },
        { id: idx * 2 + 1, pairId: idx, open: false, matched: false, image: img },
      ]),
    );

    setCards(deck);
    setSelected([]);
    setMoves(0);
    setBusy(false);
    setWon(false);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
  }, [difficulty]);

  useEffect(() => {
    newRound();
  }, [difficulty, newRound]);

  const matchedPairs = useMemo(() => cards.filter((c) => c.matched).length / 2, [cards]);
  const totalPairs = useMemo(() => cards.length / 2, [cards]);

  const flipCard = (id: number) => {
    if (busy || won) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.open || card.matched) return;
    if (selected.length === 2) return;

    const opened = cards.map((c) => (c.id === id ? { ...c, open: true } : c));
    const nextSelected = [...selected, id];

    playSound("card_draw_3.wav");
    setCards(opened);
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      setBusy(true);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      const [a, b] = nextSelected.map((sid) => opened.find((c) => c.id === sid)!);
      const isMatch = a.pairId === b.pairId;

      if (!isMatch) {
        setFeedback("No eran pareja. Buena, sigue.");
        setSuggestion(save({ score: matchedPairs, attempts: nextMoves, startedAt, won: false, accuracy: 0 }));
      }

      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => {
            if (c.id !== a.id && c.id !== b.id) return c;
            return isMatch ? { ...c, matched: true } : { ...c, open: false };
          }),
        );
        setSelected([]);
        setBusy(false);
      }, isMatch ? 380 : 650);
    }
  };

  useEffect(() => {
    if (!cards.length) return;
    const allMatched = cards.every((c) => c.matched);
    if (!allMatched || won) return;

    setWon(true);
    setFeedback("¡Brutal! Memoria top. ✅");
    fireConfetti({ y: 0.5, count: 220 });

    const minMoves = totalPairs;
    const efficiency = Math.max(0, Math.round((minMoves / Math.max(moves, 1)) * 100));
    setSuggestion(save({ score: totalPairs, attempts: Math.max(moves, 1), startedAt, won: true, accuracy: efficiency }));
  }, [cards, moves, startedAt, save, totalPairs, won]);

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>🧩 Parejas: {matchedPairs}/{totalPairs}</Pill>
        <Pill>🎯 Movimientos: {moves}</Pill>
        <Pill>{busy ? "⏳ Comprobando..." : won ? "🏁 Completado" : "🔥 Dale"}</Pill>
      </div>

      <p className="mt-4 text-sm text-slate-600">Destapa dos cartas. Si coinciden, se quedan fijas.</p>

      {/* Cartas más ALTAS: min-h-32 / md:min-h-36 */}
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => {
          const show = card.open || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              disabled={busy || won}
              className={`group relative min-h-32 md:min-h-36 overflow-hidden rounded-3xl border-2 shadow-sm transition ${
                show ? "border-emerald-300 bg-white" : "border-slate-300 bg-white hover:shadow"
              } ${busy || won ? "cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.99]"}`}
              aria-label={show ? "Carta descubierta" : "Carta oculta"}
            >
              <div className={`absolute inset-0 flex items-center justify-center transition ${show ? "opacity-0" : "opacity-100"}`}>
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-300 to-indigo-400">
                  <span className="text-3xl font-black text-white">?</span>
                </div>
              </div>

              <div className={`absolute inset-0 flex items-center justify-center bg-slate-50 p-3 transition ${show ? "opacity-100" : "opacity-0"}`}>
                <div
                  className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-cover bg-center shadow-sm"
                  style={{ backgroundImage: `url(${card.image})` }}
                />
              </div>

              {card.matched && <div className="pointer-events-none absolute inset-0 ring-2 ring-emerald-300" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={newRound}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          Reiniciar
        </button>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

/* -------------------- PATRONES -------------------- */

const PatronesGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [question, setQuestion] = useState<{ seq: string[]; answer: string; options: string[] }>({
    seq: [],
    answer: "",
    options: [],
  });

  const newRound = useCallback(() => {
    const bank =
      difficulty === "facil"
        ? { seq: ["🔵", "🟢", "🔵", "🟢", "?"], answer: "🔵", options: ["🔵", "🟢", "🟣"] }
        : difficulty === "media"
          ? { seq: ["🟥", "🟨", "🟨", "🟥", "🟨", "?"], answer: "🟨", options: ["🟨", "🟥", "🟦", "🟩"] }
          : { seq: ["1", "2", "3", "1", "2", "3", "1", "?"], answer: "2", options: ["1", "2", "3", "4", "5", "6"] };

    setQuestion({ ...bank, options: shuffle(bank.options) });
    setFeedback("");
    setSuggestion("");
    setAttempts(0);
    setStartedAt(Date.now());
  }, [difficulty]);

  useEffect(() => {
    newRound();
  }, [difficulty, newRound]);

  const handleAnswer = (value: string) => {
    const tries = attempts + 1;
    setAttempts(tries);

    if (value !== question.answer) {
      playSound("wobble.wav");
      setFeedback("No encaja. Mira el patrón otra vez.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }

    playSound("coin_4.wav");
    setFeedback("¡Correcto! Patrón clavado.");
    fireConfetti({ y: 0.5, count: 150 });
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>🧠 Intentos: {attempts}</Pill>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-lg font-black text-slate-800">Completa la secuencia</p>
        <div className="mt-3 flex flex-wrap gap-3 text-3xl">
          {question.seq.map((item, index) => (
            <span key={`${item}-${index}`} className="rounded-xl bg-slate-100 px-3 py-2">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="min-h-14 rounded-2xl border-2 border-slate-300 bg-white text-2xl font-black shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={newRound}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          Nueva secuencia
        </button>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

/* -------------------- COLORES (STROOP) -------------------- */

type ColorKey = (typeof stroopColors)[number]["key"];

const ColoresGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const [startedAt, setStartedAt] = useState(0);
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [misses, setMisses] = useState(0);
  const [locked, setLocked] = useState(false);

  const palette = useMemo(
    () => stroopColors.slice(0, difficulty === "facil" ? 3 : difficulty === "media" ? 4 : 6),
    [difficulty],
  );

  const roundsTotal = difficulty === "facil" ? 6 : difficulty === "media" ? 8 : 10;
  const limitMs = difficulty === "facil" ? 0 : difficulty === "media" ? 9000 : 6000;

  const [prompt, setPrompt] = useState<{
    text: string;
    ink: ColorKey;
    className: string;
    bgClass: string;
  }>({ text: "ROJO", ink: "azul", className: "text-blue-600", bgClass: "bg-blue-500" });

  const pickPrompt = useCallback(() => {
    const text = palette[randomInt(palette.length)];
    const ink = palette[randomInt(palette.length)];
    setPrompt({ text: text.text, ink: ink.key, className: ink.className, bgClass: ink.bgClass });
  }, [palette]);

  const newGame = useCallback(() => {
    setFeedback("");
    setSuggestion("");
    setRound(1);
    setCorrect(0);
    setMisses(0);
    setLocked(false);
    setStartedAt(Date.now());
    pickPrompt();
  }, [pickPrompt]);

  useEffect(() => {
    newGame();
  }, [difficulty, newGame]);

  const endGame = useCallback(
    (finalCorrect: number) => {
      const attempts = roundsTotal;
      const accuracy = Math.round((finalCorrect / Math.max(attempts, 1)) * 100);
      const won = finalCorrect >= Math.ceil(roundsTotal * 0.7);

      setLocked(true);
      setFeedback(won ? "¡Muy bien! Reflejos y control atencional 🔥" : "Bien. Repite y mejora tu precisión.");
      if (won) fireConfetti({ y: 0.52, count: 200 });

      setSuggestion(save({ score: finalCorrect, attempts, startedAt, won, accuracy }));
    },
    [roundsTotal, save, startedAt],
  );

  useEffect(() => {
    if (!limitMs || locked) return;

    const t = window.setTimeout(() => {
      setMisses((m) => m + 1);
      setFeedback("⏱️ Tiempo. Sigue.");

      const nextRound = round + 1;
      if (nextRound > roundsTotal) {
        endGame(correct);
        return;
      }

      setRound(nextRound);
      pickPrompt();
    }, limitMs);

    return () => window.clearTimeout(t);
  }, [limitMs, locked, round, roundsTotal, correct, pickPrompt, endGame]);

  const handleColor = (key: ColorKey) => {
    if (locked) return;

    const isCorrect = key === prompt.ink;

    if (isCorrect) {
      playSound("coin_4.wav");
      setCorrect((c) => c + 1);
      setFeedback("✅ Correcto");
    } else {
      playSound("wobble.wav");
      setMisses((m) => m + 1);
      setFeedback("❌ Era el color de la tinta");
    }

    const nextRound = round + 1;
    if (nextRound > roundsTotal) {
      endGame(correct + (isCorrect ? 1 : 0));
      return;
    }

    setRound(nextRound);
    pickPrompt();
  };

  const progressPct = Math.round(((round - 1) / roundsTotal) * 100);

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>🎯 Ronda: {Math.min(round, roundsTotal)}/{roundsTotal}</Pill>
        <Pill>✅ Aciertos: {correct}</Pill>
        <Pill>❌ Fallos: {misses}</Pill>
        {limitMs ? <Pill>⏱️ {Math.round(limitMs / 1000)}s</Pill> : <Pill>🧘 Sin tiempo</Pill>}
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-sky-600 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500">Pulsa el color de la tinta (no la palabra)</p>
        <p className={`mt-4 text-center text-6xl font-black tracking-tight ${prompt.className}`}>{prompt.text}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {palette.map((color) => (
          <button
            key={color.key}
            onClick={() => handleColor(color.key)}
            disabled={locked}
            className={`min-h-16 rounded-2xl border-2 bg-white text-lg font-black shadow-sm transition ${
              locked ? "border-slate-200 text-slate-400" : "border-slate-300 hover:scale-[1.03] hover:shadow active:scale-[0.99]"
            }`}
          >
            <span className={`inline-block h-3 w-3 rounded-full ${color.bgClass}`} />{" "}
            <span className={color.className}>{color.text}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={newGame}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          Nueva partida
        </button>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

/* -------------------- ENCAJA -------------------- */

const EncajaGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [activePiece, setActivePiece] = useState<number | null>(null);
  const [pieces, setPieces] = useState<{ id: number; shape: string; angle: number; placed: boolean }[]>([]);

  const rotationEnabled = difficulty !== "facil";

  const newRound = useCallback(() => {
    const total = difficulty === "facil" ? 3 : difficulty === "media" ? 5 : 7;
    const base = shuffle(["▲", "●", "■", "◆", "⬟", "⬢", "⬣", "✦"]).slice(0, total);
    setPieces(base.map((shape, idx) => ({ id: idx, shape, angle: 0, placed: false })));
    setActivePiece(null);
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
  }, [difficulty]);

  useEffect(() => {
    newRound();
  }, [difficulty, newRound]);

  useEffect(() => {
    if (pieces.length && pieces.every((p) => p.placed)) {
      setFeedback("¡Figura completa! Orientación espacial excelente.");
      fireConfetti({ y: 0.55, count: 200 });
      setSuggestion(save({ score: pieces.length, attempts: Math.max(attempts, 1), startedAt, won: true }));
    }
  }, [pieces, attempts, startedAt, save]);

  const rotateActive = () => {
    if (!rotationEnabled || activePiece == null) return;
    setPieces((prev) => prev.map((p) => (p.id === activePiece ? { ...p, angle: (p.angle + 90) % 360 } : p)));
  };

  const placePiece = (targetId: number) => {
    if (activePiece == null) return;

    const selected = pieces.find((p) => p.id === activePiece);
    if (!selected || selected.placed) return;

    const tries = attempts + 1;
    setAttempts(tries);

    const rotationOk = !rotationEnabled || selected.angle % 360 === 0;
    const correct = targetId === activePiece && rotationOk;

    if (correct) {
      playSound("coin_4.wav");
      setPieces((prev) => prev.map((p) => (p.id === activePiece ? { ...p, placed: true } : p)));
      setFeedback("✅ Encaja perfecto.");
      return;
    }

    playSound("wobble.wav");
    setFeedback(rotationEnabled ? "No encaja. Prueba otra silueta o rota." : "No encaja. Prueba otra silueta.");
    setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>🧩 Piezas: {pieces.filter((p) => p.placed).length}/{pieces.length}</Pill>
        <Pill>🧠 Intentos: {attempts}</Pill>
        <Pill>{rotationEnabled ? "🔁 Rotación" : "✅ Sin rotación"}</Pill>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="font-black text-slate-800">Piezas</p>
            {rotationEnabled && (
              <button
                onClick={rotateActive}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
              >
                Rotar 90°
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {pieces.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePiece(p.id)}
                disabled={p.placed}
                className={`min-h-14 min-w-14 rounded-2xl border-2 text-3xl shadow-sm transition ${
                  p.placed
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                    : activePiece === p.id
                      ? "border-sky-500 bg-sky-50"
                      : "border-slate-300 bg-white hover:bg-slate-50"
                } active:scale-[0.99]`}
                style={{ transform: `rotate(${p.angle}deg)` }}
              >
                {p.shape}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-black text-slate-800">Siluetas</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {pieces.map((p) => (
              <button
                key={`target-${p.id}`}
                onClick={() => placePiece(p.id)}
                className={`min-h-16 rounded-2xl border-2 border-dashed text-3xl transition active:scale-[0.99] ${
                  p.placed
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-400 bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {p.shape}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

/* -------------------- INTRUSO (SOLO IMÁGENES + CELDAS ALTAS) -------------------- */

const IntrusoGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [board, setBoard] = useState<{ isOdd: boolean; image: string }[]>([]);
  const [odd, setOdd] = useState(0);
  const [locked, setLocked] = useState(false);

  const newRound = useCallback(() => {
    const total = difficulty === "facil" ? 9 : difficulty === "media" ? 16 : 25;
    const oddIndex = randomInt(total);

    setOdd(oddIndex);
    setBoard(
      Array.from({ length: total }, (_, idx) => ({
        isOdd: idx === oddIndex,
        image: idx === oddIndex ? intrusoAssets.odd : intrusoAssets.base,
      })),
    );

    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
    setLocked(false);
  }, [difficulty]);

  useEffect(() => {
    newRound();
  }, [difficulty, newRound]);

  const cols = Math.round(Math.sqrt(board.length));

  const handlePick = (index: number) => {
    if (locked) return;

    const tries = attempts + 1;
    setAttempts(tries);

    if (index !== odd) {
      playSound("wobble.wav");
      setFeedback("No. Busca el que cambia. 👀");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }

    playSound("coin_4.wav");
    setFeedback("¡Encontrado! 🔥");
    fireConfetti({ y: 0.5, count: 180 });
    setLocked(true);
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>🧠 Intentos: {attempts}</Pill>
        <Pill>{locked ? "🏁 Completado" : "🎯 Encuentra el intruso"}</Pill>
      </div>

      <p className="mt-4 text-sm text-slate-600">Pulsa la imagen diferente.</p>

      {/* Celdas más ALTAS: min-h-20 / sm:min-h-24 */}
      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.max(cols, 1)}, minmax(0, 1fr))` }}
      >
        {board.map((item, idx) => (
          <button
            key={`cell-${idx}`}
            onClick={() => handlePick(idx)}
            disabled={locked}
            className={`min-h-20 sm:min-h-24 rounded-3xl border-2 bg-white shadow-sm transition ${
              locked ? "border-slate-200 opacity-80" : "border-slate-300 hover:scale-[1.02] hover:bg-slate-50 active:scale-[0.99]"
            }`}
          >
            <div
              className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-cover bg-center shadow-sm"
              style={{ backgroundImage: `url(${item.image})` }}
            />
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={newRound}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          Nueva cuadrícula
        </button>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

/* -------------------- SIMON -------------------- */

const SimonGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [showing, setShowing] = useState(false);
  const timerRef = useRef<number | null>(null);

  const pads = [
    { id: 0, label: "Azul", className: "bg-blue-500" },
    { id: 1, label: "Verde", className: "bg-green-500" },
    { id: 2, label: "Rojo", className: "bg-red-500" },
    { id: 3, label: "Amarillo", className: "bg-yellow-400" },
  ];

  const playPadSound = useCallback((id: number) => {
    playSound(`select_${id + 1}.wav`);
  }, [playSound]);

  const startGame = useCallback(() => {
    const length = difficulty === "facil" ? 3 : difficulty === "media" ? 4 : 5;
    setSequence(Array.from({ length }, () => randomInt(4)));
    setUserSequence([]);
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
  }, [difficulty]);

  useEffect(() => {
    startGame();
  }, [difficulty, startGame]);

  useEffect(() => {
    if (!sequence.length) return;

    setShowing(true);
    let index = 0;

    if (timerRef.current) window.clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setActivePad(sequence[index]);
      playPadSound(sequence[index]);
      window.setTimeout(() => setActivePad(null), 320);

      index += 1;
      if (index >= sequence.length && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
        setShowing(false);
      }
    }, 620);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playPadSound, sequence]);

  const handlePad = (id: number) => {
    if (showing) return;

    playPadSound(id);

    const next = [...userSequence, id];
    setUserSequence(next);

    const tries = attempts + 1;
    setAttempts(tries);

    const idx = next.length - 1;
    if (next[idx] !== sequence[idx]) {
      playSound("wobble.wav");
      setFeedback("❌ Secuencia incorrecta. Reinicia.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }

    if (next.length === sequence.length) {
      playSound("coin_4.wav");
      setFeedback("✅ Perfecto. Secuencia completa.");
      fireConfetti({ y: 0.52, count: 190 });
      setSuggestion(save({ score: sequence.length, attempts: tries, startedAt, won: true }));
    } else {
      setFeedback(`Bien. Paso ${next.length}/${sequence.length}`);
    }
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>🧠 Intentos: {attempts}</Pill>
        <Pill>📶 Longitud: {sequence.length}</Pill>
        <Pill>{showing ? "👁️ Mira" : "👉 Repite"}</Pill>
      </div>

      <p className="mt-4 text-sm text-slate-600">Observa la secuencia y repítela en el mismo orden.</p>

      <div className="mt-4 grid max-w-sm grid-cols-2 gap-3">
        {pads.map((pad) => (
          <button
            key={pad.id}
            onClick={() => handlePad(pad.id)}
            disabled={showing}
            className={`min-h-24 rounded-3xl text-lg font-black text-white shadow-lg transition ${
              pad.className
            } ${showing ? "opacity-80" : "opacity-90 hover:opacity-100 hover:scale-[1.02] active:scale-[0.99]"} ${
              activePad === pad.id ? "scale-105 ring-4 ring-white/90 brightness-125" : ""
            }`}
          >
            {pad.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={startGame}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          Reiniciar
        </button>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

/* -------------------- RUTINAS (FormKit Drag & Drop) -------------------- */



function SortableRoutineItem({
  id,
  index,
  label,
}: {
  id: string;
  index: number;
  label: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm
        select-none touch-none
        ${isDragging ? "opacity-50" : ""}
      `}
      // Drag desde toda la tarjeta:
      {...attributes}
      {...listeners}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700">
          {index + 1}
        </span>
        <span className="truncate text-base font-bold text-slate-800">{label}</span>
      </div>

      <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
        ↕︎
      </span>
    </li>
  );
}

export const RutinasGame = ({
  game,
  difficulty,
}: {
  game: GameDefinition;
  difficulty: Difficulty;
}) => {
  const save = useGameSaver(game, difficulty);
  const playSound = useSoundEffects();

  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const [target, setTarget] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const newRound = () => {
    const routine = [
      "Desayunar",
      "Ducharse",
      "Paseo",
      "Comida",
      "Siesta",
      "Merienda",
      "Llamada familiar",
      "Cena",
    ];

    const steps = difficulty === "facil" ? 4 : difficulty === "media" ? 6 : 8;
    const selected = routine.slice(0, steps);

    setTarget(selected);
    setOrder(shuffle(selected));

    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
    setActiveId(null);
  };

  // init por dificultad
  useState(() => {
    // Ojo: para evitar SSR mismatch, inicializa vacío y rellena en effect:
    return null;
  });
  // Mejor: efecto (cliente)
  useMemo(() => {
    newRound();
    // solo cuando cambia la dificultad
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const items = useMemo(() => order, [order]);

  const onDragStart = (event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    setOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const validateOrder = () => {
    const tries = attempts + 1;
    setAttempts(tries);

    const correctPositions = order.filter((item, idx) => item === target[idx]).length;
    const accuracy = target.length ? Math.round((correctPositions / target.length) * 100) : 0;

    if (correctPositions !== target.length) {
      playSound("wobble.wav");
      setFeedback(`Tienes ${correctPositions}/${target.length} en posición correcta.`);
      setSuggestion(save({ score: correctPositions, attempts: tries, startedAt, won: false, accuracy }));
      return;
    }

    playSound("coin_4.wav");
    setFeedback("✅ Rutina perfecta.");
    fireConfetti({ y: 0.55, count: 200 });
    setSuggestion(save({ score: target.length, attempts: tries, startedAt, won: true, accuracy }));
  };

  const overlayLabel = activeId ? order.find((x) => x === activeId) : null;

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>📋 Pasos: {order.length}</Pill>
        <Pill>🧠 Intentos: {attempts}</Pill>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Arrastra cualquier tarjeta para ordenar (funciona en móvil).
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="mt-4 space-y-3">
            {order.map((step, index) => (
              <SortableRoutineItem key={step} id={step} index={index} label={step} />
            ))}
          </ul>
        </SortableContext>

        <DragOverlay>
          {overlayLabel ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
              <div className="text-base font-black text-slate-800">{overlayLabel}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={validateOrder}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-emerald-500 active:scale-[0.99]"
        >
          Validar
        </button>

        <button
          onClick={newRound}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          Reiniciar
        </button>
      </div>

      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};




/* -------------------- PLAYGROUND -------------------- */

export const GamePlayground = ({ game }: { game: GameDefinition }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("facil");

  return (
    <GameShell game={game} difficulty={difficulty} setDifficulty={setDifficulty}>
      {game.slug === "reloj" && <RelojGame game={game} difficulty={difficulty} />}
      {game.slug === "parejas" && <ParejasGame game={game} difficulty={difficulty} />}
      {game.slug === "patrones" && <PatronesGame game={game} difficulty={difficulty} />}
      {game.slug === "colores" && <ColoresGame game={game} difficulty={difficulty} />}
      {game.slug === "encaja" && <EncajaGame game={game} difficulty={difficulty} />}
      {game.slug === "intruso" && <IntrusoGame game={game} difficulty={difficulty} />}
      {game.slug === "simon" && <SimonGame game={game} difficulty={difficulty} />}
      {game.slug === "rutinas" && <RutinasGame game={game} difficulty={difficulty} />}
    </GameShell>
  );
};
