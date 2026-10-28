import React from "react";
import { AbsoluteFill } from "remotion";
import { Lockup } from "../components/Lockup";
import { LogoMark } from "../components/Logo";
import { Card, Dot, Label, Toggle } from "../components/ui";
import { VoiceLine } from "../components/VoiceLine";
import { wf } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, mix, prog, spr } from "../motion/time";
import { SANS } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { minor, serifEmber, useAbs, type SceneProps } from "./shared";

const PANEL = { x: 1056, y: 196, w: 744, h: 700 };

const Row: React.FC<{ abs: number; at: number; top: number; children: React.ReactNode; rule?: boolean }> = ({
  abs,
  at,
  top,
  children,
  rule = true,
}) => {
  const s = spr(abs, at, SPR.settle);
  const r = prog(abs, at + 2, 26, ease.inOut);
  return (
    <>
      {rule ? (
        <div style={{ position: "absolute", left: 44, top: top - 1, height: 1, width: (PANEL.w - 88) * r, background: C.line }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          top,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: clamp01(s * 1.8),
          transform: `translateY(${(1 - s) * 26}px)`,
        }}
      >
        {children}
      </div>
    </>
  );
};

const FieldName: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: SANS, fontSize: 28, color: C.muted, letterSpacing: "-0.01em" }}>{children}</div>
);

/** S4 — "Com ele, você cria um assistente de IA para o seu comércio" : the assistant assembles itself. */
export const S04Create: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const panelIn = spr(abs, wf(44) - 4, SPR.settle);
  const name = "Lia";
  const typed = name.slice(0, Math.max(0, Math.min(name.length, Math.floor((abs - wf(46) - 6) / 5))));
  const aiOn = prog(abs, wf(49) + 4, 8, ease.inOut);
  const drift = mix(0, -14, prog(abs, start, 240, ease.inOut));

  return (
    <AbsoluteFill>
      <Lockup spread={1} formation={1} pVoice={1} pStudio={1} flip={1} />
      <Label style={{ position: "absolute", right: 120, top: 92, opacity: prog(abs, start + 6, 16) }}>
        Novo assistente
      </Label>

      <KineticPhrase
        abs={abs}
        size={78}
        weight={500}
        lineHeight={1.06}
        lines={[
          [41, 42, 43, 44],
          [45, 46, 47],
          [48, 49],
          [50, 51, 52, 53],
        ]}
        words={{
          ...minor(41, 42, 45, 47, 50, 51),
          44: serifEmber(96, { fx: "pop" }),
          48: { color: C.iris, weight: 600 },
          49: { color: C.iris, weight: 600 },
          53: { weight: 600 },
        }}
        style={{ position: "absolute", left: 120, top: 300 }}
      />

      <Card
        style={{
          left: PANEL.x,
          top: PANEL.y + drift,
          width: PANEL.w,
          height: PANEL.h,
          opacity: clamp01(panelIn * 1.6),
          transform: `translateY(${(1 - panelIn) * 60}px) scale(${0.96 + 0.04 * panelIn})`,
        }}
      >
        {/* identity */}
        <Row abs={abs} at={wf(46) - 2} top={40} rule={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 99,
                background: `radial-gradient(circle at 35% 30%, ${C.emberSoft}, ${C.emberDeep})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 ${10 * aiOn}px ${C.iris}22`,
              }}
            >
              <LogoMark size={52} color={C.ink} formation={1} />
            </div>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 54, fontWeight: 600, color: C.bone, letterSpacing: "-0.03em", height: 62 }}>
                {typed}
                <span style={{ opacity: Math.floor(abs / 18) % 2 === 0 && typed.length < name.length + 1 ? 1 : 0, color: C.ember }}>|</span>
              </div>
              <Label>Assistente da loja</Label>
            </div>
          </div>
        </Row>

        <Row abs={abs} at={wf(48) - 2} top={200}>
          <FieldName>Inteligência artificial</FieldName>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Label color={aiOn > 0.5 ? C.iris : C.muted}>{aiOn > 0.5 ? "Ativa" : "Inativa"}</Label>
            <Toggle on={aiOn} color={C.iris} />
          </div>
        </Row>

        <Row abs={abs} at={wf(50) - 6} top={330}>
          <FieldName>Voz</FieldName>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 160, height: 48, position: "relative" }}>
              <svg width={160} height={48} viewBox="0 0 160 48">
                {Array.from({ length: 16 }, (_, k) => {
                  const h = 8 + 30 * Math.abs(Math.sin(k * 1.7 + 0.4)) * (0.5 + 0.5 * Math.sin(k * 0.6));
                  return <rect key={k} x={k * 10} y={24 - h / 2} width={5} height={h} rx={2.5} fill={C.ember} />;
                })}
              </svg>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 500, color: C.bone }}>Ana · equipe</div>
          </div>
        </Row>

        <Row abs={abs} at={wf(53) - 2} top={460}>
          <FieldName>Comércio</FieldName>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontSize: 30, fontWeight: 500, color: C.bone }}>
            <Dot color={C.ember} /> Sua loja
          </div>
        </Row>

        <Row abs={abs} at={wf(53) + 10} top={580}>
          <Label>Canais</Label>
          <div style={{ display: "flex", gap: 12 }}>
            {["Mensagem", "WhatsApp", "Voz", "Telefone"].map((c, k) => (
              <div
                key={c}
                style={{
                  padding: "10px 18px",
                  borderRadius: 99,
                  border: `1px solid ${C.line}`,
                  fontFamily: SANS,
                  fontSize: 22,
                  color: C.bone,
                  opacity: prog(abs, wf(53) + 12 + k * 4, 10),
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </Row>
      </Card>

      {/* the voice is already alive under the panel */}
      <VoiceLine
        id="create"
        abs={abs}
        mode="window"
        x={PANEL.x + 44}
        y={PANEL.y + PANEL.h + 64 + drift}
        width={PANEL.w - 88}
        windowSec={2.4}
        amp={16}
        variant="bars"
        barW={4}
        head={false}
        opacity={0.55 * prog(abs, wf(46), 30)}
      />
    </AbsoluteFill>
  );
};
