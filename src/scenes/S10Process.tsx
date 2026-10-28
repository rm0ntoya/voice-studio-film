import React from "react";
import { AbsoluteFill } from "remotion";
import { VOICE_DURATION } from "../audio/envelope";
import { LogoMark, Wordmark } from "../components/Logo";
import { Dot, DrawPath, ICON, Label } from "../components/ui";
import { VoiceLine } from "../components/VoiceLine";
import { sceneStart } from "../data/timeline";
import { wf, we } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, mix, prog, spr } from "../motion/time";
import { MONO, SANS, SERIF } from "../theme/fonts";
import { C, SHADOW } from "../theme/tokens";
import { KineticPhrase, RevealText } from "../typography/KineticPhrase";
import { minor, serifEmber, useAbs, type SceneProps } from "./shared";

/** where the generated waveform sits on screen when S10 hands over to S11 */
export const OUT_WAVE = { x: 340, y: 790, w: 1240, amp: 34 };

const CAM_PAN = 1240;
const P1 = { x: 420, y: 300, w: 1080, h: 600 };
const APP = { x: 1540, y: 236, w: 1320, h: 680 };
const SLOT = { x: APP.x + 40, y: APP.y + 104, w: 600, h: 330 };
const DOC0 = { x: P1.x + 48, y: P1.y + 300, w: 984, h: 240 };

const PROMPT = "Escreva um texto curto apresentando o Voice Studio.";
const OUTPUT = "“Deixa eu te contar uma coisa que vai mudar o jeito que a sua loja atende os clientes…”";

/** S10 — "Eu não gravei nada. Eu pedi para uma IA escrever esse texto, joguei aqui no Voice Studio e mandei gerar com a minha voz." */
export const S10Process: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const end = sceneStart("perfect");

  // phase 1 — no microphone
  const micOut = wf(133) - 8;
  const micDraw = prog(abs, start + 10, 30, ease.inOut);
  const strike = prog(abs, wf(131), 18, ease.inOut);
  const micExit = prog(abs, micOut, 14, ease.exit);

  // camera
  const camX = mix(0, CAM_PAN, prog(abs, wf(141), 48, ease.inOut));
  const stageIn = prog(abs, wf(133) - 6, 18, ease.enter);

  // phase 2 — the AI writes
  const typeFrom = wf(134);
  const typeTo = wf(140) - 4;
  const typed = PROMPT.slice(0, Math.floor(PROMPT.length * prog(abs, typeFrom, typeTo - typeFrom, (t) => t)));
  const docIn = spr(abs, wf(140), SPR.settle);

  // phase 3 — throw into Voice Studio
  const throwP = prog(abs, wf(141) + 2, wf(145) - wf(141), ease.inOut);
  const land = spr(abs, wf(145), SPR.pop);
  const thrown = abs >= wf(141) + 2;
  const docX = mix(DOC0.x, SLOT.x + 20, throwP);
  const docY = mix(DOC0.y, SLOT.y + 70, throwP) - Math.sin(throwP * Math.PI) * 190;
  const docW = mix(DOC0.w, SLOT.w - 40, throwP);
  const docRot = Math.sin(throwP * Math.PI) * -7;
  const appIn = spr(abs, wf(141) + 10, SPR.settle);

  // phase 4 — generate
  const pressAt = wf(148);
  const press = abs >= pressAt ? 1 - 0.08 * Math.sin(Math.min(1, (abs - pressAt) / 10) * Math.PI) : 1;
  const progress = prog(abs, pressAt + 3, 22, ease.inOut);
  const waveReveal = prog(abs, pressAt + 20, we(152) - pressAt - 18, ease.inOut);
  const chromeOut = prog(abs, end - 14, 12, ease.inOut);

  const stepLabel =
    abs < wf(141) ? "01 — Escrever" : abs < wf(146) ? "02 — Enviar" : "03 — Gerar";

  return (
    <AbsoluteFill>
      {/* phase 1 */}
      <AbsoluteFill style={{ opacity: 1 - micExit, transform: `translateY(${-micExit * 60}px)` }}>
        <div style={{ position: "absolute", left: 960 - 100, top: 230 }}>
          <DrawPath d={ICON.mic} p={micDraw} size={200} stroke={C.bone} width={2.4} />
          <DrawPath d={ICON.strike} p={strike} size={200} stroke={C.ember} width={3.4} style={{ position: "absolute", left: 0, top: 0 }} />
          <div
            style={{
              position: "absolute",
              right: -18,
              top: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: prog(abs, start + 16, 10) * (abs < wf(130) ? 1 : 0.25),
            }}
          >
            <Dot color={abs < wf(130) ? C.ember : C.muted} size={12} />
            <span style={{ fontFamily: MONO, fontSize: 16, letterSpacing: "0.14em", color: C.muted }}>REC</span>
          </div>
        </div>
        <KineticPhrase
          abs={abs}
          size={92}
          weight={500}
          align="center"
          lines={[[129, 130, 131, 132]]}
          words={{ ...minor(129), 132: serifEmber(112, { color: C.bone, hollowAt: wf(132) + 12 }) }}
          style={{ position: "absolute", left: 0, right: 0, top: 500 }}
        />
      </AbsoluteFill>

      {/* fixed caption column */}
      {abs >= wf(133) - 6 ? (
        <>
          <RevealText
            key={stepLabel}
            text={stepLabel}
            at={stepLabel.startsWith("01") ? wf(133) - 4 : stepLabel.startsWith("02") ? wf(141) : wf(146)}
            abs={abs}
            size={20}
            upper
            color={C.ember}
            exitAt={end - 12}
            style={{ position: "absolute", left: 120, top: 112 }}
          />
          <KineticPhrase
            abs={abs}
            size={52}
            weight={500}
            lines={[[133, 134, 135, 136, 137, 138, 139, 140]]}
            words={{ ...minor(133, 135, 136, 139), 137: { color: C.iris, weight: 700 }, 138: { weight: 600 } }}
            exitAt={wf(141) - 6}
            exit="up"
            style={{ position: "absolute", left: 120, top: 150 }}
          />
          <KineticPhrase
            abs={abs}
            size={52}
            weight={500}
            lines={[[141, 142, 143, 144, 145]]}
            words={{ ...minor(142, 143), 141: { weight: 600 }, 145: { font: "serif", size: 60 } }}
            exitAt={wf(146) - 6}
            exit="up"
            style={{ position: "absolute", left: 120, top: 150 }}
          />
          <KineticPhrase
            abs={abs}
            size={52}
            weight={500}
            lines={[[146, 147, 148, 149, 150, 151, 152]]}
            words={{ ...minor(146, 149, 150), 148: { weight: 700 }, 152: serifEmber(64) }}
            exitAt={end - 16}
            exit="fade"
            style={{ position: "absolute", left: 120, top: 150 }}
          />
        </>
      ) : null}

      {/* world */}
      <AbsoluteFill style={{ transform: `translateX(${-camX}px)`, opacity: stageIn }}>
        {/* P1 — the AI writer */}
        <div
          style={{
            position: "absolute",
            opacity: 1 - prog(abs, wf(141) + 10, 34, ease.inOut),
            left: P1.x,
            top: P1.y + (1 - stageIn) * 40,
            width: P1.w,
            height: P1.h,
            borderRadius: 32,
            background: `linear-gradient(180deg, #1C1921, ${C.ink2})`,
            border: `1px solid ${C.line}`,
            boxShadow: SHADOW,
          }}
        >
          <div style={{ position: "absolute", left: 48, top: 40, display: "flex", alignItems: "center", gap: 12 }}>
            <Dot color={C.iris} glow />
            <Label color={C.iris}>IA · assistente de texto</Label>
          </div>
          <div
            style={{
              position: "absolute",
              right: 48,
              top: 110,
              maxWidth: 760,
              padding: "20px 26px",
              borderRadius: 24,
              borderBottomRightRadius: 8,
              background: C.ink3,
              fontFamily: SANS,
              fontSize: 30,
              color: C.bone,
              lineHeight: 1.3,
              minHeight: 40,
              opacity: prog(abs, typeFrom - 6, 8),
            }}
          >
            {typed}
            <span style={{ color: C.ember, opacity: Math.floor(abs / 14) % 2 === 0 ? 1 : 0 }}>▍</span>
          </div>
          {!thrown && abs >= wf(140) ? (
            <DocCard abs={abs} p={docIn} style={{ left: 48, top: 300, width: DOC0.w }} />
          ) : null}
        </div>

        {/* P2/P3 — the Voice Studio app */}
        <div
          style={{
            position: "absolute",
            left: APP.x,
            top: APP.y + (1 - appIn) * 50,
            width: APP.w,
            height: APP.h,
            borderRadius: 36,
            background: `linear-gradient(180deg, #1C1921, ${C.ink2})`,
            border: `1px solid ${C.line}`,
            boxShadow: SHADOW,
            opacity: clamp01(appIn * 1.5) * (1 - chromeOut),
          }}
        >
          <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 14 }}>
            <LogoMark size={40} />
            <Wordmark size={30} />
          </div>
          <Label style={{ position: "absolute", right: 40, top: 44 }}>Novo áudio</Label>
          {/* text slot */}
          <div
            style={{
              position: "absolute",
              left: SLOT.x - APP.x,
              top: SLOT.y - APP.y,
              width: SLOT.w,
              height: SLOT.h,
              borderRadius: 24,
              border: `2px dashed ${land > 0.5 && abs >= wf(145) ? C.ember : C.line}`,
            }}
          >
            <Label style={{ position: "absolute", left: 24, top: 22 }}>Texto</Label>
          </div>
          {/* voice chooser */}
          <div style={{ position: "absolute", left: 700, top: 104, width: 580 }}>
            <Label>Voz</Label>
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              {["Minha voz", "Ana", "Bia"].map((v, k) => {
                const sel = k === 0 && abs >= wf(151);
                return (
                  <div
                    key={v}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 22px",
                      borderRadius: 99,
                      border: `1.5px solid ${sel ? C.ember : C.line}`,
                      background: sel ? `${C.ember}1F` : "transparent",
                      fontFamily: SANS,
                      fontSize: 26,
                      fontWeight: 500,
                      color: k === 0 ? C.bone : C.muted,
                    }}
                  >
                    {k === 0 ? <Dot color={C.ember} size={10} /> : null}
                    {v}
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 52,
                height: 92,
                borderRadius: 99,
                background: C.ember,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                fontFamily: SANS,
                fontSize: 32,
                fontWeight: 600,
                color: C.ink,
                transform: `scale(${press})`,
                boxShadow: abs >= pressAt ? `0 0 0 ${12 * (1 - progress)}px ${C.ember}33` : "none",
              }}
            >
              <LogoMark size={30} color={C.ink} />
              {progress > 0 && progress < 1 ? "Gerando…" : progress >= 1 ? "Pronto" : "Gerar áudio"}
            </div>
            <div style={{ marginTop: 18, height: 4, borderRadius: 2, background: C.line }}>
              <div style={{ height: 4, borderRadius: 2, width: `${progress * 100}%`, background: C.ember }} />
            </div>
          </div>
          <Label style={{ position: "absolute", left: 40, top: 500 }}>Saída</Label>
        </div>

        {/* the generated voice — stays when the chrome dissolves */}
        <VoiceLine
          id="gen"
          abs={abs}
          mode="static"
          t0={0}
          t1={VOICE_DURATION}
          x={OUT_WAVE.x + CAM_PAN}
          y={OUT_WAVE.y}
          width={OUT_WAVE.w}
          amp={OUT_WAVE.amp}
          variant="bars"
          barW={4}
          points={180}
          reveal={waveReveal}
          head={false}
        />

        {/* the thrown document */}
        {thrown ? (
          <DocCard
            abs={abs}
            p={1}
            style={{
              left: docX,
              top: docY,
              width: docW,
              transform: `rotate(${docRot}deg) scale(${abs >= wf(145) ? 1 + (1 - land) * 0.04 : 1})`,
              opacity: 1 - chromeOut,
            }}
            compact={throwP}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const DocCard: React.FC<{ abs: number; p: number; style: React.CSSProperties; compact?: number }> = ({ p, style, compact = 0 }) => (
  <div
    style={{
      position: "absolute",
      padding: `${mix(26, 22, compact)}px ${mix(32, 26, compact)}px`,
      borderRadius: 22,
      background: "#26222C",
      border: `1px solid #3A3541`,
      boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
      opacity: clamp01(p * 1.6),
      transformOrigin: "50% 50%",
      ...style,
      ...(p < 1 ? { transform: `translateY(${(1 - p) * 30}px)` } : {}),
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>
      texto.txt
    </div>
    <div style={{ fontFamily: SERIF, fontSize: mix(34, 28, compact), lineHeight: 1.3, color: C.bone }}>{OUTPUT}</div>
  </div>
);
