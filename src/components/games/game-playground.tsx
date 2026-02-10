"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  <section className="rounded-2xl border border-slate-200 bg-white p-6">
    <h2 className="text-3xl font-bold">{game.title}</h2>
    <p className="mt-2 text-slate-700">{game.instructions}</p>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {game.difficulties.map((level) => (
        <button key={level} onClick={() => setDifficulty(level)} className={`rounded-lg border px-4 py-2 ${difficulty === level ? "bg-sky-700 text-white" : "bg-white"}`}>
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
    {feedback && <p className="mt-5 rounded-lg bg-slate-100 p-3 font-semibold">{feedback}</p>}
    {suggestion && <p className="mt-3 rounded-lg bg-amber-100 p-3">{suggestion}</p>}
  </>
);

const ClockFace = ({ hour, minute }: { hour: number; minute: number }) => {
  const minuteAngle = minute * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  return (
    <div className="relative mx-auto mt-6 h-56 w-56 rounded-full border-8 border-slate-300 bg-white">
      {Array.from({ length: 12 }, (_, index) => {
        const value = index + 1;
        const angle = ((value - 3) * Math.PI) / 6;
        return (
          <span key={value} className="absolute -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-slate-700" style={{ left: `${50 + Math.cos(angle) * 42}%`, top: `${50 + Math.sin(angle) * 42}%` }}>
            {value}
          </span>
        );
      })}
      <div className="absolute left-1/2 top-1/2 h-20 w-1 -translate-x-1/2 -translate-y-full origin-bottom rounded bg-slate-900" style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }} />
      <div className="absolute left-1/2 top-1/2 h-24 w-1 -translate-x-1/2 -translate-y-full origin-bottom rounded bg-sky-600" style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }} />
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800" />
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
    if (!correct) return setFeedback("Casi. Ajusta un poco más las manecillas.");
    setFeedback("¡Muy bien! Hora correcta.");
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <p className="mt-6 text-2xl font-semibold">Consigna: pon las {String(target.hour).padStart(2, "0")}:{String(target.minute).padStart(2, "0")}</p>
      <ClockFace hour={hour} minute={minute} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="rounded-xl border p-3">Hora<input type="range" min={1} max={12} value={hour} onChange={(e) => setHour(Number(e.target.value))} className="mt-2 w-full" /></label>
        <label className="rounded-xl border p-3">Minutos<input type="range" min={0} max={55} step={5} value={minute} onChange={(e) => setMinute(Number(e.target.value))} className="mt-2 w-full" /></label>
      </div>
      <button onClick={handleCheck} className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white">Confirmar hora</button>
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
  const [cards, setCards] = useState<{ id: number; value: string; open: boolean; matched: boolean }[]>([]);

  useEffect(() => {
    const emojis = ["🍎", "🚲", "🌙", "🌻", "🎹", "🏠", "📚", "🧩", "☕", "🕰️"];
    const pairCount = difficulty === "facil" ? 3 : difficulty === "media" ? 6 : 8;
    const values = shuffle(emojis).slice(0, pairCount);
    setCards(shuffle(values.flatMap((value, idx) => [{ id: idx * 2, value, open: false, matched: false }, { id: idx * 2 + 1, value, open: false, matched: false }])));
    setSelected([]);
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
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
      setTimeout(() => {
        setCards((prev) => prev.map((item) => {
          if (item.id !== a.id && item.id !== b.id) return item;
          return isMatch ? { ...item, matched: true } : { ...item, open: false };
        }));
        setSelected([]);
      }, 500);
    }
  };

  useEffect(() => {
    if (cards.length && cards.every((card) => card.matched)) {
      const score = cards.length / 2;
      setFeedback("¡Excelente memoria! Has encontrado todas las parejas.");
      setSuggestion(save({ score, attempts: Math.max(attempts, 1), startedAt, won: true, accuracy: Math.round((score / Math.max(attempts, 1)) * 100) }));
    }
  }, [cards, attempts, startedAt, save]);

  return (
    <>
      <p className="mt-6">Destapa dos cartas y encuentra las parejas iguales.</p>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => (
          <button key={card.id} onClick={() => handleCard(card.id)} className="min-h-20 rounded-xl border-2 border-slate-300 text-3xl font-bold hover:bg-slate-100">{card.open || card.matched ? card.value : "?"}</button>
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

  useEffect(() => {
    const bank = difficulty === "facil"
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

  const handleAnswer = (value: string) => {
    const tries = attempts + 1;
    setAttempts(tries);
    if (value !== question.answer) return setFeedback("No encaja del todo. Mira la secuencia otra vez.");
    setFeedback("¡Patrón correcto!");
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <div className="mt-6 rounded-xl border p-4"><p className="text-lg font-semibold">Secuencia</p><div className="mt-3 flex flex-wrap gap-3 text-3xl">{question.seq.map((item, index) => <span key={`${item}-${index}`} className="rounded-lg bg-slate-100 px-3 py-2">{item}</span>)}</div></div>
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

  const allColors = [
    { key: "rojo", text: "ROJO", className: "text-red-600" },
    { key: "azul", text: "AZUL", className: "text-blue-600" },
    { key: "verde", text: "VERDE", className: "text-green-600" },
    { key: "amarillo", text: "AMARILLO", className: "text-yellow-500" },
    { key: "morado", text: "MORADO", className: "text-purple-600" },
    { key: "naranja", text: "NARANJA", className: "text-orange-600" },
  ] as const;

  const palette = useMemo(
    () => allColors.slice(0, difficulty === "facil" ? 3 : difficulty === "media" ? 4 : 6),
    [difficulty],
  );
  const [prompt, setPrompt] = useState({ text: "ROJO", ink: "azul", className: "text-blue-600" });

  useEffect(() => {
    const text = palette[randomInt(palette.length)];
    const ink = palette[randomInt(palette.length)];
    setPrompt({ text: text.text, ink: ink.key, className: ink.className });
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
      const text = palette[randomInt(palette.length)];
      const ink = palette[randomInt(palette.length)];
      setPrompt({ text: text.text, ink: ink.key, className: ink.className });
      setRound((prev) => prev + 1);
    }, limitMs);
    return () => clearTimeout(timer);
  }, [prompt, limitMs, palette]);

  const handleColor = (key: string) => {
    const tries = attempts + 1;
    setAttempts(tries);
    if (key === prompt.ink) {
      setFeedback("¡Correcto! Has elegido el color de la tinta.");
      setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
    } else {
      setFeedback("Recuerda: importa el color visual del texto.");
    }
    const text = palette[randomInt(palette.length)];
    const ink = palette[randomInt(palette.length)];
    setPrompt({ text: text.text, ink: ink.key, className: ink.className });
    setRound((prev) => prev + 1);
  };

  return (
    <>
      <p className="mt-6 text-sm text-slate-500">Ronda {round}</p>
      <p className={`mt-2 text-center text-5xl font-black ${prompt.className}`}>{prompt.text}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">{palette.map((color) => <button key={color.key} onClick={() => handleColor(color.key)} className={`min-h-14 rounded-xl border-2 border-slate-300 text-lg font-bold ${color.className}`}>{color.text}</button>)}</div>
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
  };

  return (
    <>
      <p className="mt-6">Selecciona una pieza y luego pulsa su silueta correspondiente.</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-4"><p className="font-semibold">Piezas</p><div className="mt-3 flex flex-wrap gap-3">{pieces.map((piece) => <button key={piece.id} onClick={() => setActivePiece(piece.id)} className={`min-h-14 min-w-14 rounded-xl border-2 text-3xl ${activePiece === piece.id ? "border-sky-500" : "border-slate-300"} ${piece.placed ? "opacity-40" : ""}`} style={{ transform: `rotate(${piece.angle}deg)` }}>{piece.shape}</button>)}</div>{rotationEnabled && <button onClick={() => setPieces((prev) => prev.map((piece) => (piece.id === activePiece ? { ...piece, angle: (piece.angle + 90) % 360 } : piece)))} className="mt-4 rounded-lg border px-4 py-2 font-semibold">Rotar 90°</button>}</div>
        <div className="rounded-xl border p-4"><p className="font-semibold">Siluetas</p><div className="mt-3 grid grid-cols-3 gap-3">{pieces.map((piece) => <button key={`target-${piece.id}`} onClick={() => placePiece(piece.id)} className="min-h-16 rounded-xl border-2 border-dashed border-slate-400 text-3xl">{piece.placed ? piece.shape : "◌"}</button>)}</div></div>
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
  const [board, setBoard] = useState<string[]>([]);
  const [odd, setOdd] = useState(0);

  useEffect(() => {
    const total = difficulty === "facil" ? 9 : difficulty === "media" ? 16 : 25;
    const base = difficulty === "dificil" ? "◉" : "●";
    const diff = difficulty === "dificil" ? "◎" : "○";
    const oddIndex = randomInt(total);
    setOdd(oddIndex);
    setBoard(Array.from({ length: total }, (_, idx) => (idx === oddIndex ? diff : base)));
    setAttempts(0);
    setFeedback("");
    setSuggestion("");
    setStartedAt(Date.now());
  }, [difficulty]);

  const cols = Math.sqrt(board.length);
  const handlePick = (index: number) => {
    const tries = attempts + 1;
    setAttempts(tries);
    if (index !== odd) return setFeedback("Ese no era. Busca el símbolo que cambia.");
    setFeedback("¡Lo encontraste!");
    setSuggestion(save({ score: 1, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <p className="mt-6">Pulsa el elemento diferente de la cuadrícula.</p>
      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>{board.map((item, idx) => <button key={`${item}-${idx}`} onClick={() => handlePick(idx)} className="min-h-14 rounded-xl border-2 border-slate-300 text-3xl hover:bg-slate-100">{item}</button>)}</div>
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
  }, [difficulty]);

  useEffect(() => {
    startGame();
  }, [difficulty]);

  useEffect(() => {
    if (!sequence.length) return;
    setShowing(true);
    let index = 0;
    timerRef.current = window.setInterval(() => {
      setActivePad(sequence[index]);
      setTimeout(() => setActivePad(null), 320);
      index += 1;
      if (index >= sequence.length && timerRef.current) {
        clearInterval(timerRef.current);
        setShowing(false);
      }
    }, 600);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sequence]);

  const handlePad = (id: number) => {
    if (showing) return;
    const next = [...userSequence, id];
    setUserSequence(next);
    const tries = attempts + 1;
    setAttempts(tries);
    if (next[next.length - 1] !== sequence[next.length - 1]) return setFeedback("Secuencia incorrecta. Pulsa reiniciar.");
    if (next.length === sequence.length) {
      setFeedback("¡Perfecto! Secuencia completa.");
      setSuggestion(save({ score: sequence.length, attempts: tries, startedAt, won: true }));
    }
  };

  return (
    <>
      <p className="mt-6">Observa la secuencia de luces y repítela en el mismo orden.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:max-w-sm">{pads.map((pad) => <button key={pad.id} onClick={() => handlePad(pad.id)} className={`min-h-20 rounded-xl text-white shadow ${pad.className} ${activePad === pad.id ? "ring-4 ring-white brightness-125" : "opacity-90"}`}>{pad.label}</button>)}</div>
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
  const [order, setOrder] = useState<string[]>([]);
  const [target, setTarget] = useState<string[]>([]);

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
  }, [difficulty]);

  const validateOrder = () => {
    const tries = attempts + 1;
    setAttempts(tries);
    const correctPositions = order.filter((item, idx) => item === target[idx]).length;
    if (correctPositions !== target.length) return setFeedback(`Tienes ${correctPositions} de ${target.length} en posición correcta.`);
    setFeedback("¡Rutina ordenada correctamente!");
    setSuggestion(save({ score: target.length, attempts: tries, startedAt, won: true }));
  };

  return (
    <>
      <p className="mt-6">Ordena las actividades del día de forma lógica.</p>
      <div className="mt-4 space-y-3">{order.map((step, index) => <div key={step} className="flex items-center justify-between rounded-xl border p-3"><span className="text-lg font-semibold">{step}</span><div className="flex gap-2"><button onClick={() => setOrder((prev) => { if (index === 0) return prev; const copy = [...prev]; [copy[index], copy[index - 1]] = [copy[index - 1], copy[index]]; return copy; })} className="rounded-lg border px-3 py-2">↑</button><button onClick={() => setOrder((prev) => { if (index === prev.length - 1) return prev; const copy = [...prev]; [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]]; return copy; })} className="rounded-lg border px-3 py-2">↓</button></div></div>)}</div>
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
