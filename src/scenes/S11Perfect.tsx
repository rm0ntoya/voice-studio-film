import React from "react";
import { AbsoluteFill } from "remotion";
import { VOICE_DURATION } from "../audio/envelope";
import { LogoMark } from "../components/Logo";
import { DrawPath, ICON } from "../components/ui";
import { VoiceLine } from "../components/VoiceLine";
import { sceneStart } from "../data/timeline";
import { wf } from "../data/words";
import { ease } from "../motion/easing";
import { mix, prog } from "../motion/time";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { LOCKUP, serifEmber, useAbs, type SceneProps } from "./shared";
import { OUT_WAVE } from "./S10Process";

/** S11 — "E ficou perfeito, né?" : the generated voice, approved; then it condenses into the mark. */
export const S11Perfect: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const end = sceneStart("outro");
  const condense = prog(abs, end - 18, 18, ease.inOut);
  const checkAt = wf(155);

  // the waveform squeezes horizontally into the mark's slot
  const lockLeft = LOCKUP.center.x - LOCKUP.width / 2;
  const markCx = lockLeft + LOCKUP.markSize / 2;
  const waveCx = OUT_WAVE.x + OUT_WAVE.w / 2;
  const sx = mix(1, 0.08, condense);
  const tx = mix(0, markCx - waveCx, condense);
  const ty = mix(0, LOCKUP.center.y - OUT_WAVE.y, condense);

  return (
    <AbsoluteFill>
      <KineticPhrase
        abs={abs}
        size={84}
        weight={500}
        align="center"
        lines={[[153, 154, 155, 156]]}
        words={{
          153: { color: "rgba(244,239,230,0.52)" },
          155: serifEmber(132, { fx: "pop" }),
          156: { fx: "pop", style: { transform: "rotate(-7deg)" } },
        }}
        exitAt={end - 22}
        exit="blur"
        style={{ position: "absolute", left: 0, right: 0, top: 330 }}
      />
      <div style={{ position: "absolute", left: 960 - 56, top: 186, opacity: 1 - prog(abs, end - 22, 12) }}>
        <DrawPath d={ICON.circle} p={prog(abs, checkAt - 4, 22, ease.inOut)} size={112} stroke={C.ember} width={2.2} />
        <DrawPath d={ICON.check} p={prog(abs, checkAt + 8, 14, ease.enter)} size={112} stroke={C.ember} width={3} style={{ position: "absolute", left: 0, top: 0 }} />
      </div>

      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${mix(1, 1.6, condense)})`,
          transformOrigin: `${waveCx}px ${OUT_WAVE.y}px`,
          opacity: 1 - prog(abs, end - 8, 8),
        }}
      >
        <VoiceLine
          id="perfect"
          abs={abs}
          mode="static"
          t0={0}
          t1={VOICE_DURATION}
          x={OUT_WAVE.x}
          y={OUT_WAVE.y}
          width={OUT_WAVE.w}
          amp={OUT_WAVE.amp}
          variant="bars"
          barW={4}
          points={180}
          reveal={1}
          playheadSec={abs / 60}
          head={condense < 0.2}
        />
      </AbsoluteFill>

      {/* the mark the waveform becomes */}
      <div
        style={{
          position: "absolute",
          left: markCx - LOCKUP.markSize / 2,
          top: LOCKUP.center.y - LOCKUP.markSize / 2,
          opacity: prog(abs, end - 10, 10),
        }}
      >
        <LogoMark size={LOCKUP.markSize} spread={1} formation={0} />
      </div>
    </AbsoluteFill>
  );
};
