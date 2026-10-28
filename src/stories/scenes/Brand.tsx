import React from "react";
import { AbsoluteFill } from "remotion";
import { ease } from "../../motion/easing";
import { SPR } from "../../motion/springs";
import { clamp01, mix, prog, spr } from "../../motion/time";
import { MONO, SANS, SERIF } from "../../theme/fonts";
import { C } from "../../theme/tokens";
import { LogoMark, Wordmark } from "../../components/Logo";
import { Portrait } from "../../components/ui";
import { KineticPhrase } from "../../typography/KineticPhrase";
import { voiceAt } from "../data/envelope";
import { BRAND } from "../data/timeline";
import { wf } from "../data/words";
import { Burst, Cam, Flash, SceneBg, Shockwave, kc, kf, useAbs, type StoryProps } from "../kit";
import { INNER_W, PAL, SAFE, ST, SW } from "../theme";

/* ------------------------------------------------------------------ S5 reveal
 * "Esse é o Voice Studio." — a pulsing dot explodes into the V-bars on the downbeat. */
export const LOGO_Y = 900;
export const RevealScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const bloom = kf(abs, [[BRAND - 2, 0], [BRAND + 4, 1]], ease.enter);
  const spread = spr(abs, BRAND, SPR.pop);
  const pre = prog(abs, start, BRAND - start, ease.inOut);
  const dotPulse = abs < BRAND ? 1 + 0.25 * Math.sin(abs * 0.5) * pre : 1;
  const e = voiceAt(abs);
  const levels = [0.6, 0.9, 1, 0.9, 0.6].map((k, i) => e * k * (0.7 + 0.3 * Math.sin(abs * 0.4 + i)));
  const pVoice = prog(abs, wf(27), 18, ease.enter);
  const pStudio = prog(abs, wf(28), 18, ease.enter);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={PAL.ink}
        blobs={[
          { color: PAL.ember, x: 0.5, y: 0.47, r: 0.95, a: 0.25 + 0.6 * bloom },
          { color: PAL.irisDeep, x: 0.1, y: 0.1, r: 0.7, a: 0.6 },
          { color: PAL.emberDeep, x: 0.9, y: 0.95, r: 0.8, a: 0.4 + 0.4 * bloom },
        ]}
        pattern="rays"
        patternColor={PAL.emberSoft}
        patternOpacity={0.05 + 0.16 * bloom}
        seed="reveal"
      />
      <Cam abs={abs} zoom={[[start, 1.0], [BRAND - 1, 1.14], [BRAND + 3, 0.94], [BRAND + 30, 1.0], [start + 120, 1.03]]} handheld={1.5}>
        <div style={{ position: "absolute", left: SAFE.x, top: 470, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={ST.mid}
            weight={600}
            lines={[[24, 25, 26]]}
            words={{ 24: { fx: "pop" } }}
            exitAt={BRAND + 50}
            exit="blur"
          />
        </div>
        <Shockwave abs={abs} at={BRAND} x={SW / 2} y={LOGO_Y} color={PAL.emberSoft} count={4} maxR={1100} dur={50} width={10} />
        <Burst abs={abs} at={BRAND} x={SW / 2} y={LOGO_Y} colors={[PAL.ember, PAL.sun, C.bone]} count={32} dist={760} seed="rv" shape="bar" size={22} />
        <div style={{ position: "absolute", left: SW / 2 - 170, top: LOGO_Y - 170, transform: `scale(${dotPulse})` }}>
          <LogoMark size={340} spread={spread} formation={1} levels={levels} />
        </div>
        <div style={{ position: "absolute", left: 0, width: SW, top: 1180, display: "flex", justifyContent: "center" }}>
          <Wordmark size={150} pVoice={pVoice} pStudio={pStudio} />
        </div>
      </Cam>
      <Flash abs={abs} at={BRAND} color={PAL.emberSoft} dur={12} peak={0.7} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S6 channels
 * "Ele atende seus clientes por mensagem, no WhatsApp, e agora falando, com a voz da sua equipe."
 * A phone chat builds message by message; the world turns WhatsApp-green, then the voice note plays. */
const PH = { x: 230, y: 640, w: 620, h: 930 };
const WA = "#25D366";

const msgIn = (abs: number, at: number) => spr(abs, at, SPR.pop);

export const ChannelsScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const mensagem = wf(34);
  const whats = wf(36);
  const falando = wf(39);
  const equipe = wf(45);
  const base = kc(abs, [
    [whats - 4, PAL.ink],
    [whats + 6, PAL.wa],
    [falando - 6, PAL.wa],
    [falando + 6, "#22123F"],
    [wf(40) - 2, "#22123F"],
    [wf(40) + 10, "#3A130A"],
  ]);
  const waOn = kf(abs, [[whats - 2, 0], [whats + 8, 1], [falando - 4, 1], [falando + 6, 0]]);
  const voiceOn = kf(abs, [[falando - 2, 0], [falando + 10, 1]]);
  const phoneIn = spr(abs, wf(29), SPR.heavy);
  const tilt = kf(abs, [[falando - 4, 0], [falando + 10, -6], [equipe, 4]]);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={base}
        blobs={[
          { color: WA, x: 0.85, y: 0.25, r: 0.75, a: 0.15 + 0.55 * waOn },
          { color: PAL.ember, x: 0.15, y: 0.85, r: 0.8, a: 0.25 + 0.4 * voiceOn },
          { color: PAL.iris, x: 0.9, y: 0.9, r: 0.6, a: 0.3 * voiceOn },
        ]}
        pattern="grid"
        patternColor={C.bone}
        patternOpacity={0.06}
        seed="ch"
      />
      <Cam abs={abs} zoom={[[start, 1.05], [whats, 1.0], [whats + 4, 1.05], [falando, 1.0], [falando + 4, 1.04], [start + 360, 1.0]]}>
        {/* phrase 1 */}
        <Phrase top={300}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={64}
            weight={600}
            lines={[[29, 30, 31, 32], [33, 34]]}
            words={{
              33: { size: 100, color: "rgba(244,239,230,0.6)" },
              34: { size: 130, font: "serif", color: PAL.ember, fx: "pop" },
            }}
            exitAt={whats - 6}
            exit="up"
          />
        </Phrase>
        {/* phrase 2 */}
        <Phrase top={330}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={72}
            weight={700}
            lines={[[35], [36]]}
            words={{ 35: { color: "rgba(244,239,230,0.6)" }, 36: { size: 170, weight: 800, color: WA, fx: "slam" } }}
            exitAt={wf(37) - 6}
            exit="up"
          />
        </Phrase>
        {/* phrase 3 */}
        <Phrase top={300}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={72}
            weight={600}
            lines={[[37, 38], [39]]}
            words={{ 37: { color: "rgba(244,239,230,0.6)" }, 39: { font: "serif", size: 210, color: PAL.ember, fx: "pop" } }}
            exitAt={wf(40) - 6}
            exit="up"
          />
        </Phrase>
        {/* phrase 4 */}
        <Phrase top={300}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={72}
            weight={600}
            lines={[[40, 41, 42, 43], [44, 45]]}
            words={{
              40: { color: "rgba(244,239,230,0.6)" },
              41: { color: "rgba(244,239,230,0.6)" },
              42: { color: PAL.ember },
              44: { size: 120, weight: 700 },
              45: { font: "serif", size: 150, color: PAL.ember, fx: "pop" },
            }}
          />
        </Phrase>

        {/* phone */}
        <div
          style={{
            position: "absolute",
            left: PH.x,
            top: PH.y,
            width: PH.w,
            height: PH.h,
            transform: `perspective(1600px) translateY(${(1 - phoneIn) * 900}px) rotateX(${(1 - phoneIn) * 30}deg) rotateZ(${tilt}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <Shockwave abs={abs} at={falando} x={PH.w / 2} y={PH.h * 0.75} color={PAL.ember} count={3} maxR={700} dur={44} />
          <Phone abs={abs} waOn={waOn} mensagem={mensagem} whats={whats} falando={falando} equipe={equipe} />
        </div>

        <Chip abs={abs} at={mensagem} x={40} y={1040} color={C.bone} text="Mensagem" />
        <Chip abs={abs} at={whats} x={640} y={760} color={WA} text="WhatsApp" dark />
        <Chip abs={abs} at={falando} x={800} y={1300} color={PAL.ember} text="Voz" dark />
      </Cam>
      <Flash abs={abs} at={whats} color={WA} dur={8} peak={0.35} />
      <Flash abs={abs} at={falando} color={PAL.ember} dur={8} peak={0.3} />
    </AbsoluteFill>
  );
};

const Phrase: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", left: SAFE.x, top, width: INNER_W }}>{children}</div>
);

const Chip: React.FC<{ abs: number; at: number; x: number; y: number; color: string; text: string; dark?: boolean }> = ({
  abs,
  at,
  x,
  y,
  color,
  text,
  dark,
}) => {
  const s = spr(abs, at, SPR.pop);
  const bob = Math.sin(abs * 0.06 + x) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        padding: "18px 30px",
        borderRadius: 999,
        background: color,
        color: dark ? PAL.ink : PAL.ink,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: "-0.02em",
        boxShadow: "0 24px 50px rgba(0,0,0,0.35)",
        transform: `scale(${s}) rotate(${(1 - s) * -20 + Math.sin(abs * 0.05 + y) * 3}deg)`,
        opacity: clamp01(s * 2),
      }}
    >
      {text}
    </div>
  );
};

const Phone: React.FC<{ abs: number; waOn: number; mensagem: number; whats: number; falando: number; equipe: number }> = ({
  abs,
  waOn,
  mensagem,
  whats,
  falando,
  equipe,
}) => {
  const m1 = msgIn(abs, mensagem);
  const typing = abs >= mensagem + 12 && abs < mensagem + 30 ? 1 : 0;
  const m2 = msgIn(abs, mensagem + 30);
  const m3 = msgIn(abs, whats + 8);
  const m4 = msgIn(abs, falando);
  const chip = spr(abs, equipe, SPR.pop);
  const header = waOn > 0.5 ? WA : C.ink3;
  const playP = prog(abs, falando + 6, 140, (t) => t);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 72,
        background: "#0F0E12",
        border: "10px solid #1F1C24",
        boxShadow: "0 60px 120px rgba(0,0,0,0.55)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 150,
          background: `linear-gradient(180deg, ${mixHex(C.ink3, WA, waOn)} 0%, ${mixHex("#1A171F", "#1DA851", waOn)} 100%)`,
          display: "flex",
          alignItems: "flex-end",
          padding: "0 30px 22px",
          gap: 18,
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: 68, height: 68, borderRadius: 99, background: PAL.ember, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LogoMark size={40} color={PAL.ink} />
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: header === WA ? PAL.ink : C.bone }}>Loja Bella</div>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.1em", color: waOn > 0.5 ? "rgba(12,11,14,0.7)" : PAL.leaf }}>
            {abs >= falando ? "GRAVANDO ÁUDIO…" : "ONLINE · IA"}
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 18,
          padding: "26px 26px 34px",
          background: mixHex("#0F0E12", "#0B1F17", waOn),
        }}
      >
        <Msg p={m1} side="in">Oi! Tem esse tênis no 40?</Msg>
        {typing ? <Typing abs={abs} /> : null}
        <Msg p={m2} side="out">Tem sim! Quer que eu separe pra você?</Msg>
        <Msg p={m3} side="in">Separa! Pode me mandar um áudio?</Msg>
        {m4 > 0.01 ? (
          <div
            style={{
              alignSelf: "flex-end",
              width: "86%",
              borderRadius: 30,
              borderBottomRightRadius: 8,
              background: PAL.ember,
              padding: "20px 22px",
              boxSizing: "border-box",
              transformOrigin: "100% 100%",
              transform: `scale(${0.8 + 0.2 * m4}) translateY(${(1 - m4) * 40}px)`,
              opacity: clamp01(m4 * 2),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 58, height: 58, borderRadius: 99, background: PAL.ink, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <div style={{ width: 0, height: 0, borderLeft: `18px solid ${C.bone}`, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", marginLeft: 5 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, height: 60, flex: 1 }}>
                {Array.from({ length: 26 }, (_, k) => {
                  const played = k / 26 < playP;
                  const e = voiceAt(abs - (26 - k) * 2);
                  const h = 10 + e * 46 * (0.55 + 0.45 * Math.sin(k * 2.1));
                  return <div key={k} style={{ width: 6, height: h, borderRadius: 6, background: played ? PAL.ink : "rgba(12,11,14,0.35)" }} />;
                })}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: PAL.ink }}>0:{String(Math.min(59, Math.floor(playP * 12))).padStart(2, "0")}</div>
            </div>
            {chip > 0.01 ? (
              <div
                style={{
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 18px 8px 8px",
                  borderRadius: 999,
                  background: PAL.ink,
                  transform: `scale(${chip})`,
                  transformOrigin: "0% 50%",
                }}
              >
                <Portrait tint="#FFD2B8" size={44} initial="chA" />
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.bone }}>
                  voz da <span style={{ fontFamily: SERIF, color: PAL.emberSoft, fontSize: 28 }}>Ana</span> · equipe
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Msg: React.FC<{ p: number; side: "in" | "out"; children: React.ReactNode }> = ({ p, side, children }) => {
  if (p <= 0.01) return null;
  const out = side === "out";
  return (
    <div
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        maxWidth: "80%",
        padding: "18px 24px",
        borderRadius: 28,
        borderBottomRightRadius: out ? 8 : 28,
        borderBottomLeftRadius: out ? 28 : 8,
        background: out ? PAL.ember : "#24202A",
        color: out ? PAL.ink : C.bone,
        fontFamily: SANS,
        fontSize: 31,
        fontWeight: 500,
        lineHeight: 1.25,
        transformOrigin: out ? "100% 100%" : "0% 100%",
        transform: `translateY(${(1 - p) * 30}px) scale(${0.8 + 0.2 * p})`,
        opacity: clamp01(p * 2),
      }}
    >
      {children}
    </div>
  );
};

const Typing: React.FC<{ abs: number }> = ({ abs }) => (
  <div style={{ alignSelf: "flex-end", display: "flex", gap: 8, padding: "20px 24px", borderRadius: 28, background: "rgba(255,90,54,0.25)" }}>
    {[0, 1, 2].map((k) => (
      <div key={k} style={{ width: 13, height: 13, borderRadius: 99, background: PAL.ember, transform: `translateY(${Math.sin(abs * 0.4 - k) * 5}px)` }} />
    ))}
  </div>
);

/** linear mix between two #RRGGBB colors */
const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(mix(v, pb[i], clamp01(t)))).join(",")})`;
};
