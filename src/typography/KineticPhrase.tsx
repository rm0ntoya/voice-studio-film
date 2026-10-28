import React, { createContext, useContext } from "react";
import { display as filmDisplay, wf as filmWf } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, prog, spr } from "../motion/time";
import { FONT, type FontRole } from "../theme/fonts";
import { C } from "../theme/tokens";

export type WordFx = "rise" | "pop" | "flip" | "instant" | "fade" | "slam";

export type WordOpts = {
  font?: FontRole;
  size?: number;
  weight?: number;
  color?: string;
  fx?: WordFx;
  tracking?: number;
  /** override the displayed text (e.g. keep punctuation) */
  text?: string;
  /** flip target style (fx: "flip") — the word transforms into this after `flipDelay` frames */
  flipTo?: { font?: FontRole; color?: string; weight?: number; size?: number };
  flipDelay?: number;
  /** render as hollow outline after `hollowAt` (absolute frame) */
  hollowAt?: number;
  /** shift the reveal frame (frames, + = later) */
  delay?: number;
  style?: React.CSSProperties;
};

type Props = {
  lines: number[][];
  abs: number;
  size: number;
  weight?: number;
  color?: string;
  font?: FontRole;
  tracking?: number;
  lineHeight?: number;
  words?: Record<number, WordOpts>;
  fx?: WordFx;
  exitAt?: number;
  exit?: "up" | "fade" | "down" | "blur";
  exitDur?: number;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
  /** dim words that have already been spoken (0..1 dim amount) */
  dimSpoken?: number;
};

const REVEAL = 16;

/** Which narration the kinetic text is synced to (defaults to the landscape film). */
export type WordSource = { wf: (i: number) => number; display: (i: number) => string };
export const WordSourceContext = createContext<WordSource>({ wf: filmWf, display: filmDisplay });

const Word: React.FC<{
  i: number;
  abs: number;
  o: WordOpts;
  base: Required<Pick<Props, "size" | "weight" | "color" | "font" | "tracking">>;
  fx: WordFx;
  exitP: number;
  exitMode: NonNullable<Props["exit"]>;
}> = ({ i, abs, o, base, fx, exitP, exitMode }) => {
  const { wf, display } = useContext(WordSourceContext);
  const t0 = wf(i) + (o.delay ?? 0);
  if (abs < t0) {
    // keep layout stable: render invisible placeholder
    return <Shell o={o} base={base} hidden text={o.text ?? display(i)} />;
  }

  let y = 0;
  let op = 1;
  let blur = 0;
  let scale = 1;
  let rotX = 0;

  const mode = o.fx ?? fx;
  if (mode === "rise") {
    const p = prog(abs, t0, REVEAL, ease.enter);
    y = (1 - p) * 1.12;
    blur = (1 - p) * 7;
    op = clamp01(p * 1.8);
  } else if (mode === "pop") {
    const s = spr(abs, t0, SPR.pop);
    y = (1 - Math.min(1, s)) * 0.55;
    scale = 0.72 + 0.28 * s;
    op = clamp01(s * 2.2);
    blur = (1 - clamp01(s)) * 5;
  } else if (mode === "slam") {
    const s = spr(abs, t0, SPR.heavy);
    scale = 1.45 - 0.45 * s;
    op = clamp01((abs - t0) / 3);
    blur = (1 - clamp01(s)) * 10;
  } else if (mode === "fade") {
    op = prog(abs, t0, 12, ease.soft);
    blur = (1 - op) * 6;
  } else if (mode === "instant") {
    op = abs >= t0 + 2 ? 1 : 0; // lands on the exact onset (LEAD compensated)
  } else if (mode === "flip") {
    const p = prog(abs, t0, REVEAL, ease.enter);
    y = (1 - p) * 1.12;
    op = clamp01(p * 1.8);
    blur = (1 - p) * 7;
  }

  // exits
  if (exitP > 0) {
    if (exitMode === "up") y -= exitP * 1.6;
    if (exitMode === "down") y += exitP * 1.6;
    if (exitMode === "up" || exitMode === "down") op *= 1 - Math.max(0, exitP - 0.45) / 0.55;
    if (exitMode === "fade") op *= 1 - exitP;
    if (exitMode === "blur") {
      op *= 1 - exitP;
      blur += exitP * 14;
    }
  }

  const text = o.text ?? display(i);

  if (mode === "flip" && o.flipTo) {
    const f0 = t0 + (o.flipDelay ?? 14);
    const fp = prog(abs, f0, 14, ease.inOut);
    rotX = fp * 180;
    const showBack = rotX > 90;
    const style = showBack ? { ...o, ...o.flipTo } : o;
    return (
      <Shell o={style} base={base} text={text} maskless>
        <span
          style={{
            display: "inline-block",
            transform: `translateY(${y}em) rotateX(${showBack ? rotX - 180 : rotX}deg) scale(${scale})`,
            opacity: op,
            filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
          }}
        >
          {text}
        </span>
      </Shell>
    );
  }

  const hollow = o.hollowAt !== undefined ? prog(abs, o.hollowAt, 18, ease.inOut) : 0;

  return (
    <Shell o={o} base={base} text={text}>
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${y}em) scale(${scale}) rotateX(${rotX}deg)`,
          transformOrigin: "50% 80%",
          opacity: op,
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
          color: hollow > 0 ? `rgba(244,239,230,${1 - hollow})` : undefined,
          WebkitTextStroke: hollow > 0 ? `${1.5 * hollow}px ${C.bone}` : undefined,
        }}
      >
        {text}
      </span>
    </Shell>
  );
};

const Shell: React.FC<{
  o: WordOpts;
  base: Required<Pick<Props, "size" | "weight" | "color" | "font" | "tracking">>;
  text: string;
  hidden?: boolean;
  maskless?: boolean;
  children?: React.ReactNode;
}> = ({ o, base, text, hidden, maskless, children }) => {
  const font = o.font ?? base.font;
  const size = o.size ?? base.size;
  return (
    <span
      style={{
        display: "inline-block",
        overflow: maskless ? "visible" : "hidden",
        padding: "0.12em 0.06em 0.2em",
        margin: "-0.12em -0.06em -0.2em",
        verticalAlign: "baseline",
        fontFamily: FONT[font],
        fontSize: size,
        fontWeight: font === "serif" ? 400 : (o.weight ?? base.weight),
        color: o.color ?? base.color,
        letterSpacing: `${o.tracking ?? (font === "serif" ? -0.01 : base.tracking)}em`,
        perspective: 600,
        visibility: hidden ? "hidden" : "visible",
        ...o.style,
      }}
    >
      {hidden ? text : children}
    </span>
  );
};

/**
 * Word-synchronous kinetic text. Each word appears on its own aligned onset
 * (words.json). Lines are explicit so composition stays art-directed.
 */
export const KineticPhrase: React.FC<Props> = ({
  lines,
  abs,
  size,
  weight = 500,
  color = C.bone,
  font = "sans",
  tracking = -0.03,
  lineHeight = 1.02,
  words = {},
  fx = "rise",
  exitAt,
  exit = "up",
  exitDur = 14,
  align = "left",
  style,
}) => {
  const base = { size, weight, color, font, tracking };
  let order = 0;
  return (
    <div style={{ textAlign: align, lineHeight, ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "nowrap" }}>
          {line.map((i, k) => {
            const ord = order++;
            const exitP =
              exitAt !== undefined ? prog(abs, exitAt + ord * 1, exitDur, ease.exit) : 0;
            return (
              <React.Fragment key={i}>
                <Word
                  i={i}
                  abs={abs}
                  o={words[i] ?? {}}
                  base={base}
                  fx={fx}
                  exitP={exitP}
                  exitMode={exit}
                />
                {k < line.length - 1 ? <span style={{ fontSize: size }}>{" "}</span> : null}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Free text (not spoken) revealed at a given frame with the same mask language. */
export const RevealText: React.FC<{
  text: string;
  at: number;
  abs: number;
  size: number;
  font?: FontRole;
  weight?: number;
  color?: string;
  tracking?: number;
  upper?: boolean;
  exitAt?: number;
  style?: React.CSSProperties;
}> = ({ text, at, abs, size, font = "mono", weight = 400, color = C.muted, tracking, upper, exitAt, style }) => {
  const p = prog(abs, at, 18, ease.enter);
  const e = exitAt !== undefined ? prog(abs, exitAt, 12, ease.exit) : 0;
  return (
    <div
      style={{
        fontFamily: FONT[font],
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: `${tracking ?? (font === "mono" ? 0.14 : -0.02)}em`,
        textTransform: upper ? "uppercase" : undefined,
        overflow: "hidden",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <div style={{ transform: `translateY(${(1 - p) * 110 - e * 110}%)`, opacity: Math.min(1, p * 1.5) }}>
        {text}
      </div>
    </div>
  );
};
