"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "@hiseb/confetti";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import type { Difficulty } from "@/lib/constants";
import type { GameDefinition } from "@/features/games/types";
import { useGameSession } from "@/features/games/useGameSession";

const randomInt = (max: number) => Math.floor(Math.random() * max);
const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

const difficultyLabel: Record<Difficulty, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

const parejasAssets = [
  "/images/games/parejas/carta-1.jpg",
  "/images/games/parejas/carta-2.jpg",
  "/images/games/parejas/carta-3.jpg",
  "/images/games/parejas/carta-4.jpg",
  "/images/games/parejas/carta-5.jpg",
  "/images/games/parejas/carta-6.jpg",
  "/images/games/parejas/carta-7.jpg",
  "/images/games/parejas/carta-8.jpg",
  "/images/games/parejas/carta-9.jpg",
  "/images/games/parejas/carta-10.jpg",
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


const AssetOrFallback = ({
  src,
  alt,
  fallback,
  className,
  failed,
  onFail,
}: {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  failed: boolean;
  onFail: () => void;
}) => {
  if (failed) return <span className="text-3xl">{fallback}</span>;
  return <img src={src} alt={alt} className={className} onError={onFail} />;
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
  children: React.ReactNode;
}) => (
  <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm sm:p-6">
    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{game.title}</h2>
    <p className="mt-2 text-sm text-slate-600 sm:text-base">{game.instructions}</p>
    <div className="mt-4 flex flex-wrap items-center gap-2">
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
    {children}
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
  <>
    {feedback && <p className="mt-5 rounded-xl bg-slate-100 p-3 font-semibold text-slate-800">{feedback}</p>}
    {suggestion && <p className="mt-3 rounded-xl bg-amber-100 p-3 text-amber-900">{suggestion}</p>}
  </>
);

const ClockFace = ({ hour, minute }: { hour: number; minute: number }) => {
  const minuteAngle = minute * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  return (
    <div className="relative mx-auto mt-6 aspect-square w-full max-w-72 rounded-full border-8 border-slate-300 bg-white shadow-inner">
      {Array.from({ length: 60 }, (_, index) => (
        <span
          key={index}
          className={`absolute left-1/2 top-1/2 block h-1 rounded-full ${index % 5 === 0 ? "w-3 bg-slate-500" : "w-1 bg-slate-300"}`}
          style={{ transform: `translate(-50%, -50%) rotate(${index * 6}deg) translateY(-132px)` }}
        />
      ))}
      {Array.from({ length: 12 }, (_, index) => {
        const value = index + 1;
        const angle = ((value - 3) * Math.PI) / 6;
        return (
          <span
            key={value}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-base font-bold text-slate-700 sm:text-lg"
            style={{ left: `${50 + Math.cos(angle) * 40}%`, top: `${50 + Math.sin(angle) * 40}%` }}
          >
            {value}
          </span>
        );
      })}
      <div
        className="absolute bottom-1/2 left-1/2 h-20 w-2 -translate-x-1/2 origin-bottom rounded-full bg-slate-900"
        style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }}
      />
      <div
        className="absolute bottom-1/2 left-1/2 h-28 w-1.5 -translate-x-1/2 origin-bottom rounded-full bg-sky-600"
        style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}
      />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800" />
    </div>
  );
};

const RelojGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [target, setTarget] = useState({ hour: 12, minute: 0 });

  useEffect(() => {
    setTarget({ hour: randomInt(12) + 1, minute: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][randomInt(12)] });
    setFeedback("");
    setSuggestion("");
    setAttempts(0);
    setStartedAt(Date.now());
  }, [difficulty]);

  const tolerance = difficulty === "facil" ? 12 : difficulty === "media" ? 8 : 5;
  const handleCheck = () => {
    const tries = attempts + 1;
    setAttempts(tries);
    const targetMinutes = (target.hour % 12) * 60 + target.minute;
    const selectedMinutes = (hour % 12) * 60 + minute;
    const diff = Math.abs(targetMinutes - selectedMinutes);
    const correct = Math.min(diff, 720 - diff) <= tolerance;
    if (!correct) {
      setFeedback("Casi. Ajusta un poco más las manecillas.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }
    setFeedback("¡Muy bien! Hora correcta.");
    confetti();
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <p className="mt-6 text-xl font-semibold sm:text-2xl">
        Consigna: pon las {String(target.hour).padStart(2, "0")}:{String(target.minute).padStart(2, "0")}
      </p>
      <ClockFace hour={hour} minute={minute} />
      <p className="mt-4 text-center text-lg font-semibold text-slate-700">Hora seleccionada: {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">Hora<input type="range" min={1} max={12} value={hour} onChange={(e) => setHour(Number(e.target.value))} className="mt-2 w-full" /></label>
        <label className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">Minutos<input type="range" min={0} max={55} step={5} value={minute} onChange={(e) => setMinute(Number(e.target.value))} className="mt-2 w-full" /></label>
      </div>
      <button onClick={handleCheck} className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white shadow hover:bg-emerald-500">Confirmar hora</button>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

const ParejasGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [cards, setCards] = useState<{ id: number; value: string; open: boolean; matched: boolean; image: string }[]>([]);
  const [failedAssets, setFailedAssets] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const emojis = ["🍎", "🚲", "🌙", "🌻", "🎹", "🏠", "📚", "🧩", "☕", "🕰️"];
    const pairCount = difficulty === "facil" ? 3 : difficulty === "media" ? 6 : 8;
    const values = shuffle(emojis).slice(0, pairCount);
    setCards(
      shuffle(
        values.flatMap((value, idx) => [
          { id: idx * 2, value, open: false, matched: false, image: parejasAssets[idx] },
          { id: idx * 2 + 1, value, open: false, matched: false, image: parejasAssets[idx] },
        ]),
      ),
    );
    setSelected([]);
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
    setFailedAssets({});
  }, [difficulty]);

  const handleCard = (id: number) => {
    const card = cards.find((item) => item.id === id);
    if (!card || card.open || card.matched || selected.length === 2) return;
    const opened = cards.map((item) => (item.id === id ? { ...item, open: true } : item));
    const nextSelected = [...selected, id];
    setCards(opened);
    setSelected(nextSelected);
    if (nextSelected.length === 2) {
      const tries = attempts + 1;
      setAttempts(tries);
      const [a, b] = nextSelected.map((selectedId) => opened.find((item) => item.id === selectedId)!);
      const isMatch = a.value === b.value;
      if (!isMatch) {
        setFeedback("No eran pareja. Inténtalo de nuevo.");
        setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      }
      setTimeout(() => {
        setCards((prev) =>
          prev.map((item) => {
            if (item.id !== a.id && item.id !== b.id) return item;
            return isMatch ? { ...item, matched: true } : { ...item, open: false };
          }),
        );
        setSelected([]);
      }, 500);
    }
  };

  useEffect(() => {
    if (cards.length && cards.every((card) => card.matched)) {
      const score = cards.length / 2;
      setFeedback("¡Excelente memoria! Has encontrado todas las parejas.");
      confetti();
      setSuggestion(save({ score, attempts: Math.max(attempts, 1), startedAt, won: true, accuracy: Math.round((score / Math.max(attempts, 1)) * 100) }));
    }
  }, [cards, attempts, startedAt, save]);

  return (
    <>
      <p className="mt-6">Destapa dos cartas y encuentra las parejas iguales.</p>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCard(card.id)}
            className="group min-h-24 overflow-hidden rounded-2xl border-2 border-slate-300 bg-white text-3xl font-bold shadow-sm transition hover:scale-[1.02] hover:shadow"
          >
            {card.open || card.matched ? (
              <div className="flex h-full min-h-24 items-center justify-center gap-2 bg-slate-50 p-2">
                <AssetOrFallback
                  src={card.image}
                  alt={`Carta ${card.value}`}
                  fallback={card.value}
                  className="h-14 w-14 rounded-lg object-cover"
                  failed={Boolean(failedAssets[card.id])}
                  onFail={() => setFailedAssets((prev) => ({ ...prev, [card.id]: true }))}
                />
              </div>
            ) : (
              <div className="flex h-full min-h-24 items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-300 text-white">?</div>
            )}
          </button>
        ))}
      </div>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

const PatronesGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [question, setQuestion] = useState<{ seq: string[]; answer: string; options: string[] }>({ seq: [], answer: "", options: [] });
  const [revealedSeq, setRevealedSeq] = useState<string[]>([]);

  useEffect(() => {
    const bank =
      difficulty === "facil"
        ? { seq: ["🔵", "🟢", "🔵", "🟢", "?"], answer: "🔵", options: ["🔵", "🟢", "🟣"] }
        : difficulty === "media"
          ? { seq: ["🟥", "🟨", "🟨", "🟥", "🟨", "?"], answer: "🟨", options: ["🟨", "🟥", "🟦", "🟩"] }
          : { seq: ["1", "2", "3", "1", "2", "3", "1", "?"], answer: "2", options: ["1", "2", "3", "4", "5", "6"] };
    setQuestion({ ...bank, options: shuffle(bank.options) });
    setRevealedSeq(bank.seq);
    setFeedback("");
    setSuggestion("");
    setAttempts(0);
    setStartedAt(Date.now());
  }, [difficulty]);

  const handleAnswer = (value: string) => {
    const tries = attempts + 1;
    setAttempts(tries);
    if (value !== question.answer) {
      setFeedback("No encaja del todo. Mira la secuencia otra vez.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }
    setFeedback("¡Patrón correcto!");
    setRevealedSeq((prev) => prev.map((item) => (item === "?" ? question.answer : item)));
    confetti();
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <div className="mt-6 rounded-xl border p-4">
        <p className="text-lg font-semibold">Secuencia</p>
        <div className="mt-3 flex flex-wrap gap-3 text-3xl">{revealedSeq.map((item, index) => <span key={`${item}-${index}`} className="rounded-lg bg-slate-100 px-3 py-2">{item}</span>)}</div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">{question.options.map((option) => <button key={option} onClick={() => handleAnswer(option)} className="min-h-14 rounded-xl border-2 border-slate-300 text-2xl font-bold hover:bg-slate-100">{option}</button>)}</div>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

const ColoresGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [round, setRound] = useState(1);

  const palette = useMemo(() => stroopColors.slice(0, difficulty === "facil" ? 3 : difficulty === "media" ? 4 : 6), [difficulty]);
  const [prompt, setPrompt] = useState({ text: "ROJO", ink: "azul", className: "text-blue-600", bgClass: "bg-blue-500" });

  useEffect(() => {
    const text = palette[randomInt(palette.length)];
    const ink = palette[randomInt(palette.length)];
    setPrompt({ text: text.text, ink: ink.key, className: ink.className, bgClass: ink.bgClass });
    setAttempts(0);
    setRound(1);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
  }, [difficulty, palette]);

  const limitMs = difficulty === "facil" ? 0 : difficulty === "media" ? 9000 : 6000;
  useEffect(() => {
    if (!limitMs) return;
    const timer = setTimeout(() => {
      setFeedback("Tiempo agotado. Sigue con la siguiente ronda.");
      setAttempts((prev) => prev + 1);
      setSuggestion(save({ score: 0, attempts: Math.max(attempts + 1, 1), startedAt, won: false, accuracy: 0 }));
      const text = palette[randomInt(palette.length)];
      const ink = palette[randomInt(palette.length)];
      setPrompt({ text: text.text, ink: ink.key, className: ink.className, bgClass: ink.bgClass });
      setRound((prev) => prev + 1);
    }, limitMs);
    return () => clearTimeout(timer);
  }, [attempts, prompt, limitMs, palette, save, startedAt]);

  const handleColor = (key: string) => {
    const tries = attempts + 1;
    setAttempts(tries);
    if (key === prompt.ink) {
      setFeedback("¡Correcto! Has elegido el color de la tinta.");
      confetti();
      setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
    } else {
      setFeedback("Recuerda: importa el color visual del texto.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
    }
    const text = palette[randomInt(palette.length)];
    const ink = palette[randomInt(palette.length)];
    setPrompt({ text: text.text, ink: ink.key, className: ink.className, bgClass: ink.bgClass });
    setRound((prev) => prev + 1);
  };

  return (
    <>
      <p className="mt-6 text-sm text-slate-500">Ronda {round}</p>
      <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">Pulsa el color de la tinta (no la palabra)</p>
        <p className={`mt-3 text-center text-5xl font-black ${prompt.className}`}>{prompt.text}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {palette.map((color) => (
          <button
            key={color.key}
            onClick={() => handleColor(color.key)}
            className="min-h-16 rounded-xl border-2 border-slate-300 bg-white text-lg font-bold shadow-sm transition hover:scale-[1.03] hover:shadow"
          >
            <span className={`inline-block h-3 w-3 rounded-full ${color.bgClass}`} /> <span className={color.className}>{color.text}</span>
          </button>
        ))}
      </div>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

const EncajaGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [activePiece, setActivePiece] = useState<number | null>(null);
  const [pieces, setPieces] = useState<{ id: number; shape: string; angle: number; placed: boolean }[]>([]);

  const rotationEnabled = difficulty !== "facil";

  useEffect(() => {
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
    if (pieces.length && pieces.every((piece) => piece.placed)) {
      setFeedback("¡Figura completa! Excelente orientación espacial.");
      confetti();
      setSuggestion(save({ score: pieces.length, attempts: Math.max(attempts, 1), startedAt, won: true }));
    }
  }, [pieces, attempts, startedAt, save]);

  const placePiece = (targetId: number) => {
    if (activePiece == null) return;
    const selected = pieces.find((piece) => piece.id === activePiece);
    if (!selected || selected.placed) return;
    const tries = attempts + 1;
    setAttempts(tries);
    const rotationOk = !rotationEnabled || selected.angle % 360 === 0;
    if (targetId === activePiece && rotationOk) {
      setPieces((prev) => prev.map((piece) => (piece.id === activePiece ? { ...piece, placed: true } : piece)));
      setFeedback("¡Pieza encajada!");
      return;
    }
    setFeedback("No encaja todavía. Prueba otra posición o rotación.");
    setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
  };

  return (
    <>
      <p className="mt-6">Selecciona una pieza y luego pulsa su silueta correspondiente.</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-4"><p className="font-semibold">Piezas</p><div className="mt-3 flex flex-wrap gap-3">{pieces.map((piece) => <button key={piece.id} onClick={() => setActivePiece(piece.id)} className={`min-h-14 min-w-14 rounded-xl border-2 text-3xl ${activePiece === piece.id ? "border-sky-500" : "border-slate-300"} ${piece.placed ? "opacity-40" : ""}`} style={{ transform: `rotate(${piece.angle}deg)` }}>{piece.shape}</button>)}</div>{rotationEnabled && <button onClick={() => setPieces((prev) => prev.map((piece) => (piece.id === activePiece ? { ...piece, angle: (piece.angle + 90) % 360 } : piece)))} className="mt-4 rounded-lg border px-4 py-2 font-semibold">Rotar 90°</button>}</div>
        <div className="rounded-xl border p-4"><p className="font-semibold">Siluetas</p><div className="mt-3 grid grid-cols-3 gap-3">{pieces.map((piece) => <button key={`target-${piece.id}`} onClick={() => placePiece(piece.id)} className={`min-h-16 rounded-xl border-2 border-dashed text-3xl ${piece.placed ? "border-emerald-500 bg-emerald-50" : "border-slate-400 bg-slate-50 text-slate-400"}`}>{piece.shape}</button>)}</div></div>
      </div>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

const IntrusoGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [board, setBoard] = useState<{ isOdd: boolean; icon: string }[]>([]);
  const [odd, setOdd] = useState(0);
  const [failedImage, setFailedImage] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const total = difficulty === "facil" ? 9 : difficulty === "media" ? 16 : 25;
    const oddIndex = randomInt(total);
    setOdd(oddIndex);
    setBoard(Array.from({ length: total }, (_, idx) => ({ isOdd: idx === oddIndex, icon: idx === oddIndex ? "🦊" : "🐶" })));
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
    setFailedImage({});
  }, [difficulty]);

  const cols = Math.sqrt(board.length);
  const handlePick = (index: number) => {
    const tries = attempts + 1;
    setAttempts(tries);
    if (index !== odd) {
      setFeedback("Ese no era. Busca el elemento que cambia.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }
    setFeedback("¡Lo encontraste!");
    confetti();
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <p className="mt-6">Pulsa el elemento diferente de la cuadrícula.</p>
      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {board.map((item, idx) => (
          <button key={`${item.icon}-${idx}`} onClick={() => handlePick(idx)} className="min-h-16 rounded-xl border-2 border-slate-300 bg-white text-3xl shadow-sm transition hover:scale-105 hover:bg-slate-100">
            <div className="mx-auto flex h-10 w-10 items-center justify-center">
              <AssetOrFallback
                src={item.isOdd ? intrusoAssets.odd : intrusoAssets.base}
                alt="Elemento"
                fallback={item.icon}
                className="h-8 w-8 rounded object-cover"
                failed={Boolean(failedImage[item.isOdd ? intrusoAssets.odd : intrusoAssets.base])}
                onFail={() =>
                  setFailedImage((prev) => ({
                    ...prev,
                    [item.isOdd ? intrusoAssets.odd : intrusoAssets.base]: true,
                  }))
                }
              />
            </div>
          </button>
        ))}
      </div>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

const SimonGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [showing, setShowing] = useState(false);
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number>(-1);
  const timerRef = useRef<number | null>(null);

  const pads = [
    { id: 0, label: "Azul", className: "bg-blue-500" },
    { id: 1, label: "Verde", className: "bg-green-500" },
    { id: 2, label: "Rojo", className: "bg-red-500" },
    { id: 3, label: "Amarillo", className: "bg-yellow-500" },
  ];

  const startGame = useCallback(() => {
    const length = difficulty === "facil" ? 3 : difficulty === "media" ? 4 : 5;
    setSequence(Array.from({ length }, () => randomInt(4)));
    setUserSequence([]);
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
    setActiveSequenceIndex(-1);
  }, [difficulty]);

  useEffect(() => {
    startGame();
  }, [difficulty, startGame]);

  useEffect(() => {
    if (!sequence.length) return;
    setShowing(true);
    let index = 0;
    timerRef.current = window.setInterval(() => {
      setActivePad(sequence[index]);
      setActiveSequenceIndex(index);
      setTimeout(() => setActivePad(null), 380);
      index += 1;
      if (index >= sequence.length && timerRef.current) {
        clearInterval(timerRef.current);
        setShowing(false);
        setActiveSequenceIndex(-1);
      }
    }, 700);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sequence]);

  const handlePad = (id: number) => {
    if (showing) return;
    const next = [...userSequence, id];
    setUserSequence(next);
    setActiveSequenceIndex(next.length - 1);
    const tries = attempts + 1;
    setAttempts(tries);
    if (next[next.length - 1] !== sequence[next.length - 1]) {
      setFeedback("Secuencia incorrecta. Pulsa reiniciar.");
      setSuggestion(save({ score: 0, attempts: tries, startedAt, won: false, accuracy: 0 }));
      return;
    }
    if (next.length === sequence.length) {
      setFeedback("¡Perfecto! Secuencia completa.");
      confetti();
      setSuggestion(save({ score: sequence.length, attempts: tries, startedAt, won: true }));
    }
  };

  return (
    <>
      <p className="mt-6">Observa la secuencia de luces y repítela en el mismo orden.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <div className="grid grid-cols-2 gap-3 md:max-w-sm">
          {pads.map((pad) => (
            <button
              key={pad.id}
              onClick={() => handlePad(pad.id)}
              className={`min-h-24 rounded-2xl text-lg font-bold text-white shadow-lg transition ${pad.className} ${
                activePad === pad.id ? "scale-105 ring-4 ring-white/90 brightness-125" : "opacity-90 hover:opacity-100"
              }`}
            >
              {pad.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Secuencia</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sequence.map((step, index) => (
              <span
                key={`${step}-${index}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${pads[step].className} ${
                  activeSequenceIndex === index ? "scale-105 ring-2 ring-slate-900" : "opacity-70"
                }`}
              >
                {pads[step].label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {showing && <p className="mt-2 text-sm font-semibold text-sky-700">Mostrando secuencia...</p>}
      <button onClick={startGame} className="mt-4 rounded-lg border px-4 py-2 font-semibold">Reiniciar secuencia</button>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

const RutinasGame = ({ game, difficulty }: { game: GameDefinition; difficulty: Difficulty }) => {
  const save = useGameSaver(game, difficulty);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [target, setTarget] = useState<string[]>([]);
  const [parent, order, setOrder] = useDragAndDrop<HTMLDivElement, string>([]);

  useEffect(() => {
    const routine = ["Desayunar", "Ducharse", "Paseo", "Comida", "Siesta", "Merienda", "Llamada familiar", "Cena"];
    const steps = difficulty === "facil" ? 4 : difficulty === "media" ? 6 : 8;
    const selected = routine.slice(0, steps);
    setTarget(selected);
    setOrder(shuffle(selected));
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
  }, [difficulty, setOrder]);

  const validateOrder = () => {
    const tries = attempts + 1;
    setAttempts(tries);
    const correctPositions = order.filter((item, idx) => item === target[idx]).length;
    const accuracy = Math.round((correctPositions / target.length) * 100);
    if (correctPositions !== target.length) {
      setFeedback(`Tienes ${correctPositions} de ${target.length} en posición correcta.`);
      setSuggestion(save({ score: correctPositions, attempts: tries, startedAt, won: false, accuracy }));
      return;
    }
    setFeedback("¡Rutina ordenada correctamente!");
    confetti();
    setSuggestion(save({ score: target.length, attempts: tries, startedAt, won: true, accuracy }));
  };

  return (
    <>
      <p className="mt-6">Ordena las actividades del día con arrastrar y soltar.</p>
      <div ref={parent} className="mt-4 space-y-3">
        {order.map((step, index) => (
          <div
            key={step}
            draggable
            data-dnd-index={index}
            className="flex cursor-grab items-center justify-between rounded-xl border bg-white p-3 shadow-sm transition active:cursor-grabbing"
          >
            <span className="text-lg font-semibold">{index + 1}. {step}</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-600">↕ mover</span>
          </div>
        ))}
      </div>
      <button onClick={validateOrder} className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white">Validar orden</button>
      <ScorePanel feedback={feedback} suggestion={suggestion} />
    </>
  );
};

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
