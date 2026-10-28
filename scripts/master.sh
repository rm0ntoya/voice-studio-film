#!/usr/bin/env bash
# Render → master → deliverables.
#   out/voicestudio.mp4         master: 1080p60 H.264, audio loudness-normalized (-14 LUFS, -1 dBTP)
#   out/voicestudio-social.mp4  same, with the poster baked into frame 0 (platform thumbnails)
#   out/poster.jpg              strongest settled frame
#   out/share-copy.txt
# usage: scripts/master.sh [--skip-render]
set -euo pipefail
cd "$(dirname "$0")/.."
export LC_ALL=C

POSTER_FRAME=${POSTER_FRAME:-2452}   # S9: "100% gerado por inteligência artificial" fully settled
RAW=out/raw.mp4
mkdir -p out

if [[ "${1:-}" != "--skip-render" ]]; then
  npx remotion render VoiceStudioFilm "$RAW" --codec=h264 --crf=14 --audio-bitrate=320k --log=error
fi

# two-pass loudnorm
STATS=$(ffmpeg -hide_banner -nostats -i "$RAW" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"

ffmpeg -hide_banner -loglevel error -y -i "$RAW" -c:v copy -af "$LN,aresample=48000" -c:a aac -b:a 320k -movflags +faststart out/voicestudio.mp4

npx remotion still VoiceStudioFilm out/poster.png --frame="$POSTER_FRAME" --log=error
ffmpeg -hide_banner -loglevel error -y -i out/poster.png -q:v 2 out/poster.jpg && rm out/poster.png

ffmpeg -hide_banner -loglevel error -y -i out/voicestudio.mp4 -i out/poster.jpg \
  -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" -map "[v]" -map 0:a \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 60 -c:a copy -movflags +faststart out/voicestudio-social.mp4

cat > out/share-copy.txt <<'EOF'
Tudo o que você ouve neste vídeo foi gerado por IA, com a minha voz. Eu não gravei nada.
Voice Studio: um assistente de IA que atende os clientes da sua loja por mensagem, no WhatsApp, por voz e no telefone, falando com a voz da sua equipe, o dia inteiro.
EOF

ffmpeg -hide_banner -nostats -i out/voicestudio.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|LRA:|Peak:"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact out/voicestudio.mp4
