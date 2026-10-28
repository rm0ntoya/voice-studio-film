import React from "react";
import { AbsoluteFill } from "remotion";
import { Lockup } from "../components/Lockup";
import { ENDING_DOWNBEAT } from "../data/timeline";
import { onset, wf, we } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { mix, prog, spr } from "../motion/time";
import { MONO } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { liveLevels } from "./S03Reveal";
import { useAbs, type SceneProps } from "./shared";

const BAR = { x: 660, y: 846, w: 600 };

/** S12 — "Voice Studio, a sua voz atendendo por você o dia inteiro." : signature, then stillness. */
export const S12Outro: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const voice = wf(157);
  const studio = wf(158);
  const formation = spr(abs, voice + 2, SPR.heavy);
  const live = 1 - prog(abs, we(167), 30, ease.inOut);
  const dayFrom = Math.round(onset(165)) - 4;
  const dayTo = we(167);
  const day = prog(abs, dayFrom, dayTo - dayFrom, ease.inOut);
  const final = abs >= ENDING_DOWNBEAT ? Math.exp(-(abs - ENDING_DOWNBEAT) / 22) : 0;
  const settle = mix(1, 1.025, prog(abs, start, 480, ease.inOut));
  const barOut = prog(abs, ENDING_DOWNBEAT + 30, 40, ease.inOut);

  const levels = liveLevels(abs, live).map((l) => l + final * 0.55);

  return (
    <AbsoluteFill style={{ transform: `scale(${settle})` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px circle at 960px 520px, rgba(255,90,54,${0.1 + 0.3 * final}) 0%, rgba(255,90,54,0) 70%)`,
        }}
      />
      <Lockup spread={1} formation={formation} levels={levels} pVoice={prog(abs, voice + 2, 18)} pStudio={prog(abs, studio, 18)} />

      <KineticPhrase
        abs={abs}
        size={50}
        weight={400}
        align="center"
        lines={[[159, 160, 161, 162, 163, 164, 165, 166, 167]]}
        words={{
          159: { color: "rgba(244,239,230,0.52)" },
          160: { font: "serif", color: C.ember, size: 62 },
          161: { font: "serif", color: C.ember, size: 62 },
          165: { weight: 600 },
          166: { weight: 600 },
          167: { weight: 600 },
        }}
        style={{ position: "absolute", left: 0, right: 0, top: 700 }}
      />

      {/* the day bar: 24 hours fill on "o dia inteiro" */}
      <div style={{ position: "absolute", left: BAR.x, top: BAR.y, width: BAR.w, opacity: prog(abs, dayFrom - 12, 12) * (1 - barOut) }}>
        <div style={{ position: "relative", height: 2, background: C.line }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 2, width: `${day * 100}%`, background: C.ember }} />
          {Array.from({ length: 25 }, (_, h) => (
            <div
              key={h}
              style={{
                position: "absolute",
                left: `${(h / 24) * 100}%`,
                top: h % 6 === 0 ? -7 : -4,
                width: 1.5,
                height: h % 6 === 0 ? 16 : 10,
                background: h / 24 <= day ? C.ember : C.line,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: `calc(${day * 100}% - 7px)`,
              top: -6,
              width: 14,
              height: 14,
              borderRadius: 99,
              background: C.ember,
              opacity: day > 0 && day < 1 ? 1 : 0,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontFamily: MONO, fontSize: 18, letterSpacing: "0.14em", color: C.muted }}>
          <span>00h</span>
          <span>06h</span>
          <span>12h</span>
          <span>18h</span>
          <span style={{ color: day >= 1 ? C.ember : C.muted }}>24h</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
