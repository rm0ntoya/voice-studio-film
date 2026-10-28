import raw from "./words.json";
import anchorsRaw from "./anchors.json";
import { FPS } from "../theme/tokens";

export type Word = {
  i: number;
  text: string;
  startMs: number;
  endMs: number;
  score: number;
  sentence: number;
};

/** Visuals lead the measured onset by 3 frames (50 ms): MMS onsets run ~27 ms late on soft consonants (validated against pause boundaries), so this centers the error at zero and text never trails the voice. */
export const LEAD = 3;

type AnchorDef = { word: number; edge: "start" | "end" };

/** Word-timing helpers bound to one aligned narration (words.json + anchors.json). */
export const createWords = (rawWords: unknown, rawAnchors: unknown) => {
  const WORDS = rawWords as Word[];
  const anchors = rawAnchors as Record<string, AnchorDef>;

  /** exact onset of word i, in (fractional) frames */
  const onset = (i: number) => (WORDS[i].startMs / 1000) * FPS;

  /** effective end of word i (CTC ends run early; extend toward the next onset, max +140 ms). */
  const offset = (i: number) => {
    const w = WORDS[i];
    const next = WORDS[i + 1];
    const endMs = next ? Math.min(next.startMs, w.endMs + 140) : w.endMs + 140;
    return (Math.max(w.endMs, endMs) / 1000) * FPS;
  };

  /** frame at which word i should become visible */
  const wf = (i: number) => Math.round(onset(i)) - LEAD;

  /** frame at which word i has finished being spoken */
  const we = (i: number) => Math.round(offset(i));

  /** display text: drop trailing commas/periods (keep ? and %) */
  const display = (i: number) => WORDS[i].text.replace(/[.,;:]+$/u, "");

  /** named sync point (shared with the audio build script), in frames */
  const anchor = (name: string) => {
    const a = anchors[name];
    if (!a) throw new Error(`unknown anchor ${name}`);
    return Math.round(a.edge === "start" ? onset(a.word) : (WORDS[a.word].endMs / 1000) * FPS);
  };

  return { WORDS, onset, offset, wf, we, display, anchor };
};

export const { WORDS, onset, offset, wf, we, display, anchor } = createWords(raw, anchorsRaw);

export const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
};
