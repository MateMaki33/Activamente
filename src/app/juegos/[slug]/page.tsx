import { notFound } from "next/navigation";
import { GAME_BY_SLUG } from "@/content/games";
import { buildMetadata } from "@/lib/seo/metadata";
import { GamePlayground } from "@/components/games/game-playground";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const game = GAME_BY_SLUG[params.slug];
  if (!game) return {};
  return buildMetadata(game.title, game.shortDescription, [game.category, "estimulación cognitiva"]);
}

export default function GamePage({ params }: { params: { slug: string } }) {
  const game = GAME_BY_SLUG[params.slug];
  if (!game) return notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">{game.title}</h1>
      <p className="text-slate-700">{game.shortDescription}</p>
      <GamePlayground game={game} />
    </div>
  );
}
