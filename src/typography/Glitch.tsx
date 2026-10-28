import React from "react";
import { random } from "remotion";
import { FONT, type FontRole } from "../theme/fonts";
import { C } from "../theme/tokens";

/** RGB-split + slice-displacement glitch, deterministic per 2-frame bucket. */
export const GlitchWord: React.FC<{
  text: string;
  abs: number;
  from: number;
  to: number;
  size: number;
  font?: FontRole;
  color?: string;
  intensity?: number;
}> = ({ text, abs, from, to, size, font = "pixel", color = C.bone, intensity = 1 }) => {
  const active = abs >= from && abs <= to;
  const b = Math.floor(abs / 2);
  const burst = active && random(`burst-${b}`) > 0.35 ? intensity : 0;
  const dx = (random(`gx-${b}`) - 0.5) * 22 * burst;
  const dy = (random(`gy-${b}`) - 0.5) * 6 * burst;
  const sliceTop = random(`st-${b}`) * 70;
  const sliceH = 8 + random(`sh-${b}`) * 22;
  const sliceDx = (random(`sd-${b}`) - 0.5) * 50 * burst;
  const base: React.CSSProperties = {
    fontFamily: FONT[font],
    fontSize: size,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };
  return (
    <span style={{ position: "relative", display: "inline-block", ...base }}>
      <span style={{ color, visibility: "visible" }}>{text}</span>
      {burst > 0 ? (
        <>
          <span style={{ position: "absolute", left: dx, top: dy, color: C.ember, mixBlendMode: "screen", opacity: 0.85 }}>{text}</span>
          <span style={{ position: "absolute", left: -dx * 0.7, top: -dy, color: C.iris, mixBlendMode: "screen", opacity: 0.85 }}>{text}</span>
          <span
            style={{
              position: "absolute",
              left: sliceDx,
              top: 0,
              color,
              clipPath: `inset(${sliceTop}% 0 ${Math.max(0, 100 - sliceTop - sliceH)}% 0)`,
              background: C.ink,
            }}
          >
            {text}
          </span>
        </>
      ) : null}
    </span>
  );
};

/** Robotic stutter: the word is "typed" with repeats and frame holds over [from, to]. */
export const StutterText: React.FC<{
  text: string;
  abs: number;
  from: number;
  to: number;
  size: number;
  font?: FontRole;
  color?: string;
}> = ({ text, abs, from, to, size, font = "pixel", color = C.bone }) => {
  const steps = [1, 2, 3, 3, 1, 2, 3, 4, 3, 5, 6, 7, 7, 8].map((n) => Math.min(n, text.length));
  const p = Math.max(0, Math.min(1, (abs - from) / Math.max(1, to - from)));
  const n = abs < from ? 0 : abs >= to ? text.length : steps[Math.min(steps.length - 1, Math.floor(p * steps.length))];
  const shown = text.slice(0, n);
  const jolt = abs >= from && abs < to && Math.floor(abs / 3) % 2 === 0 ? 3 : 0;
  return (
    <span
      style={{
        fontFamily: FONT[font],
        fontSize: size,
        lineHeight: 1,
        color,
        whiteSpace: "nowrap",
        display: "inline-block",
        transform: `translateX(${jolt}px)`,
      }}
    >
      {shown}
      <span style={{ visibility: "hidden" }}>{text.slice(n)}</span>
    </span>
  );
};
