import { FPS } from "../../theme/tokens";
import { PLAN } from "./envelope";
import { anchor, wf } from "./words";

/**
 * Stories scene table. Starts derive from word onsets; `enter` is the transition
 * INTO the scene and begins at the scene's start frame, so a scene is fully on
 * screen at start + enter.dur (aimed at its first word).
 */
export type StoryTransition = "zoom" | "push" | "slices" | "circle" | "spin" | "glitch" | "drain" | "flood" | "squeeze";

export type StorySceneId =
  | "hook"
  | "night"
  | "sale"
  | "team"
  | "reveal"
  | "channels"
  | "call"
  | "rapid"
  | "proof"
  | "climax"
  | "process"
  | "perfect"
  | "outro";

export type StoryScene = { id: StorySceneId; start: number; enter?: { kind: StoryTransition; dur: number } };

const into = (word: number, dur: number) => wf(word) - dur;

export const CEM = anchor("cem");
export const BRAND = anchor("brandVoice");
export const ENDING = Math.round(PLAN.endingDownbeat * FPS);
export const DURATION = Math.round((PLAN.endingDownbeat + 2.9) * FPS);

export const STORY_SCENES: StoryScene[] = [
  { id: "hook", start: 0 },
  { id: "night", start: into(9, 14), enter: { kind: "zoom", dur: 14 } }, // "Um atendente que nunca dorme"
  { id: "sale", start: into(14, 12), enter: { kind: "push", dur: 12 } }, // "nunca perde uma venda"
  { id: "team", start: into(18, 12), enter: { kind: "push", dur: 12 } }, // "e fala igual à sua equipe"
  { id: "reveal", start: into(24, 12), enter: { kind: "slices", dur: 12 } }, // "Esse é o Voice Studio"
  { id: "channels", start: into(29, 14), enter: { kind: "circle", dur: 14 } }, // "Ele atende…"
  { id: "call", start: into(46, 16), enter: { kind: "spin", dur: 16 } }, // "O cliente liga…"
  { id: "rapid", start: into(59, 6), enter: { kind: "glitch", dur: 6 } }, // "na hora, natural, sem robô, sem fila"
  { id: "proof", start: into(66, 16), enter: { kind: "drain", dur: 16 } }, // "E esse áudio…"
  { id: "climax", start: CEM - 8, enter: { kind: "flood", dur: 8 } }, // "100%"
  { id: "process", start: into(78, 14), enter: { kind: "squeeze", dur: 14 } }, // "Eu não gravei nada"
  { id: "perfect", start: into(98, 12), enter: { kind: "push", dur: 12 } }, // "e ficou perfeito"
  { id: "outro", start: into(101, 14), enter: { kind: "zoom", dur: 14 } }, // "Voice Studio."
];

/** TransitionSeries sequence lengths: dur_i = start_{i+1} - start_i + T_{i+1}. */
export const storyDurations = () =>
  STORY_SCENES.map((s, i) => {
    const next = STORY_SCENES[i + 1];
    if (!next) return DURATION - s.start;
    return next.start - s.start + (next.enter?.dur ?? 0);
  });

export const storyStart = (id: StorySceneId) => {
  const s = STORY_SCENES.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return s.start;
};
