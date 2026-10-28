import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { FilmFinish } from "../backgrounds/Backdrop";
import { CUT, DURATION } from "./data";
import { ShotClock } from "./kit";
import { CUES } from "./sfx";
import { S01, S02, S03, S04, S05, S06, S08, S09 } from "./shotsA";
import { S10, S11, S12, S13, S14, S15, S16, S17 } from "./shotsB";
import { CW, K } from "./theme";
import { blurCross, dip, iris, leak, slideUp, wipe, zoomBlur } from "./transitions";

type Enter = { t: TransitionPresentation<Record<string, unknown>>; d: number };
type ShotDef = { id: string; cut: number; C: React.FC; enter?: Enter };

/** Shot order and the transition INTO each shot (centered on its cut). No `enter` = hard cut. */
const SHOTS: ShotDef[] = [
  { id: "night", cut: CUT.night, C: S01 },
  { id: "phone", cut: CUT.phone, C: S02, enter: { t: zoomBlur(), d: 16 } },
  { id: "bag", cut: CUT.bag, C: S03, enter: { t: leak(), d: 18 } },
  { id: "team", cut: CUT.team, C: S04, enter: { t: slideUp(), d: 14 } },
  { id: "brand", cut: CUT.brand, C: S05, enter: { t: dip(K.black), d: 16 } },
  { id: "product", cut: CUT.product, C: S06, enter: { t: iris(CW / 2, 820), d: 16 } },
  { id: "grille", cut: CUT.grille, C: S08, enter: { t: zoomBlur(), d: 12 } },
  { id: "portrait", cut: CUT.portrait, C: S09, enter: { t: wipe(), d: 16 } },
  { id: "street", cut: CUT.street, C: S10, enter: { t: slideUp(), d: 14 } },
  { id: "words", cut: CUT.words, C: S11, enter: { t: dip(K.ice), d: 8 } },
  { id: "proof", cut: CUT.proof, C: S12, enter: { t: dip(K.black), d: 12 } },
  { id: "climax", cut: CUT.climax, C: S13 },
  { id: "studio", cut: CUT.studio, C: S14, enter: { t: zoomBlur(), d: 16 } },
  { id: "app", cut: CUT.app, C: S15, enter: { t: dip(K.ice), d: 14 } },
  { id: "perfect", cut: CUT.perfect, C: S16, enter: { t: blurCross(), d: 12 } },
  { id: "outro", cut: CUT.outro, C: S17, enter: { t: wipe(), d: 18 } },
];

const seqStart = (s: ShotDef) => s.cut - Math.floor((s.enter?.d ?? 0) / 2);

const dbToGain = (db: number) => Math.pow(10, db / 20);

const FadeOut: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [DURATION - 45, DURATION - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#000", opacity: o }} />;
};

export const CinemaFilm: React.FC = () => (
  <AbsoluteFill style={{ background: K.black }}>
    <TransitionSeries>
      {SHOTS.flatMap((s, i) => {
        const next = SHOTS[i + 1];
        const start = seqStart(s);
        const dur = next ? seqStart(next) - start + (next.enter?.d ?? 0) : DURATION - start;
        const nodes: React.ReactNode[] = [];
        if (s.enter) {
          nodes.push(<TransitionSeries.Transition key={`t-${s.id}`} presentation={s.enter.t} timing={linearTiming({ durationInFrames: s.enter.d })} />);
        }
        nodes.push(
          <TransitionSeries.Sequence key={s.id} durationInFrames={dur} name={s.id}>
            <ShotClock.Provider value={start}>
              <s.C />
            </ShotClock.Provider>
          </TransitionSeries.Sequence>,
        );
        return nodes;
      })}
    </TransitionSeries>
    <FilmFinish grain={0.035} vignette={false} />
    <FadeOut />
    <Audio src={staticFile("cinema/voice.wav")} name="voice" />
    <Audio src={staticFile("cinema/music-bed.wav")} name="score" />
    {CUES.map((c, k) => (
      <Sequence key={`${c.src}-${k}`} from={c.frame} layout="none" name={`sfx:${c.src.split("/").pop()}`}>
        <Audio src={staticFile(c.src)} volume={dbToGain(c.db)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
