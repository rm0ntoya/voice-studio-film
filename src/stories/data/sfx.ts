import { anchor, wf, we } from "./words";
import { BRAND, CEM, ENDING, STORY_SCENES } from "./timeline";
import { PAN_AT } from "../scenes/Process";

/**
 * Stories sound-design cue sheet — denser than the landscape film: every
 * transition gets a swish, every pop-in a pop, every slam a punch.
 * Cues sit at the START of their visual gesture (timing rule: sound leads the motion).
 *
 *   shared/<name>   → public/audio/sfx  (scripts/build_audio.py)
 *   stories/<name>  → public/stories/sfx (scripts/build_audio_stories.py)
 */
export type StorySfx = { frame: number; src: string; db: number };

const S = (name: string) => `audio/sfx/${name}.wav`;
const K = (name: string) => `audio/sfx/kenney/${name}.wav`;
const N = (name: string) => `stories/sfx/${name}.wav`;
const sceneAt = (id: string) => STORY_SCENES.find((s) => s.id === id)!.start;

const every = (from: number, to: number, step: number, src: (n: number) => string, db: number) => {
  const out: StorySfx[] = [];
  for (let f = from, n = 0; f < to; f += step, n++) out.push({ frame: f, src: src(n), db: db - (n % 3) * 1.5 });
  return out;
};
const key = (n: number) => K(`keyboard-keypress-${String(((n * 7) % 32) + 1).padStart(3, "0")}`);

export const STORY_SFX: StorySfx[] = [
  // hook
  { frame: 0, src: S("intro-air"), db: -18 },
  { frame: wf(0), src: N("punch"), db: -13 },
  { frame: wf(5), src: N("pop-hi"), db: -16 },
  { frame: wf(8), src: N("punch"), db: -13 },
  { frame: sceneAt("night") - 4, src: N("whoosh-long"), db: -16 },

  // night
  { frame: wf(10) + 4, src: K("interface-drop_001"), db: -17 },
  { frame: wf(13), src: N("pop-lo"), db: -16 },
  { frame: wf(13), src: N("tick"), db: -13 },
  { frame: wf(13) + 8, src: N("notify"), db: -19 },
  { frame: sceneAt("sale"), src: N("swipe-up"), db: -14 },

  // sale
  { frame: wf(15), src: K("casino-card-slide-1"), db: -15 },
  ...every(wf(15) + 4, wf(15) + 40, 5, () => N("tick"), -25),
  { frame: wf(17), src: N("cash"), db: -13 },
  { frame: sceneAt("team"), src: N("swipe-up-2"), db: -14 },

  // team
  { frame: wf(19), src: N("pop-mid"), db: -16 },
  { frame: wf(19) + 6, src: N("pop-hi"), db: -16 },
  { frame: wf(19) + 12, src: N("pop-lo"), db: -16 },
  { frame: wf(19) + 14, src: K("ui-rollover2"), db: -18 },
  { frame: wf(23), src: K("impact-impactSoft_medium_001"), db: -15 },
  { frame: sceneAt("reveal"), src: S("whoosh-rl"), db: -16 },

  // reveal — swell sucks into the downbeat on "Voice"
  { frame: BRAND - 34, src: S("reverse-swell"), db: -14 },
  { frame: BRAND, src: S("sub-boom"), db: -10 },
  { frame: BRAND, src: S("air-burst"), db: -16 },
  { frame: BRAND, src: K("impact-impactSoft_heavy_002"), db: -14 },
  { frame: BRAND + 2, src: S("shimmer"), db: -18 },
  { frame: sceneAt("channels"), src: S("whoosh-short"), db: -16 },

  // channels
  { frame: wf(29), src: S("whoosh-lr"), db: -19 },
  { frame: wf(29) + 8, src: K("impact-impactSoft_medium_004"), db: -17 },
  { frame: wf(34), src: N("notify"), db: -15 },
  { frame: wf(34), src: N("pop-mid"), db: -19 },
  { frame: wf(34) + 30, src: N("pop-hi"), db: -18 },
  { frame: wf(36), src: N("punch"), db: -14 },
  { frame: wf(36), src: N("pop-mid"), db: -17 },
  { frame: wf(36) + 8, src: N("notify"), db: -18 },
  { frame: wf(39), src: K("interface-switch_007"), db: -16 },
  { frame: wf(39), src: N("pop-lo"), db: -17 },
  { frame: wf(39) + 2, src: S("shimmer"), db: -22 },
  { frame: wf(45), src: S("select"), db: -16 },
  { frame: sceneAt("call") - 2, src: N("whoosh-long"), db: -15 },

  // call
  { frame: wf(48), src: S("ring"), db: -15 },
  { frame: wf(54), src: S("connect"), db: -14 },
  { frame: wf(54), src: N("punch"), db: -16 },
  { frame: wf(57), src: S("shimmer"), db: -21 },
  { frame: wf(58), src: K("impact-impactSoft_medium_001"), db: -17 },

  // rapid fire
  { frame: sceneAt("rapid"), src: K("interface-glitch_002"), db: -14 },
  { frame: wf(59), src: N("punch"), db: -12 },
  ...every(wf(59) + 4, wf(61) - 2, 6, () => N("tick"), -21),
  { frame: wf(61), src: S("whoosh-short"), db: -15 },
  { frame: wf(61), src: N("pop-hi"), db: -16 },
  { frame: wf(62), src: N("punch"), db: -13 },
  { frame: wf(63), src: S("stutter"), db: -14 },
  { frame: wf(63), src: K("interface-glitch_004"), db: -16 },
  { frame: we(63) - 4, src: N("tape-stop"), db: -14 },
  { frame: wf(64), src: N("punch"), db: -12 },
  { frame: wf(65) + 20, src: S("success"), db: -15 },

  // proof — riser runs from "E esse áudio" into the drop; heartbeats in the silence
  { frame: sceneAt("proof"), src: S("whoosh-rl"), db: -21 },
  { frame: anchor("sweepStart"), src: N("riser"), db: -15 },
  { frame: anchor("agoraEnd"), src: N("drone"), db: -16 },
  { frame: we(73) + 2, src: N("heartbeat"), db: -10 },
  { frame: we(73) + 18, src: N("heartbeat"), db: -12 },

  // climax
  { frame: CEM, src: S("sub-boom"), db: -8 },
  { frame: CEM, src: N("punch"), db: -10 },
  { frame: CEM, src: S("air-burst"), db: -14 },
  { frame: CEM, src: K("impact-impactSoft_heavy_002"), db: -12 },
  { frame: wf(76), src: S("whoosh-short"), db: -20 },
  { frame: wf(77), src: N("punch"), db: -15 },
  { frame: sceneAt("process") - 2, src: N("whoosh-long"), db: -16 },

  // process — swipes on each pan, typing, throw, click
  { frame: wf(78), src: K("ui-rollover2"), db: -20 },
  { frame: wf(81), src: K("interface-glitch_002"), db: -16 },
  { frame: wf(81), src: N("punch"), db: -16 },
  { frame: PAN_AT[0], src: N("swipe-up"), db: -15 },
  ...every(wf(83), we(87) - 4, 4, key, -23),
  { frame: we(87), src: N("pop-hi"), db: -16 },
  { frame: PAN_AT[1], src: N("swipe-up-2"), db: -15 },
  { frame: wf(88), src: S("whoosh-lr"), db: -16 },
  { frame: wf(88) + 22, src: K("casino-card-slide-1"), db: -12 },
  { frame: wf(88) + 22, src: K("interface-drop_002"), db: -16 },
  { frame: PAN_AT[2], src: N("swipe-up"), db: -15 },
  { frame: wf(93), src: K("interface-click_003"), db: -10 },
  { frame: wf(93) + 6, src: S("shimmer"), db: -18 },
  { frame: sceneAt("perfect"), src: N("swipe-up-2"), db: -15 },

  // perfect
  { frame: wf(99), src: N("pop-mid"), db: -14 },
  { frame: wf(99) + 6, src: S("success"), db: -14 },
  { frame: wf(100), src: S("air-burst"), db: -18 },
  { frame: wf(100), src: S("shimmer"), db: -18 },
  { frame: sceneAt("outro") - 2, src: N("whoosh-long"), db: -15 },

  // outro + button ending on the track's final hit
  { frame: wf(101), src: S("sub-boom"), db: -16 },
  { frame: wf(101), src: K("impact-impactSoft_medium_004"), db: -16 },
  ...every(wf(109), we(111), 8, () => N("tick"), -24),
  { frame: wf(113), src: N("pop-lo"), db: -18 },
  { frame: ENDING, src: S("final-bell"), db: -12 },
  { frame: ENDING, src: S("sub-boom"), db: -12 },
  { frame: ENDING, src: S("pad-final"), db: -16 },
  { frame: ENDING, src: S("air-burst"), db: -18 },
];
