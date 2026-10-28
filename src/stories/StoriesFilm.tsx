import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { noise2D } from "@remotion/noise";
import { FilmFinish } from "../backgrounds/Backdrop";
import { WordSourceContext } from "../typography/KineticPhrase";
import { STORY_SFX } from "./data/sfx";
import { BRAND, CEM, DURATION, ENDING, STORY_SCENES, storyDurations, type StorySceneId, type StoryTransition } from "./data/timeline";
import { display, wf } from "./data/words";
import { LOGO_Y } from "./scenes/Brand";
import { PLAYHEAD } from "./scenes/Proof";
import { STORY_COMPONENTS } from "./scenes";
import { circle, drain, flood, glitch, push, slices, spin, squeeze, zoom } from "./transitions";
import { PAL, SW } from "./theme";
import type { StoryProps } from "./kit";

const presentationFor = (kind: StoryTransition) => {
  switch (kind) {
    case "zoom":
      return zoom();
    case "push":
      return push();
    case "slices":
      return slices();
    case "circle":
      return circle(SW / 2, LOGO_Y, PAL.ember);
    case "spin":
      return spin();
    case "glitch":
      return glitch();
    case "drain":
      return drain();
    case "flood":
      return flood(PLAYHEAD.x, PLAYHEAD.y);
    case "squeeze":
      return squeeze();
  }
};

/** Camera-shake impacts (frame, amplitude px). */
const IMPACTS: [number, number][] = [
  [wf(0), 10],
  [wf(8), 14],
  [BRAND, 28],
  [wf(36), 10],
  [wf(54), 12],
  [wf(59), 14],
  [wf(62), 12],
  [wf(64), 14],
  [CEM, 44],
  [wf(77), 16],
  [wf(81), 12],
  [wf(100), 14],
  [ENDING, 26],
];

const useShake = () => {
  const f = useCurrentFrame();
  let x = 0;
  let y = 0;
  let r = 0;
  for (const [at, amp] of IMPACTS) {
    const t = f - at;
    if (t < 0 || t > 22) continue;
    const d = amp * Math.exp(-t / 6);
    x += noise2D(`sx${at}`, t * 0.35, 0) * d;
    y += noise2D(`sy${at}`, t * 0.35, 5) * d;
    r += noise2D(`sr${at}`, t * 0.3, 9) * d * 0.04;
  }
  return `translate(${x}px, ${y}px) rotate(${r}deg) scale(${1 + Math.abs(r) * 0.01 + (x || y ? 0.02 : 0)})`;
};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [DURATION - 50, DURATION - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#000", opacity: o }} />;
};

const dbToGain = (db: number) => Math.pow(10, db / 20);

export const StoriesFilm: React.FC = () => {
  const durations = storyDurations();
  const shake = useShake();
  return (
    <WordSourceContext.Provider value={{ wf, display }}>
      <AbsoluteFill style={{ backgroundColor: PAL.ink }}>
        <AbsoluteFill style={{ transform: shake }}>
          <TransitionSeries>
            {STORY_SCENES.flatMap((s, i) => {
              const Comp: React.FC<StoryProps> = STORY_COMPONENTS[s.id as StorySceneId];
              const nodes: React.ReactNode[] = [];
              if (s.enter) {
                nodes.push(
                  <TransitionSeries.Transition
                    key={`t-${s.id}`}
                    presentation={presentationFor(s.enter.kind)}
                    timing={linearTiming({ durationInFrames: s.enter.dur })}
                  />,
                );
              }
              nodes.push(
                <TransitionSeries.Sequence key={s.id} durationInFrames={durations[i]} name={s.id}>
                  <Comp start={s.start} />
                </TransitionSeries.Sequence>,
              );
              return nodes;
            })}
          </TransitionSeries>
        </AbsoluteFill>
        <FilmFinish grain={0.06} />
        <FadeOut />
        <Audio src={staticFile("stories/voice.wav")} name="voice" />
        <Audio src={staticFile("stories/music-bed.wav")} name="music-bed" />
        {STORY_SFX.map((c, k) => (
          <Sequence key={`${c.src}-${k}`} from={c.frame} layout="none" name={`sfx:${c.src.split("/").pop()}`}>
            <Audio src={staticFile(c.src)} volume={dbToGain(c.db)} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </WordSourceContext.Provider>
  );
};
