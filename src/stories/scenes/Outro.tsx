import React from "react";
import { AbsoluteFill } from "remotion";
import { ease } from "../../motion/easing";
import { SPR } from "../../motion/springs";
import { prog, spr } from "../../motion/time";
import { MONO, SERIF } from "../../theme/fonts";
import { C } from "../../theme/tokens";
import { LogoMark, Wordmark } from "../../components/Logo";
import { KineticPhrase } from "../../typography/KineticPhrase";
import { voiceAt } from "../data/envelope";
import { ENDING } from "../data/timeline";
import { wf, we } from "../data/words";
import { Burst, Cam, Flash, Marquee, SceneBg, Shockwave, useAbs, type StoryProps } from "../kit";
import { INNER_W, PAL, SAFE, SW } from "../theme";

const LOGO = { x: SW / 2, y: 640, size: 230 };
const RING_R = 250;

/* ------------------------------------------------------------------ S13 outro
 * "Voice Studio. A sua voz atendendo por você. O dia inteiro, sem parar."
 * Lockup + a 24 h ring that closes on "o dia inteiro", marquee that never stops, button ending. */
export const OutroScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const mark = spr(abs, wf(101) - 4, SPR.pop);
  const hit = spr(abs, ENDING, SPR.pop);
  const hitPunch = abs >= ENDING ? 1 + 0.18 * (1 - hit) : 1;
  const e = voiceAt(abs);
  const levels = [0.6, 0.9, 1, 0.9, 0.6].map((k, i) => e * k * (0.7 + 0.3 * Math.sin(abs * 0.4 + i)));
  const ringP = prog(abs, wf(109), we(111) - wf(109), ease.inOut);
  const ringIn = prog(abs, wf(103), 30, ease.enter);
  const spinA = abs * 0.6;
  const circ = 2 * Math.PI * RING_R;
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={PAL.ink}
        blobs={[
          { color: PAL.ember, x: 0.5, y: 0.34, r: 0.85, a: 0.45 + 0.3 * prog(abs, ENDING, 10) },
          { color: PAL.irisDeep, x: 0.05, y: 0.95, r: 0.7, a: 0.7 },
          { color: PAL.emberDeep, x: 0.95, y: 0.9, r: 0.6, a: 0.5 },
        ]}
        pattern="rings"
        patternColor={PAL.emberSoft}
        patternOpacity={0.07}
        seed="outro"
      />
      <Marquee abs={abs} text="o dia inteiro  ·  sem parar" y={1500} size={84} speed={5} color={C.bone} font={SERIF} weight={400} opacity={0.14 * prog(abs, wf(112), 20)} />
      <Cam abs={abs} zoom={[[start, 1.0], [ENDING - 1, 1.06], [ENDING + 2, 1.0], [ENDING + 120, 1.04]]}>
        {/* 24h ring */}
        <svg width={SW} height={1300} style={{ position: "absolute", left: 0, top: 0, opacity: ringIn }}>
          <g transform={`translate(${LOGO.x} ${LOGO.y})`}>
            {Array.from({ length: 24 }, (_, k) => {
              const a = (k / 24) * Math.PI * 2;
              const lit = k / 24 <= ringP;
              return (
                <line
                  key={k}
                  x1={Math.cos(a) * (RING_R + 22)}
                  y1={Math.sin(a) * (RING_R + 22)}
                  x2={Math.cos(a) * (RING_R + (k % 6 === 0 ? 48 : 36))}
                  y2={Math.sin(a) * (RING_R + (k % 6 === 0 ? 48 : 36))}
                  stroke={lit ? PAL.ember : "rgba(244,239,230,0.25)"}
                  strokeWidth={k % 6 === 0 ? 5 : 3}
                  strokeLinecap="round"
                />
              );
            })}
            <circle r={RING_R} fill="none" stroke="rgba(244,239,230,0.12)" strokeWidth={6} />
            <circle
              r={RING_R}
              fill="none"
              stroke={PAL.ember}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - ringP)}
              transform="rotate(-90)"
            />
            <circle cx={Math.cos((spinA * Math.PI) / 180) * RING_R} cy={Math.sin((spinA * Math.PI) / 180) * RING_R} r={10} fill={C.bone} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: LOGO.x + RING_R + 40, top: LOGO.y - RING_R - 70, fontFamily: MONO, fontSize: 30, letterSpacing: "0.14em", color: PAL.ember, opacity: prog(abs, wf(110), 14) }}>
          24H
        </div>

        <Shockwave abs={abs} at={wf(101)} x={LOGO.x} y={LOGO.y} color={PAL.emberSoft} count={2} maxR={800} />
        <Shockwave abs={abs} at={ENDING} x={LOGO.x} y={LOGO.y} color={PAL.ember} count={4} maxR={1300} dur={56} width={10} />
        <Burst abs={abs} at={ENDING} x={LOGO.x} y={LOGO.y} colors={[PAL.ember, C.bone, PAL.sun]} count={36} dist={900} seed="end" shape="bar" size={22} />
        <div style={{ position: "absolute", left: LOGO.x - LOGO.size / 2, top: LOGO.y - LOGO.size / 2, transform: `scale(${mark * hitPunch})` }}>
          <LogoMark size={LOGO.size} levels={levels} />
        </div>
        <div style={{ position: "absolute", left: 0, width: SW, top: 960, display: "flex", justifyContent: "center", transform: `scale(${hitPunch})` }}>
          <Wordmark size={128} pVoice={prog(abs, wf(101), 18)} pStudio={prog(abs, wf(102), 18)} />
        </div>

        <div style={{ position: "absolute", left: SAFE.x, top: 1170, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={68}
            weight={600}
            lines={[[103, 104, 105], [106, 107, 108]]}
            words={{
              103: { color: "rgba(244,239,230,0.6)" },
              104: { color: "rgba(244,239,230,0.6)" },
              105: { font: "serif", size: 96, color: PAL.ember },
              108: { weight: 700 },
            }}
            exitAt={wf(109) - 8}
            exit="blur"
          />
        </div>
        <div style={{ position: "absolute", left: SAFE.x, top: 1150, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={100}
            weight={700}
            lines={[[109, 110, 111], [112, 113]]}
            words={{
              109: { color: "rgba(244,239,230,0.6)" },
              112: { color: "rgba(244,239,230,0.6)" },
              113: { font: "serif", size: 140, color: PAL.ember, fx: "pop" },
            }}
          />
        </div>
      </Cam>
      <Flash abs={abs} at={ENDING} color={PAL.ember} dur={14} peak={0.5} />
    </AbsoluteFill>
  );
};
