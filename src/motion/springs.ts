import type { SpringConfig } from "remotion";

export const SPR = {
  /** UI without overshoot */
  settle: { damping: 200 },
  /** emphasis words, logo bars — small overshoot */
  pop: { damping: 13, stiffness: 170, mass: 0.8 },
  /** big type with weight */
  heavy: { damping: 22, stiffness: 110, mass: 2.2 },
  /** quick, tight */
  snappy: { damping: 18, stiffness: 260, mass: 0.6 },
} satisfies Record<string, Partial<SpringConfig>>;
