import { notFound } from "next/navigation";
import { GAME_BY_SLUG, GAMES } from "@/content/games";
import { buildMetadata } from "@/lib/seo/metadata";
import { GamePlayground } from "@/components/games/game-playground";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const game = GAME_BY_SLUG[slug];
  if (!game) {
    return buildMetadata("Juego no encontrado", "No pudimos encontrar ese juego.", ["juegos"]);
  }

  return buildMetadata(game.title, game.shortDescription, [game.category, "estimulación cognitiva"]);
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = GAME_BY_SLUG[slug];

  if (!game) return notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold text-sky-950">{game.title}</h1>
      <p className="text-lg text-slate-800">{game.shortDescription}</p>
      <GamePlayground game={game} />
    </div>
  );
}
