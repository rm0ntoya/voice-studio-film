import React from "react";
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { SFX_CUES } from "../data/sfx";

const dbToGain = (db: number) => Math.pow(10, db / 20);

/** Voice (priority), the pre-ducked music bed, and word-anchored SFX cues. */
export const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("audio/voice.wav")} name="voice" />
    <Audio src={staticFile("audio/music-bed.wav")} name="music-bed" />
    {SFX_CUES.map((c, k) => (
      <Sequence key={`${c.file}-${k}`} from={c.frame} layout="none" name={`sfx:${c.file}`}>
        <Audio src={staticFile(`audio/sfx/${c.file}.wav`)} volume={dbToGain(c.db)} />
      </Sequence>
    ))}
  </>
);
