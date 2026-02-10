import { buildMetadata } from "@/lib/seo/metadata";
import { GAMES } from "@/content/games";
import { GamesCatalog } from "@/components/games/games-catalog";

export const metadata = buildMetadata("Juegos", "Listado de juegos de estimulación cognitiva por categorías y dificultad.", ["juegos", "memoria", "atención"]);

export default function JuegosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold text-sky-950">Juegos</h1>
      <p className="text-lg text-slate-800">Elige un juego y comienza en segundos. Puedes ajustar la dificultad cuando quieras.</p>
      <GamesCatalog games={GAMES} />
    </div>
  );
}
