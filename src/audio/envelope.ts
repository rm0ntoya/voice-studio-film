import voice from "../data/voice-envelope.json";
import music from "../data/music-envelope.json";
import plan from "../data/music-plan.json";

const sample = (arr: number[], pos: number) => {
  if (pos <= 0) return arr[0] ?? 0;
  const i = Math.floor(pos);
  if (i >= arr.length - 1) return arr[arr.length - 1] ?? 0;
  const f = pos - i;
  return arr[i] * (1 - f) + arr[i + 1] * f;
};

type VoiceEnv = { rate: number; durationSec: number; frames: number[]; hi: number[] };
type MusicEnv = { bass: number[]; full: number[] };

/** Audio-reactive lookups bound to one pre-computed envelope set (build_audio*.py). */
export const createEnvelope = (voiceRaw: unknown, musicRaw: unknown) => {
  const v = voiceRaw as VoiceEnv;
  const m = musicRaw as MusicEnv;
  const HI = v.hi;
  const RATE = v.rate;
  return {
    /** voice energy (0..1) at a given frame — smoothed, 60 fps */
    voiceAt: (frame: number) => sample(v.frames, frame),
    /** voice energy at an exact time in seconds (240 Hz resolution) */
    voiceHi: (sec: number) => sample(HI, sec * RATE),
    /** max voice energy inside [a, b] seconds — used to draw long ranges without aliasing */
    voiceMax: (a: number, b: number) => {
      const i0 = Math.max(0, Math.floor(a * RATE));
      const i1 = Math.min(HI.length - 1, Math.ceil(b * RATE));
      let mx = 0;
      for (let i = i0; i <= i1; i++) if (HI[i] > mx) mx = HI[i];
      return mx;
    },
    VOICE_DURATION: v.durationSec,
    /** music bass energy (0..1) at frame — for light breathing / beat pulses */
    bassAt: (frame: number) => sample(m.bass, frame),
    /** full-band music energy (0..1) at frame */
    musicAt: (frame: number) => sample(m.full, frame),
  };
};

export const { voiceAt, voiceHi, voiceMax, VOICE_DURATION, bassAt } = createEnvelope(voice, music);

export const MUSIC = plan;
