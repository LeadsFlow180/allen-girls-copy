"use client";

import { useCallback, useState } from "react";

import type { LibraryNovel, LibraryWingId } from "@/lib/library/library-catalog";
import { useLibraryCatalog } from "@/hooks/use-library-catalog";

import { LibraryHubScene } from "./library-hub-scene";
import { LibraryReader } from "./library-reader";
import { LibraryShelfScene } from "./library-shelf-scene";
import styles from "./library-scene.module.css";

type LibraryScene = "hub" | "shelf";

export function MagicalLibraryExperience() {
  const { novels, loading } = useLibraryCatalog();
  const [scene, setScene] = useState<LibraryScene>("hub");
  const [activeWing, setActiveWing] = useState<LibraryWingId | "all">("all");
  const [selectedNovel, setSelectedNovel] = useState<LibraryNovel | null>(null);
  const [readerMode, setReaderMode] = useState<"text" | "pdf">("text");

  const openNovel = (novel: LibraryNovel, mode?: "text" | "pdf") => {
    setReaderMode(mode ?? "text");
    setSelectedNovel(novel);
  };

  const enterShelf = (wing: LibraryWingId | "all") => {
    setActiveWing(wing);
    setScene("shelf");
  };

  const backToHub = useCallback(() => {
    setScene("hub");
    window.scrollTo(0, 0);
  }, []);

  if (selectedNovel) {
    return (
      <div className="lib-labyrinth">
        <LibraryReader
          novel={selectedNovel}
          mode={readerMode}
          onClose={() => setSelectedNovel(null)}
        />
      </div>
    );
  }

  return (
    <div className="lib-labyrinth">
      {/* Reason: keep hub mounted so mobile browsers don't lose the background on back */}
      <div
        className={`${styles.libSceneLayer}${scene === "hub" ? "" : ` ${styles.libSceneHidden}`}`}
        aria-hidden={scene !== "hub"}
      >
        <LibraryHubScene novels={novels} loading={loading} onEnter={enterShelf} />
      </div>

      {scene === "shelf" ? (
        <LibraryShelfScene
          novels={novels}
          activeWing={activeWing}
          onWingChange={setActiveWing}
          onBack={backToHub}
          onOpenNovel={openNovel}
        />
      ) : null}
    </div>
  );
}
