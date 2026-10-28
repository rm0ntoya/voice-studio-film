#!/usr/bin/env bash
# Stories (1080x1920) render → loudness master → poster.
#   out/voicestudio-stories.mp4   1080x1920 60 fps H.264, -14 LUFS / -1 dBTP
#   out/poster-stories.jpg
# usage: scripts/master-stories.sh [--skip-render]
set -euo pipefail
cd "$(dirname "$0")/.."
export LC_ALL=C

POSTER_FRAME=${POSTER_FRAME:-1590}   # "100% inteligência artificial" settled
RAW=out/raw-stories.mp4
mkdir -p out

if [[ "${1:-}" != "--skip-render" ]]; then
  npx remotion render VoiceStudioStories "$RAW" --codec=h264 --crf=16 --audio-bitrate=320k --log=error
fi

STATS=$(ffmpeg -hide_banner -nostats -i "$RAW" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"

ffmpeg -hide_banner -loglevel error -y -i "$RAW" -c:v copy -af "$LN,aresample=48000" -c:a aac -b:a 320k -movflags +faststart out/voicestudio-stories.mp4

npx remotion still VoiceStudioStories out/poster-stories.png --frame="$POSTER_FRAME" --log=error
ffmpeg -hide_banner -loglevel error -y -i out/poster-stories.png -q:v 2 out/poster-stories.jpg && rm out/poster-stories.png

ffmpeg -hide_banner -nostats -i out/voicestudio-stories.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact out/voicestudio-stories.mp4
