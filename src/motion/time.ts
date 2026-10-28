import { interpolate, spring, type SpringConfig } from "remotion";
import { FPS } from "../theme/tokens";
import { ease } from "./easing";

export const secToFrame = (s: number) => s * FPS;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 progress over [start, start+dur], clamped, eased. */
export const prog = (
  frame: number,
  start: number,
  dur: number,
  easing: (t: number) => number = ease.enter,
) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** spring starting at `start` (absolute frames). */
export const spr = (
  frame: number,
  start: number,
  config: Partial<SpringConfig>,
  durationInFrames?: number,
) => spring({ frame: frame - start, fps: FPS, config, durationInFrames });

/** enter-then-exit window: 0 → 1 (enter) … 1 → 0 (exit). */
export const window01 = (
  frame: number,
  inStart: number,
  inDur: number,
  outStart: number,
  outDur: number,
) => prog(frame, inStart, inDur) * (1 - prog(frame, outStart, outDur, ease.exit));
