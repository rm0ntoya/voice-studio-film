import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { bassAt } from "../audio/envelope";
import { LIGHTS } from "../data/timeline";
import { ease } from "../motion/easing";
import { C, H, W } from "../theme/tokens";

const lightAt = (frame: number) => {
  const fs = LIGHTS.map((l) => l.f);
  const pick = (k: "x" | "y" | "r" | "a") =>
    interpolate(frame, fs, LIGHTS.map((l) => l[k]), {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.inOut,
    });
  return { x: pick("x"), y: pick("y"), r: pick("r"), a: pick("a") };
};

/** Ink stage + a moving ember light pool that breathes with the music's bass. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const L = lightAt(frame);
  const a = L.a * (1 + 0.32 * bassAt(frame));
  const R = L.r * W;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(${R}px circle at ${L.x * W}px ${L.y * H}px, rgba(255,90,54,${a}) 0%, rgba(255,90,54,${a * 0.38}) 38%, rgba(255,90,54,0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const TILES = Array.from({ length: 8 }, (_, k) => staticFile(`textures/grain-${k}.png`));

/** Deterministic film grain (pre-generated seeded tiles, 30 fps cadence) + vignette. */
export const FilmFinish: React.FC<{ grain?: number; vignette?: boolean }> = ({ grain = 0.055, vignette = true }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 2) % TILES.length;
  const ox = (k * 97) % 256;
  const oy = (k * 53) % 256;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* hidden preloads so Remotion waits for every tile before the first capture */}
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
        {TILES.map((t) => (
          <Img key={t} src={t} />
        ))}
      </div>
      {vignette ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${TILES[k]})`,
          backgroundSize: "256px 256px",
          backgroundPosition: `${ox}px ${oy}px`,
          opacity: grain,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
