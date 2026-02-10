import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { APP_CLAIM, APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { GAMES } from "@/content/games";
import { GameCard } from "@/components/ui/game-card";

export const metadata = buildMetadata("Inicio", APP_DESCRIPTION, ["juegos cognitivos", "personas mayores"]);

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-100 via-indigo-50 to-fuchsia-100 p-8 shadow-sm">
        <h1 className="text-4xl font-extrabold text-sky-950">{APP_NAME}</h1>
        <p className="mt-3 text-2xl font-semibold text-slate-900">{APP_CLAIM}</p>
        <p className="mt-3 max-w-3xl text-slate-800">{APP_DESCRIPTION}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/juegos" className="rounded-xl bg-sky-800 px-6 py-4 text-lg font-bold text-white">Jugar ahora</Link>
          <Link href="/estadisticas" className="rounded-xl border border-slate-400 bg-white px-6 py-4 text-lg font-bold text-slate-900">Ver estadísticas</Link>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-extrabold text-slate-900">Juegos destacados</h2>
        <p className="mt-2 text-slate-800">Ejercicios de memoria, atención, tiempo y orientación para mantenerte activo cada día.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {GAMES.slice(0, 4).map((game) => <GameCard key={game.slug} game={game} />)}
        </div>
      </section>
    </div>
  );
}
