"use client";

import { useEffect } from "react";

/** Hides site chrome so the labyrinth is full-screen. */
export function LibraryImmersiveBody() {
  useEffect(() => {
    document.body.classList.add("store-immersive", "library-immersive");
    return () => {
      document.body.classList.remove("store-immersive", "library-immersive");
    };
  }, []);

  return null;
}
