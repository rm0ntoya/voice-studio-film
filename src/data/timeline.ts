import { FPS } from "../theme/tokens";
import plan from "./music-plan.json";
import { anchor, wf } from "./words";

/**
 * Scene table. Every start is derived from a word onset (words.json), so a
 * re-alignment retimes the whole film without touching scene components.
 *
 * `enter` describes the TransitionSeries transition INTO that scene; the
 * transition begins exactly at the scene's start frame.
 */
export type TransitionKind = "lift" | "whip" | "dip" | "iris" | "collapse";

export type SceneDef = {
  id:
    | "hook"
    | "imagine"
    | "reveal"
    | "create"
    | "channels"
    | "voice"
    | "call"
    | "proof"
    | "climax"
    | "process"
    | "perfect"
    | "outro";
  start: number;
  enter?: { kind: TransitionKind; dur: number };
};

export const SCENES: SceneDef[] = [
  { id: "hook", start: 0 },
  { id: "imagine", start: wf(18) - 10, enter: { kind: "lift", dur: 18 } }, // "Imagina"
  { id: "reveal", start: wf(36) }, // "Esse" — S2 hands over a centered dot
  { id: "create", start: wf(41) - 2 }, // "Com" — S3 hands over the header logo
  { id: "channels", start: wf(54) - 12, enter: { kind: "whip", dur: 16 } }, // "que atende"
  { id: "voice", start: wf(69) }, // hard cut on "Isso"
  { id: "call", start: wf(83) - 2, enter: { kind: "dip", dur: 12 } }, // "E tem mais"
  { id: "proof", start: wf(107) - 6, enter: { kind: "dip", dur: 22 } }, // "E para te provar"
  { id: "climax", start: anchor("cem") - 5, enter: { kind: "iris", dur: 7 } }, // "100%"
  { id: "process", start: wf(129) - 16, enter: { kind: "collapse", dur: 16 } }, // "Eu não gravei"
  { id: "perfect", start: wf(153) - 4 }, // "E ficou perfeito"
  { id: "outro", start: wf(157) - 8 }, // "Voice Studio,"
];

export const DURATION = Math.round(57.0 * FPS);

export const ENDING_DOWNBEAT = Math.round(plan.endingDownbeat * FPS);
export const DROP_FRAME = anchor("cem");

/** TransitionSeries sequence lengths: dur_i = start_{i+1} - start_i + T_{i+1}. */
export const sceneDurations = () =>
  SCENES.map((s, i) => {
    const next = SCENES[i + 1];
    if (!next) return DURATION - s.start;
    return next.start - s.start + (next.enter?.dur ?? 0);
  });

export const sceneStart = (id: SceneDef["id"]) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return s.start;
};

/**
 * Light-pool keyframes (normalized screen coords). The light travels with the
 * focus of each scene like a lighting cue; intensity drops before the climax.
 */
export const LIGHTS: { f: number; x: number; y: number; r: number; a: number }[] = [
  { f: 0, x: 0.12, y: 0.76, r: 0.22, a: 0.08 },
  { f: 200, x: 0.36, y: 0.5, r: 0.5, a: 0.13 },
  { f: sceneStart("imagine") + 30, x: 0.72, y: 0.5, r: 0.42, a: 0.15 },
  { f: sceneStart("reveal") + 20, x: 0.5, y: 0.5, r: 0.5, a: 0.24 },
  { f: sceneStart("create") + 30, x: 0.74, y: 0.48, r: 0.42, a: 0.14 },
  { f: sceneStart("channels") + 30, x: 0.28, y: 0.55, r: 0.45, a: 0.16 },
  { f: sceneStart("voice") + 20, x: 0.5, y: 0.5, r: 0.52, a: 0.18 },
  { f: sceneStart("call") + 60, x: 0.7, y: 0.5, r: 0.45, a: 0.17 },
  { f: sceneStart("proof") + 20, x: 0.5, y: 0.56, r: 0.4, a: 0.06 },
  { f: sceneStart("climax") - 4, x: 0.72, y: 0.56, r: 0.5, a: 0.22 },
  { f: sceneStart("process") + 30, x: 0.5, y: 0.5, r: 0.45, a: 0.12 },
  { f: sceneStart("perfect"), x: 0.5, y: 0.5, r: 0.45, a: 0.15 },
  { f: sceneStart("outro") + 20, x: 0.5, y: 0.47, r: 0.55, a: 0.24 },
  { f: DURATION, x: 0.5, y: 0.47, r: 0.6, a: 0.16 },
];
