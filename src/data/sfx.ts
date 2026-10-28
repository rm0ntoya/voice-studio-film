import { FPS } from "../theme/tokens";
import plan from "./music-plan.json";
import { anchor, wf, we } from "./words";

/**
 * Sound-design cue sheet. Every cue is anchored to a word (or a music anchor),
 * aligned to the START of its visual gesture (timing rule: sound leads the motion).
 * Tonal sounds are synthesized in C major (scripts/build_audio.py); the rest
 * are Kenney CC0 picks chosen for low HF risk.
 */
export type SfxCue = { frame: number; file: string; db: number };

const K = (name: string) => `kenney/${name}`;
const sec = (s: number) => Math.round(s * FPS);
const beat = plan.beat;
const esse = anchor("esseAudio");
const cem = anchor("cem");

const keys = (from: number, to: number, every: number, db: number): SfxCue[] => {
  const out: SfxCue[] = [];
  let n = 0;
  for (let f = from; f < to; f += every) {
    out.push({ frame: f, file: K(`keyboard-keypress-${String(((n * 7) % 32) + 1).padStart(3, "0")}`), db: db - (n % 3) * 2 });
    n++;
  }
  return out;
};

export const SFX_CUES: SfxCue[] = [
  // S1 — hook: room opens, the head pops, "mudar" flips
  { frame: 0, file: "intro-air", db: -16 },
  { frame: 1, file: K("interface-bong_001"), db: -14 },
  { frame: wf(8) + 12, file: "whoosh-short", db: -24 },

  // S2 — three promises land
  { frame: wf(22), file: K("interface-drop_001"), db: -15 },
  { frame: wf(25), file: K("interface-drop_002"), db: -15 },
  { frame: wf(28) + 2, file: "success", db: -21 },
  { frame: wf(29), file: K("interface-drop_001"), db: -16 },
  { frame: we(35) - 12, file: "reverse-swell", db: -17 },

  // S3 — brand reveal on the music downbeat
  { frame: anchor("brandVoice") - 1, file: "sub-boom", db: -9 },
  { frame: anchor("brandVoice") - 1, file: K("impact-impactSoft_medium_001"), db: -11 },
  { frame: anchor("brandVoice") + 2, file: "shimmer", db: -20 },
  { frame: we(40) - 2, file: "whoosh-short", db: -22 },

  // S4 — the assistant assembles
  { frame: wf(44) - 4, file: K("interface-drop_002"), db: -16 },
  ...keys(wf(46) + 6, wf(46) + 21, 5, -21),
  { frame: wf(49) + 4, file: K("interface-switch_007"), db: -14 },
  { frame: wf(53) - 2, file: K("interface-click_002"), db: -18 },

  // S5 — whip into channels
  { frame: wf(54) - 13, file: "whoosh-lr", db: -14 },
  { frame: wf(58), file: K("ui-rollover2"), db: -15 },
  { frame: wf(62), file: K("interface-drop_001"), db: -17 },
  { frame: wf(64), file: K("interface-click_003"), db: -20 },
  { frame: wf(67), file: "select", db: -15 },

  // S6 — "Isso mesmo" punch, the selection scan
  { frame: wf(69), file: K("impact-impactSoft_medium_004"), db: -10 },
  { frame: wf(69), file: "sub-boom", db: -17 },
  { frame: wf(73), file: K("interface-drop_002"), db: -18 },
  { frame: wf(77), file: K("interface-click_003"), db: -21 },
  { frame: wf(79), file: K("interface-click_003"), db: -21 },
  { frame: wf(81), file: K("interface-click_003"), db: -21 },
  { frame: wf(82), file: K("interface-select_008"), db: -13 },

  // S7 — plus opens, the phone rings, answered; the robot glitches
  { frame: wf(85), file: "whoosh-short", db: -19 },
  { frame: wf(86) - 12, file: "whoosh-rl", db: -15 },
  { frame: wf(89) - 4, file: "ring", db: -19 },
  { frame: wf(97), file: "connect", db: -14 },
  { frame: wf(99), file: K("interface-click_002"), db: -14 },
  { frame: wf(102), file: K("interface-glitch_002"), db: -15 },
  { frame: wf(102) + 10, file: K("interface-glitch_004"), db: -19 },
  { frame: wf(106), file: "stutter", db: -19 },
  { frame: we(106) - 14, file: "whoosh-short", db: -21 },

  // S8 — the music sinks; silence, drone, riser, heartbeat
  { frame: anchor("verdadeEnd") + 2, file: "reverse-swell", db: -15 },
  { frame: esse, file: "drone", db: -13 },
  { frame: esse, file: "riser", db: -12 },
  { frame: esse + sec(beat), file: "heartbeat", db: -15 },
  { frame: esse + sec(beat * 2), file: "heartbeat", db: -12 },
  { frame: esse + sec(beat * 3), file: "heartbeat", db: -9 },

  // S9 — the drop
  { frame: cem, file: "sub-boom", db: -7 },
  { frame: cem, file: "air-burst", db: -14 },
  { frame: cem, file: K("impact-impactSoft_heavy_002"), db: -12 },

  // S10 — the process
  { frame: wf(129) - 14, file: "whoosh-short", db: -20 },
  { frame: wf(131), file: K("interface-click_002"), db: -20 },
  ...keys(wf(134), wf(140) - 4, 6, -23),
  { frame: wf(141) + 2, file: K("casino-card-slide-1"), db: -15 },
  { frame: wf(141) + 4, file: "whoosh-lr", db: -19 },
  { frame: wf(145), file: K("interface-drop_002"), db: -14 },
  { frame: wf(148), file: K("interface-click_002"), db: -11 },
  { frame: wf(148) + 22, file: "select", db: -18 },

  // S11 — approved
  { frame: wf(155) + 6, file: "success", db: -15 },
  { frame: wf(156), file: K("ui-rollover2"), db: -19 },

  // S12 — signature and the button ending
  { frame: wf(157), file: K("impact-impactSoft_medium_001"), db: -14 },
  { frame: wf(157) + 2, file: "shimmer", db: -21 },
  { frame: Math.round(plan.endingDownbeat * FPS), file: "final-bell", db: -13 },
  { frame: Math.round(plan.endingDownbeat * FPS), file: "sub-boom", db: -13 },
  { frame: Math.round(plan.endingDownbeat * FPS), file: "pad-final", db: -17 },
];
