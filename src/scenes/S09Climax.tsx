import React from "react";
import { AbsoluteFill } from "remotion";
import { noise2D } from "@remotion/noise";
import { VOICE_DURATION } from "../audio/envelope";
import { Label } from "../components/ui";
import { VoiceLine } from "../components/VoiceLine";
import { anchor } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, prog, spr } from "../motion/time";
import { SANS, SERIF } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { useAbs, type SceneProps } from "./shared";

const WAVE = { x: 160, y: 872, w: 1600 };

/** S9 — "100% gerado por inteligência artificial." The film turns around and shows itself. */
export const S09Climax: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const hit = anchor("cem");
  const since = abs - hit;

  const slam = spr(abs, hit - 1, SPR.heavy);
  const scale = 1.6 - 0.6 * slam;
  const blur = (1 - clamp01(slam)) * 14;
  const shakeAmp = since >= 0 ? 16 * Math.exp(-since / 7) : 0;
  const sx = noise2D("shake-x", abs * 0.45, 0) * shakeAmp;
  const sy = noise2D("shake-y", 0, abs * 0.45) * shakeAmp;
  const flash = since >= 0 ? Math.exp(-since / 3.2) * 0.7 : 0;
  const ring = prog(abs, hit, 46, ease.enter);

  return (
    <AbsoluteFill style={{ background: C.ember }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px circle at 50% 42%, ${C.emberSoft} 0%, ${C.ember} 55%, ${C.emberDeep} 130%)`,
        }}
      />
      {/* shockwave */}
      <div
        style={{
          position: "absolute",
          left: 960 - ring * 1100,
          top: 430 - ring * 1100,
          width: ring * 2200,
          height: ring * 2200,
          borderRadius: 9999,
          border: `3px solid ${C.ink}`,
          opacity: (1 - ring) * 0.35,
        }}
      />

      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 150,
            textAlign: "center",
            color: C.ink,
            lineHeight: 1,
            transform: `scale(${scale})`,
            transformOrigin: "50% 60%",
            filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
            opacity: clamp01((abs - hit + 2) / 2),
          }}
        >
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 360, letterSpacing: "-0.075em" }}>100</span>
          <span style={{ fontFamily: SERIF, fontSize: 380, marginLeft: 6 }}>%</span>
        </div>

        <KineticPhrase
          abs={abs}
          size={78}
          weight={600}
          color={C.ink}
          align="center"
          lines={[[125, 126, 127, 128]]}
          words={{
            126: { weight: 400 },
            127: { font: "serif", size: 92 },
            128: { font: "serif", size: 92 },
          }}
          style={{ position: "absolute", left: 0, right: 0, top: 600 }}
        />

        {/* the whole film's voice — and where we are in it */}
        <Label color={C.ink} style={{ position: "absolute", left: WAVE.x, top: WAVE.y - 82, opacity: prog(abs, hit + 10, 16) }}>
          Narração completa · 100% IA
        </Label>
        <VoiceLine
          id="whole"
          abs={abs}
          mode="static"
          t0={0}
          t1={VOICE_DURATION}
          x={WAVE.x}
          y={WAVE.y}
          width={WAVE.w}
          amp={38}
          variant="bars"
          barW={4}
          points={200}
          reveal={prog(abs, hit + 2, 52, ease.inOut)}
          playheadSec={abs / 60}
          color={C.ink}
          head={abs >= hit + 30}
        />
        <Label color={C.ink} style={{ position: "absolute", left: WAVE.x, top: WAVE.y + 58, opacity: prog(abs, hit + 30, 16) }}>
          00:00
        </Label>
        <Label color={C.ink} style={{ position: "absolute", left: WAVE.x + WAVE.w - 70, top: WAVE.y + 58, opacity: prog(abs, hit + 40, 16) }}>
          00:53
        </Label>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "#FFF6EE", opacity: flash }} />
    </AbsoluteFill>
  );
};
