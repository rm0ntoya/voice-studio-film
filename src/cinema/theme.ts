import { Easing } from "remotion";

/** Cinema cut — keynote minimalism: black, ice white, one signal color used once. */
export const CW = 1080;
export const CH = 1920;

export const K = {
  black: "#000000",
  ice: "#F5F5F7",
  grey: "#86868B",
  dim: "rgba(245,245,247,0.55)",
  ink: "#111113",
  signal: "#FF6A3D",
} as const;

export const E = {
  /** keynote text reveal — long, soft settle */
  reveal: Easing.bezier(0.16, 1, 0.3, 1),
  /** camera drift */
  drift: Easing.bezier(0.33, 0, 0.67, 1),
  /** fades */
  fade: Easing.bezier(0.25, 0.1, 0.25, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
} as const;

/** Stories safe zone, reused (Instagram/TikTok chrome). */
export const SAFE = { top: 260, bottom: 1580, x: 80 } as const;
