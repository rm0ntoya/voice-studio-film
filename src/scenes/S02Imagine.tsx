import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Card, Dot, DrawPath, ICON, Label, Portrait } from "../components/ui";
import { sceneStart } from "../data/timeline";
import { wf } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, mix, prog, spr } from "../motion/time";
import { MONO, SANS } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { minor, serifEmber, useAbs, type SceneProps } from "./shared";

const CARD_W = 560;
const CARD_H = 330;
const STACK_X = 1410;
const STACK_Y = 560;

/** collapse into the centered dot that S3 picks up */
const collapseStart = () => sceneStart("reveal") - 22;

const StackCard: React.FC<{
  abs: number;
  enter: number;
  depth: number;
  depthAt: number[];
  children: React.ReactNode;
}> = ({ abs, enter, depthAt, children }) => {
  if (abs < enter - 1) return null;
  const s = spr(abs, enter, SPR.pop);
  // depth increases each time a newer card arrives — eased with its own spring (follow-through)
  const d = depthAt.reduce((acc, f, k) => acc + spr(abs, f + 3 + k * 2, SPR.settle), 0);
  const c = prog(abs, collapseStart(), 18, ease.snap);
  const x = mix(STACK_X, 960, c);
  const y = mix(STACK_Y + (1 - s) * 340 - d * 64, 540, c);
  const sc = mix((0.86 + 0.14 * s) * Math.pow(0.93, d), 0.02, c);
  const rot = (1 - s) * 7 - d * 1.2;
  return (
    <Card
      style={{
        left: x - CARD_W / 2,
        top: y - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        transform: `scale(${sc}) rotate(${rot}deg)`,
        filter: `brightness(${1 - 0.32 * Math.min(2, d)})`,
        opacity: clamp01(s * 2.5) * (1 - prog(abs, collapseStart() + 12, 6)),
      }}
    >
      {children}
    </Card>
  );
};

const ItemRule: React.FC<{ abs: number; at: number; top: number; index: string }> = ({ abs, at, top, index }) => {
  const p = prog(abs, at, 30, ease.inOut);
  const e = prog(abs, collapseStart() - 4, 14, ease.exit);
  return (
    <>
      <div style={{ position: "absolute", left: 120, top, width: 780 * p * (1 - e), height: 1, background: C.line }} />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: top + 26,
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: "0.14em",
          color: C.ember,
          opacity: prog(abs, at, 12) * (1 - e),
        }}
      >
        {index}
      </div>
    </>
  );
};

/** S2 — "Imagina ter um atendente que…" : three promises, three stacked proof cards. */
export const S02Imagine: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const exitAt = collapseStart() - 6;
  const t1 = wf(22);
  const t2 = wf(25);
  const t3 = wf(29);

  // clock on card 1 keeps ticking — the attendant never sleeps
  const secs = 47 * 60 + 12 + Math.floor((abs - t1) / 60) * 1;
  const clock = `03:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}`;
  const sec = String(secs % 60).padStart(2, "0");
  const dotP = spr(abs, collapseStart() + 8, SPR.snappy);

  return (
    <AbsoluteFill>
      <KineticPhrase
        abs={abs}
        size={150}
        lines={[[18]]}
        words={{ 18: serifEmber(170, { fx: "pop" }) }}
        exitAt={exitAt}
        style={{ position: "absolute", left: 112, top: 116 }}
      />
      <KineticPhrase
        abs={abs}
        size={72}
        weight={500}
        lines={[[19, 20, 21]]}
        words={{ ...minor(19, 20) }}
        exitAt={exitAt + 1}
        style={{ position: "absolute", left: 120, top: 318 }}
      />

      <ItemRule abs={abs} at={t1 - 4} top={452} index="01" />
      <KineticPhrase
        abs={abs}
        size={50}
        weight={400}
        lines={[[22, 23, 24]]}
        words={{ 22: { color: "rgba(244,239,230,0.52)" }, 24: { weight: 600 } }}
        exitAt={exitAt + 2}
        style={{ position: "absolute", left: 200, top: 466 }}
      />
      <ItemRule abs={abs} at={t2 - 4} top={560} index="02" />
      <KineticPhrase
        abs={abs}
        size={50}
        weight={400}
        lines={[[25, 26, 27, 28]]}
        words={{ ...minor(27), 28: { weight: 600 } }}
        exitAt={exitAt + 3}
        style={{ position: "absolute", left: 200, top: 574 }}
      />
      <ItemRule abs={abs} at={t3 - 4} top={668} index="03" />
      <KineticPhrase
        abs={abs}
        size={50}
        weight={400}
        lineHeight={1.12}
        lines={[
          [29, 30, 31],
          [32, 33, 34, 35],
        ]}
        words={{ ...minor(29, 32, 33), 35: { weight: 600 } }}
        exitAt={exitAt + 4}
        style={{ position: "absolute", left: 200, top: 682 }}
      />

      {/* proof cards, newest in front */}
      <StackCard abs={abs} enter={t1} depth={0} depthAt={[t2, t3]}>
        <div style={{ position: "absolute", left: 40, top: 36, display: "flex", alignItems: "center", gap: 12 }}>
          <Dot color={C.leaf} glow />
          <Label color={C.leaf}>Atendimento ativo</Label>
        </div>
        <DrawPath d={ICON.moon} p={prog(abs, t1 + 4, 34, ease.inOut)} size={64} stroke={C.iris} width={2.6} style={{ position: "absolute", right: 40, top: 26 }} />
        <div style={{ position: "absolute", left: 36, top: 104, fontFamily: MONO, fontSize: 120, color: C.bone, letterSpacing: "-0.04em", lineHeight: 1 }}>
          {clock}
          <span style={{ fontSize: 46, color: C.muted, letterSpacing: "0" }}>:{sec}</span>
        </div>
        <Label style={{ position: "absolute", left: 40, bottom: 34 }}>Madrugada · loja fechada</Label>
      </StackCard>

      <StackCard abs={abs} enter={t2} depth={0} depthAt={[t3]}>
        <div style={{ position: "absolute", left: 40, top: 36 }}>
          <Label>Pedido #2481</Label>
        </div>
        <div style={{ position: "absolute", left: 40, top: 86, fontFamily: SANS, fontSize: 36, fontWeight: 600, color: C.bone, letterSpacing: "-0.02em" }}>
          Venda confirmada
        </div>
        <div style={{ position: "absolute", left: 38, top: 150, fontFamily: SANS, fontSize: 96, fontWeight: 600, color: C.bone, letterSpacing: "-0.05em" }}>
          <span style={{ fontSize: 44, color: C.muted, marginRight: 10, letterSpacing: 0 }}>R$</span>189,90
        </div>
        <div style={{ position: "absolute", right: 36, top: 30, width: 84, height: 84, borderRadius: 99, background: `${C.leaf}1F` }}>
          <DrawPath d={ICON.check} p={prog(abs, wf(28), 18, ease.enter)} size={84} stroke={C.leaf} width={3.4} />
        </div>
      </StackCard>

      <StackCard abs={abs} enter={t3} depth={0} depthAt={[]}>
        <div style={{ position: "absolute", left: 40, top: 34, display: "flex" }}>
          {[C.ember, C.iris, C.leaf].map((t, k) => (
            <div key={t} style={{ marginLeft: k ? -14 : 0, borderRadius: 99, border: `3px solid ${C.ink2}`, transform: `scale(${spr(abs, t3 + 4 + k * 4, SPR.pop)})` }}>
              <Portrait tint={t} size={64} initial={`s2${k}`} />
            </div>
          ))}
        </div>
        <Label style={{ position: "absolute", left: 220, top: 58 }}>Sua equipe</Label>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 132,
            right: 40,
            padding: "22px 26px",
            borderRadius: 24,
            borderBottomLeftRadius: 8,
            background: C.ink3,
            fontFamily: SANS,
            fontSize: 30,
            lineHeight: 1.3,
            color: C.bone,
            letterSpacing: "-0.01em",
            opacity: prog(abs, wf(31), 12),
            transform: `translateY(${(1 - prog(abs, wf(31), 18)) * 20}px)`,
          }}
        >
          Oi! Aqui é a Ana, da loja.
          <br />
          <span style={{ color: C.muted }}>Posso te ajudar com o pedido?</span>
        </div>
      </StackCard>

      {/* the dot S3 inherits */}
      <div
        style={{
          position: "absolute",
          left: 960 - 10.3,
          top: 540 - 10.3,
          width: 20.6,
          height: 20.6,
          borderRadius: 99,
          background: C.ember,
          transform: `scale(${interpolate(dotP, [0, 1], [0, 1])})`,
        }}
      />
    </AbsoluteFill>
  );
};
