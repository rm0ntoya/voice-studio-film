import React from "react";
import { mix } from "../motion/time";
import { SANS, SERIF } from "../theme/fonts";
import { C } from "../theme/tokens";

/**
 * "V-bars" mark: five rounded voice bars standing in a V formation.
 * Unit box 100×100 — bar width 12, centers x = 6/28/50/72/94.
 *
 *  spread    0 = all bars collapsed into one dot, 1 = laid out
 *  formation 0 = flat (a waveform on a line), 1 = the V
 *  levels    live voice energy per bar (0..1) stretching each bar
 */
const XS = [6, 28, 50, 72, 94];
const V_CY = [33, 49, 65, 49, 33];
const V_LEN = [62, 52, 42, 52, 62];
const FLAT_LEN = [16, 26, 34, 26, 16];

export const LogoMark: React.FC<{
  size: number;
  spread?: number;
  formation?: number;
  levels?: number[];
  color?: string;
  style?: React.CSSProperties;
}> = ({ size, spread = 1, formation = 1, levels, color = C.ember, style }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", ...style }}>
      {XS.map((x, k) => {
        const cx = mix(50, x, spread);
        const cy = mix(50, V_CY[k], formation);
        const rest = mix(FLAT_LEN[k], V_LEN[k], formation);
        const live = levels ? levels[k] : 0;
        const len = mix(12, rest * (1 + live * 0.9), Math.min(1, spread * 1.4));
        return (
          <rect
            key={k}
            x={cx - 6}
            y={cy - len / 2}
            width={12}
            height={len}
            rx={6}
            fill={color}
          />
        );
      })}
    </svg>
  );
};

/** Wordmark: "Voice" (Geist 600) + "Studio" (Instrument Serif italic). Each half has its own reveal. */
export const Wordmark: React.FC<{
  size: number;
  pVoice?: number;
  pStudio?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ size, pVoice = 1, pStudio = 1, color = C.bone, style }) => {
  const part = (p: number, node: React.ReactNode, extra: React.CSSProperties) => (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        padding: "0.1em 0.06em 0.22em",
        margin: "-0.1em -0.06em -0.22em",
        verticalAlign: "baseline",
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${(1 - p) * 110}%)`,
          opacity: Math.min(1, p * 2),
          ...extra,
        }}
      >
        {node}
      </span>
    </span>
  );
  return (
    <div style={{ fontSize: size, color, lineHeight: 1, whiteSpace: "nowrap", ...style }}>
      {part(pVoice, "Voice", { fontFamily: SANS, fontWeight: 600, letterSpacing: "-0.04em" })}
      <span style={{ display: "inline-block", width: "0.22em" }} />
      {part(pStudio, "Studio", { fontFamily: SERIF, fontWeight: 400, letterSpacing: "-0.01em", fontSize: "1.08em" })}
    </div>
  );
};
