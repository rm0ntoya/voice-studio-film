import React from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { ease } from "../motion/easing";
import { C, H, W } from "../theme/tokens";

type P = Record<string, unknown>;
type Comp<T extends P> = React.FC<TransitionPresentationComponentProps<T>>;

const make = <T extends P>(component: Comp<T>, props: T): TransitionPresentation<T> => ({
  component,
  props,
});

/* lift — outgoing rises & dissolves, incoming rises in from below */
const Lift: Comp<P> = ({ children, presentationDirection, presentationProgress }) => {
  const p = ease.inOut(presentationProgress);
  const exiting = presentationDirection === "exiting";
  const y = exiting ? -p * 140 : (1 - p) * 140;
  const o = exiting ? 1 - Math.min(1, p * 1.4) : Math.min(1, p * 1.4);
  const b = exiting ? p * 10 : (1 - p) * 10;
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px)`, opacity: o, filter: b > 0.3 ? `blur(${b}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};
export const lift = () => make(Lift, {});

/* whip — horizontal snap with directional (x-only) motion blur */
const Whip: Comp<P> = ({ children, presentationDirection, presentationProgress }) => {
  const p = ease.snap(presentationProgress);
  const exiting = presentationDirection === "exiting";
  const x = exiting ? -p * W * 0.55 : (1 - p) * W * 0.55;
  const blur = Math.sin(presentationProgress * Math.PI) * 46;
  const id = `whip-${presentationDirection}`;
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translateX(${x}px)`,
          opacity: exiting ? 1 - Math.max(0, p - 0.55) / 0.45 : Math.min(1, p / 0.45),
          filter: blur > 1 ? `url(#${id})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const whip = () => make(Whip, {});

/* dip — the outgoing world sinks into darkness before the next one surfaces */
const Dip: Comp<P> = ({ children, presentationDirection, presentationProgress }) => {
  const exiting = presentationDirection === "exiting";
  const p = presentationProgress;
  const o = exiting ? 1 - ease.inOut(Math.min(1, p / 0.6)) : ease.inOut(Math.max(0, (p - 0.4) / 0.6));
  const s = exiting ? 1 - 0.06 * ease.inOut(p) : 1.03 - 0.03 * ease.enter(p);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>{children}</AbsoluteFill>
  );
};
export const dip = () => make(Dip, {});

/* iris — ember flood expanding from a point (the playhead) */
const Iris: Comp<P> = ({ children, presentationDirection, presentationProgress, passedProps: raw }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const passedProps = raw as { cx: number; cy: number };
  const p = ease.snap(presentationProgress);
  const maxR = Math.hypot(Math.max(passedProps.cx, W - passedProps.cx), Math.max(passedProps.cy, H - passedProps.cy));
  const r = Math.max(0.5, p * maxR);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at ${passedProps.cx}px ${passedProps.cy}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
export const iris = (cx: number, cy: number) => make<P>(Iris, { cx, cy });

/* collapse — the outgoing frame is squeezed into a single horizontal line */
const Collapse: Comp<P> = ({ children, presentationDirection, presentationProgress }) => {
  if (presentationDirection === "entering") {
    return <AbsoluteFill style={{ opacity: Math.min(1, presentationProgress * 3) }}>{children}</AbsoluteFill>;
  }
  const p = ease.inOut(presentationProgress);
  const inset = Math.min(49.9, p * 50);
  const fade = presentationProgress > 0.8 ? 1 - (presentationProgress - 0.8) / 0.2 : 1;
  return (
    <AbsoluteFill style={{ zIndex: 2 }}>
      <AbsoluteFill style={{ clipPath: `inset(${inset}% 0 ${inset}% 0)` }}>{children}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: H / 2 - 1,
          height: 2,
          background: C.ember,
          opacity: p * fade,
        }}
      />
    </AbsoluteFill>
  );
};
export const collapse = () => make(Collapse, {});
