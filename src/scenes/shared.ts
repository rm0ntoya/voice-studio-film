import { useCurrentFrame } from "remotion";
import { C } from "../theme/tokens";
import type { WordOpts } from "../typography/KineticPhrase";

/** absolute film frame inside a scene that starts at `start` */
export const useAbs = (start: number) => useCurrentFrame() + start;

export type SceneProps = { start: number };

/** function words get a quieter voice — typographic stress mirrors spoken stress */
export const minor = (...ids: number[]): Record<number, WordOpts> =>
  Object.fromEntries(ids.map((i) => [i, { color: "rgba(244,239,230,0.52)" }]));

export const serifEmber = (size?: number, extra: WordOpts = {}): WordOpts => ({
  font: "serif",
  color: C.ember,
  size,
  ...extra,
});

/** shared brand lockup geometry (S3 → S4 header FLIP, S11 → S12 handoff) */
export const LOCKUP = {
  markSize: 172,
  wordSize: 150,
  gap: 44,
  /** measured width of the wordmark at wordSize (Geist 600 + Instrument Serif) */
  wordW: 742,
  get width() {
    return this.markSize + this.gap + this.wordW;
  },
  center: { x: 960, y: 520 },
  header: { left: 120, y: 102, scale: 0.25 },
};
