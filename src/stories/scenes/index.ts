import type React from "react";
import type { StorySceneId } from "../data/timeline";
import type { StoryProps } from "../kit";
import { RevealScene, ChannelsScene } from "./Brand";
import { CallScene, RapidScene } from "./Call";
import { HookScene, NightScene, SaleScene, TeamScene } from "./Intro";
import { OutroScene } from "./Outro";
import { PerfectScene, ProcessScene } from "./Process";
import { ClimaxScene, ProofScene } from "./Proof";

export const STORY_COMPONENTS: Record<StorySceneId, React.FC<StoryProps>> = {
  hook: HookScene,
  night: NightScene,
  sale: SaleScene,
  team: TeamScene,
  reveal: RevealScene,
  channels: ChannelsScene,
  call: CallScene,
  rapid: RapidScene,
  proof: ProofScene,
  climax: ClimaxScene,
  process: ProcessScene,
  perfect: PerfectScene,
  outro: OutroScene,
};
