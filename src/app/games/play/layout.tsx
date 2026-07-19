import type { ReactNode } from "react";

import { GameImmersiveBody } from "@/components/games/game-immersive-body";

/**
 * Full-screen play chrome for iframe games (/games/play/*).
 * Catalog page at /games keeps normal nav.
 */
export default function GamesPlayLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.body.classList.add('store-immersive','games-immersive');",
        }}
      />
      <GameImmersiveBody />
      {children}
    </>
  );
}
