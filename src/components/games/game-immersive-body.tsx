"use client";

import { useEffect } from "react";

/**
 * Hides the site nav/footer so games fill the phone or desktop screen.
 * Pairs with body.games-immersive in globals.css (same chrome hide as store).
 */
export function GameImmersiveBody() {
  useEffect(() => {
    document.body.classList.add("store-immersive", "games-immersive");
    return () => {
      document.body.classList.remove("store-immersive", "games-immersive");
    };
  }, []);

  return null;
}
