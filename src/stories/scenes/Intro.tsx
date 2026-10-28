import React from "react";
import { AbsoluteFill } from "remotion";
import { ease } from "../../motion/easing";
import { SPR } from "../../motion/springs";
import { clamp01, prog, spr } from "../../motion/time";
import { MONO, SANS, SERIF } from "../../theme/fonts";
import { C } from "../../theme/tokens";
import { DrawPath, ICON, Portrait } from "../../components/ui";
import { KineticPhrase } from "../../typography/KineticPhrase";
import { voiceAt } from "../data/envelope";
import { wf } from "../data/words";
import { Burst, Cam, SceneBg, Shockwave, useAbs, type StoryProps } from "../kit";
import { INNER_W, PAL, SAFE, ST, SW } from "../theme";

const dim = (color: string, ...ids: number[]) => Object.fromEntries(ids.map((i) => [i, { color }]));

/* ------------------------------------------------------------------ S1 hook
 * "Olha o que a sua loja já consegue fazer."  — stacked kinetic type, slow push-in. */
export const HookScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const fazer = wf(8);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={PAL.ink}
        blobs={[
          { color: PAL.ember, x: 0.15, y: 0.25, r: 0.75, a: 0.55 },
          { color: PAL.irisDeep, x: 0.9, y: 0.8, r: 0.8, a: 0.7 },
        ]}
        pattern="dots"
        patternColor={C.bone}
        patternOpacity={0.08}
        seed="hook"
      />
      <Cam abs={abs} zoom={[[0, 1.06], [fazer, 1.0], [fazer + 6, 1.05], [fazer + 40, 1.02]]} rot={[[0, -1.5], [140, 1]]}>
        <Shockwave abs={abs} at={wf(0)} x={SW / 2} y={560} color={PAL.ember} count={2} maxR={700} />
        <Burst abs={abs} at={fazer + 2} x={SW / 2} y={1260} colors={[PAL.ember, C.bone, PAL.iris]} count={20} seed="hk" shape="bar" />
        <div style={{ position: "absolute", left: SAFE.x, top: 420, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={ST.big}
            weight={600}
            lineHeight={1.0}
            lines={[[0], [1, 2, 3, 4], [5], [6, 7], [8]]}
            words={{
              0: { size: 230, weight: 800, fx: "slam", color: PAL.ember },
              1: { size: ST.mid, color: "rgba(244,239,230,0.6)" },
              2: { size: ST.mid, color: "rgba(244,239,230,0.6)" },
              3: { size: ST.mid, color: "rgba(244,239,230,0.6)" },
              4: { size: ST.mid },
              5: { font: "serif", size: 250, color: PAL.ember, fx: "pop" },
              6: { size: ST.big },
              7: { size: ST.big },
              8: { size: 190, weight: 800, fx: "slam" },
            }}
          />
        </div>
      </Cam>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S2 night
 * "Um atendente que nunca dorme," — night palette, moon draws, 03:47 clock ticks. */
export const NightScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const dorme = wf(13);
  const moonP = prog(abs, wf(9), 40, ease.inOut);
  const card = spr(abs, wf(10) + 4, SPR.pop);
  const flip = prog(abs, dorme, 10, ease.snap);
  const reply = spr(abs, dorme + 8, SPR.pop);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={PAL.night}
        blobs={[
          { color: PAL.nightGlow, x: 0.8, y: 0.2, r: 0.7, a: 0.9 },
          { color: PAL.irisDeep, x: 0.1, y: 0.85, r: 0.8, a: 0.8 },
        ]}
        pattern="stars"
        patternColor={C.bone}
        patternOpacity={0.8}
        seed="night"
      />
      <Cam abs={abs} zoom={[[start, 1.08], [start + 110, 1.0]]} y={[[start, 30], [start + 110, -10]]}>
        <div style={{ position: "absolute", right: 110, top: 300, opacity: 0.95 }}>
          <DrawPath d={ICON.moon} p={moonP} size={230} stroke={PAL.iris} width={2.2} fill={moonP > 0.95 ? "rgba(183,166,255,0.18)" : "none"} />
        </div>
        <div style={{ position: "absolute", left: SAFE.x, top: 520, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="left"
            size={ST.big}
            weight={600}
            lines={[[9, 10], [11, 12], [13]]}
            words={{
              9: { size: ST.title, color: "rgba(244,239,230,0.6)" },
              10: { size: ST.title, color: "rgba(244,239,230,0.6)" },
              11: { color: "rgba(244,239,230,0.6)" },
              13: { font: "serif", size: 270, color: PAL.iris, fx: "pop" },
            }}
          />
        </div>
        {/* clock card */}
        <div
          style={{
            position: "absolute",
            left: SAFE.x,
            top: 1120,
            width: INNER_W,
            height: 330,
            borderRadius: 40,
            background: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(183,166,255,0.35)",
            backdropFilter: "blur(8px)",
            transform: `translateY(${(1 - card) * 160}px) scale(${0.9 + 0.1 * card})`,
            opacity: clamp01(card * 2),
            padding: "36px 48px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: "0.16em", color: PAL.iris }}>LOJA FECHADA · ATENDENTE ON</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 14, fontFamily: SANS, fontWeight: 700, fontSize: 170, color: C.bone, letterSpacing: "-0.04em", lineHeight: 1 }}>
            <span>03:4</span>
            <span style={{ display: "inline-block", overflow: "hidden", height: "1em", lineHeight: 1 }}>
              <span style={{ display: "block", transform: `translateY(${-flip * 50}%)` }}>
                <span style={{ display: "block", height: "1em" }}>7</span>
                <span style={{ display: "block", height: "1em", color: PAL.iris }}>8</span>
              </span>
            </span>
            <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 64, color: "rgba(244,239,230,0.55)", marginLeft: 28, letterSpacing: 0 }}>da manhã</span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: SAFE.x + 10,
            top: 1478,
            padding: "22px 30px",
            borderRadius: 30,
            borderBottomRightRadius: 8,
            background: PAL.iris,
            color: PAL.night,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 36,
            transform: `scale(${reply}) translateY(${(1 - reply) * 40}px)`,
            transformOrigin: "100% 100%",
            opacity: clamp01(reply * 2),
          }}
        >
          Respondido em 2s ✓
        </div>
      </Cam>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S3 sale
 * "nunca perde uma venda" — green flood, sale card with rolling price, coin burst. */
const PRICE = 289.9;
export const SaleScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const venda = wf(17);
  const card = spr(abs, wf(15), SPR.pop);
  const count = prog(abs, wf(15) + 4, 40, ease.enter);
  const price = (PRICE * count).toFixed(2).replace(".", ",");
  const check = prog(abs, venda + 2, 16, ease.enter);
  const stamp = spr(abs, venda, SPR.pop);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={PAL.leaf}
        blobs={[
          { color: "#B9F5D3", x: 0.2, y: 0.2, r: 0.7, a: 0.9 },
          { color: PAL.leafDeep, x: 0.9, y: 0.9, r: 0.8, a: 0.55 },
        ]}
        pattern="stripes"
        patternColor={PAL.leafDeep}
        patternOpacity={0.12}
        seed="sale"
      />
      <Cam abs={abs} zoom={[[start, 1.1], [venda, 1.0], [venda + 5, 1.06], [venda + 60, 1.03]]} rot={[[start, 2], [venda + 60, -1]]}>
        <div style={{ position: "absolute", left: SAFE.x, top: 430, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={150}
            weight={700}
            color={PAL.ink}
            lines={[[14, 15], [16, 17]]}
            words={{
              16: { size: ST.mid, color: "rgba(12,11,14,0.55)", weight: 600 },
              17: { font: "serif", size: 260, color: PAL.ink, fx: "pop" },
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: SAFE.x + 40,
            top: 1010,
            width: INNER_W - 80,
            borderRadius: 44,
            background: PAL.ink,
            color: C.bone,
            padding: "40px 48px",
            boxSizing: "border-box",
            boxShadow: "0 50px 90px rgba(12,60,36,0.45)",
            transform: `translateY(${(1 - card) * 300}px) rotate(${(1 - card) * -8}deg)`,
            opacity: clamp01(card * 2),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: "0.16em", color: PAL.leaf }}>PEDIDO #4821</div>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 99,
                background: PAL.leaf,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${0.6 + 0.4 * stamp})`,
              }}
            >
              <DrawPath d={ICON.check} p={check} size={56} stroke={PAL.ink} width={5.5} />
            </div>
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: 8 }}>
            R$ {price}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, color: "rgba(244,239,230,0.6)" }}>
            Venda confirmada <span style={{ fontFamily: SERIF, color: PAL.leaf }}>pela IA</span>
          </div>
        </div>
        <Burst abs={abs} at={venda + 2} x={SW / 2} y={1180} colors={[PAL.sun, PAL.ink, C.bone]} count={26} dist={620} seed="sale" />
      </Cam>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S4 team
 * "e fala igual à sua equipe." — ember world, three teammates pop around a live voice bubble. */
const TEAM = [
  { tint: "#FFD2B8", initial: "A", x: 0.22, y: 1180, d: 0 },
  { tint: "#B7A6FF", initial: "B", x: 0.5, y: 1060, d: 6 },
  { tint: "#7BE0A6", initial: "C", x: 0.78, y: 1180, d: 12 },
];
export const TeamScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const equipe = wf(23);
  const fala = wf(19);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={PAL.ember}
        blobs={[
          { color: PAL.sun, x: 0.85, y: 0.15, r: 0.7, a: 0.7 },
          { color: PAL.emberDeep, x: 0.1, y: 0.9, r: 0.9, a: 0.8 },
        ]}
        pattern="rings"
        patternColor={PAL.ink}
        patternOpacity={0.08}
        seed="team"
      />
      <Cam abs={abs} zoom={[[start, 1.12], [start + 100, 1.0]]} rot={[[start, -2], [start + 100, 0.5]]}>
        <div style={{ position: "absolute", left: SAFE.x, top: 420, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={ST.big}
            weight={700}
            color={PAL.ink}
            lines={[[18, 19, 20], [21, 22], [23]]}
            words={{
              ...dim("rgba(12,11,14,0.55)", 18, 21, 22),
              21: { size: ST.mid, color: "rgba(12,11,14,0.55)" },
              22: { size: ST.mid, color: "rgba(12,11,14,0.55)" },
              23: { font: "serif", size: 250, color: C.bone, fx: "pop" },
            }}
          />
        </div>
        {TEAM.map((m, k) => {
          const s = spr(abs, fala + m.d, SPR.pop);
          const bob = Math.sin((abs + k * 20) * 0.07) * 10;
          const lit = abs >= equipe ? 1 : 0;
          return (
            <div
              key={m.initial}
              style={{
                position: "absolute",
                left: m.x * SW - 110,
                top: m.y + bob,
                transform: `scale(${s})`,
                opacity: clamp01(s * 2),
                borderRadius: 999,
                boxShadow: `0 0 0 ${6 + lit * 6}px ${PAL.ink}, 0 30px 60px rgba(80,20,0,0.35)`,
              }}
            >
              <Portrait tint={m.tint} size={220} initial={`st-${m.initial}`} />
            </div>
          );
        })}
        <VoiceBubble abs={abs} at={fala + 14} x={SW / 2} y={1470} />
        <Shockwave abs={abs} at={equipe} x={SW / 2} y={1200} color={PAL.ink} count={2} maxR={600} />
      </Cam>
    </AbsoluteFill>
  );
};

/** Pill with live voice bars (real narration energy). */
const VoiceBubble: React.FC<{ abs: number; at: number; x: number; y: number }> = ({ abs, at, x, y }) => {
  const s = spr(abs, at, SPR.pop);
  const bars = 18;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 260,
        top: y,
        width: 520,
        height: 110,
        borderRadius: 999,
        background: PAL.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transform: `scale(${s})`,
        opacity: clamp01(s * 2),
      }}
    >
      {Array.from({ length: bars }, (_, k) => {
        const e = voiceAt(abs - k * 2);
        const h = 14 + e * 70 * (0.5 + 0.5 * Math.sin(k * 1.7 + abs * 0.3));
        return <div key={k} style={{ width: 9, height: Math.max(10, h), borderRadius: 9, background: k % 4 === 0 ? C.bone : PAL.ember }} />;
      })}
    </div>
  );
};

