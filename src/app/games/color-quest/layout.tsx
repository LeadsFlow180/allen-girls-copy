import type { ReactNode } from "react";

import { GameImmersiveBody } from "@/components/games/game-immersive-body";

export default function ColorQuestLayoutRoute({ children }: { children: ReactNode }) {
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
