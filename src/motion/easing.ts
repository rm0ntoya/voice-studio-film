import { Easing } from "remotion";

export const ease = {
  /** strong ease-out — text and UI entrances */
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  /** accelerate away — exits */
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  /** camera moves, morphs */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** whips and hard snaps */
  snap: Easing.bezier(0.85, 0, 0.15, 1),
  /** gentle settle */
  soft: Easing.bezier(0.33, 1, 0.68, 1),
} as const;
