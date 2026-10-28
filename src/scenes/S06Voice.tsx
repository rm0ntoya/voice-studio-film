import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Label, Portrait } from "../components/ui";
import { VoiceLine } from "../components/VoiceLine";
import { wf, we } from "../data/words";
import { ease } from "../motion/easing";
import { SPR } from "../motion/springs";
import { clamp01, mix, prog, spr } from "../motion/time";
import { SANS } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { minor, serifEmber, useAbs, type SceneProps } from "./shared";

const TEAM = [
  { name: "Ana", tint: C.ember },
  { name: "Bia", tint: C.iris },
  { name: "Carla", tint: C.leaf },
  { name: "Duda", tint: "#E9C46A" },
];
const CW = 296;
const CH = 360;
const GAP = 40;
const ROW_X = 960 - (TEAM.length * CW + (TEAM.length - 1) * GAP) / 2;
const ROW_Y = 432;

/** S6 — "Isso mesmo, a IA conversa falando, usando a voz de uma das suas atendentes." */
export const S06Voice: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const punchOut = we(70) + 2;

  // selection cursor: scans right→left on the stressed words, locks on "atendentes"
  const stops = [wf(75), wf(77), wf(79), wf(81)];
  const lock = wf(82);
  const targetIndex = (f: number) => {
    let idx = 3;
    stops.forEach((s, k) => {
      if (f >= s) idx = 3 - k;
    });
    return idx;
  };
  const cursorVisible = prog(abs, stops[0] - 4, 10);
  const idxNow = targetIndex(abs);
  const lastStop = [...stops].reverse().find((s) => abs >= s) ?? stops[0];
  const fromIdx = idxNow + (lastStop === stops[0] ? 0 : 1);
  const moveP = spr(abs, lastStop, SPR.snappy);
  const cursorX = ROW_X + mix(fromIdx, idxNow, moveP) * (CW + GAP);
  const locked = spr(abs, lock, SPR.pop);

  return (
    <AbsoluteFill>
      {/* the punch */}
      <KineticPhrase
        abs={abs}
        size={176}
        weight={700}
        tracking={-0.05}
        fx="slam"
        align="center"
        lines={[[69, 70]]}
        exitAt={punchOut}
        exit="blur"
        exitDur={12}
        style={{ position: "absolute", left: 0, right: 0, top: 430 }}
      />

      <KineticPhrase
        abs={abs}
        size={60}
        weight={500}
        lineHeight={1.14}
        lines={[
          [71, 72, 73, 74],
          [75, 76, 77, 78, 79, 80, 81, 82],
        ]}
        words={{
          ...minor(71, 76, 78, 79, 80),
          72: { color: C.iris, weight: 700 },
          77: serifEmber(74),
          82: { weight: 600 },
        }}
        style={{ position: "absolute", left: 120, top: 150 }}
      />

      {TEAM.map((m, k) => {
        const s = spr(abs, wf(73) + k * 5, SPR.settle);
        const isPick = k === 0;
        const dim = locked > 0.05 && !isPick ? 0.38 : 1;
        const lift = isPick ? locked * -18 : 0;
        return (
          <div
            key={m.name}
            style={{
              position: "absolute",
              left: ROW_X + k * (CW + GAP),
              top: ROW_Y + (1 - s) * 90 + lift,
              width: CW,
              height: CH,
              borderRadius: 28,
              background: `linear-gradient(180deg, #1C1921, ${C.ink2})`,
              border: `1px solid ${C.line}`,
              opacity: clamp01(s * 1.8) * mix(1, dim, clamp01(locked * 1.4)),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 44,
              boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
            }}
          >
            <Portrait tint={m.tint} size={150} initial={`s6${k}`} />
            <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 600, color: C.bone, marginTop: 26, letterSpacing: "-0.02em" }}>
              {m.name}
            </div>
            <Label style={{ marginTop: 8 }}>Atendente</Label>
          </div>
        );
      })}

      {/* selection cursor */}
      <div
        style={{
          position: "absolute",
          left: cursorX - 10,
          top: ROW_Y - 10 + locked * -18,
          width: CW + 20,
          height: CH + 20,
          borderRadius: 36,
          border: `${2 + 2 * locked}px solid ${C.ember}`,
          opacity: cursorVisible,
          boxShadow: `0 0 0 ${8 * locked}px ${C.ember}22`,
        }}
      />

      {/* Ana's voice flows into the AI */}
      {abs >= lock ? (
        <>
          <VoiceLine
            id="ana"
            abs={abs}
            mode="window"
            x={ROW_X + CW / 2}
            y={ROW_Y + CH + 72}
            width={interpolate(prog(abs, lock, 34, ease.inOut), [0, 1], [1, ROW_X + 4 * CW + 3 * GAP - (ROW_X + CW / 2) - 150])}
            windowSec={2}
            amp={22}
            variant="bars"
            barW={4}
            head
          />
          <div
            style={{
              position: "absolute",
              left: ROW_X + 4 * CW + 3 * GAP - 128,
              top: ROW_Y + CH + 52,
              padding: "8px 16px",
              borderRadius: 99,
              background: `${C.iris}22`,
              border: `1px solid ${C.iris}55`,
              opacity: prog(abs, lock + 22, 12),
            }}
          >
            <Label color={C.iris}>IA · voz da Ana</Label>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
