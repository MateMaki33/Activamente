import Link from "next/link";
import type { GameDefinition } from "@/features/games/types";

export const GameCard = ({ game }: { game: GameDefinition }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-semibold text-sky-700">{game.category}</p>
    <h3 className="mt-2 text-2xl font-bold">{game.title}</h3>
    <p className="mt-2 text-slate-700">{game.shortDescription}</p>
    <Link href={`/juegos/${game.slug}`} className="mt-4 inline-block rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white">
      Jugar ahora
    </Link>
  </article>
);
