import React from "react";
import { AbsoluteFill } from "remotion";
import { Label } from "../components/ui";
import { VoiceLine } from "../components/VoiceLine";
import { anchor, wf } from "../data/words";
import { ease } from "../motion/easing";
import { mix, prog } from "../motion/time";
import { MONO } from "../theme/fonts";
import { C } from "../theme/tokens";
import { KineticPhrase } from "../typography/KineticPhrase";
import { minor, useAbs, type SceneProps } from "./shared";

/** the playhead stays pinned here while the camera pushes in — the iris opens from it */
export const PROOF_PLAYHEAD = { x: 1340, y: 660 };
const LINE_X = 160;

const timecode = (sec: number) =>
  `00:${String(Math.floor(sec)).padStart(2, "0")}.${String(Math.floor((sec % 1) * 100)).padStart(2, "0")}`;

/** S8 — "E para te provar que isso é de verdade, esse áudio que você está escutando agora foi…" */
export const S08Proof: React.FC<SceneProps> = ({ start }) => {
  const abs = useAbs(start);
  const esse = wf(116);
  const agora = wf(122);
  const drop = anchor("cem");

  // anticipation: a slow push toward the playhead, accelerating into the drop
  const push = prog(abs, esse, drop - esse, ease.inOut);
  const cam = mix(1, 1.16, push);
  const tension = prog(abs, esse, drop - esse, (t) => t * t);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${cam})`,
          transformOrigin: `${PROOF_PLAYHEAD.x}px ${PROOF_PLAYHEAD.y}px`,
        }}
      >
        <KineticPhrase
          abs={abs}
          size={62}
          weight={400}
          align="center"
          lineHeight={1.14}
          lines={[
            [107, 108, 109, 110, 111],
            [112, 113, 114, 115],
          ]}
          words={{
            ...minor(107, 108, 109, 111, 113),
            114: { font: "serif", size: 78 },
            115: { font: "serif", size: 78 },
          }}
          exitAt={esse - 8}
          exit="blur"
          style={{ position: "absolute", left: 0, right: 0, top: 260 }}
        />

        <KineticPhrase
          abs={abs}
          size={60}
          weight={500}
          align="center"
          lineHeight={1.2}
          lines={[[116, 117, 118, 119, 120, 121, 122], [123]]}
          words={{
            ...minor(118, 120),
            117: { font: "serif", color: C.ember, size: 74 },
            122: { color: C.ember, weight: 600 },
            123: { size: 72, weight: 600 },
          }}
          style={{ position: "absolute", left: 0, right: 0, top: 300 }}
        />

        <Label style={{ position: "absolute", left: LINE_X, top: PROOF_PLAYHEAD.y - 96, opacity: prog(abs, start + 20, 20) }}>
          Áudio · este vídeo
        </Label>
        <VoiceLine
          id="proof"
          abs={abs}
          mode="window"
          x={LINE_X}
          y={PROOF_PLAYHEAD.y}
          width={PROOF_PLAYHEAD.x - LINE_X}
          windowSec={4.2}
          amp={70 + 26 * tension}
          variant="bars"
          barW={6}
          baseline={0}
          opacity={prog(abs, start + 12, 24)}
        />
        {/* the future: still silent */}
        <div
          style={{
            position: "absolute",
            left: PROOF_PLAYHEAD.x + 22,
            top: PROOF_PLAYHEAD.y - 1,
            height: 2,
            width: (1800 - PROOF_PLAYHEAD.x - 22) * prog(abs, start + 12, 40, ease.inOut),
            background: `repeating-linear-gradient(90deg, ${C.line} 0 6px, transparent 6px 12px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: PROOF_PLAYHEAD.x - 120,
            width: 240,
            top: PROOF_PLAYHEAD.y + 66,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: "0.1em",
            color: abs >= agora ? C.ember : C.muted,
            opacity: prog(abs, start + 20, 20),
          }}
        >
          {timecode(abs / 60)}
        </div>
        <Label
          color={C.ember}
          style={{
            position: "absolute",
            left: PROOF_PLAYHEAD.x - 100,
            width: 200,
            textAlign: "center",
            top: PROOF_PLAYHEAD.y - 132,
            opacity: prog(abs, agora, 10),
            transform: `translateY(${(1 - prog(abs, agora, 14)) * 12}px)`,
          }}
        >
          ● agora
        </Label>
      </AbsoluteFill>

      {/* tension: the world darkens around the playhead */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(${mix(1400, 620, tension)}px circle at ${PROOF_PLAYHEAD.x}px ${PROOF_PLAYHEAD.y}px, rgba(0,0,0,0) 30%, rgba(0,0,0,${0.55 * tension}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
