import voice from "./voice-envelope.json";
import music from "./music-envelope.json";
import plan from "./music-plan.json";
import { createEnvelope } from "../../audio/envelope";

export const { voiceAt, voiceHi, voiceMax, VOICE_DURATION, bassAt, musicAt } = createEnvelope(voice, music);
export const PLAN = plan;
