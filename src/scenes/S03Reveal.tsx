import React from "react";
import { AbsoluteFill } from "remotion";
import { voiceHi } from "../audio/envelope";
import { Lockup } from "../components/Lockup";
import { sceneStart } from "../data/timeline";
import { onset, wf, we } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { prog, spr } from "../motion/time";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { LOCKUP, useAbs, type SceneProps } from "./shared";

/** live voice → five bars, each sampled a few ms apart so the energy ripples across the mark */
export const liveLevels = (abs: number, amount: number) =>
  [0, 1, 2, 3, 4].map((k) => voiceHi(abs / 60 - Math.abs(k - 2) * 0.045) * amount);

/** S3 — "Esse é o Voice Studio." : the dot becomes the voice, the voice becomes the mark. */
export const S03Reveal: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const impact = Math.round(onset(39)); // "Voice" — music downbeat lands here
  const studio = wf(40);
  const flipEnd = sceneStart("create");
  const flipStart = flipEnd - 22;

  const spread = spr(abs, impact - 2, SPR.pop);
  const formation = spr(abs, studio + 4, SPR.heavy);
  const live = 1 - prog(abs, we(40) - 10, 14, ease.inOut);
  const markShift = 1 - spr(abs, impact - 1, SPR.snappy);
  const flip = prog(abs, flipStart, flipEnd - flipStart, ease.inOut);

  // dot listens before the reveal
  const listen = abs < impact ? 1 + voiceHi(abs / 60) * 0.35 : 1;
  const punch = abs >= impact ? 0.055 * Math.exp(-(abs - impact) / 9) : 0;
  const glow = abs >= impact ? 0.16 + 0.42 * Math.exp(-(abs - impact) / 16) : 0.06;

  return (
    <AbsoluteFill style={{ transform: `scale(${1 + punch})` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px circle at 960px ${LOCKUP.center.y}px, rgba(255,90,54,${glow * (1 - flip)}) 0%, rgba(255,90,54,0) 70%)`,
        }}
      />
      <KineticPhrase
        abs={abs}
        size={46}
        weight={400}
        color={C.muted}
        fx="fade"
        align="center"
        lines={[[36, 37, 38]]}
        exitAt={impact - 4}
        exit="blur"
        style={{ position: "absolute", left: 0, right: 0, top: 330 }}
      />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${listen})`, transformOrigin: "960px 540px" }}>
        <Lockup
          spread={spread}
          formation={formation}
          levels={liveLevels(abs, live)}
          pVoice={prog(abs, impact + 5, 18)}
          pStudio={prog(abs, studio, 18)}
          markShift={markShift}
          markDy={(540 - LOCKUP.center.y) * markShift}
          flip={flip}
        />
      </div>
    </AbsoluteFill>
  );
};
