import voice from "./data/voice-envelope.json";
import music from "./data/music-envelope.json";
import plan from "./data/music-plan.json";
import { createEnvelope } from "../audio/envelope";
import { FPS } from "../theme/tokens";
import { anchor, we, wf } from "../stories/data/words";

/** Same narration (and alignment) as the Stories cut; score + envelopes are the Cinema mix. */
export { anchor, we, wf };
export const { voiceAt, voiceHi, voiceMax, VOICE_DURATION, bassAt } = createEnvelope(voice, music);

export const BRAND = anchor("brandVoice");
export const CEM = anchor("cem");
export const SILENCE = Math.round(plan.silenceAt * FPS);
export const ENDING = Math.round(plan.endingDownbeat * FPS);
export const DURATION = Math.round((plan.endingDownbeat + 3.0) * FPS);

/** Shot cut points (absolute frames), each just ahead of the phrase it belongs to. */
export const CUT = {
  night: 0,
  phone: wf(9) - 6,
  bag: wf(14) - 4,
  team: wf(18) - 4,
  brand: wf(24) - 8,
  product: wf(29) - 4,
  grille: wf(37) - 4,
  portrait: wf(40) - 4,
  street: wf(46) - 4,
  call: wf(54) - 2,
  words: wf(59) - 3,
  proof: wf(66) - 6,
  climax: CEM,
  studio: wf(78) - 6,
  prompt: wf(82) - 4,
  app: wf(88) - 6,
  perfect: wf(98) - 4,
  outro: wf(101) - 6,
  card: ENDING,
} as const;
