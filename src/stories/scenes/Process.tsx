import React from "react";
import { AbsoluteFill } from "remotion";
import { ease } from "../../motion/easing";
import { SPR } from "../../motion/springs";
import { clamp01, prog, spr } from "../../motion/time";
import { MONO, SANS } from "../../theme/fonts";
import { C } from "../../theme/tokens";
import { LogoMark, Wordmark } from "../../components/Logo";
import { DrawPath, ICON } from "../../components/ui";
import { KineticPhrase } from "../../typography/KineticPhrase";
import { voiceHi, VOICE_DURATION } from "../data/envelope";
import { wf, we } from "../data/words";
import { Burst, Cam, SceneBg, Shockwave, useAbs, type StoryProps } from "../kit";
import { INNER_W, PAL, SAFE, SH, SW } from "../theme";

const INK60 = "rgba(12,11,14,0.55)";

/** frames where the camera pans down to the next panel (just before each phrase) */
export const PAN_AT = [wf(82) - 10, wf(88) - 10, wf(92) - 10];
const PAN_DUR = 14;

/* ------------------------------------------------------------------ S11 process
 * "Eu não gravei nada. Pedi para uma IA escrever, joguei no Voice Studio,
 *  mandei gerar com a minha voz" — a light world; the camera drops panel to panel. */
export const ProcessScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const pans = PAN_AT.map((f) => prog(abs, f, PAN_DUR, ease.snap));
  const camY = pans.reduce((a, b) => a + b, 0) * SH;
  const moving = PAN_AT.reduce((a, f) => a + Math.sin(prog(abs, f, PAN_DUR, (t) => t) * Math.PI), 0);
  return (
    <AbsoluteFill style={{ background: PAL.bone }}>
      <SceneBg
        abs={abs}
        base={PAL.bone}
        blobs={[
          { color: "#FFD9C7", x: 0.1, y: 0.2, r: 0.8, a: 0.9 },
          { color: "#E3DCFF", x: 0.95, y: 0.85, r: 0.7, a: 0.7 },
        ]}
        seed="proc"
      />
      <Cam abs={abs} zoom={[[start, 1.04], [start + 60, 1.0]]} handheld={0.8}>
        <AbsoluteFill style={{ transform: `translateY(${-camY}px)`, filter: moving > 0.05 ? `blur(${moving * 10}px)` : undefined }}>
          {/* moving grid so the pan reads as travel */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: SW,
              height: SH * 4,
              opacity: 0.08,
              backgroundImage: `linear-gradient(${PAL.ink} 1.5px, transparent 1.5px), linear-gradient(90deg, ${PAL.ink} 1.5px, transparent 1.5px)`,
              backgroundSize: "90px 90px",
            }}
          />
          <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH }}>
            <NoMic abs={abs} />
          </div>
          <div style={{ position: "absolute", left: 0, top: SH, width: SW, height: SH }}>
            <Prompt abs={abs} />
          </div>
          <div style={{ position: "absolute", left: 0, top: SH * 2, width: SW, height: SH }}>
            <Throw abs={abs} />
          </div>
          <div style={{ position: "absolute", left: 0, top: SH * 3, width: SW, height: SH }}>
            <Generate abs={abs} />
          </div>
        </AbsoluteFill>
      </Cam>
    </AbsoluteFill>
  );
};

const NoMic: React.FC<{ abs: number }> = ({ abs }) => {
  const mic = prog(abs, wf(78), 26, ease.inOut);
  const strike = prog(abs, wf(81), 12, ease.snap);
  const shake = abs > wf(81) && abs < wf(81) + 12 ? Math.sin(abs * 3) * 8 : 0;
  return (
    <>
      <div style={{ position: "absolute", left: SW / 2 - 190, top: 400, transform: `translateX(${shake}px)` }}>
        <DrawPath d={ICON.mic} p={mic} size={380} stroke={PAL.ink} width={2.4} />
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <DrawPath d={ICON.strike} p={strike} size={380} stroke={PAL.ember} width={3.6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: SAFE.x, top: 900, width: INNER_W }}>
        <KineticPhrase
          abs={abs}
          align="center"
          size={120}
          weight={700}
          color={PAL.ink}
          lines={[[78, 79, 80], [81]]}
          words={{ 78: { color: INK60 }, 81: { font: "serif", size: 280, color: PAL.ember, fx: "pop" } }}
        />
      </div>
    </>
  );
};

const PROMPT = "Escreva um texto de 40 segundos apresentando o Voice Studio pro dono da loja.";
const Prompt: React.FC<{ abs: number }> = ({ abs }) => {
  const card = spr(abs, PAN_AT[0] + 6, SPR.settle);
  const typed = Math.floor(PROMPT.length * prog(abs, wf(83), we(87) - wf(83), (t) => t));
  const sent = spr(abs, we(87), SPR.pop);
  return (
    <>
      <div style={{ position: "absolute", left: SAFE.x, top: 300, width: INNER_W }}>
        <KineticPhrase
          abs={abs}
          align="center"
          size={80}
          weight={600}
          color={PAL.ink}
          lines={[[82, 83, 84], [85, 86], [87]]}
          words={{
            82: { size: 110, weight: 700 },
            83: { color: INK60 },
            84: { color: INK60 },
            85: { font: "serif", size: 104, color: PAL.ember },
            86: { font: "serif", size: 104, color: PAL.ember },
            87: { size: 150, weight: 800, fx: "slam" },
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: SAFE.x,
          top: 1000,
          width: INNER_W,
          minHeight: 380,
          borderRadius: 44,
          background: PAL.ink,
          padding: "40px 44px",
          boxSizing: "border-box",
          transform: `translateY(${(1 - card) * 200}px)`,
          opacity: card,
          boxShadow: "0 40px 80px rgba(60,30,10,0.25)",
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.16em", color: PAL.iris }}>PROMPT · IA</div>
        <div style={{ fontFamily: SANS, fontSize: 44, lineHeight: 1.3, color: C.bone, marginTop: 16, fontWeight: 500 }}>
          {PROMPT.slice(0, typed)}
          <span style={{ display: "inline-block", width: 4, height: 46, background: PAL.ember, marginLeft: 4, verticalAlign: "middle", opacity: Math.floor(abs / 15) % 2 ? 1 : 0.2 }} />
        </div>
        <div
          style={{
            position: "absolute",
            right: 30,
            bottom: -40,
            width: 90,
            height: 90,
            borderRadius: 99,
            background: PAL.ember,
            transform: `scale(${0.7 + 0.3 * sent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PAL.ink,
            fontSize: 48,
            fontWeight: 800,
            fontFamily: SANS,
          }}
        >
          ↑
        </div>
      </div>
    </>
  );
};

const Throw: React.FC<{ abs: number }> = ({ abs }) => {
  const joguei = wf(88);
  const fly = prog(abs, joguei, 22, ease.inOut);
  const land = abs >= joguei + 22;
  const appIn = spr(abs, PAN_AT[1] + 4, SPR.settle);
  // arc from top-left into the app's drop zone
  const x = 80 + (380 - 80) * fly;
  const y = 700 + (1170 - 700) * fly - Math.sin(fly * Math.PI) * 260;
  const r = -24 + 24 * fly + Math.sin(fly * Math.PI) * 40;
  return (
    <>
      <div style={{ position: "absolute", left: SAFE.x, top: 300, width: INNER_W }}>
        <KineticPhrase
          abs={abs}
          align="center"
          size={110}
          weight={700}
          color={PAL.ink}
          lines={[[88, 89], [90, 91]]}
          words={{
            88: { fx: "pop" },
            89: { color: INK60 },
            90: { size: 140, weight: 700 },
            91: { font: "serif", size: 150, color: PAL.ember },
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: SAFE.x,
          top: 960,
          width: INNER_W,
          height: 560,
          borderRadius: 48,
          background: "#FFFFFF",
          border: `3px solid ${land ? PAL.ember : "rgba(12,11,14,0.12)"}`,
          boxShadow: "0 40px 90px rgba(60,30,10,0.18)",
          transform: `scale(${0.9 + 0.1 * appIn})`,
          opacity: appIn,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "30px 36px", borderBottom: "2px solid rgba(12,11,14,0.08)" }}>
          <LogoMark size={54} />
          <Wordmark size={44} color={PAL.ink} />
        </div>
        <div
          style={{
            margin: 36,
            height: 320,
            borderRadius: 30,
            border: `4px dashed ${land ? PAL.ember : "rgba(12,11,14,0.2)"}`,
            background: land ? "rgba(255,90,54,0.08)" : "transparent",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 30,
            boxSizing: "border-box",
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: "0.14em",
            color: land ? PAL.ember : INK60,
          }}
        >
          {land ? "TEXTO RECEBIDO ✓" : "SOLTE O TEXTO AQUI"}
        </div>
      </div>
      {abs >= joguei - 2 ? (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 330,
            height: 200,
            borderRadius: 24,
            background: PAL.ink,
            padding: 26,
            boxSizing: "border-box",
            transform: `rotate(${r}deg) scale(${land ? 0.9 : 1})`,
            boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
          }}
        >
          {[0.9, 0.75, 0.85, 0.5].map((w, k) => (
            <div key={k} style={{ height: 14, width: `${w * 100}%`, borderRadius: 8, background: k === 0 ? PAL.ember : "rgba(244,239,230,0.35)", marginBottom: 16 }} />
          ))}
        </div>
      ) : null}
      <Shockwave abs={abs} at={joguei + 22} x={SW / 2} y={1260} color={PAL.ember} count={2} maxR={500} dur={30} />
    </>
  );
};

const Generate: React.FC<{ abs: number }> = ({ abs }) => {
  const gerar = wf(93);
  const press = abs >= gerar && abs < gerar + 8 ? 0.88 : 1;
  const btn = spr(abs, PAN_AT[2] + 4, SPR.pop);
  const grow = prog(abs, gerar + 6, 50, ease.enter);
  const bars = 56;
  return (
    <>
      <div style={{ position: "absolute", left: SAFE.x, top: 300, width: INNER_W }}>
        <KineticPhrase
          abs={abs}
          align="center"
          size={96}
          weight={600}
          color={PAL.ink}
          lines={[[92, 93], [94, 95, 96, 97]]}
          words={{
            92: { size: 130, weight: 700 },
            93: { font: "serif", size: 150, color: PAL.ember, fx: "pop" },
            94: { color: INK60 },
            95: { color: INK60 },
            97: { font: "serif", size: 130, color: PAL.ember, fx: "pop" },
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: SW / 2 - 230,
          top: 830,
          width: 460,
          height: 150,
          borderRadius: 999,
          background: PAL.ember,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 64,
          color: PAL.ink,
          transform: `scale(${btn * press})`,
          boxShadow: `0 30px 60px rgba(201,56,28,0.35), 0 0 0 ${abs >= gerar ? 18 * (1 - prog(abs, gerar, 20)) : 0}px rgba(255,90,54,0.3)`,
        }}
      >
        <LogoMark size={64} color={PAL.ink} /> Gerar
      </div>
      {/* pointer */}
      <div
        style={{
          position: "absolute",
          left: SW / 2 + 90 + (1 - prog(abs, gerar - 16, 14, ease.inOut)) * 260,
          top: 930 + (1 - prog(abs, gerar - 16, 14, ease.inOut)) * 300,
          width: 0,
          height: 0,
          borderLeft: "34px solid transparent",
          borderRight: "34px solid transparent",
          borderBottom: `70px solid ${PAL.ink}`,
          transform: `rotate(-28deg) scale(${press})`,
          opacity: btn,
        }}
      />
      <div style={{ position: "absolute", left: SAFE.x, top: 1150, width: INNER_W, height: 300, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {Array.from({ length: bars }, (_, k) => {
          const t0 = (k / bars) * VOICE_DURATION;
          const v = voiceHi(t0 + VOICE_DURATION / bars / 2) * (0.55 + 0.45 * Math.abs(Math.sin(k * 2.3)));
          const local = clamp01(grow * 1.6 - Math.abs(k - bars / 2) / bars);
          return <div key={k} style={{ width: 10, height: 8 + v * 260 * local, borderRadius: 9, background: k % 6 === 0 ? PAL.ink : PAL.ember }} />;
        })}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ S12 perfect
 * "e ficou perfeito." — sunrise palette, check pops, sparkles. */
export const PerfectScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const ficou = wf(99);
  const perfeito = wf(100);
  const ring = spr(abs, ficou, SPR.pop);
  const check = prog(abs, ficou + 6, 16, ease.enter);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base="#FF6A3D"
        blobs={[
          { color: PAL.sun, x: 0.5, y: 0.3, r: 0.9, a: 0.9 },
          { color: PAL.emberDeep, x: 0.5, y: 1.05, r: 0.9, a: 0.7 },
        ]}
        pattern="rays"
        patternColor={C.bone}
        patternOpacity={0.14}
        seed="perf"
      />
      <Cam abs={abs} zoom={[[start, 1.12], [perfeito, 1.0], [perfeito + 4, 1.05], [start + 100, 1.02]]} rot={[[start, -3], [start + 100, 1]]}>
        <div
          style={{
            position: "absolute",
            left: SW / 2 - 170,
            top: 470,
            width: 340,
            height: 340,
            borderRadius: 999,
            background: C.bone,
            transform: `scale(${ring})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 40px 80px rgba(150,40,0,0.35)",
          }}
        >
          <DrawPath d={ICON.check} p={check} size={230} stroke={PAL.ember} width={5} />
        </div>
        <Shockwave abs={abs} at={perfeito} x={SW / 2} y={640} color={C.bone} count={3} maxR={900} />
        <Burst abs={abs} at={perfeito} x={SW / 2} y={640} colors={[C.bone, PAL.sun, PAL.ink]} count={30} dist={800} seed="pf" />
        <div style={{ position: "absolute", left: SAFE.x, top: 940, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={110}
            weight={700}
            color={PAL.ink}
            lines={[[98, 99], [100]]}
            words={{ 98: { color: "rgba(12,11,14,0.6)" }, 100: { font: "serif", size: 270, color: C.bone, fx: "pop" } }}
          />
        </div>
      </Cam>
    </AbsoluteFill>
  );
};
