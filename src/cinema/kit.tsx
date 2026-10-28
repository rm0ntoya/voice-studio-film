import React, { createContext, useContext } from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { SANS, SERIF } from "../theme/fonts";
import { CW, E, K } from "./theme";

/**
 * Shots live inside TransitionSeries sequences (local frames). Each sequence
 * provides its absolute start through this context, so shot code keeps
 * working in absolute film frames (word onsets, cut points).
 */
export const ShotClock = createContext(0);
export const useF = () => useCurrentFrame() + useContext(ShotClock);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const p01 = (f: number, a: number, dur: number, easing = E.reveal) =>
  interpolate(f, [a, a + Math.max(1, dur)], [0, 1], { ...clamp, easing });

/**
 * A layer that starts at `from` and stays (later layers cover earlier ones). A layer that
 * starts at its sequence's cut also shows during the incoming transition, a few frames early.
 */
const useStart = (from: number) => {
  const seqStart = useContext(ShotClock);
  return from - seqStart <= 20 ? Math.min(from, seqStart) : from;
};
export const Shot: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => {
  const f = useF();
  const start = useStart(from);
  if (f < start) return null;
  return <>{children}</>;
};

/* ------------------------------------------------------------------ type */

type LineProps = {
  text: React.ReactNode;
  at: number;
  out?: number;
  size: number;
  weight?: number;
  color?: string;
  serif?: boolean;
  tracking?: number;
  dur?: number;
  y: number;
  /** per-word reveal, frames between words (string text only) */
  stagger?: number;
  lineHeight?: number;
};

/**
 * Keynote title line: rises out of a mask, blur 10→0, tracking tightens as it settles.
 * With `stagger`, each word gets its own mask and lands a few frames after the previous.
 */
export const Line: React.FC<LineProps> = ({ text, at, out, size, weight = 600, color = K.ice, serif, tracking = -0.035, dur = 34, y, stagger, lineHeight = 1.02 }) => {
  const f = useF();
  if (f < at - 1) return null;
  const e = out !== undefined ? p01(f, out, 14, E.exit) : 0;
  if (e >= 1) return null;
  const font: React.CSSProperties = {
    fontFamily: serif ? SERIF : SANS,
    fontWeight: serif ? 400 : weight,
    fontSize: size,
    lineHeight,
    color,
    whiteSpace: "pre-line",
  };
  const piece = (node: React.ReactNode, start: number, key?: number) => {
    const p = p01(f, start, dur);
    const track = tracking + (1 - p) * 0.06;
    const blur = (1 - p) * 10 + e * 8;
    return (
      <span key={key} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.2, marginBottom: -size * 0.2, verticalAlign: "top" }}>
        <span
          style={{
            display: "inline-block",
            letterSpacing: `${serif ? track + 0.02 : track}em`,
            transform: `translateY(${(1 - p) * 60 - e * 20}%)`,
            opacity: Math.min(1, p * 1.4) * (1 - e),
            filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
          }}
        >
          {node}
        </span>
      </span>
    );
  };
  const words = typeof text === "string" && stagger ? text.split(" ") : null;
  return (
    <div style={{ position: "absolute", left: 0, width: CW, top: y, textAlign: "center", ...font }}>
      {words
        ? words.map((w, k) => (
            <React.Fragment key={k}>
              {piece(w, at + k * stagger!, k)}
              {k < words.length - 1 ? " " : null}
            </React.Fragment>
          ))
        : piece(text, at)}
    </div>
  );
};

export const Serif: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: SERIF, fontWeight: 400, letterSpacing: "-0.01em" }}>{children}</span>
);

/* ------------------------------------------------------------------ media */

/**
 * Generated still or clip as a cinematic plate: slow push, optional drift, grade
 * (darkening for type legibility), vignette. Video plays from its first frame at `from`.
 */
export const Plate: React.FC<{
  src: string;
  kind: "image" | "video";
  from: number;
  to: number;
  push?: [number, number];
  drift?: [number, number];
  fadeIn?: number;
  fadeOut?: number;
  grade?: "top" | "bottom" | "both" | "none" | "light";
  brightness?: number;
  blur?: [number, number];
  rate?: number;
  origin?: string;
}> = ({ src, kind, from, to, push = [1.0, 1.06], drift = [0, 0], fadeIn = 0, fadeOut = 0, grade = "top", brightness = 1, blur, rate = 1, origin = "50% 50%" }) => {
  const f = useF();
  const offset = useContext(ShotClock);
  const start = useStart(from);
  if (f < start) return null;
  const o = (fadeIn ? p01(f, from, fadeIn, E.fade) : 1) * (fadeOut ? 1 - p01(f, to - fadeOut, fadeOut, E.fade) : 1);
  const lin = Math.max(0, f - from) / Math.max(1, to - from);
  const t = lin <= 1 ? E.drift(lin) : 1 + (lin - 1) * 0.6; // keeps drifting through the outgoing transition
  const s = push[0] + (push[1] - push[0]) * t;
  const dy = drift[0] + (drift[1] - drift[0]) * t;
  const b = blur ? blur[0] + (blur[1] - blur[0]) * p01(f, from, (to - from) * 0.5, E.reveal) : 0;
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden", background: K.black }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${dy}px) scale(${s})`,
          transformOrigin: origin,
          filter: `brightness(${brightness})${b > 0.3 ? ` blur(${b}px)` : ""}`,
        }}
      >
        {kind === "video" ? (
          <Sequence from={start - offset} layout="none">
            <OffthreadVideo src={staticFile(src)} muted style={style} playbackRate={rate} />
          </Sequence>
        ) : (
          <Img src={staticFile(src)} style={style} />
        )}
      </AbsoluteFill>
      {grade === "top" || grade === "both" ? (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 38%, rgba(0,0,0,0) 60%)" }} />
      ) : null}
      {grade === "bottom" || grade === "both" ? (
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0) 55%)" }} />
      ) : null}
      {grade === "light" ? (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 60%)" }} />
      ) : null}
      {grade !== "light" ? (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ fx */

/** Soft light sweep travelling across a region (keynote type glint). */
export const Sweep: React.FC<{ at: number; dur?: number; y: number; h: number; opacity?: number }> = ({ at, dur = 40, y, h, opacity = 0.35 }) => {
  const f = useF();
  const p = p01(f, at, dur, E.drift);
  if (f < at || p >= 1) return null;
  const x = -400 + (CW + 800) * p;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 200,
        top: y,
        width: 400,
        height: h,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)",
        opacity,
        mixBlendMode: "overlay",
        transform: "skewX(-18deg)",
      }}
    />
  );
};

/** Anamorphic flare: a horizontal streak and a soft bloom around a light source. */
export const Flare: React.FC<{ x: number; y: number; at: number; peak: number; end: number; color?: string; strength?: number }> = ({ x, y, at, peak, end, color = "255,196,140", strength = 1 }) => {
  const f = useF();
  if (f < at || f > end) return null;
  const a = (f < peak ? p01(f, at, peak - at, E.drift) : 1 - p01(f, peak, end - peak, E.drift)) * strength;
  const flick = 0.92 + 0.08 * noise2D("flare", f * 0.2, x);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: a * flick, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x - 520, top: y - 5, width: 1040, height: 10, borderRadius: 10, background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},0.9) 50%, rgba(${color},0) 100%)`, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", left: x - 260, top: y - 260, width: 520, height: 520, borderRadius: "50%", background: `radial-gradient(circle, rgba(${color},0.55) 0%, rgba(${color},0) 65%)` }} />
    </AbsoluteFill>
  );
};

/** Expanding hairline ring (minimal shockwave). */
export const Ring: React.FC<{ at: number; x: number; y: number; maxR?: number; dur?: number; color?: string; width?: number }> = ({ at, x, y, maxR = 700, dur = 50, color = K.ice, width = 2 }) => {
  const f = useF();
  const p = p01(f, at, dur, E.reveal);
  if (f < at || p >= 1) return null;
  const r = 40 + p * maxR;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${width}px solid ${color}`, opacity: (1 - p) * 0.8 }} />;
};

/** iOS-style glass notification banner sliding down. */
export const Banner: React.FC<{ at: number; out?: number; y: number; title: string; body: string; icon?: React.ReactNode; tint?: string }> = ({ at, out, y, title, body, icon, tint = "rgba(255,255,255,0.14)" }) => {
  const f = useF();
  if (f < at) return null;
  const p = p01(f, at, 22, E.reveal);
  const e = out !== undefined ? p01(f, out, 14, E.exit) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        width: CW - 160,
        top: y,
        padding: "24px 28px",
        boxSizing: "border-box",
        borderRadius: 36,
        background: tint,
        border: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(24px)",
        display: "flex",
        alignItems: "center",
        gap: 22,
        transform: `translateY(${(1 - p) * -80 - e * 40}px) scale(${0.96 + 0.04 * p})`,
        opacity: Math.min(1, p * 1.5) * (1 - e),
        boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
      }}
    >
      {icon}
      <div style={{ fontFamily: SANS, color: K.ice, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 30 }}>{title}</div>
        <div style={{ fontWeight: 400, fontSize: 28, color: "rgba(245,245,247,0.75)", marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
};

/** Decaying camera shake for impacts. */
export const shake = (f: number, at: number, amp: number) => {
  const t = f - at;
  if (t < 0 || t > 24) return "none";
  const d = amp * Math.exp(-t / 6);
  return `translate(${noise2D("shx", t * 0.4, at) * d}px, ${noise2D("shy", t * 0.4, at + 3) * d}px)`;
};
