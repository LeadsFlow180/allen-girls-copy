import { notFound } from "next/navigation";

import { IframeGameShell } from "@/components/games/iframe-game-shell";
import { getIframeGameById, toIframeGameData } from "@/data/games/catalog";

type PlayGamePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PlayGamePageProps) {
  const { slug } = await params;
  const game = getIframeGameById(slug);
  if (!game || !game.available || !game.embedUrl) {
    return { title: "Game not found | Allen Girls Adventures" };
  }
  return {
    title: `${game.title} | Game Zone`,
    description: game.description,
  };
}

export default async function PlayGamePage({ params }: PlayGamePageProps) {
  const { slug } = await params;
  const game = getIframeGameById(slug);

  if (!game || !game.available || !game.embedUrl) {
    notFound();
  }

  return <IframeGameShell game={toIframeGameData(game)} />;
}
