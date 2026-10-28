import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { LogoMark, Wordmark } from "../components/Logo";
import { MONO, SANS } from "../theme/fonts";
import { FPS } from "../theme/tokens";
import { BRAND, CUT, voiceAt, voiceHi, wf } from "./data";
import { Banner, Flare, Line, Plate, Ring, Shot, Sweep, p01, useF } from "./kit";
import { CH, CW, E, K } from "./theme";

const Black: React.FC<{ children?: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ background: K.black }}>{children}</AbsoluteFill>;

const AppIcon: React.FC<{ bg?: string }> = ({ bg = K.ice }) => (
  <div style={{ width: 64, height: 64, borderRadius: 16, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
    <LogoMark size={38} color={K.ink} />
  </div>
);

/* 01 — the store wakes up · "Olha o que a sua loja já consegue fazer." */
export const S01: React.FC = () => (
  <Shot from={CUT.night}>
    <Plate src="cinema/media/v01-night.mp4" kind="video" from={CUT.night} to={CUT.phone} push={[1.0, 1.12]} fadeIn={24} grade="top" />
    <Flare x={585} y={880} at={30} peak={110} end={170} strength={0.8} />
    <Line text="Olha." at={wf(0)} size={200} y={360} />
    <Line text="o que a sua loja já consegue fazer." at={wf(1)} size={46} weight={500} color={K.dim} y={640} tracking={-0.02} stagger={4} dur={26} />
  </Shot>
);

/* 02 — 03:47 · "Um atendente que nunca dorme," */
export const S02: React.FC = () => (
  <Shot from={CUT.phone}>
    <Plate src="cinema/media/v02-phone.mp4" kind="video" from={CUT.phone} to={CUT.bag} push={[1.04, 1.14]} grade="top" origin="50% 70%" />
    <Line text="Um atendente que" at={wf(9)} size={46} weight={500} color={K.dim} y={330} tracking={-0.02} stagger={4} dur={26} />
    <Line text="nunca dorme." at={wf(12)} size={120} y={410} stagger={6} />
    <Banner at={wf(13) + 2} y={620} title="Loja Bella · 03:47" body="Pedido respondido pela IA ✓" icon={<AppIcon />} />
  </Shot>
);

/* 03 — the sale · "nunca perde uma venda" */
export const S03: React.FC = () => {
  const f = useF();
  const chip = spring({ frame: f - (wf(17) + 6), fps: FPS, config: { damping: 18, stiffness: 160 } });
  return (
    <Shot from={CUT.bag}>
      <Plate src="cinema/media/v03-bag.mp4" kind="video" from={CUT.bag} to={CUT.team} push={[1.04, 1.12]} drift={[0, -24]} grade="light" />
      <Line text="Nunca perde" at={wf(14)} size={112} color={K.ink} y={330} stagger={5} />
      <Line text="uma venda." at={wf(16)} size={150} serif color={K.ink} y={450} />
      <Sweep at={wf(17) + 4} y={430} h={220} opacity={0.5} />
      {f >= wf(17) + 6 ? (
        <div
          style={{
            position: "absolute",
            left: CW / 2 - 230,
            top: 1400,
            width: 460,
            height: 96,
            borderRadius: 999,
            background: "rgba(17,17,19,0.9)",
            color: K.ice,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 34,
            transform: `scale(${0.7 + 0.3 * chip}) translateY(${(1 - chip) * 30}px)`,
            opacity: Math.min(1, chip * 2),
            boxShadow: "0 24px 50px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ width: 34, height: 34, borderRadius: 99, background: "#30D158", color: K.ink, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✓</span>
          Venda confirmada
        </div>
      ) : null}
    </Shot>
  );
};

/* 04 — the team, rack focus · "e fala igual à sua equipe." */
export const S04: React.FC = () => (
  <Shot from={CUT.team}>
    <Plate src="cinema/media/v04-team.mp4" kind="video" from={CUT.team} to={CUT.brand} push={[1.12, 1.03]} blur={[20, 0]} grade="top" />
    <Line text="Fala igual à" at={wf(19)} size={96} y={330} stagger={5} />
    <Line text="sua equipe." at={wf(22)} size={140} serif y={445} />
  </Shot>
);

/* 05 — silence, then the mark · "Esse é o Voice Studio." */
export const S05: React.FC = () => {
  const f = useF();
  const s = spring({ frame: f - BRAND, fps: FPS, config: { damping: 18, stiffness: 120, mass: 0.9 } });
  const glow = p01(f, BRAND, 40);
  const e = voiceAt(f);
  const levels = [0.6, 0.9, 1, 0.9, 0.6].map((k, i) => e * k * (0.6 + 0.4 * Math.sin(f * 0.35 + i)));
  const dot = f < BRAND ? 1 + 0.15 * Math.sin((f - CUT.brand) * 0.4) * p01(f, CUT.brand + 10, 30) : 0;
  return (
    <Shot from={CUT.brand}>
      <Black>
        <div
          style={{
            position: "absolute",
            left: CW / 2 - 520,
            top: 820 - 520,
            width: 1040,
            height: 1040,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)",
            opacity: glow,
            transform: `scale(${0.7 + 0.3 * glow})`,
          }}
        />
        <Line text="Esse é o" at={wf(24)} size={46} weight={500} color={K.dim} y={560} tracking={-0.02} stagger={5} dur={26} />
        {f < BRAND ? (
          <div style={{ position: "absolute", left: CW / 2 - 9, top: 811, width: 18, height: 18, borderRadius: 99, background: K.ice, opacity: p01(f, CUT.brand + 10, 20), transform: `scale(${dot})` }} />
        ) : null}
        <Ring at={BRAND} x={CW / 2} y={820} maxR={900} dur={60} width={2} />
        <Ring at={BRAND + 8} x={CW / 2} y={820} maxR={700} dur={60} width={1.5} />
        <div style={{ position: "absolute", left: CW / 2 - 110, top: 710, opacity: f >= BRAND ? Math.min(1, s * 1.5) : 0, transform: `scale(${0.85 + 0.15 * s})` }}>
          <LogoMark size={220} color={K.ice} spread={s} formation={1} levels={levels} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: CW,
            top: 1010,
            display: "flex",
            justifyContent: "center",
            opacity: p01(f, wf(27), 24),
            filter: `blur(${(1 - p01(f, wf(27), 24)) * 8}px)`,
          }}
        >
          <Wordmark size={118} pVoice={p01(f, wf(27), 26)} pStudio={p01(f, wf(28), 26)} color={K.ice} />
        </div>
        <Sweep at={wf(28) + 10} y={1000} h={160} opacity={0.4} />
      </Black>
    </Shot>
  );
};

/* 06/07 — product shot of the phone · "Ele atende seus clientes por mensagem, no WhatsApp," */
const WA = "#25D366";
const Bub: React.FC<{ at: number; out?: boolean; children: React.ReactNode; green?: number; read?: number }> = ({ at, out, children, green = 0, read }) => {
  const f = useF();
  if (f < at) return null;
  const s = spring({ frame: f - at, fps: FPS, config: { damping: 20, stiffness: 160 } });
  return (
    <div
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        maxWidth: "80%",
        padding: "16px 22px",
        borderRadius: 26,
        background: out ? (green > 0.5 ? WA : K.ice) : "#2A2A2E",
        color: out ? K.ink : K.ice,
        fontFamily: SANS,
        fontSize: 28,
        fontWeight: 500,
        lineHeight: 1.25,
        transform: `translateY(${(1 - s) * 24}px) scale(${0.9 + 0.1 * s})`,
        transformOrigin: out ? "100% 100%" : "0% 100%",
        opacity: Math.min(1, s * 2),
      }}
    >
      {children}
      {out && read !== undefined && f >= read ? <span style={{ marginLeft: 10, fontSize: 22, color: green > 0.5 ? "#0B5132" : "#2D7FF9" }}>✓✓</span> : null}
    </div>
  );
};

const Typing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useF();
  if (f < from || f >= to) return null;
  return (
    <div style={{ alignSelf: "flex-end", display: "flex", gap: 8, padding: "18px 22px", borderRadius: 26, background: "rgba(245,245,247,0.16)" }}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ width: 12, height: 12, borderRadius: 99, background: K.ice, opacity: 0.5 + 0.5 * Math.sin(f * 0.35 - k), transform: `translateY(${Math.sin(f * 0.35 - k) * 4}px)` }} />
      ))}
    </div>
  );
};

export const S06: React.FC = () => {
  const f = useF();
  const from = CUT.product;
  const to = CUT.grille;
  const turn = p01(f, from, to - from, E.drift);
  const green = p01(f, wf(36) - 2, 10, E.fade);
  const float = Math.sin((f - from) * 0.05) * 10;
  return (
    <Shot from={from}>
      <Black>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at 50% 62%, rgba(${green > 0.5 ? "37,211,102" : "255,255,255"},0.10) 0%, rgba(0,0,0,0) 70%)` }} />
        <Line text="Por mensagem." at={wf(33)} out={wf(35) - 6} size={104} y={300} stagger={6} />
        <Line text="No WhatsApp." at={wf(35)} size={104} y={300} stagger={6} />
        <div
          style={{
            position: "absolute",
            left: CW / 2 - 290,
            top: 560,
            width: 580,
            height: 1060,
            borderRadius: 78,
            background: "#0B0B0D",
            border: "9px solid #2B2B30",
            boxShadow: `0 80px 140px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.06), 0 0 ${120 * green}px rgba(37,211,102,${0.25 * green})`,
            transform: `perspective(2200px) rotateY(${-24 + 24 * turn}deg) rotateX(${6 - 6 * turn}deg) translateY(${(1 - p01(f, from, 40)) * 120 + float}px)`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ height: 130, display: "flex", alignItems: "flex-end", gap: 16, padding: "0 28px 20px", background: green > 0.5 ? "rgba(37,211,102,0.16)" : "rgba(255,255,255,0.04)" }}>
            <div style={{ width: 54, height: 54, borderRadius: 99, background: green > 0.5 ? WA : K.ice, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogoMark size={32} color={K.ink} />
            </div>
            <div style={{ fontFamily: SANS, color: K.ice }}>
              <div style={{ fontWeight: 600, fontSize: 30 }}>Loja Bella</div>
              <div style={{ fontWeight: 400, fontSize: 20, color: green > 0.5 ? WA : K.grey }}>{f >= wf(34) - 14 && f < wf(34) ? "digitando…" : "online"}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14, padding: "24px 24px 40px" }}>
            <Bub at={wf(31)}>Oi! Tem esse tênis no 40?</Bub>
            <Typing from={wf(34) - 14} to={wf(34)} />
            <Bub at={wf(34)} out green={green} read={wf(35) + 4}>
              Tem sim! Quer que eu separe pra você?
            </Bub>
            <Bub at={wf(36) + 6}>Separa, por favor.</Bub>
          </div>
        </div>
        <Sweep at={wf(36)} y={560} h={1060} opacity={0.18} />
      </Black>
    </Shot>
  );
};

/* 08 — particles answer the voice · "e agora falando," */
export const S08: React.FC = () => (
  <Shot from={CUT.grille}>
    <Plate src="cinema/media/v08-grille.mp4" kind="video" from={CUT.grille} to={CUT.portrait} push={[1.0, 1.08]} grade="none" />
    <Line text="Agora," at={wf(38)} size={110} y={330} />
    <Line text="falando." at={wf(39)} size={160} serif y={450} />
    <Flare x={760} y={1035} at={wf(39)} peak={wf(39) + 20} end={wf(39) + 60} strength={0.6} />
  </Shot>
);

/* 09 — her voice · "com a voz da sua equipe." */
export const S09: React.FC = () => {
  const f = useF();
  const from = CUT.portrait;
  const pts = Array.from({ length: 120 }, (_, k) => {
    const x = (k / 119) * CW;
    const t = f / FPS - (119 - k) * 0.012;
    const v = voiceHi(Math.max(0, t));
    const y = 1235 + Math.sin(k * 0.55 + f * 0.25) * v * 70;
    return `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <Shot from={from}>
      <Plate src="cinema/media/v09-portrait.mp4" kind="video" from={from} to={CUT.street} push={[1.0, 1.1]} origin="50% 30%" grade="bottom" />
      <svg width={CW} height={CH} style={{ position: "absolute", left: 0, top: 0, opacity: p01(f, wf(41), 20) }}>
        <path d={pts} fill="none" stroke={K.ice} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      <Line text="A voz da" at={wf(41)} size={82} y={1300} stagger={5} />
      <Line text="sua equipe." at={wf(44)} size={120} serif y={1385} />
      <div style={{ position: "absolute", left: 0, width: CW, top: 1545, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: "0.2em", color: K.dim, opacity: p01(f, wf(42), 20) }}>
        VOZ · ANA · EQUIPE
      </div>
    </Shot>
  );
};
