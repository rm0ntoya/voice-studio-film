# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = [
#   "numpy<2.3",
#   "scipy",
#   "soundfile",
#   "pyloudnorm",
# ]
# ///
"""
Audio production for the vertical (Stories) cut — same DSP toolkit as build_audio.py,
re-edited to the 40 s narration.

  public/stories/voice.wav          narration (48 kHz, high-passed copy)
  public/stories/music-bed.wav      vol-12 re-edited to the narration:
                                      - track intro from frame 0, groove downbeat on "Voice"
                                      - LPF sweep + suck-out on "E esse áudio … agora?"
                                      - drop returns on "100%"
                                      - button ending: the track's own final hit 7 bars later
                                    then side-chain ducked + mid-band carved under the voice.
  public/stories/sfx/*.wav          stories-only synth cues (tension length, swipes, pops, ticks)
  src/stories/data/*.json           voice / music envelopes + music plan

Shared SFX (public/audio/sfx) come from build_audio.py and are reused as-is.

Run:  uv run scripts/build_audio_stories.py
"""
import json
from pathlib import Path

import numpy as np
import pyloudnorm as pyln

from build_audio import (
    BAR, BEAT, FPS, MUSIC_SRC, N, SR, TRACK_DROP_DOWNBEAT, TRACK_FINAL_HIT, TRACK_GROOVE_DOWNBEAT,
    blip_seq, butter, butter_zero_phase, decode, drone, env_follow, fade, heartbeat, peak_norm,
    riser, stereo, swept_filter, t_axis, whoosh, write,
)

ROOT = Path(__file__).resolve().parent.parent
VOICE_SRC = ROOT / "work/stories/voice-original.mp3"
OUT = ROOT / "public/stories"
DATA = ROOT / "src/stories/data"
RETURN_BARS = 7
STAGE_LU = 7.0  # music sits this far under the voice before ducking


def load_anchors() -> dict[str, float]:
    words = json.load(open(DATA / "words.json", encoding="utf-8"))
    anchors = json.load(open(DATA / "anchors.json", encoding="utf-8"))
    out = {}
    for name, a in anchors.items():
        if name.startswith("_"):
            continue
        w = words[a["word"]]
        out[name] = (w["startMs"] if a["edge"] == "start" else w["endMs"]) / 1000
    return out


# ------------------------------------------------------------ stories-only synth
def swipe_up(dur=0.38, seed=21):
    """Short airy upward swish for vertical push transitions."""
    t = t_axis(dur)
    p = t / dur
    rng = np.random.default_rng(seed)
    n = butter(rng.standard_normal(len(t)), "bandpass", [700, 9000])
    sweep = np.sin(2 * np.pi * np.cumsum(300 + 2400 * p ** 1.6) / SR) * 0.12
    amp = np.sin(np.pi * p) ** 1.6 * (0.4 + 0.6 * p)
    return peak_norm(fade(stereo((n + sweep) * amp), 0.004, 0.02))


def pop(freq=N["G5"], seed=22):
    """Bubbly pop: fast pitch drop + tiny noise transient."""
    dur = 0.22
    t = t_axis(dur)
    f = freq * (1 + 1.4 * np.exp(-t / 0.012))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045)
    rng = np.random.default_rng(seed)
    x += butter(rng.standard_normal(len(t)), "highpass", 3000) * np.exp(-t / 0.003) * 0.25
    return peak_norm(fade(stereo(x), 0.0005, 0.02), -3)


def tick(seed=23):
    dur = 0.08
    t = t_axis(dur)
    rng = np.random.default_rng(seed)
    x = butter(rng.standard_normal(len(t)), "bandpass", [2500, 7000]) * np.exp(-t / 0.006)
    x += np.sin(2 * np.pi * N["C6"] * t) * np.exp(-t / 0.012) * 0.4
    return peak_norm(fade(stereo(x), 0.0002, 0.01), -4)


def punch(seed=24):
    """Tight kick + body for word slams (shorter than sub-boom)."""
    dur = 0.6
    t = t_axis(dur)
    f = N["C2"] + 140 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) * (1 - np.exp(-t / 0.001))
    rng = np.random.default_rng(seed)
    x += butter(rng.standard_normal(len(t)), "highpass", 2000) * np.exp(-t / 0.005) * 0.3
    return peak_norm(fade(stereo(np.tanh(2.2 * x)), 0.0003, 0.04))


def notify():
    """Message-in chime (two-note, C major)."""
    return blip_seq(["E6", "C7"], step=0.075, decay=0.14, wet=0.25)


def cash():
    """Sale confirmed: bright arpeggio + shaker."""
    x = blip_seq(["C6", "E6", "G6", "C7"], step=0.045, decay=0.12, wet=0.3)
    return peak_norm(x)


def tape_stop(dur=0.5, seed=25):
    """Pitch-falling tone for 'sem robô' / power-down."""
    t = t_axis(dur)
    f = N["C5"] * (1 - 0.85 * (t / dur) ** 0.7)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5
    x = butter(x, "lowpass", 3200) * np.clip(1 - t / dur, 0, 1)
    return peak_norm(fade(stereo(x), 0.002, 0.02), -3)


# ------------------------------------------------------------ main
def main() -> None:
    A = load_anchors()
    offset = A["brandVoice"] - TRACK_GROOVE_DOWNBEAT     # video t = track τ + offset (negative)
    t_return = A["cem"]
    t_end_downbeat = t_return + RETURN_BARS * BAR
    print(f"offset {offset:.3f}s | drop {t_return:.3f}s | ending {t_end_downbeat:.3f}s | speechEnd {A['speechEnd']:.3f}s")

    voice = decode(VOICE_SRC, 1)
    voice = butter(voice, "highpass", 70, order=2).astype(np.float32)
    write(OUT / "voice.wav", voice)
    total = t_end_downbeat + 3.2
    n_total = int(total * SR)
    v_full = np.zeros(n_total, dtype=np.float32)
    v_full[: len(voice)] = voice

    track = decode(MUSIC_SRC, 2)
    bed = np.zeros((n_total, 2), dtype=np.float32)

    def place(tau0: float, tau1: float, t0: float, fin=0.003, fout=0.003):
        a, b = int(tau0 * SR), int(tau1 * SR)
        seg = fade(track[a:b].copy(), fin, fout)
        s = int(t0 * SR)
        e = min(n_total, s + len(seg))
        bed[s:e] += seg[: e - s]

    # A: intro (starting mid-intro so the groove lands on "Voice") until the suck-out
    seg_a_end = A["agoraEnd"] + 0.04
    place(-offset, seg_a_end - offset, 0.0, fin=0.03, fout=0.01)

    tt = np.arange(n_total) / SR
    s0, s1 = A["sweepStart"], A["agoraEnd"]
    p = np.clip((tt - s0) / (s1 - s0), 0, 1)
    cutoff = 18000 * (650 / 18000) ** (p ** 0.8)
    region = slice(int((s0 - 0.2) * SR), int(seg_a_end * SR))
    bed[region] = swept_filter(bed[region], cutoff[region])
    g = 10 ** (-5 * p / 20)
    fo0, fo1 = A["agoraStart"], A["agoraEnd"]
    q = np.clip((tt - fo0) / (fo1 - fo0), 0, 1)
    g *= np.cos(q * np.pi / 2) ** 2
    g[tt >= fo1] = 0
    bed *= g[:, None].astype(np.float32)

    # B: full groove returns on "100%"; C: the track's own ending hit
    place(TRACK_DROP_DOWNBEAT, TRACK_DROP_DOWNBEAT + RETURN_BARS * BAR + 0.012, t_return, fin=0.002, fout=0.012)
    place(TRACK_FINAL_HIT, TRACK_FINAL_HIT + 3.0, t_end_downbeat, fin=0.012, fout=0.4)

    # envelopes (pre-duck) for audio-reactive visuals
    hop = SR // FPS
    frames = n_total // hop
    mono = bed.mean(axis=1)
    bass = butter(mono, "lowpass", 150)

    def frame_rms(x):
        return np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(frames)])

    def norm01(db, lo, hi):
        return np.clip((db - lo) / (hi - lo), 0, 1)

    m_full = norm01(20 * np.log10(frame_rms(mono)), -42, -14)
    m_bass = env_follow(norm01(20 * np.log10(frame_rms(bass)), -44, -16), 0.01, 0.18, FPS)
    json.dump({"fps": FPS, "bass": [round(float(v), 3) for v in m_bass],
               "full": [round(float(v), 3) for v in m_full]},
              open(DATA / "music-envelope.json", "w"))

    hop_hi = SR // 240
    n_hi = n_total // hop_hi
    v_rms_hi = np.array([np.sqrt(np.mean(v_full[i * hop_hi:(i + 1) * hop_hi] ** 2) + 1e-12) for i in range(n_hi)])
    v_db_hi = 20 * np.log10(v_rms_hi)
    v_hi = env_follow(np.clip((v_db_hi + 52) / 40, 0, 1), 0.006, 0.06, 240)
    v_frames = np.array([v_hi[i * 4:(i + 1) * 4].max() for i in range(n_hi // 4)])
    json.dump({"fps": FPS, "rate": 240, "durationSec": round(len(voice) / SR, 3),
               "frames": [round(float(v), 3) for v in v_frames],
               "hi": [round(float(v), 3) for v in v_hi]},
              open(DATA / "voice-envelope.json", "w"))

    meter = pyln.Meter(SR)
    l_voice = meter.integrated_loudness(voice.astype(np.float64))
    groove = bed[int(A["brandVoice"] * SR): int(A["sweepStart"] * SR)]
    l_music = meter.integrated_loudness(groove.astype(np.float64))
    stage_gain = 10 ** (((l_voice - STAGE_LU) - l_music) / 20)
    bed *= stage_gain

    v_sc = env_follow(np.clip((v_db_hi + 46) / 22, 0, 1), 0.02, 0.32, 240)
    sc = np.interp(tt, np.arange(n_hi) / 240, v_sc)
    duck = 10 ** ((-6.0 * sc) / 20)
    carve = 10 ** ((-3.5 * sc) / 20)
    low = butter_zero_phase(bed, "lowpass", 900)
    high = butter_zero_phase(bed, "highpass", 4200)
    mid = bed - low - high
    bed = (low + mid * carve[:, None] + high) * duck[:, None]
    bed *= (10 ** ((3.0 * np.clip((tt - A["speechEnd"]) / 0.5, 0, 1)) / 20))[:, None]
    write(OUT / "music-bed.wav", bed)
    print(f"voice {l_voice:.1f} LUFS | groove {l_music:.1f} LUFS | stage {20 * np.log10(stage_gain):+.1f} dB")

    tension = A["cem"] - A["sweepStart"] - 0.02
    gap = A["cem"] - A["agoraEnd"] - 0.02
    sfx = {
        "riser": riser(tension, seed=26),
        "drone": drone(gap + 0.1),
        "heartbeat": heartbeat(),
        "swipe-up": swipe_up(),
        "swipe-up-2": swipe_up(dur=0.3, seed=31),
        "whoosh-long": whoosh(dur=0.8, seed=32),
        "pop-hi": pop(N["C6"]),
        "pop-mid": pop(N["G5"], seed=27),
        "pop-lo": pop(N["E5"], seed=28),
        "tick": tick(),
        "punch": punch(),
        "notify": notify(),
        "cash": cash(),
        "tape-stop": tape_stop(),
    }
    for name, x in sfx.items():
        write(OUT / "sfx" / f"{name}.wav", x)

    json.dump({"offset": round(offset, 4), "return": round(t_return, 4),
               "endingDownbeat": round(t_end_downbeat, 4), "totalSec": round(total, 3),
               "beat": BEAT, "tension": round(tension, 4)},
              open(DATA / "music-plan.json", "w"), indent=1)
    print("done:", len(sfx), "stories sfx")


if __name__ == "__main__":
    main()
