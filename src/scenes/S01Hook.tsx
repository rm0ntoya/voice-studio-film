import React from "react";
import { AbsoluteFill } from "remotion";
import { VoiceLine } from "../components/VoiceLine";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { mix, prog, spr } from "../motion/time";
import { MONO } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { minor, useAbs, type SceneProps } from "./shared";

const LINE_X = 200;
const LINE_Y = 812;
const LINE_W = 1520;
const PX_PER_SEC = 368;

/** S1 — "Deixa eu te contar uma coisa…" : a recording head writes the voice across the frame. */
export const S01Hook: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const now = abs / 60;

  // anticipation: the head pops in, the path draws ahead of it
  const headIn = spr(abs, 0, SPR.pop);
  const pathIn = prog(abs, 2, 46, ease.inOut);
  const cam = mix(1, 1.045, prog(abs, 0, 280, ease.inOut));
  const headX = Math.min(LINE_X + LINE_W, LINE_X + now * PX_PER_SEC);
  const tc = `00:${String(Math.floor(now)).padStart(2, "0")}.${String(Math.floor((now % 1) * 100)).padStart(2, "0")}`;

  return (
    <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: "20% 50%" }}>
      <KineticPhrase
        abs={abs}
        size={96}
        weight={500}
        lineHeight={1.04}
        style={{ position: "absolute", left: LINE_X - 6, top: 228 }}
        lines={[
          [0, 1, 2, 3, 4, 5],
          [6, 7, 8],
          [9, 10, 11, 12, 13, 14],
          [15, 16, 17],
        ]}
        words={{
          ...minor(1, 2, 4, 6, 9, 11, 12, 16),
          8: {
            fx: "flip",
            flipDelay: 13,
            flipTo: { font: "serif", color: C.ember, size: 112 },
          },
          14: { weight: 600 },
          17: { weight: 600 },
        }}
      />

      {/* the path ahead of the head */}
      <div
        style={{
          position: "absolute",
          left: LINE_X,
          top: LINE_Y - 0.75,
          height: 1.5,
          width: LINE_W * pathIn,
          background: C.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${headIn})`,
          transformOrigin: `${LINE_X}px ${LINE_Y}px`,
        }}
      >
        <VoiceLine
          id="hook"
          abs={abs}
          mode="record"
          x={LINE_X}
          y={LINE_Y}
          width={LINE_W}
          amp={46}
          pxPerSec={PX_PER_SEC}
          variant="bars"
          barW={5}
        />
      </div>
      {/* timecode planted here, paid off in the proof scene */}
      <div
        style={{
          position: "absolute",
          left: headX - 60,
          width: 120,
          top: LINE_Y + 40,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 18,
          letterSpacing: "0.12em",
          color: C.muted,
          opacity: prog(abs, 10, 20),
        }}
      >
        {tc}
      </div>
    </AbsoluteFill>
  );
};
