"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { STORE_ART } from "@/lib/store/store-art";

import styles from "./magical-store.module.css";

export function StoreCurator() {
  return (
    <div className={styles.curator} aria-hidden>
      <div className={styles.curatorAura} />
      <motion.div
        className={styles.curatorFrame}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={STORE_ART.shopkeeper}
          alt=""
          width={88}
          height={110}
          className={styles.curatorImg}
        />
      </motion.div>
      <p className={`${styles.curatorLabel} font-nunito`}>
        <Sparkles size={9} aria-hidden />
        Curator Maya
      </p>
    </div>
  );
}
