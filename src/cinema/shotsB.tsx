import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { LogoMark, Wordmark } from "../components/Logo";
import { MONO, SANS } from "../theme/fonts";
import { FPS } from "../theme/tokens";
import { CEM, CUT, DURATION, ENDING, VOICE_DURATION, voiceAt, voiceHi, voiceMax, we, wf } from "./data";
import { Banner, Flare, Line, Plate, Ring, Serif, Shot, Sweep, p01, shake, useF } from "./kit";
import { CH, CW, E, K } from "./theme";

const Bg: React.FC<{ color: string }> = ({ color }) => <AbsoluteFill style={{ background: color }} />;

/** quick punch-in used on hard cuts inside a shot */
const Punch: React.FC<{ at: number; children: React.ReactNode; amount?: number }> = ({ at, children, amount = 0.1 }) => {
  const f = useF();
  const s = spring({ frame: f - at, fps: FPS, config: { damping: 26, stiffness: 220 } });
  const b = (1 - Math.min(1, (f - at) / 8)) * 10;
  return <AbsoluteFill style={{ transform: `scale(${1 + amount * (1 - s)})`, filter: b > 0.4 ? `blur(${b}px)` : undefined }}>{children}</AbsoluteFill>;
};

/* 10 — the customer calls, then the call is answered · "O cliente liga … inteligência artificial," */
export const S10: React.FC = () => {
  const f = useF();
  const t = Math.max(0, (f - CUT.call) / FPS);
  const e = voiceAt(f);
  const s = spring({ frame: f - CUT.call, fps: FPS, config: { damping: 20, stiffness: 140 } });
  return (
    <>
      <Shot from={CUT.street}>
        <Plate src="cinema/media/v10-street.mp4" kind="video" from={CUT.street} to={CUT.call} push={[1.0, 1.06]} grade="top" rate={0.9} />
        <Line text="O cliente liga." at={wf(46)} size={104} y={330} stagger={6} />
        <Line text="na sua loja" at={wf(49)} size={50} weight={500} color={K.dim} y={480} tracking={-0.02} stagger={4} dur={26} />
        <Banner
          at={wf(48) + 4}
          y={620}
          title="Chamada recebida"
          body="Loja Bella · Linha 1"
          tint="rgba(30,30,34,0.55)"
          icon={
            <div style={{ width: 64, height: 64, borderRadius: 99, background: "#30D158", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", transform: `rotate(${Math.sin(f * 1.4) * 8 * (f < CUT.call ? 1 : 0)}deg)`, color: K.ink, fontSize: 30 }}>
              ✆
            </div>
          }
        />
      </Shot>
      <Shot from={CUT.call}>
        <Punch at={CUT.call} amount={0.08}>
          <Bg color={K.black} />
          <Line text="Quem atende é a" at={CUT.call} size={56} weight={500} color={K.dim} y={330} tracking={-0.02} stagger={4} dur={26} />
          <Line text="inteligência artificial." at={wf(57)} size={104} serif y={410} />
          <div style={{ position: "absolute", left: 0, width: CW, top: 690, textAlign: "center", fontFamily: MONO, fontSize: 26, letterSpacing: "0.2em", color: "#30D158" }}>
            EM LIGAÇÃO · 00:{String(Math.floor(t)).padStart(2, "0")}
          </div>
          <Ring at={CUT.call} x={CW / 2} y={970} maxR={600} dur={50} />
          <Ring at={CUT.call + 30} x={CW / 2} y={970} maxR={600} dur={50} width={1.5} />
          <Ring at={CUT.call + 60} x={CW / 2} y={970} maxR={600} dur={50} width={1.5} />
          <div
            style={{
              position: "absolute",
              left: CW / 2 - 170,
              top: 800,
              width: 340,
              height: 340,
              borderRadius: 999,
              background: "radial-gradient(circle at 40% 35%, #FFFFFF 0%, #DADADF 45%, #8E8E93 100%)",
              boxShadow: `0 0 ${60 + 160 * e}px rgba(255,255,255,${0.12 + 0.3 * e})`,
              transform: `scale(${(0.8 + 0.2 * s) * (1 + 0.06 * e)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogoMark size={150} color={K.ink} levels={[0.5, 0.85, 1, 0.85, 0.5].map((k, i) => e * k * (0.6 + 0.4 * Math.sin(f * 0.4 + i)))} />
          </div>
          <div style={{ position: "absolute", left: 0, width: CW, top: 1200, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 44, color: K.ice }}>Loja Bella</div>
          <div style={{ position: "absolute", left: 0, width: CW, top: 1262, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: 30, color: K.grey }}>
            Assistente com a voz da equipe
          </div>
        </Punch>
      </Shot>
    </>
  );
};

/* 11 — four words, four cuts · "na hora, natural, sem robô, sem fila." */
const Word: React.FC<{ from: number; children: React.ReactNode; serif?: boolean }> = ({ from, children, serif }) => (
  <Shot from={from}>
    <Punch at={from} amount={0.14}>
      <Bg color={K.black} />
      <Line text={children} at={from} size={180} serif={serif} y={760} dur={18} />
    </Punch>
  </Shot>
);
export const S11: React.FC = () => {
  const f = useF();
  const tNat = wf(61) - 1;
  const tRobo = wf(62) - 1;
  const tFila = wf(64) - 1;
  const ring = p01(f, CUT.words + 4, tNat - CUT.words - 8, E.drift);
  const strike = p01(f, we(63) - 6, 12, E.reveal);
  const merge = p01(f, wf(65) + 2, 22, E.drift);
  const C = 2 * Math.PI * 70;
  return (
    <>
      <Word from={CUT.words}>Na hora.</Word>
      <Shot from={CUT.words}>
        <svg width={CW} height={CH} style={{ position: "absolute", left: 0, top: 0 }}>
          <circle cx={CW / 2} cy={1130} r={70} fill="none" stroke="rgba(245,245,247,0.15)" strokeWidth={4} />
          <circle cx={CW / 2} cy={1130} r={70} fill="none" stroke={K.ice} strokeWidth={4} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform={`rotate(-90 ${CW / 2} 1130)`} />
        </svg>
      </Shot>
      <Word from={tNat} serif>
        Natural.
      </Word>
      <Shot from={tNat}>
        <Sweep at={tNat + 6} y={740} h={240} opacity={0.5} />
      </Shot>
      <Word from={tRobo}>Sem robô.</Word>
      <Shot from={tRobo}>
        <div style={{ position: "absolute", left: CW / 2 + 20, top: 868, height: 8, width: 360 * strike, background: K.ice, borderRadius: 8 }} />
      </Shot>
      <Word from={tFila}>Sem fila.</Word>
      <Shot from={tFila}>
        {Array.from({ length: 6 }, (_, k) => {
          const x0 = CW / 2 - 200 + k * 80;
          const x = x0 + (CW / 2 - x0) * merge;
          return <div key={k} style={{ position: "absolute", left: x - 14, top: 1116, width: 28, height: 28, borderRadius: 99, background: K.ice, opacity: k === 2 ? 1 : 1 - merge * 0.9 }} />;
        })}
        <Ring at={wf(65) + 24} x={CW / 2} y={1130} maxR={260} dur={36} />
      </Shot>
    </>
  );
};

/* 12 — the film listens to itself · "E esse áudio que você está escutando agora?" */
export const S12: React.FC = () => {
  const f = useF();
  const now = f / FPS;
  const beat = (at: number) => 0.04 * Math.max(0, 1 - Math.abs(f - at) / 7);
  const push = 1 + 0.1 * p01(f, CUT.proof, CEM - CUT.proof, E.drift) + beat(we(73) + 4) + beat(we(73) + 20);
  const N = 160;
  const span = 3.2;
  const pts = Array.from({ length: N }, (_, k) => {
    const t = now - span + (k / (N - 1)) * span;
    const v = t < 0 ? 0 : voiceMax(t, t + span / N);
    const x = 80 + (k / (N - 1)) * (CW - 160);
    return { x, v };
  });
  const top = pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(1)} ${(1080 - p.v * 85).toFixed(1)}`).join(" ");
  const bottom = pts
    .slice()
    .reverse()
    .map((p) => `L${p.x.toFixed(1)} ${(1080 + p.v * 85).toFixed(1)}`)
    .join(" ");
  const mm = Math.floor(now / 60);
  const ss = (now % 60).toFixed(2).padStart(5, "0");
  const dim = p01(f, we(73), 20, E.fade);
  return (
    <Shot from={CUT.proof}>
      <Bg color={K.black} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 56%" }}>
        <Line text="E esse áudio" at={wf(66)} size={104} y={330} stagger={6} />
        <Line text="que você está escutando" at={wf(69)} size={50} weight={500} color={K.dim} y={470} tracking={-0.02} stagger={4} dur={26} />
        <Line text="agora?" at={wf(73)} size={170} serif y={560} />
        <svg width={CW} height={CH} style={{ position: "absolute", left: 0, top: 0, opacity: p01(f, wf(66), 20) * (1 - 0.6 * dim) }}>
          <path d={`${top} ${bottom} Z`} fill={K.ice} opacity={0.9} />
          <line x1={CW - 80} y1={940} x2={CW - 80} y2={1220} stroke={K.ice} strokeWidth={2} />
        </svg>
        <div style={{ position: "absolute", left: 0, width: CW, top: 1270, textAlign: "center", fontFamily: MONO, fontSize: 30, color: K.dim, letterSpacing: "0.1em", opacity: p01(f, wf(66), 20) }}>
          {String(mm).padStart(2, "0")}:{ss}
        </div>
      </AbsoluteFill>
      {/* the frame closes in during the silence before the drop */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${90 - 35 * dim}% ${70 - 25 * dim}% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.95) 100%)` }} />
    </Shot>
  );
};

/* 13 — the only color in the film · "É 100% inteligência artificial." */
export const S13: React.FC = () => {
  const f = useF();
  const n = Math.round(100 * p01(f, CEM, we(75) - CEM, E.reveal));
  const s = spring({ frame: f - CEM, fps: FPS, config: { damping: 16, stiffness: 120, mass: 1.2 } });
  const split = Math.max(0, 1 - (f - CEM) / 10) * 14;
  const num: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: CW,
    top: 600,
    textAlign: "center",
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 300,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  };
  return (
    <Shot from={CUT.climax}>
      <AbsoluteFill style={{ transform: shake(f, CEM, 34) }}>
        <Plate src="cinema/media/v13-burst.mp4" kind="video" from={CUT.climax} to={CUT.studio} push={[1.2, 1.0]} grade="none" brightness={0.85} />
        <AbsoluteFill style={{ transform: `scale(${1.25 - 0.25 * s})` }}>
          {split > 0.5 ? (
            <>
              <div style={{ ...num, color: "rgba(255,80,40,0.8)", transform: `translateX(${-split}px)`, mixBlendMode: "screen" }}>{n}%</div>
              <div style={{ ...num, color: "rgba(80,160,255,0.8)", transform: `translateX(${split}px)`, mixBlendMode: "screen" }}>{n}%</div>
            </>
          ) : null}
          <div style={{ ...num, color: K.ice, textShadow: "0 20px 80px rgba(0,0,0,0.5)" }}>{n}%</div>
        </AbsoluteFill>
        <Line text="inteligência artificial." at={wf(76)} size={96} serif y={1000} />
        <Sweep at={wf(77) + 6} y={560} h={360} opacity={0.35} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: K.ice, opacity: Math.max(0, 1 - (f - CEM) / 8) * 0.9 }} />
    </Shot>
  );
};

/* 14 — nothing was recorded · "Eu não gravei nada. Pedi para uma IA escrever," */
const PROMPT = "Escreva um texto curto apresentando o Voice Studio para o dono de uma loja.";
export const S14: React.FC = () => {
  const f = useF();
  const typed = Math.floor(PROMPT.length * p01(f, wf(83), we(87) - wf(83), (t) => t));
  const card = p01(f, CUT.prompt, 24);
  const sent = spring({ frame: f - we(87), fps: FPS, config: { damping: 14, stiffness: 180 } });
  return (
    <Shot from={CUT.studio}>
      <Plate src="cinema/media/v14-studio.mp4" kind="video" from={CUT.studio} to={CUT.app} push={[1.0, 1.12]} drift={[0, 40]} grade="top" brightness={f >= CUT.prompt ? 1 - 0.55 * card : 1} />
      <Flare x={540} y={760} at={CUT.studio} peak={CUT.studio + 40} end={CUT.prompt} strength={0.35} color="210,225,255" />
      <Line text="Eu não gravei" at={wf(78)} out={CUT.prompt - 8} size={100} y={330} stagger={6} />
      <Line text="nada." at={wf(81)} out={CUT.prompt - 8} size={170} serif y={450} />
      <Line text="Pedi para uma" at={wf(82)} size={56} weight={500} color={K.dim} y={330} tracking={-0.02} stagger={4} dur={26} />
      <Line text="inteligência artificial" at={wf(85)} size={92} serif y={410} />
      <Line text="escrever." at={wf(87)} size={104} y={530} />
      {f >= CUT.prompt ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            width: CW - 160,
            top: 1060,
            padding: "36px 40px 70px",
            boxSizing: "border-box",
            borderRadius: 36,
            background: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(20px)",
            opacity: card,
            transform: `translateY(${(1 - card) * 60}px)`,
            fontFamily: SANS,
            fontSize: 40,
            lineHeight: 1.35,
            color: K.ice,
            minHeight: 260,
          }}
        >
          {PROMPT.slice(0, typed)}
          <span style={{ display: "inline-block", width: 3, height: 44, marginLeft: 4, verticalAlign: "middle", background: K.ice, opacity: Math.floor(f / 15) % 2 ? 1 : 0.2 }} />
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 20,
              width: 64,
              height: 64,
              borderRadius: 99,
              background: f >= we(87) ? K.ice : "rgba(255,255,255,0.2)",
              color: K.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              transform: `scale(${f >= we(87) ? 0.8 + 0.2 * sent : 1})`,
            }}
          >
            ↑
          </div>
        </div>
      ) : null}
    </Shot>
  );
};

/* 15 — keynote demo of the app (light) · "joguei no Voice Studio, mandei gerar com a minha voz" */
export const S15: React.FC = () => {
  const f = useF();
  const win = spring({ frame: f - CUT.app, fps: FPS, config: { damping: 22, stiffness: 120 } });
  const drop = p01(f, wf(88), 24, E.drift);
  const landed = f >= wf(88) + 24;
  const press = f >= wf(93) && f < wf(93) + 7 ? 0.94 : 1;
  const grow = p01(f, wf(93) + 4, 44, E.reveal);
  const cur = p01(f, wf(92) - 4, 20, E.drift);
  const bars = 48;
  const done = f >= wf(93) + 50;
  return (
    <Shot from={CUT.app}>
      <Bg color={K.ice} />
      <Line text="Joguei no Voice Studio." at={wf(88)} out={wf(92) - 8} size={70} color={K.ink} y={330} stagger={5} />
      <Line text="Mandei gerar" at={wf(92)} size={84} color={K.ink} y={300} stagger={6} />
      <Line text={<>com a minha <Serif>voz.</Serif></>} at={wf(94)} size={84} color={K.ink} y={400} />
      <div
        style={{
          position: "absolute",
          left: 80,
          width: CW - 160,
          top: 620,
          height: 860,
          borderRadius: 44,
          background: "#FFFFFF",
          boxShadow: "0 40px 100px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
          transform: `translateY(${(1 - win) * 80}px)`,
          opacity: win,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "30px 36px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <LogoMark size={44} color={K.ink} />
          <Wordmark size={38} color={K.ink} />
          <div style={{ marginLeft: "auto", fontFamily: SANS, fontSize: 24, color: done ? "#1F9D55" : K.grey }}>{done ? "Pronto ✓" : landed ? "Pronto para gerar" : ""}</div>
        </div>
        <div
          style={{
            margin: 36,
            height: 260,
            borderRadius: 26,
            border: `2px ${landed ? "solid" : "dashed"} ${landed ? K.ink : "rgba(0,0,0,0.15)"}`,
            background: landed ? "rgba(0,0,0,0.03)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SANS,
            fontSize: 28,
            color: landed ? K.ink : K.grey,
          }}
        >
          {landed ? "Texto pronto · 38 s" : "Solte o texto aqui"}
        </div>
        <div style={{ position: "absolute", left: CW / 2 - 80 - 170, top: 440, width: 340, height: 104, borderRadius: 999, background: K.ink, color: K.ice, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: SANS, fontWeight: 600, fontSize: 40, transform: `scale(${press})` }}>
          <LogoMark size={40} color={K.ice} /> Gerar
        </div>
        <div style={{ position: "absolute", left: 50, right: 50, top: 590, height: 230, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {Array.from({ length: bars }, (_, k) => {
            const v = voiceHi(((k + 0.5) / bars) * VOICE_DURATION);
            const local = Math.max(0, Math.min(1, grow * 1.8 - Math.abs(k - bars / 2) / bars));
            return <div key={k} style={{ width: 8, height: 6 + v * 200 * local * (0.5 + 0.5 * Math.abs(Math.sin(k * 1.9))), borderRadius: 8, background: K.ink }} />;
          })}
        </div>
      </div>
      {/* pointer travels to "Gerar" and clicks */}
      {f >= wf(92) - 4 ? (
        <div
          style={{
            position: "absolute",
            left: 760 - 230 * cur,
            top: 1400 - 280 * cur,
            width: 46,
            height: 46,
            borderRadius: 99,
            background: "rgba(17,17,19,0.85)",
            border: "3px solid #FFFFFF",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            transform: `scale(${press})`,
          }}
        />
      ) : null}
      <Ring at={wf(93)} x={530} y={1143} maxR={120} dur={24} color={K.ink} />
      {f >= wf(88) - 2 && !landed ? (
        <div
          style={{
            position: "absolute",
            left: 120 + 300 * drop,
            top: 420 + 420 * drop - Math.sin(drop * Math.PI) * 120,
            width: 240,
            height: 150,
            borderRadius: 20,
            background: K.ink,
            padding: 22,
            boxSizing: "border-box",
            transform: `rotate(${-10 + 10 * drop}deg)`,
            boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          }}
        >
          {[0.9, 0.7, 0.8].map((w, k) => (
            <div key={k} style={{ height: 12, width: `${w * 100}%`, borderRadius: 8, background: "rgba(255,255,255,0.5)", marginBottom: 14 }} />
          ))}
        </div>
      ) : null}
    </Shot>
  );
};

/* 16 — one word on white · "e ficou perfeito." */
export const S16: React.FC = () => {
  const f = useF();
  const line = p01(f, wf(100) + 14, 30, E.reveal);
  return (
    <Shot from={CUT.perfect}>
      <Bg color={K.ice} />
      <Line text="E ficou" at={wf(98)} size={60} weight={500} color={K.grey} y={700} tracking={-0.02} stagger={5} dur={26} />
      <Line text="perfeito." at={wf(100)} size={220} serif color={K.ink} y={780} dur={40} />
      <div style={{ position: "absolute", left: CW / 2 - 260 * line, top: 1060, width: 520 * line, height: 3, borderRadius: 3, background: K.ink }} />
    </Shot>
  );
};

/* 17 — all day long, then the card · "Voice Studio. A sua voz atendendo por você. O dia inteiro, sem parar." */
export const S17: React.FC = () => {
  const f = useF();
  const dusk = p01(f, CUT.outro, ENDING - CUT.outro, E.drift);
  const e = voiceAt(f);
  const bars = [0, 1, 2, 3, 4].map((k) => spring({ frame: f - ENDING - k * 3, fps: FPS, config: { damping: 16, stiffness: 170 } }));
  const card = Math.min(1, bars[4] * 1.4);
  return (
    <>
      <Shot from={CUT.outro}>
        <Plate src="cinema/media/v17-store.mp4" kind="video" from={CUT.outro} to={ENDING} push={[1.0, 1.08]} grade="top" brightness={1 - 0.45 * dusk} rate={0.95} />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,20,60,${0.55 * dusk}) 0%, rgba(10,20,60,${0.2 * dusk}) 60%, rgba(0,0,0,0) 100%)` }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 12% at 50% 66%, rgba(255,180,90,${0.45 * dusk}) 0%, rgba(255,180,90,0) 100%)`, mixBlendMode: "screen" }} />
        <Flare x={540} y={1270} at={wf(109)} peak={wf(111)} end={ENDING} strength={0.5} />
        <div style={{ position: "absolute", left: 0, width: CW, top: 300, display: "flex", justifyContent: "center", opacity: p01(f, wf(101), 24), filter: `blur(${(1 - p01(f, wf(101), 24)) * 8}px)` }}>
          <Wordmark size={110} pVoice={p01(f, wf(101), 24)} pStudio={p01(f, wf(102), 24)} color={K.ice} />
        </div>
        <Line text="A sua voz," at={wf(103)} out={wf(109) - 6} size={72} y={480} stagger={5} />
        <Line text="atendendo por você." at={wf(106)} out={wf(109) - 6} size={72} y={565} stagger={5} />
        <Line text="O dia inteiro." at={wf(109)} size={88} y={480} stagger={6} />
        <Line text="Sem parar." at={wf(112)} size={120} serif y={580} />
      </Shot>
      <Shot from={ENDING}>
        <Bg color={K.black} />
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(255,255,255,${0.12 * card}) 0%, rgba(0,0,0,0) 45%)` }} />
        <Ring at={ENDING} x={CW / 2} y={790} maxR={1000} dur={70} width={2} />
        <div style={{ position: "absolute", left: CW / 2 - 90, top: 700, display: "flex", gap: 0 }}>
          <svg width={180} height={180} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
            {[6, 28, 50, 72, 94].map((x, k) => {
              const len = [62, 52, 42, 52, 62][k] * bars[k] * (1 + 0.25 * e);
              const cy = [33, 49, 65, 49, 33][k];
              return <rect key={k} x={x - 6} y={cy - len / 2} width={12} height={Math.max(0.1, len)} rx={6} fill={K.ice} />;
            })}
          </svg>
        </div>
        <div style={{ position: "absolute", left: 0, width: CW, top: 940, display: "flex", justifyContent: "center", opacity: card, transform: `translateY(${(1 - card) * 30}px)` }}>
          <Wordmark size={110} color={K.ice} />
        </div>
        <Line text="A sua voz. O dia inteiro." at={ENDING + 24} size={36} weight={500} color={K.grey} y={1110} tracking={-0.01} stagger={4} dur={24} />
      </Shot>
      {f >= ENDING && f < DURATION ? <AbsoluteFill style={{ background: K.ice, opacity: Math.max(0, 1 - (f - ENDING) / 7) * 0.7 }} /> : null}
    </>
  );
};
