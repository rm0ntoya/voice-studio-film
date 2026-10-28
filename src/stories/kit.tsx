import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { ease } from "../motion/easing";
import { prog } from "../motion/time";
import { bassAt } from "./data/envelope";
import { SH, SW } from "./theme";

/** absolute film frame inside a scene that starts at `start` */
export const useAbs = (start: number) => useCurrentFrame() + start;

export type StoryProps = { start: number };

/** Keyframed value: [[frame, value], ...] eased in-out between keys, clamped at the ends. */
export const kf = (abs: number, keys: [number, number][], easing = ease.inOut) =>
  interpolate(
    abs,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing },
  );

/** Keyframed color. */
export const kc = (abs: number, keys: [number, string][]) => {
  if (keys.length === 1) return keys[0][1];
  const fs = keys.map((k) => k[0]);
  const t = Math.min(fs[fs.length - 1], Math.max(fs[0], abs));
  return interpolateColors(t, fs, keys.map((k) => k[1]));
};

/* ------------------------------------------------------------------ background */

export type Blob = { color: string; x: number; y: number; r: number; a?: number };
export type PatternKind = "none" | "grid" | "dots" | "stripes" | "rays" | "stars" | "rings";

/**
 * Living backdrop: a base color plus soft color blobs that drift on noise paths
 * and breathe with the music's bass, and an optional moving pattern layer.
 */
export const SceneBg: React.FC<{
  abs: number;
  base: string;
  blobs?: Blob[];
  pattern?: PatternKind;
  patternColor?: string;
  patternOpacity?: number;
  drift?: number;
  seed?: string;
}> = ({ abs, base, blobs = [], pattern = "none", patternColor = "#FFFFFF", patternOpacity = 0.07, drift = 1, seed = "bg" }) => {
  const bass = bassAt(abs);
  return (
    <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
      {blobs.map((b, k) => {
        const nx = noise2D(`${seed}-x${k}`, abs * 0.004 * drift, k) * 0.18;
        const ny = noise2D(`${seed}-y${k}`, abs * 0.004 * drift, k + 7) * 0.14;
        const R = b.r * SW * (1 + 0.1 * bass);
        const a = (b.a ?? 1) * (0.85 + 0.25 * bass);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: (b.x + nx) * SW - R,
              top: (b.y + ny) * SH - R,
              width: R * 2,
              height: R * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
              opacity: a,
            }}
          />
        );
      })}
      <Pattern kind={pattern} abs={abs} color={patternColor} opacity={patternOpacity} />
    </AbsoluteFill>
  );
};

export const Pattern: React.FC<{ kind: PatternKind; abs: number; color: string; opacity: number }> = ({
  kind,
  abs,
  color,
  opacity,
}) => {
  if (kind === "none") return null;
  if (kind === "grid") {
    const off = (abs * 0.6) % 90;
    return (
      <AbsoluteFill
        style={{
          opacity,
          backgroundImage: `linear-gradient(${color} 1.5px, transparent 1.5px), linear-gradient(90deg, ${color} 1.5px, transparent 1.5px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${off}px`,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 85%)",
        }}
      />
    );
  }
  if (kind === "dots") {
    const off = (abs * 0.4) % 54;
    return (
      <AbsoluteFill
        style={{
          opacity,
          backgroundImage: `radial-gradient(${color} 2.5px, transparent 3px)`,
          backgroundSize: "54px 54px",
          backgroundPosition: `${off}px ${-off}px`,
        }}
      />
    );
  }
  if (kind === "stripes") {
    const off = (abs * 1.2) % 120;
    return (
      <AbsoluteFill
        style={{
          opacity,
          backgroundImage: `repeating-linear-gradient(-45deg, ${color} 0 26px, transparent 26px 60px)`,
          backgroundSize: "170px 170px",
          backgroundPosition: `${off}px 0px`,
        }}
      />
    );
  }
  if (kind === "rays") {
    const rot = abs * 0.35;
    return (
      <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: SW / 2 - SH,
            top: SH / 2 - SH,
            width: SH * 2,
            height: SH * 2,
            transform: `rotate(${rot}deg)`,
            background: `repeating-conic-gradient(from 0deg, ${color} 0deg 7deg, transparent 7deg 22.5deg)`,
            maskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
          }}
        />
      </AbsoluteFill>
    );
  }
  if (kind === "rings") {
    const off = (abs * 1.4) % 140;
    return (
      <AbsoluteFill
        style={{
          opacity,
          background: `repeating-radial-gradient(circle at 50% 50%, transparent 0 ${off}px, ${color} ${off}px ${off + 2}px, transparent ${off + 2}px 140px)`,
        }}
      />
    );
  }
  // stars
  return (
    <AbsoluteFill style={{ opacity }}>
      {Array.from({ length: 70 }, (_, k) => {
        const x = random(`sx${k}`) * SW;
        const y = random(`sy${k}`) * SH;
        const s = 2 + random(`ss${k}`) * 4;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(abs * (0.05 + random(`st${k}`) * 0.08) + k));
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x,
              top: y - (abs * 0.15 * (0.5 + random(`sv${k}`))) % SH,
              width: s,
              height: s,
              borderRadius: 9,
              background: color,
              opacity: tw,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ camera */

/** Scene camera: keyframed zoom / rotation / pan + a slow handheld drift. */
export const Cam: React.FC<{
  abs: number;
  zoom?: [number, number][];
  rot?: [number, number][];
  y?: [number, number][];
  x?: [number, number][];
  handheld?: number;
  origin?: string;
  children: React.ReactNode;
}> = ({ abs, zoom, rot, y, x, handheld = 1, origin = "50% 50%", children }) => {
  const s = zoom ? kf(abs, zoom) : 1;
  const r = rot ? kf(abs, rot) : 0;
  const ty = y ? kf(abs, y) : 0;
  const tx = x ? kf(abs, x) : 0;
  const hx = noise2D("cam-x", abs * 0.01, 0) * 6 * handheld;
  const hy = noise2D("cam-y", abs * 0.01, 3) * 6 * handheld;
  const hr = noise2D("cam-r", abs * 0.008, 9) * 0.35 * handheld;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx + hx}px, ${ty + hy}px) scale(${s}) rotate(${r + hr}deg)`,
        transformOrigin: origin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ fx */

/** Expanding shockwave rings fired at `at`. */
export const Shockwave: React.FC<{
  abs: number;
  at: number;
  x: number;
  y: number;
  color: string;
  count?: number;
  maxR?: number;
  dur?: number;
  width?: number;
}> = ({ abs, at, x, y, color, count = 3, maxR = 900, dur = 40, width = 6 }) => {
  if (abs < at) return null;
  return (
    <>
      {Array.from({ length: count }, (_, k) => {
        const p = prog(abs, at + k * 5, dur, ease.enter);
        if (p <= 0 || p >= 1) return null;
        const r = p * maxR;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `${width * (1 - p) + 1}px solid ${color}`,
              opacity: (1 - p) * 0.9,
            }}
          />
        );
      })}
    </>
  );
};

/** Burst of particles (deterministic) flying out from a point at `at`. */
export const Burst: React.FC<{
  abs: number;
  at: number;
  x: number;
  y: number;
  colors: string[];
  count?: number;
  dist?: number;
  dur?: number;
  size?: number;
  seed?: string;
  shape?: "dot" | "bar";
}> = ({ abs, at, x, y, colors, count = 24, dist = 520, dur = 46, size = 16, seed = "b", shape = "dot" }) => {
  if (abs < at) return null;
  const p = prog(abs, at, dur, ease.enter);
  if (p >= 1) return null;
  return (
    <>
      {Array.from({ length: count }, (_, k) => {
        const ang = (k / count) * Math.PI * 2 + random(`${seed}a${k}`) * 0.5;
        const d = dist * (0.45 + random(`${seed}d${k}`) * 0.55) * p;
        const s = size * (0.5 + random(`${seed}s${k}`)) * (1 - p * 0.7);
        const fall = p * p * 160;
        const c = colors[k % colors.length];
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x + Math.cos(ang) * d - s / 2,
              top: y + Math.sin(ang) * d - s / 2 + fall,
              width: shape === "bar" ? s * 0.45 : s,
              height: shape === "bar" ? s * 1.8 : s,
              borderRadius: shape === "bar" ? 4 : 99,
              background: c,
              transform: `rotate(${(ang * 180) / Math.PI + 90 + p * 200}deg)`,
              opacity: 1 - Math.max(0, p - 0.6) / 0.4,
            }}
          />
        );
      })}
    </>
  );
};

/** Full-frame color flash decaying over `dur` frames. */
export const Flash: React.FC<{ abs: number; at: number; color?: string; dur?: number; peak?: number }> = ({
  abs,
  at,
  color = "#FFFFFF",
  dur = 10,
  peak = 0.85,
}) => {
  if (abs < at || abs > at + dur) return null;
  const o = peak * (1 - (abs - at) / dur) ** 2;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

/** Infinite marquee row of text. */
export const Marquee: React.FC<{
  abs: number;
  text: string;
  y: number;
  size: number;
  speed?: number;
  color: string;
  font: string;
  weight?: number;
  opacity?: number;
  rotate?: number;
}> = ({ abs, text, y, size, speed = 4, color, font, weight = 700, opacity = 1, rotate = 0 }) => {
  const unit = `${text}  ·  `;
  const approxW = unit.length * size * 0.56;
  const off = -((abs * speed) % approxW);
  return (
    <div
      style={{
        position: "absolute",
        left: -200,
        top: y,
        width: SW + 400,
        whiteSpace: "nowrap",
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        opacity,
        letterSpacing: "-0.03em",
        lineHeight: 1,
        transform: `rotate(${rotate}deg) translateX(${off}px)`,
      }}
    >
      {unit.repeat(8)}
    </div>
  );
};
