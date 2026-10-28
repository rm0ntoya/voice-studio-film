import { anchor, BRAND, CEM, CUT, ENDING, we, wf } from "./data";

/**
 * Cinema sound design. Accents land at the START of each gesture; every
 * transition gets its own whoosh/swipe (cue at the transition's first frame,
 * i.e. cut − dur/2). New cinematic one-shots were generated with Eleven
 * Sound Effects v2 (public/cinema/sfx); the rest reuse the film's library.
 */
export type Cue = { frame: number; src: string; db: number };

const C = (n: string) => `cinema/sfx/${n}.wav`;
const S = (n: string) => `audio/sfx/${n}.wav`;
const Kn = (n: string) => `audio/sfx/kenney/${n}.wav`;
const N = (n: string) => `stories/sfx/${n}.wav`;

const keys = (from: number, to: number): Cue[] =>
  Array.from({ length: Math.max(0, Math.floor((to - from) / 5)) }, (_, k) => ({
    frame: from + k * 5,
    src: Kn(`keyboard-keypress-${String(((k * 7) % 32) + 1).padStart(3, "0")}`),
    db: -27 - (k % 3) * 1.5,
  }));

/** reverse swell timed to END on `at` (1.48 s long) */
const swellInto = (at: number, db: number): Cue => ({ frame: at - 89, src: C("reverse-swell"), db });

export const CUES: Cue[] = [
  // 01 night — the lamp comes on
  { frame: 34, src: C("lamp-on"), db: -15 },

  // → 02 phone (zoom blur)
  { frame: CUT.phone - 8, src: C("whoosh-deep"), db: -18 },
  { frame: wf(13) + 2, src: C("ui-tap"), db: -17 },
  { frame: wf(13) + 4, src: N("notify"), db: -23 },

  // → 03 bag (light leak)
  { frame: CUT.bag - 9, src: C("glass-shimmer"), db: -22 },
  { frame: CUT.bag + 6, src: C("paper-bag"), db: -15 },
  { frame: wf(17) + 6, src: C("ui-tap"), db: -15 },
  { frame: wf(17) + 8, src: S("success"), db: -25 },

  // → 04 team (slide up)
  { frame: CUT.team - 7, src: C("swipe"), db: -15 },

  // → 05 brand (dip to black, silence, then the mark)
  { frame: CUT.brand - 8, src: C("whoosh-deep"), db: -27 },
  { frame: BRAND, src: S("sub-boom"), db: -10 },
  { frame: BRAND, src: C("glass-shimmer"), db: -16 },
  { frame: BRAND, src: S("air-burst"), db: -23 },

  // → 06 product (iris) + chat
  { frame: CUT.product - 8, src: C("whoosh-deep"), db: -19 },
  { frame: wf(31), src: C("ui-tap"), db: -20 },
  { frame: wf(34), src: N("notify"), db: -20 },
  { frame: wf(35) + 4, src: C("ui-tap"), db: -26 },
  { frame: wf(36), src: N("pop-hi"), db: -20 },
  { frame: wf(36) + 6, src: C("ui-tap"), db: -22 },

  // → 08 grille (zoom blur)
  { frame: CUT.grille - 6, src: C("whoosh-deep"), db: -18 },
  { frame: wf(39), src: S("whoosh-short"), db: -24 },

  // → 09 portrait (wipe)
  { frame: CUT.portrait - 8, src: C("swipe"), db: -18 },

  // → 10 street (slide up) · incoming call · answered
  { frame: CUT.street - 7, src: C("swipe"), db: -16 },
  { frame: wf(48) + 4, src: C("ui-tap"), db: -18 },
  { frame: wf(48) + 4, src: S("ring"), db: -19 },
  { frame: CUT.call, src: S("connect"), db: -16 },
  { frame: CUT.call, src: N("punch"), db: -21 },

  // → 11 four words (white flash)
  swellInto(CUT.words, -23),
  { frame: CUT.words, src: N("punch"), db: -15 },
  { frame: wf(61) - 1, src: N("punch"), db: -18 },
  { frame: wf(61) - 1, src: C("swipe"), db: -24 },
  { frame: wf(62) - 1, src: N("punch"), db: -16 },
  { frame: we(63) - 6, src: C("swipe"), db: -21 },
  { frame: wf(64) - 1, src: N("punch"), db: -15 },
  { frame: wf(65) + 20, src: S("success"), db: -21 },

  // → 12 proof (dip to black) · riser · heartbeats in the silence
  { frame: CUT.proof - 6, src: C("whoosh-deep"), db: -20 },
  { frame: anchor("sweepStart"), src: N("riser"), db: -18 },
  { frame: we(73) + 2, src: N("heartbeat"), db: -11 },
  { frame: we(73) + 18, src: N("heartbeat"), db: -13 },

  // 13 — 100% (hard cut on the drop)
  { frame: CEM, src: C("trailer-hit"), db: -8 },
  { frame: CEM, src: S("sub-boom"), db: -11 },
  { frame: CEM, src: N("punch"), db: -13 },
  { frame: CEM, src: S("air-burst"), db: -18 },
  { frame: wf(77) + 6, src: C("glass-shimmer"), db: -24 },

  // → 14 studio (zoom blur) · prompt typed and sent
  { frame: CUT.studio - 8, src: C("whoosh-deep"), db: -16 },
  { frame: CUT.prompt, src: C("ui-tap"), db: -18 },
  ...keys(wf(83), we(87) - 4),
  { frame: we(87), src: C("ui-tap"), db: -14 },
  { frame: we(87) + 2, src: C("swipe"), db: -24 },

  // → 15 app (white) · throw · click Gerar · done
  { frame: CUT.app - 7, src: C("whoosh-deep"), db: -21 },
  { frame: wf(88), src: C("swipe"), db: -18 },
  { frame: wf(88) + 24, src: Kn("casino-card-slide-1"), db: -17 },
  { frame: wf(88) + 24, src: C("paper-bag"), db: -22 },
  { frame: wf(93), src: C("ui-tap"), db: -12 },
  { frame: wf(93), src: Kn("interface-click_003"), db: -19 },
  { frame: wf(93) + 4, src: C("glass-shimmer"), db: -20 },
  { frame: wf(93) + 50, src: S("success"), db: -22 },

  // → 16 perfect (blur cross)
  { frame: CUT.perfect - 6, src: C("swipe"), db: -22 },
  { frame: wf(100), src: C("glass-shimmer"), db: -18 },

  // → 17 outro (wipe) · final card on the score's last hit
  { frame: CUT.outro - 9, src: C("whoosh-deep"), db: -18 },
  { frame: wf(101), src: S("sub-boom"), db: -20 },
  swellInto(ENDING, -18),
  { frame: ENDING, src: C("trailer-hit"), db: -14 },
  { frame: ENDING, src: S("final-bell"), db: -13 },
  { frame: ENDING, src: S("pad-final"), db: -19 },
];
