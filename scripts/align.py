# /// script
# requires-python = ">=3.11,<3.13"
# dependencies = [
#   "torch==2.7.1",
#   "torchaudio==2.7.1",
#   "soundfile",
#   "numpy<2.3",
# ]
# ///
"""
Word-level forced alignment for the narration.

Pipeline:
  1. Whisper large-v3-turbo produced the transcript (work/transcript/turbo.json).
  2. This script force-aligns that exact text against the audio with the
     wav2vec2 MMS_FA model (character-level CTC), which is far tighter than
     Whisper's own token timestamps (~20 ms vs ~80 ms error).
  3. Word onsets are then refined against the voice energy envelope so a word
     that follows a pause starts exactly where the sound starts.

Output: src/data/words.json  ->  [{ i, text, startMs, endMs, score, sentence }]

Run:  uv run scripts/align.py work/audio/voice-16k.wav work/transcript/transcript.txt src/data/words.json
"""
import json
import re
import sys
import unicodedata

import numpy as np
import soundfile as sf
import torch
import torchaudio

SPOKEN_OVERRIDES = {
    "100%": ["cem", "por", "cento"],
}


def spoken_tokens(display: str) -> list[str]:
    bare = display.strip()
    stripped = re.sub(r"[.,!?;:]+$", "", bare)
    if stripped in SPOKEN_OVERRIDES:
        return SPOKEN_OVERRIDES[stripped]
    norm = unicodedata.normalize("NFKD", stripped.lower())
    norm = "".join(c for c in norm if not unicodedata.combining(c))
    norm = re.sub(r"[^a-z']", "", norm)
    return [norm] if norm else []


def main(audio_path: str, text_path: str, out_path: str) -> None:
    audio, sr = sf.read(audio_path, dtype="float32")
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    assert sr == 16000, "expects 16 kHz mono"
    waveform = torch.from_numpy(audio).unsqueeze(0)

    sentences = [s.strip() for s in open(text_path, encoding="utf-8").read().splitlines() if s.strip()]
    display_words: list[tuple[str, int]] = []
    for si, s in enumerate(sentences):
        for w in s.split():
            display_words.append((w, si))

    flat: list[str] = []
    owner: list[int] = []
    for di, (w, _) in enumerate(display_words):
        for tok in spoken_tokens(w):
            flat.append(tok)
            owner.append(di)

    bundle = torchaudio.pipelines.MMS_FA
    model = bundle.get_model(with_star=False)
    tokenizer = bundle.get_tokenizer()
    aligner = bundle.get_aligner()

    with torch.inference_mode():
        emission, _ = model(waveform)
        spans = aligner(emission[0], tokenizer(flat))

    ratio = waveform.size(1) / emission.size(1) / sr  # seconds per emission frame

    # Energy envelope (5 ms hop) for onset refinement.
    hop = int(0.005 * sr)
    frames = len(audio) // hop
    env = np.array([np.sqrt(np.mean(audio[k * hop:(k + 1) * hop] ** 2) + 1e-12) for k in range(frames)])
    env_db = 20 * np.log10(env + 1e-9)
    floor = np.percentile(env_db, 10)
    speech_thresh = floor + 12

    def refine_onset(t: float) -> float:
        # If the aligner put the onset inside silence, walk forward to the first
        # frame where energy rises above the speech threshold (max 120 ms).
        k = int(t / 0.005)
        for step in range(0, 24):
            j = k + step
            if j >= frames:
                break
            if env_db[j] > speech_thresh:
                return j * 0.005
        return t

    per_display: dict[int, dict] = {}
    for tok_spans, di in zip(spans, owner):
        start = tok_spans[0].start * ratio
        end = tok_spans[-1].end * ratio
        score = float(np.mean([s.score for s in tok_spans]))
        if di not in per_display:
            per_display[di] = {"start": start, "end": end, "scores": [score]}
        else:
            per_display[di]["end"] = end
            per_display[di]["scores"].append(score)

    out = []
    for di, (w, si) in enumerate(display_words):
        d = per_display[di]
        start = refine_onset(d["start"])
        out.append({
            "i": di,
            "text": w,
            "startMs": round(start * 1000),
            "endMs": round(d["end"] * 1000),
            "score": round(float(np.mean(d["scores"])), 3),
            "sentence": si,
        })

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"aligned {len(out)} words -> {out_path}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
