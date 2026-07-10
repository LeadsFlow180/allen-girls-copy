import ButterflyColorLab from "@/components/games/butterfly-lab/ButterflyColorLab";

/**
 * Color Lab game page — renders Butterfly + Alana (and more) with picture selector.
 * The Alana SVG and regions are defined in:
 *   - src/components/games/AlanaColorScene.tsx (standalone Alana scene)
 *   - src/data/games/color-lab-scenes.ts (shared scene data used by Color Lab)
 */
export default function ButterflyLabPage() {
  return <ButterflyColorLab />;
}
