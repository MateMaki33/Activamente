import Link from "next/link";
import type { GameDefinition } from "@/features/games/types";

const categoryStyles: Record<GameDefinition["category"], string> = {
  Memoria: "from-emerald-100 to-emerald-50 border-emerald-300",
  Atención: "from-amber-100 to-amber-50 border-amber-300",
  Tiempo: "from-sky-100 to-sky-50 border-sky-300",
  Espacial: "from-violet-100 to-violet-50 border-violet-300",
  Lógica: "from-fuchsia-100 to-fuchsia-50 border-fuchsia-300",
};

export const GameCard = ({ game }: { game: GameDefinition }) => (
  <article className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${categoryStyles[game.category]}`}>
    <p className="text-sm font-bold uppercase tracking-wide text-slate-700">{game.category}</p>
    <h3 className="mt-2 text-2xl font-extrabold text-slate-900">{game.title}</h3>
    <p className="mt-2 text-slate-800">{game.shortDescription}</p>
    <Link href={`/juegos/${game.slug}`} className="mt-4 inline-block rounded-xl bg-sky-800 px-5 py-3 font-bold text-white transition hover:bg-sky-900">
      Jugar ahora
    </Link>
  </article>
);
