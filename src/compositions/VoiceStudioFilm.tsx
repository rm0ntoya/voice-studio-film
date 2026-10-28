import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Soundtrack } from "../audio/Soundtrack";
import { Backdrop, FilmFinish } from "../backgrounds/Backdrop";
import { DURATION, SCENES, sceneDurations, type SceneDef } from "../data/timeline";
import { SCENE_COMPONENTS } from "../scenes";
import { collapse, dip, iris, lift, whip } from "../transitions/presentations";
import { PROOF_PLAYHEAD } from "../scenes/S08Proof";

const presentationFor = (kind: NonNullable<SceneDef["enter"]>["kind"]) => {
  switch (kind) {
    case "lift":
      return lift();
    case "whip":
      return whip();
    case "dip":
      return dip();
    case "iris":
      return iris(PROOF_PLAYHEAD.x, PROOF_PLAYHEAD.y);
    case "collapse":
      return collapse();
  }
};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [DURATION - 54, DURATION - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ background: "#000", opacity: o }} />;
};

export const VoiceStudioFilm: React.FC = () => {
  const durations = sceneDurations();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0C0B0E" }}>
      <Backdrop />
      <TransitionSeries>
        {SCENES.flatMap((s, i) => {
          const Comp = SCENE_COMPONENTS[s.id];
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
      <FilmFinish />
      <FadeOut />
      <Soundtrack />
    </AbsoluteFill>
  );
};
