import React from "react";
import { LOCKUP } from "../scenes/shared";
import { LogoMark, Wordmark } from "./Logo";

/**
 * Brand lockup positioned on the shared LOCKUP geometry so S3, S4 and S12
 * render the exact same pixels at the same transform (seamless FLIP handoffs).
 *
 * markShift: 0 = mark sits in its lockup slot, 1 = mark sits at screen center
 * (used before the wordmark exists).
 */
export const Lockup: React.FC<{
  spread: number;
  formation: number;
  levels?: number[];
  pVoice: number;
  pStudio: number;
  markShift?: number;
  markDy?: number;
  flip?: number;
  opacity?: number;
}> = ({ spread, formation, levels, pVoice, pStudio, markShift = 0, markDy = 0, flip = 0, opacity = 1 }) => {
  const left = LOCKUP.center.x - LOCKUP.width / 2;
  const cy = LOCKUP.center.y;
  const markSlotCx = left + LOCKUP.markSize / 2;
  const markCx = markSlotCx + (960 - markSlotCx) * markShift;

  const h = LOCKUP.header;
  const dx = (h.left - left) * flip;
  const dy = (h.y - cy) * flip;
  const s = 1 + (h.scale - 1) * flip;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${dx}px, ${dy}px) scale(${s})`,
        transformOrigin: `${left}px ${cy}px`,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: markCx - LOCKUP.markSize / 2,
          top: cy - LOCKUP.markSize / 2 + markDy,
        }}
      >
        <LogoMark size={LOCKUP.markSize} spread={spread} formation={formation} levels={levels} />
      </div>
      <Wordmark
        size={LOCKUP.wordSize}
        pVoice={pVoice}
        pStudio={pStudio}
        style={{
          position: "absolute",
          left: left + LOCKUP.markSize + LOCKUP.gap,
          top: cy - LOCKUP.wordSize * 0.56,
        }}
      />
    </div>
  );
};
