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
Audio production for the Voice Studio film.

Builds, deterministically, everything the Remotion soundtrack layer plays:

  public/audio/voice.wav          narration (48 kHz, high-passed copy; original untouched)
  public/audio/music-bed.wav      "Happy Beats vol.12" (ende.app) re-edited to the narration:
                                    - groove downbeat lands on "Voice" (brand reveal)
                                    - low-pass sweep on "E para te provar"
                                    - suck-out to silence on "esse áudio..."
                                    - drop returns on "100%"
                                    - button ending spliced to the track's own final hit
                                  then side-chain ducked + mid-band carved under the voice.
  public/audio/sfx/*.wav          synthesized sound design tuned to C major (the track key)
                                  + normalized Kenney CC0 picks (assets/sfx).
  src/data/voice-envelope.json    per-frame (60 fps) + 240 Hz voice energy, 0..1
  src/data/music-envelope.json    per-frame bass/full energy of the bed (pre-duck), 0..1

Run:  uv run scripts/build_audio.py
"""
import json
import os
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
ASSETS = Path(os.environ.get("AUDIO_ASSETS_DIR", ROOT / "assets"))  # licensed music + Kenney SFX (not versioned)
MUSIC_SRC = ASSETS / "music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3"
VOICE_SRC = ROOT / "work/audio/voice-original.mp3"
OUT_AUDIO = ROOT / "public/audio"
OUT_SFX = OUT_AUDIO / "sfx"
DATA = ROOT / "src/data"

SR = 48000
FPS = 60
BEAT = 60.0 / 109.96          # vol-12 tempo
BAR = 4 * BEAT
TRACK_GROOVE_DOWNBEAT = 8.742  # first strong downbeat of the groove (beat-mapped)
TRACK_DROP_DOWNBEAT = 43.654   # full groove returns after the breakdown
TRACK_FINAL_HIT = 113.507      # the track's own ending hit
RETURN_BARS = 7                # bars from "100%" to the ending downbeat

# C major note table (Hz)
N = {
    "C1": 32.70, "G1": 49.00, "C2": 65.41, "G2": 98.00, "C3": 130.81, "E3": 164.81, "G3": 196.00,
    "C4": 261.63, "D4": 293.66, "E4": 329.63, "G4": 392.00, "B4": 493.88, "C5": 523.25, "D5": 587.33,
    "E5": 659.25, "G5": 783.99, "C6": 1046.50, "E6": 1318.51, "G6": 1567.98, "B6": 1975.53, "C7": 2093.00,
}


# ---------------------------------------------------------------- io helpers
def decode(path: Path, channels: int) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", str(channels), "-ar", str(SR), "-"],
        check=True, capture_output=True,
    ).stdout
    x = np.frombuffer(raw, dtype=np.float32).copy()
    return x.reshape(-1, channels) if channels > 1 else x


def write(path: Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), x.astype(np.float32), SR, subtype="FLOAT")


def peak_norm(x: np.ndarray, dbfs: float = -1.0) -> np.ndarray:
    p = np.max(np.abs(x)) + 1e-12
    return x * (10 ** (dbfs / 20) / p)


def stereo(x: np.ndarray) -> np.ndarray:
    return np.stack([x, x], axis=1) if x.ndim == 1 else x


def t_axis(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


# ---------------------------------------------------------------- dsp helpers
def butter(x, kind, f, order=2):
    sos = signal.butter(order, f, btype=kind, fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def butter_zero_phase(x, kind, f, order=2):
    sos = signal.butter(order, f, btype=kind, fs=SR, output="sos")
    return signal.sosfiltfilt(sos, x, axis=0)


def swept_filter(x: np.ndarray, cutoff_hz: np.ndarray, kind="lowpass", block=256) -> np.ndarray:
    """Time-varying 4th-order Butterworth (two cascaded biquads), state carried across blocks."""
    x2 = stereo(x)
    y = np.zeros_like(x2)
    zi = None
    for s in range(0, len(x2), block):
        fc = float(np.clip(cutoff_hz[min(s, len(cutoff_hz) - 1)], 30, SR / 2 - 200))
        sos = signal.butter(4, fc, btype=kind, fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2, x2.shape[1]))
        seg, zi = signal.sosfilt(sos, x2[s:s + block], axis=0, zi=zi)
        y[s:s + block] = seg
    return y


def bandpass_sweep(noise: np.ndarray, centers: np.ndarray, q=2.2, block=256) -> np.ndarray:
    y = np.zeros_like(noise)
    zi = None
    for s in range(0, len(noise), block):
        c = float(np.clip(centers[min(s, len(centers) - 1)], 60, SR / 2 - 2000))
        lo, hi = c / (1 + 1 / (2 * q)), c * (1 + 1 / (2 * q))
        sos = signal.butter(2, [lo, hi], btype="bandpass", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg, zi = signal.sosfilt(sos, noise[s:s + block], zi=zi)
        y[s:s + block] = seg
    return y


def reverb_ir(dur=1.8, seed=7, damp_hz=5200) -> np.ndarray:
    rng = np.random.default_rng(seed)
    t = t_axis(dur)
    ir = np.stack([rng.standard_normal(len(t)), rng.standard_normal(len(t))], axis=1)
    ir *= np.exp(-t / (dur / 6.5))[:, None]
    ir = butter(ir, "lowpass", damp_hz)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))


IR = reverb_ir()


def with_reverb(x: np.ndarray, wet=0.28, tail=1.6) -> np.ndarray:
    x2 = stereo(np.concatenate([x, np.zeros(int(tail * SR))]) if x.ndim == 1 else
                np.concatenate([x, np.zeros((int(tail * SR), x.shape[1]))]))
    w = np.stack([signal.fftconvolve(x2[:, c], IR[:, c])[: len(x2)] for c in range(2)], axis=1)
    return (1 - wet) * x2 + wet * w * 0.6


def fade(x: np.ndarray, fin=0.004, fout=0.004) -> np.ndarray:
    y = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        y[:a] *= np.linspace(0, 1, a)[:, None] if y.ndim > 1 else np.linspace(0, 1, a)
    if b:
        y[-b:] *= np.linspace(1, 0, b)[:, None] if y.ndim > 1 else np.linspace(1, 0, b)
    return y


def env_follow(x: np.ndarray, attack: float, release: float, rate: int) -> np.ndarray:
    ga, gr = np.exp(-1 / (attack * rate)), np.exp(-1 / (release * rate))
    y = np.zeros_like(x)
    v = 0.0
    for i, s in enumerate(x):
        g = ga if s > v else gr
        v = g * v + (1 - g) * s
        y[i] = v
    return y


# ---------------------------------------------------------------- anchors
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


# ---------------------------------------------------------------- synth sfx
def sub_boom(dur=1.7):
    t = t_axis(dur)
    f = N["C1"] + (115 - N["C1"]) * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.6) * (1 - np.exp(-t / 0.002))
    rng = np.random.default_rng(1)
    click = butter(rng.standard_normal(len(t)), "highpass", 1800) * np.exp(-t / 0.004) * 0.35
    x = np.tanh(1.8 * (x + click)) / np.tanh(1.8)
    return peak_norm(fade(stereo(x), 0.0005, 0.05))


def air_burst(dur=1.4, seed=2):
    t = t_axis(dur)
    rng = np.random.default_rng(seed)
    n = np.stack([rng.standard_normal(len(t)), rng.standard_normal(len(t))], axis=1)
    n = butter(butter(n, "highpass", 2500), "lowpass", 11000)
    x = n * np.exp(-t / 0.32)[:, None] * (1 - np.exp(-t / 0.003))[:, None]
    return peak_norm(fade(x, 0.0005, 0.08))


def riser(dur: float, seed=3):
    t = t_axis(dur)
    p = t / dur
    rng = np.random.default_rng(seed)
    centers = 380 * (7000 / 380) ** (p ** 1.4)
    nl = bandpass_sweep(rng.standard_normal(len(t)), centers)
    nr = bandpass_sweep(np.random.default_rng(seed + 10).standard_normal(len(t)), centers * 1.06)
    glide = N["G3"] * (N["G5"] / N["G3"]) ** (p ** 1.6)
    tone = np.sin(2 * np.pi * np.cumsum(glide) / SR) * 0.18
    amp = p ** 2.3
    x = np.stack([nl + tone, nr + tone], axis=1) * amp[:, None]
    return peak_norm(fade(x, 0.02, 0.006))


def drone(dur: float):
    t = t_axis(dur)
    lfo = 1 + 0.18 * np.sin(2 * np.pi * 0.9 * t)
    x = (np.sin(2 * np.pi * N["C1"] * t) + 0.6 * np.sin(2 * np.pi * N["C2"] * t)
         + 0.25 * np.sin(2 * np.pi * N["G2"] * 1.003 * t)) * lfo
    x *= np.minimum(1, t / 0.45)
    return peak_norm(fade(stereo(x), 0.01, 0.03))


def heartbeat(dur=0.34):
    t = t_axis(dur)
    f = 42 + 22 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09) * (1 - np.exp(-t / 0.003))
    return peak_norm(fade(stereo(np.tanh(1.5 * x)), 0.0005, 0.03))


def reverse_swell(dur=0.56, seed=4):
    t = t_axis(dur)
    rng = np.random.default_rng(seed)
    n = butter(rng.standard_normal(len(t)), "bandpass", [400, 6000]) * 0.5
    chord = sum(np.sin(2 * np.pi * N[k] * t) for k in ("C4", "E4", "G4", "C5")) / 4
    x = (n + chord) * np.exp((t - dur) / 0.16)
    return peak_norm(fade(stereo(x), 0.01, 0.004))


def whoosh(dur=0.52, direction=1, seed=5):
    t = t_axis(dur)
    p = t / dur
    rng = np.random.default_rng(seed)
    centers = 600 + 3200 * np.sin(np.pi * p) ** 1.5
    n = bandpass_sweep(rng.standard_normal(len(t)), centers, q=1.4)
    amp = np.sin(np.pi * p) ** 2
    pan = p if direction > 0 else 1 - p
    x = np.stack([n * amp * np.cos(pan * np.pi / 2), n * amp * np.sin(pan * np.pi / 2)], axis=1)
    return peak_norm(fade(x, 0.005, 0.01))


def tone(freq, dur, attack=0.004, decay=0.18, harm=(1.0, 0.0, 0.12)):
    t = t_axis(dur)
    x = sum(a * np.sin(2 * np.pi * freq * (i + 1) * t) for i, a in enumerate(harm))
    return x * (1 - np.exp(-t / attack)) * np.exp(-t / decay)


def ring():
    parts = []
    for _ in range(2):
        dur = 0.9
        t = t_axis(dur)
        sel = (np.floor(t * 18) % 2) == 0
        f = np.where(sel, N["G5"], N["C6"])
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.8 + 0.12 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        x *= np.minimum(1, t / 0.012) * np.minimum(1, (dur - t) / 0.06)
        parts += [x, np.zeros(int(0.32 * SR))]
    return peak_norm(with_reverb(np.concatenate(parts), wet=0.22, tail=0.8))


def blip_seq(notes, step=0.07, decay=0.16, wet=0.3):
    dur = step * len(notes) + 0.5
    out = np.zeros(int(dur * SR))
    for i, n in enumerate(notes):
        s = int(i * step * SR)
        x = tone(N[n], 0.45, decay=decay, harm=(1.0, 0.0, 0.1))
        out[s:s + len(x)] += x[: len(out) - s]
    return peak_norm(with_reverb(out, wet=wet, tail=1.0))


def fm_bell(freq, dur=3.2, ratio=3.5, index=2.2, decay=1.1):
    t = t_axis(dur)
    mod = index * np.exp(-t / 0.5) * np.sin(2 * np.pi * freq * ratio * t)
    return np.sin(2 * np.pi * freq * t + mod) * np.exp(-t / decay) * (1 - np.exp(-t / 0.002))


def final_bell():
    x = fm_bell(N["C5"]) + 0.55 * fm_bell(N["C4"], decay=1.6, index=1.2) + 0.25 * fm_bell(N["G5"], decay=0.8)
    return peak_norm(with_reverb(x, wet=0.35, tail=1.8))


def shimmer():
    dur = 1.9
    out = np.zeros(int(dur * SR))
    for i, n in enumerate(["C6", "E6", "G6", "B6", "C7"]):
        x = fm_bell(N[n], dur=1.2, ratio=2.0, index=0.8, decay=0.35)
        s = int(i * 0.045 * SR)
        out[s:s + len(x)] += x[: len(out) - s] * (0.9 - i * 0.1)
    return peak_norm(with_reverb(out, wet=0.45, tail=1.2))


def pad_final(dur=4.6):
    t = t_axis(dur)
    x = np.zeros_like(t)
    for k, n in enumerate(["C3", "G3", "E4", "D5", "C4"]):
        for h in range(1, 7):
            det = 1 + (0.0025 if h % 2 else -0.0025)
            x += np.sin(2 * np.pi * N[n] * h * det * t + k) / (h ** 1.6)
    x = butter(x, "lowpass", 2400)
    x *= np.minimum(1, t / 0.5) * np.clip((dur - t) / 2.6, 0, 1) ** 1.5
    return peak_norm(with_reverb(x, wet=0.3, tail=1.0))


def stutter(seed=6):
    pattern = [1, 1, 0, 1, 1, 1, 0, 1]
    step = BEAT / 8
    dur = step * len(pattern)
    t = t_axis(dur)
    sq = signal.square(2 * np.pi * N["C4"] * t) * 0.4
    rng = np.random.default_rng(seed)
    nz = rng.standard_normal(len(t)) * 0.25
    x = sq + nz
    x = np.round(x * 6) / 6  # bitcrush
    gate = np.repeat(pattern, int(step * SR))[: len(t)]
    gate = np.pad(gate, (0, len(t) - len(gate)))
    x = butter(x * gate, "bandpass", [300, 5000])
    return peak_norm(fade(stereo(x), 0.002, 0.01))


def intro_air(dur=3.0, seed=8):
    t = t_axis(dur)
    rng = np.random.default_rng(seed)
    n = butter(rng.standard_normal(len(t)), "bandpass", [200, 1800]) * 0.25
    pad = 0.5 * np.sin(2 * np.pi * N["C2"] * t) + 0.3 * np.sin(2 * np.pi * N["G2"] * t)
    x = (n + pad) * np.minimum(1, t / 0.6) * np.clip((dur - t) / 0.9, 0, 1)
    return peak_norm(fade(stereo(x), 0.01, 0.02))


# ---------------------------------------------------------------- main
def main() -> None:
    A = load_anchors()
    offset = A["brandVoice"] - TRACK_GROOVE_DOWNBEAT     # video t = track τ + offset
    t_return = A["cem"]
    t_end_downbeat = t_return + RETURN_BARS * BAR
    print(f"music offset {offset:.3f}s | drop return {t_return:.3f}s | ending downbeat {t_end_downbeat:.3f}s")

    # -- voice
    voice = decode(VOICE_SRC, 1)
    voice = butter(voice, "highpass", 70, order=2).astype(np.float32)
    write(OUT_AUDIO / "voice.wav", voice)
    total = t_end_downbeat + 3.2
    n_total = int(total * SR)
    v_full = np.zeros(n_total, dtype=np.float32)
    v_full[: len(voice)] = voice

    # -- music edit
    track = decode(MUSIC_SRC, 2)
    bed = np.zeros((n_total, 2), dtype=np.float32)

    def place(tau0: float, tau1: float, t0: float, fin=0.003, fout=0.003):
        a, b = int(tau0 * SR), int(tau1 * SR)
        seg = fade(track[a:b].copy(), fin, fout)
        s = int(t0 * SR)
        e = min(n_total, s + len(seg))
        bed[s:e] += seg[: e - s]

    # A: intro + groove until the suck-out (track starts at video t=offset)
    seg_a_end_t = A["esseAudio"] + 0.05
    place(0.0, seg_a_end_t - offset, offset, fin=0.01, fout=0.01)

    # LPF sweep + gain automation on segment A
    tt = np.arange(n_total) / SR
    sweep0, sweep1 = A["travadaEnd"], A["provar"]
    p = np.clip((tt - sweep0) / (sweep1 - sweep0), 0, 1)
    cutoff = 18000 * (700 / 18000) ** p
    region = slice(int((sweep0 - 0.2) * SR), int(seg_a_end_t * SR))
    filtered = swept_filter(bed[region], cutoff[region])
    bed[region] = filtered
    g = np.ones(n_total)
    g *= 10 ** (-4 * p / 20)
    fo0, fo1 = A["verdadeEnd"] + 0.02, A["esseAudio"]
    q = np.clip((tt - fo0) / (fo1 - fo0), 0, 1)
    g *= np.cos(q * np.pi / 2) ** 2
    g[tt >= fo1] = 0
    bed *= g[:, None].astype(np.float32)

    # B: full groove returns on "100%"
    tau_b1 = TRACK_DROP_DOWNBEAT + RETURN_BARS * BAR
    place(TRACK_DROP_DOWNBEAT, tau_b1 + 0.012, t_return, fin=0.002, fout=0.012)
    # C: the track's own ending hit + natural decay
    place(TRACK_FINAL_HIT, TRACK_FINAL_HIT + 3.0, t_end_downbeat, fin=0.012, fout=0.4)

    # -- envelopes of the (pre-duck) bed for audio-reactive visuals
    hop = SR // FPS
    frames = n_total // hop
    mono = bed.mean(axis=1)
    bass = butter(mono, "lowpass", 150)
    def frame_rms(x):
        return np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(frames)])
    def norm01(db, lo, hi):
        return np.clip((db - lo) / (hi - lo), 0, 1)
    m_full = norm01(20 * np.log10(frame_rms(mono)), -42, -14)
    m_bass = norm01(20 * np.log10(frame_rms(bass)), -44, -16)
    m_bass = env_follow(m_bass, 0.01, 0.18, FPS)
    json.dump({"fps": FPS, "bass": [round(float(v), 3) for v in m_bass],
               "full": [round(float(v), 3) for v in m_full]},
              open(DATA / "music-envelope.json", "w"))

    # -- voice envelope (drives ducking + visuals)
    hop_hi = SR // 240
    n_hi = n_total // hop_hi
    v_rms_hi = np.array([np.sqrt(np.mean(v_full[i * hop_hi:(i + 1) * hop_hi] ** 2) + 1e-12) for i in range(n_hi)])
    v_db_hi = 20 * np.log10(v_rms_hi)
    v_hi = np.clip((v_db_hi + 52) / 40, 0, 1)
    v_hi_smooth = env_follow(v_hi, 0.006, 0.06, 240)
    v_frames = np.array([v_hi_smooth[i * 4:(i + 1) * 4].max() for i in range(n_hi // 4)])
    json.dump({"fps": FPS, "rate": 240, "durationSec": round(len(voice) / SR, 3),
               "frames": [round(float(v), 3) for v in v_frames],
               "hi": [round(float(v), 3) for v in v_hi_smooth]},
              open(DATA / "voice-envelope.json", "w"))

    # -- loudness staging: music sits 7.5 LU under the voice before ducking
    meter = pyln.Meter(SR)
    l_voice = meter.integrated_loudness(voice.astype(np.float64))
    groove = bed[int((A["brandVoice"]) * SR): int((A["travadaEnd"]) * SR)]
    l_music = meter.integrated_loudness(groove.astype(np.float64))
    stage_gain = 10 ** (((l_voice - 7.5) - l_music) / 20)
    bed *= stage_gain

    # -- side-chain ducking + voiceover carve (1-4 kHz dip while the voice speaks)
    v_sc = np.clip((v_db_hi + 46) / 22, 0, 1)
    v_sc = env_follow(v_sc, 0.02, 0.32, 240)
    sc = np.interp(np.arange(n_total) / SR, np.arange(n_hi) / 240, v_sc)
    duck = 10 ** ((-6.0 * sc) / 20)
    carve = 10 ** ((-3.5 * sc) / 20)
    low = butter_zero_phase(bed, "lowpass", 900)
    high = butter_zero_phase(bed, "highpass", 4200)
    mid = bed - low - high
    bed = (low + mid * carve[:, None] + high) * duck[:, None]
    # let the button ending breathe a little louder once the narration is over
    tail_lift = 10 ** ((3.0 * np.clip((tt - A["speechEnd"]) / 0.6, 0, 1)) / 20)
    bed *= tail_lift[:, None]
    write(OUT_AUDIO / "music-bed.wav", bed)
    print(f"voice {l_voice:.1f} LUFS | music groove pre-stage {l_music:.1f} LUFS | stage {20*np.log10(stage_gain):+.1f} dB")

    # -- synthesized sound design (C major)
    tension_len = A["cem"] - A["esseAudio"] - 0.03
    sfx = {
        "sub-boom": sub_boom(),
        "air-burst": air_burst(),
        "riser": riser(tension_len),
        "drone": drone(tension_len),
        "heartbeat": heartbeat(),
        "reverse-swell": reverse_swell(),
        "whoosh-lr": whoosh(direction=1),
        "whoosh-rl": whoosh(direction=-1, seed=9),
        "whoosh-short": whoosh(dur=0.34, seed=11),
        "ring": ring(),
        "connect": blip_seq(["C6", "G6"], step=0.085),
        "success": blip_seq(["E6", "G6", "C7"], step=0.06),
        "select": blip_seq(["G6"], step=0.05, decay=0.08, wet=0.2),
        "shimmer": shimmer(),
        "final-bell": final_bell(),
        "pad-final": pad_final(),
        "stutter": stutter(),
        "intro-air": intro_air(),
    }
    for name, x in sfx.items():
        write(OUT_SFX / f"{name}.wav", x)

    # -- Kenney CC0 picks (normalized, resampled)
    kenney = [
        "interface/drop_001.ogg", "interface/drop_002.ogg", "interface/click_002.ogg",
        "interface/click_003.ogg", "interface/select_008.ogg", "interface/switch_007.ogg",
        "interface/glitch_002.ogg", "interface/glitch_004.ogg", "interface/bong_001.ogg",
        "impact/impactSoft_medium_001.ogg", "impact/impactSoft_medium_004.ogg",
        "impact/impactSoft_heavy_002.ogg", "casino/card-slide-1.ogg", "ui/rollover2.ogg",
    ] + [f"keyboard/keypress-{i:03d}.wav" for i in range(1, 33)]
    for rel in kenney:
        x = decode(ASSETS / "sfx" / rel, 2)
        name = rel.replace("/", "-").rsplit(".", 1)[0]
        write(OUT_SFX / "kenney" / f"{name}.wav", peak_norm(x, -1.0))

    json.dump({"offset": round(offset, 4), "return": round(t_return, 4),
               "endingDownbeat": round(t_end_downbeat, 4), "totalSec": round(total, 3),
               "beat": BEAT, "tensionLen": round(tension_len, 4)},
              open(DATA / "music-plan.json", "w"), indent=1)
    print("done:", len(sfx), "synth sfx,", len(kenney), "kenney sfx")


if __name__ == "__main__":
    main()
