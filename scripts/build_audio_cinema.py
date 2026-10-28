# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = [
#   "numpy<2.3",
#   "scipy",
#   "soundfile",
#   "pyloudnorm",
#   "librosa",
# ]
# ///
"""
Audio for the Cinema cut (same narration as Stories) — score generated with
Eleven Music v2.5 (work/cinema/music/take1.mp3), re-edited to the narration:

  0 → 7.5 s        piano intro (score τ 0…), faded into…
  7.5 → "Voice"    true silence
  "Voice"          the score's own groove entrance (detected onset near τ≈17 s)
  "E esse áudio"   LPF sweep + suck-out to silence before "100%"
  "100%"           the score's big drop (detected onset near τ≈57 s)
  +6 bars          final hit: the drop's downbeat re-triggered, long fade

  public/cinema/music-bed.wav   ducked + carved under the voice
  src/cinema/data/*.json        voice/music envelopes + plan (ending frame)

Run:  uv run scripts/build_audio_cinema.py
"""
import json
from pathlib import Path

import librosa
import numpy as np
import pyloudnorm as pyln

from build_audio import (
    FPS, SR, butter, butter_zero_phase, decode, env_follow, fade, swept_filter, write,
)

ROOT = Path(__file__).resolve().parent.parent
SCORE = ROOT / "work/cinema/music/take1.mp3"
VOICE = ROOT / "public/stories/voice.wav"
WORDS = ROOT / "src/stories/data"
OUT = ROOT / "public/cinema"
DATA = ROOT / "src/cinema/data"
STAGE_LU = 8.0
TAIL = 3.2


def anchors() -> dict[str, float]:
    words = json.load(open(WORDS / "words.json", encoding="utf-8"))
    a = json.load(open(WORDS / "anchors.json", encoding="utf-8"))
    return {k: (words[v["word"]]["startMs"] if v["edge"] == "start" else words[v["word"]]["endMs"]) / 1000
            for k, v in a.items() if not k.startswith("_")}


def onset_near(y: np.ndarray, sr: int, t: float, win: float = 0.8) -> float:
    """Sharpest onset inside [t-win, t+win], refined to the energy rise (ms precision)."""
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=128)
    times = librosa.times_like(on, sr=sr, hop_length=128)
    m = (times > t - win) & (times < t + win)
    return float(times[m][np.argmax(on[m])])


def main() -> None:
    A = anchors()
    score = decode(SCORE, 2)
    mono22 = librosa.resample(score.mean(axis=1), orig_sr=SR, target_sr=22050)
    tempo = float(np.atleast_1d(librosa.beat.beat_track(y=mono22, sr=22050)[0])[0])
    bar = 4 * 60 / tempo
    groove_in = onset_near(mono22, 22050, 16.95)
    drop_in = onset_near(mono22, 22050, 57.1)
    t_end = A["cem"] + 6 * bar
    print(f"tempo {tempo:.2f} | bar {bar:.3f}s | groove τ {groove_in:.3f} | drop τ {drop_in:.3f} | ending {t_end:.3f}s")

    voice = decode(VOICE, 1)
    write(OUT / "voice.wav", voice)
    total = t_end + TAIL
    n = int(total * SR)
    bed = np.zeros((n, 2), dtype=np.float32)
    tt = np.arange(n) / SR

    def place(tau0, tau1, t0, fin=0.004, fout=0.004, gain=1.0):
        a, b = int(tau0 * SR), int(tau1 * SR)
        seg = fade(score[a:b].copy(), fin, fout) * gain
        s = int(t0 * SR)
        e = min(n, s + len(seg))
        bed[s:e] += seg[: e - s]

    silence_at = 7.5
    # 1) intro: score from τ0, fading to nothing at 7.5 s
    place(0.0, silence_at, 0.0, fin=0.02, fout=0.45)
    # 2) groove from "Voice" through the suck-out
    seg2_end = A["agoraEnd"] + 0.04
    place(groove_in - 0.006, groove_in + (seg2_end - A["brandVoice"]), A["brandVoice"] - 0.006, fin=0.003, fout=0.01)
    s0, s1 = A["sweepStart"], A["agoraEnd"]
    p = np.clip((tt - s0) / (s1 - s0), 0, 1)
    cutoff = 18000 * (600 / 18000) ** (p ** 0.8)
    region = slice(int((s0 - 0.2) * SR), int(seg2_end * SR))
    bed[region] = swept_filter(bed[region], cutoff[region])
    g = 10 ** (-6 * p / 20)
    q = np.clip((tt - A["agoraStart"]) / (A["agoraEnd"] - A["agoraStart"]), 0, 1)
    g *= np.cos(q * np.pi / 2) ** 2
    g[(tt >= A["agoraEnd"]) & (tt < A["cem"] - 0.01)] = 0
    bed *= g[:, None].astype(np.float32)
    # 3) the drop on "100%", 6 bars, then 4) the drop downbeat re-struck as the final hit
    place(drop_in - 0.004, drop_in + (t_end - A["cem"]) + 0.01, A["cem"] - 0.004, fin=0.002, fout=0.012)
    place(drop_in - 0.004, drop_in + TAIL, t_end - 0.004, fin=0.002, fout=2.4)

    # envelopes (pre-duck) for audio-reactive visuals
    hop = SR // FPS
    frames = n // hop
    mono = bed.mean(axis=1)
    bass = butter(mono, "lowpass", 150)
    fr = lambda x: np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(frames)])
    n01 = lambda db, lo, hi: np.clip((db - lo) / (hi - lo), 0, 1)
    m_bass = env_follow(n01(20 * np.log10(fr(bass)), -44, -16), 0.01, 0.18, FPS)
    m_full = n01(20 * np.log10(fr(mono)), -42, -14)
    DATA.mkdir(parents=True, exist_ok=True)
    json.dump({"fps": FPS, "bass": [round(float(v), 3) for v in m_bass], "full": [round(float(v), 3) for v in m_full]},
              open(DATA / "music-envelope.json", "w"))

    v_full = np.zeros(n, dtype=np.float32)
    v_full[: min(n, len(voice))] = voice[:n]
    hop_hi = SR // 240
    n_hi = n // hop_hi
    v_db = 20 * np.log10(np.array([np.sqrt(np.mean(v_full[i * hop_hi:(i + 1) * hop_hi] ** 2) + 1e-12) for i in range(n_hi)]))
    v_hi = env_follow(np.clip((v_db + 52) / 40, 0, 1), 0.006, 0.06, 240)
    json.dump({"fps": FPS, "rate": 240, "durationSec": round(len(voice) / SR, 3),
               "frames": [round(float(v), 3) for v in [v_hi[i * 4:(i + 1) * 4].max() for i in range(n_hi // 4)]],
               "hi": [round(float(v), 3) for v in v_hi]},
              open(DATA / "voice-envelope.json", "w"))

    meter = pyln.Meter(SR)
    l_voice = meter.integrated_loudness(voice.astype(np.float64))
    l_music = meter.integrated_loudness(bed[int(A["brandVoice"] * SR): int(A["sweepStart"] * SR)].astype(np.float64))
    bed *= 10 ** (((l_voice - STAGE_LU) - l_music) / 20)

    v_sc = env_follow(np.clip((v_db + 46) / 22, 0, 1), 0.02, 0.32, 240)
    sc = np.interp(tt, np.arange(n_hi) / 240, v_sc)
    low = butter_zero_phase(bed, "lowpass", 900)
    high = butter_zero_phase(bed, "highpass", 4200)
    bed = (low + (bed - low - high) * (10 ** (-3.5 * sc / 20))[:, None] + high) * (10 ** (-6.0 * sc / 20))[:, None]
    bed *= (10 ** (3.5 * np.clip((tt - A["speechEnd"]) / 0.4, 0, 1) / 20))[:, None]
    write(OUT / "music-bed.wav", bed)

    json.dump({"tempo": round(tempo, 3), "bar": round(bar, 4), "silenceAt": silence_at,
               "endingDownbeat": round(t_end, 4), "totalSec": round(total, 3)},
              open(DATA / "music-plan.json", "w"), indent=1)
    print(f"voice {l_voice:.1f} LUFS | groove {l_music:.1f} LUFS | done")


if __name__ == "__main__":
    main()
