"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { LibraryNovel, LibraryWingId } from "@/lib/library/library-catalog";
import { useLibraryCatalog } from "@/hooks/use-library-catalog";

import { LibraryHubScene } from "./library-hub-scene";
import { LibraryReader } from "./library-reader";
import { LibraryShelfScene } from "./library-shelf-scene";
import styles from "./library-scene.module.css";

type LibraryScene = "hub" | "shelf";

const CROSSFADE_EASE = [0.25, 0.1, 0.25, 1] as const;

export function MagicalLibraryExperience() {
  const { novels, loading } = useLibraryCatalog();
  const [scene, setScene] = useState<LibraryScene>("hub");
  const [hubKey, setHubKey] = useState(0);
  const [activeWing, setActiveWing] = useState<LibraryWingId | "all">("all");
  const [selectedNovel, setSelectedNovel] = useState<LibraryNovel | null>(null);
  const [readerMode, setReaderMode] = useState<"text" | "pdf">("text");

  const openNovel = (novel: LibraryNovel, mode?: "text" | "pdf") => {
    setReaderMode(mode ?? "text");
    setSelectedNovel(novel);
  };

  const enterShelf = useCallback((wing: LibraryWingId | "all") => {
    setActiveWing(wing);
    setScene("shelf");
  }, []);

  const backToHub = useCallback(() => {
    setScene("hub");
    setHubKey((key) => key + 1);
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
      <AnimatePresence mode="sync">
        {scene === "hub" ? (
          <motion.div
            key={`hub-${hubKey}`}
            className={styles.libSceneLayer}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: CROSSFADE_EASE }}
          >
            <LibraryHubScene novels={novels} loading={loading} onEnter={enterShelf} />
          </motion.div>
        ) : null}

        {scene === "shelf" ? (
          <motion.div
            key="shelf"
            className={styles.libSceneLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: CROSSFADE_EASE }}
          >
            <LibraryShelfScene
              novels={novels}
              activeWing={activeWing}
              onWingChange={setActiveWing}
              onBack={backToHub}
              onOpenNovel={openNovel}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
