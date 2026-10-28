import React from "react";
import { AbsoluteFill, random } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { ease } from "../motion/easing";
import { PAL, SH, SW } from "./theme";

type P = Record<string, unknown>;
type Comp<T extends P> = React.FC<TransitionPresentationComponentProps<T>>;
const make = <T extends P>(component: Comp<T>, props: T): TransitionPresentation<T> => ({ component, props });

const blurF = (b: number) => (b > 0.4 ? `blur(${b}px)` : undefined);

/* zoom — fly through the outgoing frame; the next one settles from slightly small */
const Zoom: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const exiting = presentationDirection === "exiting";
  const p = ease.inOut(t);
  if (exiting) {
    return (
      <AbsoluteFill style={{ transform: `scale(${1 + p * 2.6})`, opacity: 1 - Math.max(0, p - 0.45) / 0.55, filter: blurF(p * 24) }}>
        {children}
      </AbsoluteFill>
    );
  }
  const q = ease.enter(Math.max(0, (t - 0.3) / 0.7));
  return (
    <AbsoluteFill style={{ transform: `scale(${0.55 + 0.45 * q})`, opacity: Math.min(1, q * 1.6), filter: blurF((1 - q) * 14), borderRadius: 90 * (1 - q), overflow: "hidden" }}>
      {children}
    </AbsoluteFill>
  );
};
export const zoom = () => make(Zoom, {});

/* push — vertical swipe like a story feed, with y-motion-blur */
const Push: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const p = ease.snap(t);
  const exiting = presentationDirection === "exiting";
  const y = exiting ? -p * SH : (1 - p) * SH;
  const blur = Math.sin(t * Math.PI) * 30;
  const id = `push-${presentationDirection}`;
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="0" y="-20%" width="100%" height="140%">
          <feGaussianBlur stdDeviation={`0 ${blur}`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translateY(${y}px) scale(${exiting ? 1 - p * 0.08 : 1.08 - 0.08 * p})`,
          filter: blur > 1 ? `url(#${id})` : undefined,
          borderRadius: 40 * Math.sin(t * Math.PI),
          overflow: "hidden",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const push = () => make(Push, {});

/* slices — the next scene arrives in 8 horizontal bands sliding from alternating sides */
const BANDS = 8;
const Slices: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `scale(${1 - 0.06 * t})`, filter: blurF(t * 6) }}>{children}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill>
      {Array.from({ length: BANDS }, (_, k) => {
        const local = ease.snap(Math.min(1, Math.max(0, (t - k * 0.045) / (1 - (BANDS - 1) * 0.045))));
        const dir = k % 2 === 0 ? -1 : 1;
        const top = (k / BANDS) * 100;
        const bottom = 100 - ((k + 1) / BANDS) * 100;
        return (
          <AbsoluteFill
            key={k}
            style={{
              clipPath: `inset(${top}% 0 ${bottom - 0.05}% 0)`,
              transform: `translateX(${dir * (1 - local) * SW}px)`,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
export const slices = () => make(Slices, {});

/* circle — the next scene opens as a growing circle from a point */
const Circle: Comp<P> = ({ children, presentationDirection, presentationProgress: t, passedProps }) => {
  const { cx, cy, ring } = passedProps as { cx: number; cy: number; ring: string };
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `scale(${1 + 0.15 * ease.inOut(t)})` }}>{children}</AbsoluteFill>;
  }
  const p = ease.inOut(t);
  const maxR = Math.hypot(Math.max(cx, SW - cx), Math.max(cy, SH - cy));
  const r = Math.max(0.5, p * maxR);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: `${10 * (1 - p) + 2}px solid ${ring}`,
          opacity: 1 - p,
        }}
      />
    </AbsoluteFill>
  );
};
export const circle = (cx: number, cy: number, ring: string = PAL.ember) => make<P>(Circle, { cx, cy, ring });

/* spin — outgoing twists away and shrinks; incoming counter-rotates in */
const Spin: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const p = ease.inOut(t);
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ transform: `rotate(${p * 28}deg) scale(${1 - p * 0.5})`, opacity: 1 - p, filter: blurF(p * 16) }}>
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ transform: `rotate(${(1 - p) * -24}deg) scale(${1.5 - 0.5 * p})`, opacity: Math.min(1, p * 1.8), filter: blurF((1 - p) * 16) }}>
      {children}
    </AbsoluteFill>
  );
};
export const spin = () => make(Spin, {});

/* glitch — hard cut dressed with RGB split and slice displacement */
const Glitch: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const exiting = presentationDirection === "exiting";
  const show = exiting ? t < 0.5 : t >= 0.5;
  if (!show) return null;
  const b = Math.floor(t * 6);
  const dx = (random(`gl-${b}`) - 0.5) * 80;
  const cut = 20 + random(`gc-${b}`) * 50;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${dx * 0.3}px)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(${cut}% 0 ${100 - cut - 12}% 0)`, transform: `translateX(${dx}px)`, mixBlendMode: "screen", opacity: 0.9 }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: PAL.ember, mixBlendMode: "multiply", opacity: 0.25 }} />
    </AbsoluteFill>
  );
};
export const glitch = () => make(Glitch, {});

/* drain — color bleeds out of the outgoing world, the next fades up from black */
const Drain: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const exiting = presentationDirection === "exiting";
  if (exiting) {
    const p = ease.inOut(Math.min(1, t / 0.7));
    return (
      <AbsoluteFill style={{ filter: `grayscale(${p}) brightness(${1 - p * 0.85})`, transform: `scale(${1 - 0.05 * p})` }}>
        {children}
      </AbsoluteFill>
    );
  }
  const q = ease.enter(Math.max(0, (t - 0.45) / 0.55));
  return <AbsoluteFill style={{ opacity: q }}>{children}</AbsoluteFill>;
};
export const drain = () => make(Drain, {});

/* flood — ember fill expanding from a point (the playhead) */
const Flood: Comp<P> = ({ children, presentationDirection, presentationProgress: t, passedProps }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const { cx, cy } = passedProps as { cx: number; cy: number };
  const p = ease.snap(t);
  const maxR = Math.hypot(Math.max(cx, SW - cx), Math.max(cy, SH - cy));
  return (
    <AbsoluteFill style={{ clipPath: `circle(${Math.max(0.5, p * maxR)}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
  );
};
export const flood = (cx: number, cy: number) => make<P>(Flood, { cx, cy });

/* squeeze — outgoing frame collapses into a vertical bar, the next expands out of it */
const Squeeze: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const exiting = presentationDirection === "exiting";
  if (exiting) {
    const p = ease.inOut(Math.min(1, t / 0.6));
    const inset = p * 49.6;
    return (
      <AbsoluteFill style={{ zIndex: 2, opacity: t > 0.6 ? 1 - (t - 0.6) / 0.15 : 1 }}>
        <AbsoluteFill style={{ clipPath: `inset(0 ${inset}% 0 ${inset}%)` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const q = ease.enter(Math.max(0, (t - 0.5) / 0.5));
  const inset = (1 - q) * 49.6;
  return <AbsoluteFill style={{ clipPath: `inset(${inset * 0.4}% ${inset}% ${inset * 0.4}% ${inset}%)` }}>{children}</AbsoluteFill>;
};
export const squeeze = () => make(Squeeze, {});
