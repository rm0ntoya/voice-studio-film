import React from "react";
import { evolvePath } from "@remotion/paths";
import { MONO, SANS, SERIF } from "../theme/fonts";
import { C, RADIUS, SHADOW } from "../theme/tokens";

export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  tone?: "ink2" | "ink3" | "ember";
}> = ({ style, children, tone = "ink2" }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: RADIUS.card,
      background:
        tone === "ember"
          ? `linear-gradient(160deg, ${C.emberSoft} 0%, ${C.ember} 60%)`
          : `linear-gradient(180deg, ${tone === "ink2" ? "#1A171F" : "#24202A"} 0%, ${tone === "ink2" ? C.ink2 : C.ink3} 100%)`,
      border: `1px solid ${tone === "ember" ? "rgba(255,255,255,0.18)" : C.line}`,
      boxShadow: SHADOW,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.muted,
  size = 18,
  style,
}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Dot: React.FC<{ color?: string; size?: number; glow?: boolean }> = ({ color = C.leaf, size = 10, glow }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: 99,
      background: color,
      boxShadow: glow ? `0 0 0 ${size * 0.6}px ${color}33` : undefined,
    }}
  />
);

/** Stroke-drawn icon from an SVG path, progress 0..1 */
export const DrawPath: React.FC<{
  d: string;
  p: number;
  size: number;
  stroke?: string;
  width?: number;
  viewBox?: string;
  style?: React.CSSProperties;
  fill?: string;
}> = ({ d, p, size, stroke = C.bone, width = 3, viewBox = "0 0 48 48", style, fill = "none" }) => {
  const { strokeDasharray, strokeDashoffset } = evolvePath(Math.max(0.0001, Math.min(1, p)), d);
  return (
    <svg width={size} height={size} viewBox={viewBox} style={{ overflow: "visible", ...style, opacity: p <= 0.002 ? 0 : (style?.opacity ?? 1) }}>
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};

export const ICON = {
  moon: "M33 30.5A14 14 0 0 1 17.5 15 14 14 0 1 0 33 30.5Z",
  check: "M13 25 L21 33 L36 16",
  mic: "M24 6 a6 6 0 0 1 6 6 v10 a6 6 0 0 1 -12 0 v-10 a6 6 0 0 1 6 -6 Z M12 22 a12 12 0 0 0 24 0 M24 34 v8 M17 42 h14",
  phone:
    "M14 8 h6 l3 8 -4 3 a20 20 0 0 0 10 10 l3 -4 8 3 v6 a3 3 0 0 1 -3 3 A29 29 0 0 1 11 11 a3 3 0 0 1 3 -3 Z",
  play: "M17 13 L35 24 L17 35 Z",
  plus: "M24 8 v32 M8 24 h32",
  circle: "M24 4 a20 20 0 1 1 0 40 a20 20 0 1 1 0 -40",
  strike: "M8 40 L40 8",
};

export const Toggle: React.FC<{ on: number; color?: string }> = ({ on, color = C.leaf }) => (
  <div
    style={{
      width: 64,
      height: 36,
      borderRadius: 99,
      background: on > 0.5 ? color : C.line,
      position: "relative",
      transition: "none",
      opacity: 0.95,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 4,
        left: 4 + 28 * on,
        width: 28,
        height: 28,
        borderRadius: 99,
        background: C.bone,
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
      }}
    />
  </div>
);

/** Abstract attendant portrait — no faces, just tinted head + shoulders. */
export const Portrait: React.FC<{ tint: string; size: number; initial: string }> = ({ tint, size, initial }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <radialGradient id={`pg-${initial}`} cx="50%" cy="35%" r="75%">
        <stop offset="0" stopColor={tint} stopOpacity="0.95" />
        <stop offset="1" stopColor={tint} stopOpacity="0.25" />
      </radialGradient>
      <clipPath id={`pc-${initial}`}>
        <circle cx="50" cy="50" r="50" />
      </clipPath>
    </defs>
    <g clipPath={`url(#pc-${initial})`}>
      <rect width="100" height="100" fill="#211E26" />
      <circle cx="50" cy="40" r="17" fill={`url(#pg-${initial})`} />
      <path d="M14 100 C 16 72, 34 62, 50 62 C 66 62, 84 72, 86 100 Z" fill={`url(#pg-${initial})`} />
    </g>
  </svg>
);

export const Bubble: React.FC<{
  side: "in" | "out";
  children: React.ReactNode;
  p: number;
  style?: React.CSSProperties;
  tone?: "ember" | "ink";
}> = ({ side, children, p, style, tone }) => {
  const out = side === "out";
  const bg = tone === "ember" || (out && tone !== "ink") ? C.ember : C.ink3;
  return (
    <div
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        maxWidth: "82%",
        padding: "16px 20px",
        borderRadius: 24,
        borderBottomRightRadius: out ? 8 : 24,
        borderBottomLeftRadius: out ? 24 : 8,
        background: bg,
        color: out ? C.ink : C.bone,
        fontFamily: SANS,
        fontSize: 25,
        fontWeight: 500,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
        transformOrigin: out ? "100% 100%" : "0% 100%",
        transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`,
        opacity: Math.min(1, p * 1.6),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Serif: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontFamily: SERIF, fontWeight: 400, letterSpacing: "-0.01em", ...style }}>{children}</span>
);
