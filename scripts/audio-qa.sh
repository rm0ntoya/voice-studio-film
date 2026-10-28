#!/usr/bin/env bash
# Audio QA: loudness summary + spectrogram/waveform picture of a rendered file.
# usage: scripts/audio-qa.sh <video> <out-prefix>
set -euo pipefail
export LC_ALL=C
IN=$1; OUT=$2
ffmpeg -hide_banner -nostats -i "$IN" -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|LRA:|Peak:"
ffmpeg -hide_banner -loglevel error -y -i "$IN" -filter_complex \
  "[0:a]aformat=channel_layouts=mono,showspectrumpic=s=1800x360:legend=0:scale=log:fscale=log:color=intensity[s];[0:a]aformat=channel_layouts=mono,showwavespic=s=1800x200:colors=0xFF5A36[w];[s][w]vstack" \
  -frames:v 1 "$OUT-audio.png"
echo "$OUT-audio.png"
