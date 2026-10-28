import React from "react";
import { AbsoluteFill } from "remotion";
import { ease } from "../../motion/easing";
import { SPR } from "../../motion/springs";
import { prog, spr } from "../../motion/time";
import { MONO, SANS, SERIF } from "../../theme/fonts";
import { C } from "../../theme/tokens";
import { LogoMark } from "../../components/Logo";
import { DrawPath, ICON } from "../../components/ui";
import { GlitchWord } from "../../typography/Glitch";
import { KineticPhrase } from "../../typography/KineticPhrase";
import { voiceAt } from "../data/envelope";
import { wf, we } from "../data/words";
import { Burst, Cam, Flash, SceneBg, Shockwave, kc, useAbs, type StoryProps } from "../kit";
import { INNER_W, PAL, SAFE, SH, ST, SW } from "../theme";

/* ------------------------------------------------------------------ S7 call
 * "O cliente liga na sua loja e quem atende é a inteligência artificial," */
const AV = { x: SW / 2, y: 1060, r: 150 };
export const CallScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const liga = wf(48);
  const atende = wf(54);
  const ia = wf(57);
  const ringing = abs >= liga && abs < atende;
  const answered = prog(abs, atende, 18, ease.enter);
  const vib = ringing ? Math.sin(abs * 2.4) * 7 * (Math.floor((abs - liga) / 18) % 2 === 0 ? 1 : 0.2) : 0;
  const orb = spr(abs, atende + 2, SPR.pop);
  const e = voiceAt(abs);
  const levels = [0.5, 0.85, 1, 0.85, 0.5].map((k, i) => e * k * (0.7 + 0.3 * Math.sin(abs * 0.45 + i * 1.3)));
  const secs = Math.max(0, Math.floor((abs - atende) / 60));
  const base = kc(abs, [
    [atende - 4, PAL.irisDeep],
    [atende + 12, "#1A0F2E"],
  ]);
  return (
    <AbsoluteFill>
      <SceneBg
        abs={abs}
        base={base}
        blobs={[
          { color: PAL.iris, x: 0.5, y: 0.55, r: 0.8, a: 0.5 * (1 - answered) + 0.15 },
          { color: PAL.ember, x: 0.5, y: 0.6, r: 0.7, a: 0.55 * answered },
          { color: PAL.nightGlow, x: 0.1, y: 0.1, r: 0.6, a: 0.6 },
        ]}
        pattern="rings"
        patternColor={answered > 0.5 ? PAL.emberSoft : PAL.iris}
        patternOpacity={0.1}
        seed="call"
      />
      <Cam abs={abs} zoom={[[start, 1.1], [atende, 1.0], [atende + 4, 1.06], [ia, 1.02], [ia + 30, 1.08]]} rot={[[start, 2], [start + 240, -1]]}>
        <div style={{ position: "absolute", left: SAFE.x, top: 300, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={ST.big}
            weight={700}
            lines={[[46, 47, 48], [49, 50, 51]]}
            words={{
              46: { color: "rgba(244,239,230,0.6)" },
              48: { font: "serif", color: PAL.iris, size: 150, fx: "pop" },
              49: { size: ST.mid, color: "rgba(244,239,230,0.6)" },
              50: { size: ST.mid, color: "rgba(244,239,230,0.6)" },
              51: { size: ST.mid },
            }}
            exitAt={wf(52) - 8}
            exit="up"
          />
        </div>
        <div style={{ position: "absolute", left: SAFE.x, top: 290, width: INNER_W }}>
          <KineticPhrase
            abs={abs}
            align="center"
            size={ST.mid}
            weight={600}
            lines={[[52, 53, 54], [55, 56, 57], [58]]}
            words={{
              52: { color: "rgba(244,239,230,0.6)" },
              54: { color: PAL.ember },
              55: { color: "rgba(244,239,230,0.6)" },
              56: { color: "rgba(244,239,230,0.6)" },
              57: { font: "serif", size: 120, color: C.bone },
              58: { size: 112, weight: 800, fx: "slam" },
            }}
          />
        </div>

        {/* status line */}
        <div style={{ position: "absolute", left: 0, width: SW, top: 790, textAlign: "center", fontFamily: MONO, fontSize: 28, letterSpacing: "0.18em", color: answered > 0.5 ? PAL.leaf : PAL.iris, opacity: prog(abs, liga - 6, 10) }}>
          {answered > 0.5 ? `EM LIGAÇÃO · 00:0${Math.min(9, secs)}` : "CHAMADA RECEBIDA"}
        </div>

        {/* ringing ripples */}
        {ringing
          ? [0, 1, 2, 3].map((k) => (
              <Shockwave key={k} abs={abs} at={liga + k * 18} x={AV.x} y={AV.y} color={PAL.iris} count={1} maxR={520} dur={40} width={5} />
            ))
          : null}
        <Shockwave abs={abs} at={atende} x={AV.x} y={AV.y} color={PAL.ember} count={3} maxR={900} dur={46} width={8} />

        {/* avatar → AI orb */}
        <div
          style={{
            position: "absolute",
            left: AV.x - AV.r,
            top: AV.y - AV.r,
            width: AV.r * 2,
            height: AV.r * 2,
            borderRadius: 999,
            transform: `translateX(${vib}px) scale(${spr(abs, liga - 10, SPR.pop) * (1 + 0.12 * e * answered)})`,
            background: answered > 0.5 ? `radial-gradient(circle at 40% 35%, ${PAL.emberSoft}, ${PAL.ember} 55%, ${PAL.emberDeep})` : "#2E2560",
            border: `4px solid ${answered > 0.5 ? "rgba(255,255,255,0.25)" : PAL.iris}`,
            boxShadow: answered > 0.5 ? `0 0 ${80 + 120 * e}px rgba(255,90,54,0.6)` : "0 30px 60px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {answered > 0.5 ? (
            <div style={{ transform: `scale(${orb})` }}>
              <LogoMark size={150} color={PAL.ink} levels={levels} />
            </div>
          ) : (
            <DrawPath d={ICON.phone} p={1} size={130} stroke={C.bone} width={2.6} />
          )}
        </div>
        <div style={{ position: "absolute", left: 0, width: SW, top: AV.y + AV.r + 36, textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: C.bone, letterSpacing: "-0.02em" }}>
            {answered > 0.5 ? (
              <>
                Assistente <span style={{ fontFamily: SERIF, fontWeight: 400, color: PAL.emberSoft }}>IA</span>
              </>
            ) : (
              "Cliente"
            )}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: "rgba(244,239,230,0.55)", letterSpacing: "0.08em", marginTop: 6 }}>
            {answered > 0.5 ? "voz da sua equipe" : "(11) 9 8765-4321"}
          </div>
        </div>

        {/* buttons → live waveform */}
        <div style={{ position: "absolute", left: 0, width: SW, top: 1420, display: "flex", justifyContent: "center", gap: 260, opacity: 1 - answered }}>
          <CallButton color="#FF4D4D" rot={135} />
          <CallButton color={PAL.leaf} rot={0} pulse={ringing ? 1 + 0.08 * Math.sin(abs * 0.5) : 1} press={abs >= atende - 4 ? 0.85 : 1} />
        </div>
        <div style={{ position: "absolute", left: 0, width: SW, top: 1440, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, height: 120, opacity: answered }}>
          {Array.from({ length: 30 }, (_, k) => {
            const v = voiceAt(abs - Math.abs(k - 15) * 2);
            return <div key={k} style={{ width: 10, height: 12 + v * 100 * (0.6 + 0.4 * Math.sin(k)), borderRadius: 9, background: k % 5 === 0 ? C.bone : PAL.ember }} />;
          })}
        </div>
      </Cam>
      <Flash abs={abs} at={atende} color={PAL.ember} dur={10} peak={0.35} />
    </AbsoluteFill>
  );
};

const CallButton: React.FC<{ color: string; rot: number; pulse?: number; press?: number }> = ({ color, rot, pulse = 1, press = 1 }) => (
  <div
    style={{
      width: 150,
      height: 150,
      borderRadius: 999,
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${pulse * press})`,
      boxShadow: `0 0 0 ${(pulse - 1) * 200}px ${color}33`,
    }}
  >
    <div style={{ transform: `rotate(${rot}deg)` }}>
      <DrawPath d={ICON.phone} p={1} size={76} stroke={PAL.ink} width={3.4} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ S8 rapid fire
 * "na hora, natural, sem robô, sem fila." — four hard-cut cards, each with its own world. */
const punchIn = (abs: number, at: number) => 1 + 0.22 * (1 - spr(abs, at, SPR.snappy));

export const RapidScene: React.FC<StoryProps> = ({ start }) => {
  const abs = useAbs(start);
  const tNatural = wf(61);
  const tRobo = wf(62);
  const tFila = wf(64);
  if (abs < tNatural) return <NaHora abs={abs} at={start} />;
  if (abs < tRobo) return <Natural abs={abs} at={tNatural} />;
  if (abs < tFila) return <SemRobo abs={abs} at={tRobo} />;
  return <SemFila abs={abs} at={tFila} />;
};

const Panel: React.FC<{ abs: number; at: number; bg: React.ReactNode; flash: string; children: React.ReactNode; rot?: number }> = ({
  abs,
  at,
  bg,
  flash,
  children,
  rot = 0,
}) => (
  <AbsoluteFill>
    {bg}
    <AbsoluteFill style={{ transform: `scale(${punchIn(abs, at)}) rotate(${rot * (1 - spr(abs, at, SPR.snappy))}deg)` }}>{children}</AbsoluteFill>
    <Flash abs={abs} at={at} color={flash} dur={6} peak={0.5} />
  </AbsoluteFill>
);

const NaHora: React.FC<{ abs: number; at: number }> = ({ abs, at }) => {
  const hand = (abs - at) * 14;
  return (
    <Panel
      abs={abs}
      at={at}
      flash={C.bone}
      rot={-6}
      bg={<SceneBg abs={abs} base={PAL.ember} blobs={[{ color: PAL.sun, x: 0.5, y: 0.4, r: 0.8, a: 0.6 }]} pattern="rays" patternColor={PAL.ink} patternOpacity={0.12} seed="nh" />}
    >
      <div style={{ position: "absolute", left: SW / 2 - 230, top: 470, width: 460, height: 460, borderRadius: 999, border: `16px solid ${PAL.ink}` }}>
        <div style={{ position: "absolute", left: 214, top: 40, width: 16, height: 190, borderRadius: 9, background: PAL.ink, transformOrigin: "50% 100%", transform: `rotate(${hand}deg)` }} />
        <div style={{ position: "absolute", left: 202, top: 202, width: 40, height: 40, borderRadius: 99, background: PAL.ink }} />
      </div>
      <div style={{ position: "absolute", left: SAFE.x, top: 1020, width: INNER_W }}>
        <KineticPhrase abs={abs} align="center" size={220} weight={800} color={PAL.ink} lines={[[59], [60]]} fx="slam" words={{ 59: { size: 120, weight: 700 } }} />
      </div>
      <div style={{ position: "absolute", left: 0, width: SW, top: 1460, textAlign: "center", fontFamily: MONO, fontSize: 30, letterSpacing: "0.18em", color: PAL.ink }}>
        ATENDE EM 0,8 S
      </div>
    </Panel>
  );
};

const Natural: React.FC<{ abs: number; at: number }> = ({ abs, at }) => {
  const draw = prog(abs, at, 30, ease.inOut);
  const pts = Array.from({ length: 60 }, (_, k) => {
    const x = (k / 59) * SW;
    const y = 1300 + Math.sin(k * 0.35 + abs * 0.12) * 70 * Math.sin((k / 59) * Math.PI);
    return `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <Panel
      abs={abs}
      at={at}
      flash={PAL.ember}
      rot={5}
      bg={<SceneBg abs={abs} base={PAL.bone} blobs={[{ color: "#FFD9C7", x: 0.2, y: 0.3, r: 0.8, a: 0.9 }, { color: "#E3DCFF", x: 0.9, y: 0.8, r: 0.7, a: 0.8 }]} seed="nat" />}
    >
      <svg width={SW} height={SH} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={pts} fill="none" stroke={PAL.ember} strokeWidth={8} strokeLinecap="round" strokeDasharray={SW * 1.4} strokeDashoffset={SW * 1.4 * (1 - draw)} />
      </svg>
      <div style={{ position: "absolute", left: 0, width: SW, top: 640, textAlign: "center" }}>
        <KineticPhrase abs={abs} align="center" size={290} font="serif" color={PAL.ink} lines={[[61]]} fx="pop" />
      </div>
    </Panel>
  );
};

const SemRobo: React.FC<{ abs: number; at: number }> = ({ abs, at }) => {
  const robo = wf(63);
  const strike = prog(abs, we(63) - 4, 10, ease.snap);
  return (
    <Panel
      abs={abs}
      at={at}
      flash={PAL.iris}
      rot={-4}
      bg={<SceneBg abs={abs} base={PAL.ink} blobs={[{ color: PAL.irisDeep, x: 0.5, y: 0.5, r: 0.8, a: 0.7 }]} pattern="grid" patternColor={PAL.iris} patternOpacity={0.12} seed="robo" />}
    >
      <div style={{ position: "absolute", left: 0, width: SW, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 150, color: "rgba(244,239,230,0.6)", letterSpacing: "-0.03em", opacity: abs >= wf(62) ? 1 : 0 }}>
        sem
      </div>
      <div style={{ position: "absolute", left: 0, width: SW, top: 790, display: "flex", justifyContent: "center", opacity: abs >= robo ? 1 : 0 }}>
        <div style={{ position: "relative" }}>
          <GlitchWord text="robô" abs={abs} from={robo} to={robo + 40} size={260} color={C.bone} intensity={1.4} />
          <div style={{ position: "absolute", left: -30, top: "52%", height: 22, width: `${strike * 112}%`, background: PAL.ember, borderRadius: 12, transform: "rotate(-8deg)", transformOrigin: "0% 50%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: SW, top: 1180, display: "flex", justifyContent: "center", gap: 14, height: 120, alignItems: "center", opacity: abs >= robo ? 1 : 0 }}>
        {Array.from({ length: 16 }, (_, k) => {
          const q = Math.round((0.3 + 0.7 * Math.abs(Math.sin(k * 1.9 + Math.floor(abs / 6)))) * 4) / 4;
          return <div key={k} style={{ width: 26, height: q * 110, background: strike > 0.5 ? "rgba(183,166,255,0.25)" : PAL.iris }} />;
        })}
      </div>
    </Panel>
  );
};

const SemFila: React.FC<{ abs: number; at: number }> = ({ abs, at }) => {
  const fila = wf(65);
  const collapse = prog(abs, fila + 4, 22, ease.inOut);
  const ok = spr(abs, fila + 20, SPR.pop);
  return (
    <Panel
      abs={abs}
      at={at}
      flash={C.bone}
      rot={6}
      bg={<SceneBg abs={abs} base={PAL.leaf} blobs={[{ color: "#B9F5D3", x: 0.5, y: 0.3, r: 0.8, a: 0.9 }]} pattern="stripes" patternColor={PAL.leafDeep} patternOpacity={0.12} seed="fila" />}
    >
      <div style={{ position: "absolute", left: SAFE.x, top: 520, width: INNER_W }}>
        <KineticPhrase abs={abs} align="center" size={240} weight={800} color={PAL.ink} lines={[[64], [65]]} fx="slam" words={{ 64: { size: 140, weight: 700 } }} />
      </div>
      <div style={{ position: "absolute", left: 0, width: SW, top: 1180, height: 200 }}>
        {Array.from({ length: 7 }, (_, k) => {
          const x0 = 110 + k * 125;
          const x = x0 + (SW / 2 - 50 - x0) * collapse;
          const o = k === 3 ? 1 : 1 - collapse;
          return (
            <div key={k} style={{ position: "absolute", left: x, top: 40 + Math.sin(abs * 0.3 + k) * 6 * (1 - collapse), width: 100, height: 100, borderRadius: 99, background: PAL.ink, opacity: o }}>
              <div style={{ position: "absolute", left: 30, top: 18, width: 40, height: 40, borderRadius: 99, background: PAL.leaf }} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: SW / 2 + 40, top: 10, transform: `scale(${ok})`, width: 80, height: 80, borderRadius: 99, background: C.bone, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DrawPath d={ICON.check} p={prog(abs, fila + 22, 12)} size={56} stroke={PAL.leafDeep} width={6} />
        </div>
      </div>
      <Burst abs={abs} at={fila + 20} x={SW / 2} y={1230} colors={[PAL.ink, C.bone, PAL.sun]} count={18} seed="fila" />
    </Panel>
  );
};

