import React from "react";
import { AbsoluteFill } from "remotion";
import { ease } from "../../motion/easing";
import { SPR } from "../../motion/springs";
import { clamp01, prog, spr } from "../../motion/time";
import { MONO, SANS, SERIF } from "../../theme/fonts";
import { C, FPS } from "../../theme/tokens";
import { KineticPhrase } from "../../typography/KineticPhrase";
import { voiceMax } from "../data/envelope";
import { CEM } from "../data/timeline";
import { wf, we } from "../data/words";
import { Burst, Cam, Flash, Marquee, SceneBg, Shockwave, useAbs, type StoryProps } from "../kit";
import { INNER_W, PAL, SAFE, SW } from "../theme";

/* ------------------------------------------------------------------ S9 proof
 * "E esse áudio que você está escutando agora?" — the film shows its own waveform,
 * live, with the real timecode; the world drains to black and the camera pushes in. */
export const PLAYHEAD = { x: 700, y: 1190 };
const BAR_STEP = 15;
const PX_PER_SEC = 240;

const timecode = (frame: number) => {
  const s = frame / FPS;
  const mm = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  const cs = Math.floor((s * 100) % 100);
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

export const ProofScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const now = abs / FPS;
  const agoraEnd = we(73);
  const beat = (at: number) => 0.035 * Math.max(0, 1 - Math.abs(abs - at) / 6);
  const pulse = 1 + beat(agoraEnd + 2) + beat(agoraEnd + 18);
  const reveal = prog(abs, wf(66), 24, ease.enter);
  return (
    <AbsoluteFill>
      <SceneBg abs={abs} base="#050507" blobs={[{ color: PAL.emberDeep, x: 0.65, y: 0.62, r: 0.6, a: 0.35 }]} seed="proof" />
      <Cam abs={abs} zoom={[[start + 16, 1.0], [CEM, 1.28]]} origin={`${PLAYHEAD.x}px ${PLAYHEAD.y}px`} handheld={0.6}>
        <AbsoluteFill style={{ transform: `scale(${pulse})`, transformOrigin: `${PLAYHEAD.x}px ${PLAYHEAD.y}px` }}>
          <div style={{ position: "absolute", left: PLAYHEAD.x - 300, width: 600, top: 980, textAlign: "center", fontFamily: MONO, fontSize: 64, color: C.bone, opacity: reveal, letterSpacing: "0.02em" }}>
            {timecode(abs)}
          </div>
          <div style={{ position: "absolute", left: SAFE.x, top: 1420, fontFamily: MONO, fontSize: 24, letterSpacing: "0.2em", color: PAL.ember, opacity: reveal }}>
            ● ESTE ÁUDIO · AO VIVO
          </div>

          {/* waveform window: past in ember, future already known (dim) */}
          <div style={{ position: "absolute", left: 0, top: PLAYHEAD.y - 190, width: SW, height: 380, opacity: reveal }}>
            {Array.from({ length: Math.ceil(SW / BAR_STEP) }, (_, k) => {
              const x = k * BAR_STEP + 4;
              const t = now + (x - PLAYHEAD.x) / PX_PER_SEC;
              const dt = BAR_STEP / PX_PER_SEC / 2;
              const v = t < 0 ? 0 : voiceMax(t - dt, t + dt);
              const h = 6 + v * 330;
              const past = x <= PLAYHEAD.x;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 190 - h / 2,
                    width: 8,
                    height: h,
                    borderRadius: 8,
                    background: past ? PAL.ember : "rgba(244,239,230,0.22)",
                  }}
                />
              );
            })}
          </div>
          <div style={{ position: "absolute", left: PLAYHEAD.x - 2, top: PLAYHEAD.y - 230, width: 4, height: 460, background: C.bone, opacity: reveal }} />
          <div style={{ position: "absolute", left: PLAYHEAD.x - 14, top: PLAYHEAD.y - 244, width: 28, height: 28, borderRadius: 99, background: C.bone, opacity: reveal }} />
        </AbsoluteFill>
      </Cam>
      <div style={{ position: "absolute", left: SAFE.x, top: 290, width: INNER_W, transform: `scale(${1 + 0.04 * prog(abs, wf(66), 130, ease.inOut)}) translateY(${-20 * prog(abs, wf(66), 130, ease.inOut)}px)`, transformOrigin: "0% 0%" }}>
            <KineticPhrase
              abs={abs}
              align="left"
              size={72}
              weight={600}
              lines={[[66, 67, 68], [69, 70, 71], [72], [73]]}
              words={{
                66: { size: 120, color: "rgba(244,239,230,0.6)" },
                67: { size: 120 },
                68: { size: 120, font: "serif", color: PAL.ember, fx: "pop" },
                69: { color: "rgba(244,239,230,0.6)" },
                72: { size: 110, weight: 700 },
                73: { size: 190, font: "serif", color: C.bone, fx: "pop", text: "agora?" },
              }}
            />
          </div>

      {/* tightening vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${90 - 30 * prog(abs, wf(72), 80, ease.inOut)}% ${70 - 20 * prog(abs, wf(72), 80, ease.inOut)}% at ${(PLAYHEAD.x / SW) * 100}% 62%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S10 climax
 * "É 100% inteligência artificial." — ember flood, counter slams to 100, the world shakes. */
export const ClimaxScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const count = Math.round(100 * prog(abs, CEM, we(75) - CEM, ease.enter));
  const slam = spr(abs, CEM, SPR.heavy);
  const settle = spr(abs, we(75), SPR.pop);
  const scale = (1.6 - 0.6 * slam) * (1 + 0.06 * (1 - settle) * (abs >= we(75) ? 1 : 0));
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={PAL.ember}
        blobs={[
          { color: PAL.sun, x: 0.5, y: 0.38, r: 0.85, a: 0.75 },
          { color: PAL.emberDeep, x: 0.5, y: 1.0, r: 0.9, a: 0.6 },
        ]}
        pattern="rays"
        patternColor={PAL.ink}
        patternOpacity={0.1}
        seed="climax"
      />
      <Marquee abs={abs} text="100% IA" y={250} size={120} speed={6} color={PAL.ink} font={SANS} weight={800} opacity={0.1} rotate={-8} />
      <Marquee abs={abs} text="VOZ GERADA POR IA" y={1560} size={90} speed={-5} color={PAL.ink} font={SANS} weight={800} opacity={0.1} rotate={-8} />
      <Cam abs={abs} zoom={[[CEM, 1.0], [start + 130, 1.06]]} handheld={2}>
        <Shockwave abs={abs} at={CEM} x={SW / 2} y={760} color={PAL.ink} count={4} maxR={1200} dur={50} width={12} />
        <Burst abs={abs} at={CEM} x={SW / 2} y={760} colors={[PAL.ink, C.bone, PAL.sun]} count={40} dist={900} size={26} seed="cl" shape="bar" />
        <div
          style={{
            position: "absolute",
            left: 0,
            width: SW,
            top: 560,
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 330,
            lineHeight: 1,
            color: PAL.ink,
            letterSpacing: "-0.06em",
            transform: `scale(${abs >= CEM ? scale : 0})`,
            opacity: clamp01((abs - CEM + 1) / 3),
            filter: slam < 0.6 ? `blur(${(1 - slam) * 6}px)` : undefined,
          }}
        >
          {count}
          <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 300, letterSpacing: 0 }}>%</span>
        </div>
        <div style={{ position: "absolute", left: SAFE.x, top: 1000, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={150}
            weight={800}
            color={PAL.ink}
            lines={[[76], [77]]}
            words={{
              76: { font: "serif", size: 170, color: PAL.ink, fx: "pop" },
              77: { fx: "slam" },
            }}
          />
        </div>
      </Cam>
      <Flash abs={abs} at={CEM} color={C.bone} dur={12} peak={0.9} />
    </AbsoluteFill>
  );
};
