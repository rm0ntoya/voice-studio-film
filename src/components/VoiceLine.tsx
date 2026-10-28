import React from "react";
import { random } from "remotion";
import { voiceHi, voiceMax } from "../audio/envelope";
import { FPS, C } from "../theme/tokens";

/**
 * The film's leitmotif: the real narration envelope drawn as an ember ribbon.
 *
 * modes
 *  - record : the playhead travels right at `pxPerSec`, leaving the voice behind it
 *  - window : fixed playhead at the right edge, the last `windowSec` scroll past
 *  - static : a fixed time range [t0, t1] laid across the width, revealed by `reveal`
 *
 * style "bars" + quantize/jitter turns the same data robotic (S7 "voz travada").
 */
type Props = {
  id: string;
  abs: number;
  x: number;
  y: number;
  width: number;
  amp: number;
  mode: "record" | "window" | "static";
  t0?: number;
  t1?: number;
  windowSec?: number;
  pxPerSec?: number;
  reveal?: number;
  playheadSec?: number;
  color?: string;
  opacity?: number;
  points?: number;
  variant?: "ribbon" | "bars";
  barW?: number;
  quantize?: number;
  jitter?: number;
  head?: boolean;
  baseline?: number;
  gain?: number;
  fadeTail?: boolean;
};

export const VoiceLine: React.FC<Props> = ({
  id,
  abs,
  x,
  y,
  width,
  amp,
  mode,
  t0 = 0,
  t1 = 1,
  windowSec = 3,
  pxPerSec = 380,
  reveal = 1,
  playheadSec,
  color = C.ember,
  opacity = 1,
  points = 180,
  variant = "ribbon",
  barW = 6,
  quantize = 0,
  jitter = 0,
  head = true,
  baseline = 0,
  gain = 1,
  fadeTail = true,
}) => {
  const now = abs / FPS;

  // resolve the drawn time span and pixel span
  let ta: number;
  let tb: number;
  let x0 = x;
  let x1 = x + width;
  if (mode === "record") {
    ta = t0;
    tb = Math.max(t0, now);
    x1 = Math.min(x + width, x + (tb - ta) * pxPerSec);
  } else if (mode === "window") {
    ta = now - windowSec;
    tb = now;
  } else {
    ta = t0;
    tb = t0 + (t1 - t0) * reveal;
    x1 = x + width * reveal;
  }
  if (mode === "record" && (tb - ta) * pxPerSec > width) {
    // once the head reaches the edge, keep scrolling
    ta = tb - width / pxPerSec;
  }
  const span = Math.max(1e-3, x1 - x0);
  const n = Math.max(2, Math.round(points * (span / Math.max(1, width))));

  const sampleAt = (k: number) => {
    const u = k / (n - 1);
    const t = ta + (tb - ta) * u;
    let a: number;
    if (mode === "static" && t1 - t0 > 6) {
      const half = ((t1 - t0) / points) * 0.5;
      a = voiceMax(t - half, t + half);
    } else {
      a = t < 0 ? 0 : voiceHi(t);
    }
    a = Math.min(1, a * gain);
    if (quantize > 0) {
      const steps = Math.round(2 + (1 - quantize) * 14);
      a = a * (1 - quantize) + (Math.round(a * steps) / steps) * quantize;
    }
    return { px: x0 + span * u, a, t };
  };

  const samples = Array.from({ length: n }, (_, k) => sampleAt(k));
  const jit = (k: number) =>
    jitter > 0 ? (random(`${id}-${k}-${Math.floor(abs / 3)}`) - 0.5) * jitter * amp * 0.9 : 0;

  const headA = samples[samples.length - 1]?.a ?? 0;
  const headX = samples[samples.length - 1]?.px ?? x0;
  const playX =
    playheadSec !== undefined && mode === "static"
      ? x + width * ((playheadSec - t0) / (t1 - t0))
      : headX;

  let body: React.ReactNode;
  if (variant === "bars") {
    const step = barW * 2;
    const count = Math.max(1, Math.floor(span / step));
    const dt = (tb - ta) / count;
    body = Array.from({ length: count }, (_, k) => {
      const tA = ta + dt * k;
      let a = tA + dt < 0 ? 0 : voiceMax(Math.max(0, tA), tA + dt);
      a = Math.min(1, a * gain);
      if (quantize > 0) {
        const steps = Math.round(2 + (1 - quantize) * 6);
        a = a * (1 - quantize) + (Math.ceil(a * steps) / steps) * quantize;
      }
      const h = Math.max(barW, a * amp * 2);
      const dy = jit(k);
      const u = k / Math.max(1, count - 1);
      const tail = fadeTail && mode !== "static" ? Math.min(1, 0.08 + u * 1.6) : 1;
      return (
        <rect
          key={k}
          x={x0 + k * step}
          y={y - h / 2 + dy}
          width={barW}
          height={h}
          rx={quantize > 0.5 ? 1 : barW / 2}
          fill={color}
          opacity={tail}
        />
      );
    });
  } else {
    const top = samples.map((s, k) => `${s.px.toFixed(1)},${(y - Math.max(0.8, s.a * amp) + jit(k)).toFixed(1)}`);
    const bot = samples
      .map((s, k) => `${s.px.toFixed(1)},${(y + Math.max(0.8, s.a * amp) + jit(k + 999)).toFixed(1)}`)
      .reverse();
    body = <polygon points={[...top, ...bot].join(" ")} fill={`url(#${id}-grad)`} />;
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1={x0} x2={x1} y1={0} y2={0} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity={fadeTail ? 0.05 : 1} />
          <stop offset="0.35" stopColor={color} stopOpacity={fadeTail ? 0.7 : 1} />
          <stop offset="1" stopColor={color} stopOpacity={1} />
        </linearGradient>
      </defs>
      {baseline > 0 ? (
        <line x1={x} x2={x + width} y1={y} y2={y} stroke={C.line} strokeWidth={1.5} opacity={baseline} />
      ) : null}
      {body}
      {head ? (
        <g>
          <circle cx={playX} cy={y} r={14 + headA * 26} fill={color} opacity={0.12 + headA * 0.12} />
          <circle cx={playX} cy={y} r={7} fill={color} />
        </g>
      ) : null}
    </svg>
  );
};
