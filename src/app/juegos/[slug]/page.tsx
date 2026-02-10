import { GamePlayground } from "@/components/games/game-playground";
import { GAME_BY_SLUG } from "@/content/games";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const game = GAME_BY_SLUG[slug];
  if (!game) return {};

  return buildMetadata(game.title, game.shortDescription, [
    game.category,
    "estimulación cognitiva",
  ]);
}

export default async function GamePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const game = GAME_BY_SLUG[slug];
  if (!game) return notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">{game.title}</h1>
      <p className="text-slate-700">{game.shortDescription}</p>
      <GamePlayground game={game} />
    </div>
  );
}
