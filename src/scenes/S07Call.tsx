import React from "react";
import { AbsoluteFill } from "remotion";
import { Dot, DrawPath, ICON, Label, Portrait } from "../components/ui";
import { VoiceLine } from "../components/VoiceLine";
import { wf } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, mix, prog, spr } from "../motion/time";
import { MONO, SANS } from "../theme/fonts";
import { C, SHADOW } from "../theme/tokens";
import { GlitchWord, StutterText } from "../typography/Glitch";
import { KineticPhrase } from "../typography/KineticPhrase";
import { minor, serifEmber, useAbs, type SceneProps } from "./shared";

const CARD = { x: 1110, y: 176, w: 640, h: 728 };
const AV = { cx: CARD.x + CARD.w / 2, cy: CARD.y + 250 };

const plusPolygon = (cx: number, cy: number, L: number, t: number) =>
  `polygon(${[
    [cx - t, cy - L], [cx + t, cy - L], [cx + t, cy - t], [cx + L, cy - t], [cx + L, cy + t], [cx + t, cy + t],
    [cx + t, cy + L], [cx - t, cy + L], [cx - t, cy + t], [cx - L, cy + t], [cx - L, cy - t], [cx - t, cy - t],
  ]
    .map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`)
    .join(", ")})`;

/** S7 — "E tem mais, quando o cliente liga… natural, na hora, sem robô, sem aquela voz travada." */
export const S07Call: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);

  // phase A — the "+" of "mais" becomes the mask that opens the call
  const plusIn = spr(abs, wf(85), SPR.pop);
  const expandStart = wf(86) - 12;
  const ex = prog(abs, expandStart, 20, ease.snap);
  const k = 1 + ex * 60;
  const L = 130 * plusIn * k;
  const T = 19 * plusIn * k;
  const plusRot = (1 - plusIn) * -90;
  const plusFill = 1 - prog(abs, expandStart, 8);
  const opened = abs >= expandStart;
  const clip = ex >= 0.999 ? undefined : plusPolygon(960, 560, opened ? L : 0, opened ? T : 0);

  // phase B — the call
  const ringFrom = wf(89);
  const accept = wf(97);
  const answered = abs >= accept + 4;
  const press = abs >= accept ? 1 - 0.12 * Math.sin(Math.min(1, (abs - accept) / 10) * Math.PI) : 1;
  const buttonsOut = prog(abs, accept + 8, 12, ease.exit);
  const callIn = spr(abs, expandStart - 2, SPR.settle);
  const callSecs = Math.max(0, Math.floor((abs - accept) / 60));

  // phase timing for the left column
  const bOut = wf(98) - 8;
  const cOut = wf(101) - 6;
  const robotFrom = wf(101);
  const strikeAt = wf(106) + 24;
  const strike = prog(abs, strikeAt, 16, ease.inOut);
  const robotFade = prog(abs, strikeAt + 14, 16, ease.exit);

  return (
    <AbsoluteFill>
      {/* phase A */}
      <KineticPhrase
        abs={abs}
        size={56}
        weight={400}
        color={C.muted}
        align="center"
        fx="fade"
        lines={[[83, 84, 85]]}
        words={{ 85: { color: C.bone, weight: 600 } }}
        exitAt={expandStart}
        exit="blur"
        style={{ position: "absolute", left: 0, right: 0, top: 300 }}
      />

      {/* phase B+ — everything that lives inside the plus */}
      <AbsoluteFill style={{ clipPath: clip }}>
        <AbsoluteFill style={{ background: "#121016" }} />
        <AbsoluteFill
          style={{ background: `radial-gradient(900px circle at ${AV.cx}px ${AV.cy}px, rgba(255,90,54,0.2), rgba(255,90,54,0) 70%)` }}
        />

        <KineticPhrase
          abs={abs}
          size={70}
          weight={500}
          lineHeight={1.12}
          lines={[
            [86, 87, 88, 89],
            [90, 91, 92, 93],
            [94, 95, 96, 97],
          ]}
          words={{ ...minor(87, 90, 91, 96), 89: { weight: 700 }, 97: serifEmber(92, { fx: "pop" }) }}
          exitAt={bOut}
          exit="up"
          style={{ position: "absolute", left: 120, top: 330 }}
        />

        {/* phase C — natural, na hora */}
        <KineticPhrase
          abs={abs}
          size={156}
          lineHeight={1}
          lines={[[98], [99, 100]]}
          words={{
            98: serifEmber(176, { fx: "pop" }),
            99: { weight: 700, fx: "instant", tracking: -0.05 },
            100: { weight: 700, fx: "instant", tracking: -0.05 },
          }}
          exitAt={cOut}
          exit="blur"
          style={{ position: "absolute", left: 112, top: 300 }}
        />

        {/* phase D — the robot it is not */}
        {abs >= robotFrom ? (
          <div style={{ position: "absolute", left: 120, top: 268, opacity: 1 - robotFade }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 30, height: 120, opacity: prog(abs, robotFrom, 6) }}>
              <span style={{ fontFamily: SANS, fontSize: 92, fontWeight: 500, color: "rgba(244,239,230,0.52)", letterSpacing: "-0.03em" }}>sem</span>
              {abs >= wf(102) ? <GlitchWord text="robô" abs={abs} from={wf(102)} to={wf(102) + 30} size={104} /> : null}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 26, height: 120, marginTop: 18 }}>
              {[103, 104, 105].map((i) =>
                abs >= wf(i) ? (
                  <span
                    key={i}
                    style={{
                      fontFamily: SANS,
                      fontSize: 92,
                      fontWeight: 500,
                      color: i === 105 ? C.bone : "rgba(244,239,230,0.52)",
                      letterSpacing: "-0.03em",
                      opacity: prog(abs, wf(i), 6),
                    }}
                  >
                    {i === 103 ? "sem" : i === 104 ? "aquela" : "voz"}
                  </span>
                ) : null,
              )}
            </div>
            <div style={{ position: "relative", marginTop: 26, height: 130 }}>
              <StutterText text="travada" abs={abs} from={wf(106)} to={wf(106) + 26} size={128} />
              <div
                style={{
                  position: "absolute",
                  left: -8,
                  top: 62,
                  height: 8,
                  width: 560 * strike,
                  background: C.ember,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        ) : null}
        {abs >= robotFrom ? (
          <VoiceLine
            id="robot"
            abs={abs}
            mode="window"
            x={120}
            y={858}
            width={820}
            windowSec={2.2}
            amp={40}
            variant="bars"
            barW={8}
            quantize={1}
            jitter={0.8}
            head={false}
            color={C.muted}
            opacity={prog(abs, robotFrom, 10) * (1 - robotFade)}
          />
        ) : null}

        {/* the call card */}
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            borderRadius: 40,
            background: `linear-gradient(180deg, #1C1921, ${C.ink2})`,
            border: `1px solid ${C.line}`,
            boxShadow: SHADOW,
            opacity: clamp01(callIn * 1.6),
            transform: `translateX(${(1 - callIn) * 90}px)`,
          }}
        >
          <div style={{ position: "absolute", left: 40, top: 38, display: "flex", alignItems: "center", gap: 12 }}>
            <Dot color={answered ? C.iris : C.leaf} glow />
            <Label color={answered ? C.iris : C.leaf}>
              {answered ? `Em chamada · 00:${String(callSecs).padStart(2, "0")}` : abs >= ringFrom ? "Chamada recebida" : "Sua loja · telefone"}
            </Label>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
            <div style={{ fontFamily: SANS, fontSize: 46, fontWeight: 600, color: C.bone, letterSpacing: "-0.02em" }}>Cliente</div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: C.muted, letterSpacing: "0.1em", marginTop: 8 }}>+55 31 9 ••••-2048</div>
          </div>
          {answered ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 488, display: "flex", justifyContent: "center", opacity: prog(abs, accept + 10, 14) }}>
              <div style={{ padding: "10px 20px", borderRadius: 99, background: `${C.iris}1F`, border: `1px solid ${C.iris}55` }}>
                <Label color={C.iris}>Atendido por IA · voz da Ana</Label>
              </div>
            </div>
          ) : null}
          {/* buttons */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", gap: 120, opacity: 1 - buttonsOut }}>
            <div style={{ width: 108, height: 108, borderRadius: 99, background: C.ink3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DrawPath d={ICON.phone} p={1} size={48} stroke={C.muted} width={3.2} style={{ transform: "rotate(135deg)" }} />
            </div>
            <div
              style={{
                width: 108,
                height: 108,
                borderRadius: 99,
                background: C.leaf,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${press * (abs >= ringFrom && abs < accept ? 1 + 0.05 * Math.sin((abs - ringFrom) / 4.3) : 1)})`,
                boxShadow: `0 0 0 ${abs >= ringFrom && abs < accept ? 14 : 0}px ${C.leaf}22`,
              }}
            >
              <DrawPath d={ICON.phone} p={1} size={48} stroke={C.ink} width={3.4} />
            </div>
          </div>
        </div>

        {/* ringing ripples around the caller */}
        {[0, 1, 2].map((r) => {
          const period = 54;
          const local = abs - ringFrom - r * 18;
          if (local < 0 || abs > accept + 20) return null;
          const ph = (local % period) / period;
          const fadeAll = 1 - prog(abs, accept, 18);
          return (
            <div
              key={r}
              style={{
                position: "absolute",
                left: AV.cx - (100 + ph * 120),
                top: AV.cy - (100 + ph * 120),
                width: 2 * (100 + ph * 120),
                height: 2 * (100 + ph * 120),
                borderRadius: 999,
                border: `2px solid ${C.leaf}`,
                opacity: (1 - ph) * 0.55 * fadeAll,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: AV.cx - 100,
            top: AV.cy - 100,
            opacity: clamp01(callIn * 1.6),
            transform: `translateX(${(1 - callIn) * 90}px) scale(${abs >= accept ? mix(1, 0.92, prog(abs, accept, 14)) : 1})`,
          }}
        >
          <Portrait tint={C.iris} size={200} initial="caller" />
        </div>
        {answered ? (
          <VoiceLine
            id="call"
            abs={abs}
            mode="window"
            x={CARD.x + 60}
            y={CARD.y + CARD.h - 122}
            width={CARD.w - 120}
            windowSec={2.2}
            amp={34}
            variant="bars"
            barW={5}
            head={false}
            opacity={prog(abs, accept + 14, 14)}
          />
        ) : null}
      </AbsoluteFill>

      {/* ember edge of the opening plus — makes the shape wipe legible */}
      {opened && ex < 0.999 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <polygon
            points={plusPolygon(960, 560, L, T).replace(/polygon\(|\)|px/g, "").replace(/,/g, " ")}
            fill="none"
            stroke={C.ember}
            strokeWidth={4}
            opacity={1 - ex}
          />
        </svg>
      ) : null}

      {/* the ember "+" itself, which dissolves as it opens */}
      {plusFill > 0.001 && abs >= wf(85) ? (
        <AbsoluteFill
          style={{
            clipPath: plusPolygon(960, 560, L, T),
            background: C.ember,
            opacity: plusFill,
            transform: `rotate(${plusRot}deg)`,
            transformOrigin: "960px 560px",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
