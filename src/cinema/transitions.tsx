import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { CH, CW, E } from "./theme";

type P = Record<string, unknown>;
type Comp<T extends P> = React.FC<TransitionPresentationComponentProps<T>>;
const make = <T extends P>(component: Comp<T>, props: T): TransitionPresentation<T> => ({ component, props });
const blurF = (b: number) => (b > 0.4 ? `blur(${b}px)` : undefined);

/* zoom-blur — push through the outgoing frame; the next one lands from slightly small */
const ZoomBlur: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  if (presentationDirection === "exiting") {
    const p = E.exit(t);
    return <AbsoluteFill style={{ transform: `scale(${1 + 0.45 * p})`, filter: blurF(p * 22), opacity: 1 - Math.max(0, t - 0.5) * 2 }}>{children}</AbsoluteFill>;
  }
  const q = E.reveal(t);
  return <AbsoluteFill style={{ transform: `scale(${0.86 + 0.14 * q})`, filter: blurF((1 - q) * 18), opacity: Math.min(1, t * 2.2) }}>{children}</AbsoluteFill>;
};
export const zoomBlur = () => make(ZoomBlur, {});

/* slide-up — vertical push with y motion blur, like a feed swipe */
const SlideUp: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const p = E.drift(t) * 0.25 + Easing(t) * 0.75;
  const exiting = presentationDirection === "exiting";
  const y = exiting ? -p * CH * 0.35 : (1 - p) * CH;
  const blur = Math.sin(t * Math.PI) * 26;
  const id = `su-${presentationDirection}`;
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="0" y="-20%" width="100%" height="140%">
          <feGaussianBlur stdDeviation={`0 ${blur}`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translateY(${y}px) scale(${exiting ? 1 - 0.06 * p : 1})`,
          filter: blur > 1 ? `url(#${id})${exiting ? ` brightness(${1 - 0.5 * p})` : ""}` : undefined,
          borderRadius: exiting ? 0 : 48 * (1 - p),
          overflow: "hidden",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Easing = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const slideUp = () => make(SlideUp, {});

/* soft wipe — the next shot is revealed bottom→top behind a feathered edge */
const Wipe: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  if (presentationDirection === "exiting") {
    const p = E.drift(t);
    return <AbsoluteFill style={{ transform: `translateY(${-p * 80}px)`, filter: `brightness(${1 - 0.4 * p})` }}>{children}</AbsoluteFill>;
  }
  const p = E.drift(t);
  const edge = (1 - p) * 120 - 10; // % from top of the feather start
  const mask = `linear-gradient(180deg, rgba(0,0,0,0) ${edge}%, rgba(0,0,0,1) ${edge + 18}%)`;
  return (
    <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, transform: `translateY(${(1 - p) * 60}px)` }}>{children}</AbsoluteFill>
  );
};
export const wipe = () => make(Wipe, {});

/* iris — the next shot opens as a circle from a point */
const Iris: Comp<P> = ({ children, presentationDirection, presentationProgress: t, passedProps }) => {
  const { cx, cy } = passedProps as { cx: number; cy: number };
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ transform: `scale(${1 + 0.1 * E.drift(t)})` }}>{children}</AbsoluteFill>;
  const r = Math.max(0.5, E.drift(t) * Math.hypot(Math.max(cx, CW - cx), Math.max(cy, CH - cy)));
  return <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>;
};
export const iris = (cx: number, cy: number) => make<P>(Iris, { cx, cy });

/* dip — through a solid color (black for weight, white for a bright flash) */
const Dip: Comp<P> = ({ children, presentationDirection, presentationProgress: t, passedProps }) => {
  const { color } = passedProps as { color: string };
  const exiting = presentationDirection === "exiting";
  const o = exiting ? 1 - E.fade(Math.min(1, t / 0.5)) : E.fade(Math.max(0, (t - 0.5) / 0.5));
  return (
    <AbsoluteFill style={{ background: color }}>
      <AbsoluteFill style={{ opacity: o, transform: `scale(${exiting ? 1 + 0.04 * t : 1.04 - 0.04 * t})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
export const dip = (color: string) => make<P>(Dip, { color });

/* blur cross — gentle crossfade through focus */
const BlurCross: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const exiting = presentationDirection === "exiting";
  const p = E.fade(t);
  return (
    <AbsoluteFill style={{ opacity: exiting ? 1 : p, filter: blurF(exiting ? p * 14 : (1 - p) * 14) }}>{children}</AbsoluteFill>
  );
};
export const blurCross = () => make(BlurCross, {});

/* light leak — crossfade under a warm bloom that sweeps across the frame */
const Leak: Comp<P> = ({ children, presentationDirection, presentationProgress: t }) => {
  const exiting = presentationDirection === "exiting";
  if (exiting) return <AbsoluteFill style={{ filter: `brightness(${1 + 0.6 * t})` }}>{children}</AbsoluteFill>;
  const p = E.fade(Math.max(0, (t - 0.25) / 0.6));
  const bloom = Math.sin(t * Math.PI);
  const x = -30 + 160 * t;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: p }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: bloom,
          background: `radial-gradient(ellipse 60% 45% at ${x}% 40%, rgba(255,190,120,0.95) 0%, rgba(255,120,60,0.55) 35%, rgba(255,90,40,0) 70%), radial-gradient(ellipse 40% 30% at ${x - 30}% 70%, rgba(255,230,190,0.7) 0%, rgba(255,230,190,0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
export const leak = () => make(Leak, {});
