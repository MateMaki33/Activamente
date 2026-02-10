import { buildMetadata } from "@/lib/seo/metadata";
import { GAMES } from "@/content/games";
import { GamesCatalog } from "@/components/games/games-catalog";

export const metadata = buildMetadata("Juegos", "Listado de juegos de estimulación cognitiva por categorías y dificultad.", ["juegos", "memoria", "atención"]);

export default function JuegosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">Juegos</h1>
      <p className="text-slate-700">Elige un juego y comienza en segundos. Puedes ajustar la dificultad cuando quieras.</p>
      <GamesCatalog games={GAMES} />
    </div>
  );
}
