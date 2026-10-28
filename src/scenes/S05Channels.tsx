import React from "react";
import { AbsoluteFill } from "remotion";
import { voiceMax } from "../audio/envelope";
import { Bubble, Dot, Label } from "../components/ui";
import { DrawPath, ICON } from "../components/ui";
import { wf } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, mix, prog, spr } from "../motion/time";
import { MONO, SANS } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { minor, serifEmber, useAbs, type SceneProps } from "./shared";

const PHONE = { cx: 520, cy: 548, w: 440, h: 880 };
const TEXT_X = 900;

/** a voice-note bubble whose waveform is the narration itself */
const VoiceNote: React.FC<{ abs: number; p: number }> = ({ abs, p }) => {
  const now = abs / 60;
  const bars = 26;
  return (
    <Bubble side="out" p={p} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", width: "86%" }}>
      <div style={{ width: 46, height: 46, borderRadius: 99, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={22} height={22} viewBox="0 0 48 48">
          <path d={ICON.play} fill={C.ember} />
        </svg>
      </div>
      <svg width={220} height={44} viewBox="0 0 220 44">
        {Array.from({ length: bars }, (_, k) => {
          const t = now - (bars - k) * 0.06;
          const a = t < 0 ? 0 : voiceMax(t, t + 0.06);
          const h = 5 + a * 36;
          return <rect key={k} x={k * 8.4} y={22 - h / 2} width={4.6} height={h} rx={2.3} fill={C.ink} opacity={0.35 + 0.65 * (k / bars)} />;
        })}
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 18, color: C.ink, opacity: 0.75 }}>0:12</div>
    </Bubble>
  );
};

/** height-growing slot so older messages are pushed up smoothly, never jump */
const Grow: React.FC<{ p: number; h: number; children: React.ReactNode }> = ({ p, h, children }) => (
  <div style={{ maxHeight: p * h, overflow: p < 0.999 ? "hidden" : "visible", display: "flex", flexDirection: "column" }}>
    {children}
  </div>
);

const Typing: React.FC<{ abs: number; p: number }> = ({ abs, p }) => (
  <Bubble side="in" p={p} style={{ display: "flex", gap: 8, padding: "20px 22px" }}>
    {[0, 1, 2].map((k) => (
      <span
        key={k}
        style={{
          width: 10,
          height: 10,
          borderRadius: 99,
          background: C.muted,
          opacity: 0.4 + 0.6 * Math.max(0, Math.sin((abs / 60) * 9 - k * 0.9)),
        }}
      />
    ))}
  </Bubble>
);

/** S5 — "…que atende os seus clientes de verdade, por mensagem, no WhatsApp e agora com voz." */
export const S05Channels: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const phoneIn = spr(abs, start + 4, SPR.settle);
  const rotY = mix(17, 8, prog(abs, start, 300, ease.inOut));

  const tIn = wf(58);
  const tTyping = wf(59) + 4;
  const tReply = wf(62);
  const tNote = wf(67);
  const typingP = prog(abs, tTyping, 10) * (1 - prog(abs, tReply - 4, 6));

  // messages stack from the bottom; older ones are pushed up by springs
  const grow = (t: number) => spr(abs, t - 2, SPR.settle);
  const appear = (t: number) => spr(abs, t, SPR.pop);

  const wa = spr(abs, wf(64), SPR.pop);

  return (
    <AbsoluteFill>
      <KineticPhrase
        abs={abs}
        size={62}
        weight={500}
        lineHeight={1.12}
        lines={[
          [54, 55, 56, 57, 58],
          [59, 60],
          [61, 62, 63, 64],
          [65, 66, 67, 68],
        ]}
        words={{
          ...minor(54, 56, 57, 61, 63, 65),
          59: serifEmber(80, { color: C.bone }),
          60: serifEmber(80, { color: C.bone }),
          64: { weight: 700 },
          68: serifEmber(118, { fx: "pop" }),
        }}
        style={{ position: "absolute", left: TEXT_X, top: 262 }}
      />

      {/* phone */}
      <div
        style={{
          position: "absolute",
          left: PHONE.cx - PHONE.w / 2,
          top: PHONE.cy - PHONE.h / 2,
          width: PHONE.w,
          height: PHONE.h,
          perspective: 1800,
          opacity: clamp01(phoneIn * 1.5),
          transform: `translateY(${(1 - phoneIn) * 140}px)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 66,
            background: "#08080A",
            padding: 12,
            boxShadow: "0 60px 120px rgba(0,0,0,0.6), inset 0 0 0 1.5px #2E2A33",
            transform: `rotateY(${rotY}deg) rotateX(4deg)`,
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: 56, background: C.ink2, overflow: "hidden", position: "relative" }}>
            {/* header */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 132, background: "#1B1820", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "flex-end", padding: "0 26px 20px", gap: 16 }}>
              <div style={{ width: 58, height: 58, borderRadius: 99, background: C.ember, color: C.ink, fontFamily: SANS, fontWeight: 700, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                L
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 600, color: C.bone, letterSpacing: "-0.01em" }}>Sua Loja</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, height: 24 }}>
                  <Dot color={C.leaf} size={8} />
                  <div style={{ fontFamily: MONO, fontSize: 15, color: C.muted, letterSpacing: "0.08em" }}>online</div>
                  <div
                    style={{
                      marginLeft: 6,
                      padding: "2px 10px",
                      borderRadius: 99,
                      background: `${C.leaf}22`,
                      color: C.leaf,
                      fontFamily: MONO,
                      fontSize: 14,
                      letterSpacing: "0.08em",
                      transform: `scale(${wa})`,
                      transformOrigin: "0% 50%",
                      opacity: clamp01(wa * 2),
                    }}
                  >
                    WhatsApp
                  </div>
                </div>
              </div>
            </div>

            {/* thread */}
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 110 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {abs >= tIn ? (
                  <Grow p={grow(tIn)} h={140}>
                    <Bubble side="in" p={appear(tIn)}>
                      Oi! Vocês têm esse tênis no 40?
                    </Bubble>
                  </Grow>
                ) : null}
                {typingP > 0.01 ? (
                  <Grow p={typingP} h={70}>
                    <Typing abs={abs} p={typingP} />
                  </Grow>
                ) : null}
                {abs >= tReply ? (
                  <Grow p={grow(tReply)} h={140}>
                    <Bubble side="out" p={appear(tReply)}>
                      Temos sim! Quer que eu separe um pra você?
                    </Bubble>
                  </Grow>
                ) : null}
                {abs >= tNote ? (
                  <Grow p={grow(tNote)} h={100}>
                    <VoiceNote abs={abs} p={appear(tNote)} />
                  </Grow>
                ) : null}
              </div>
            </div>

            {/* composer */}
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 26, height: 64, borderRadius: 99, background: "#1F1C24", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px 0 26px" }}>
              <div style={{ fontFamily: SANS, fontSize: 21, color: C.muted }}>Mensagem</div>
              <div style={{ width: 46, height: 46, borderRadius: 99, background: abs >= tNote ? C.ember : C.line, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DrawPath d={ICON.mic} p={1} size={26} stroke={abs >= tNote ? C.ink : C.bone} width={3.6} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Label style={{ position: "absolute", left: TEXT_X, top: 190, opacity: prog(abs, start + 10, 16) }}>
        Atendimento · {abs >= wf(67) ? "texto + voz" : "texto"}
      </Label>
    </AbsoluteFill>
  );
};
