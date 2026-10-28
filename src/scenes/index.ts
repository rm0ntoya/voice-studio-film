import type React from "react";
import type { SceneDef } from "../data/timeline";
import type { SceneProps } from "./shared";
import { S01Hook } from "./S01Hook";
import { S02Imagine } from "./S02Imagine";
import { S03Reveal } from "./S03Reveal";
import { S04Create } from "./S04Create";
import { S05Channels } from "./S05Channels";
import { S06Voice } from "./S06Voice";
import { S07Call } from "./S07Call";
import { S08Proof } from "./S08Proof";
import { S09Climax } from "./S09Climax";
import { S10Process } from "./S10Process";
import { S11Perfect } from "./S11Perfect";
import { S12Outro } from "./S12Outro";

export const SCENE_COMPONENTS: Record<SceneDef["id"], React.FC<SceneProps>> = {
  hook: S01Hook,
  imagine: S02Imagine,
  reveal: S03Reveal,
  create: S04Create,
  channels: S05Channels,
  voice: S06Voice,
  call: S07Call,
  proof: S08Proof,
  climax: S09Climax,
  process: S10Process,
  perfect: S11Perfect,
  outro: S12Outro,
};
