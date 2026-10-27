#!/bin/sh
# Continuous excerpt of a finished piece as a GIF-style loop:
#   sh excerpt.sh <out-name> <source.mp4> <start-seconds> [length-seconds]
# Writes media/<out>.mp4 (960x540 H.264), .webm, .webp poster and .gif.
# The excerpt plays straight through (default 5 s, no freeze) with a 0.25 s
# fade in and out so the restart is clean. Cut it from a loop-mode render of
# the piece (render.mjs <piece>?loop) so the progress rail is gone and the
# concept label is in the frame.
set -e
cd "$(dirname "$0")/.."
FF="$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')"
OUT="$1"; SRC="$2"; START="$3"; DUR="${4:-5}"
OUTST=$(echo "$DUR - 0.25" | bc)
VF="fade=t=in:st=0:d=0.25:color=0xF7F4F1,fade=t=out:st=$OUTST:d=0.25:color=0xF7F4F1,scale=960:540:flags=lanczos"
"$FF" -hide_banner -loglevel error -y -ss "$START" -t "$DUR" -i "$SRC" -vf "$VF" -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -movflags +faststart -an "$OUT.mp4"
"$FF" -hide_banner -loglevel error -y -ss "$START" -t "$DUR" -i "$SRC" -vf "$VF" -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -pix_fmt yuv420p -an "$OUT.webm"
"$FF" -hide_banner -loglevel error -y -ss "$(echo "$START + 0.3" | bc)" -i "$SRC" -vf "scale=960:540:flags=lanczos" -frames:v 1 -c:v libwebp -quality 82 "$OUT.webp"
"$FF" -hide_banner -loglevel error -y -i "$OUT.mp4" -vf "fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 "$OUT.gif"
ls -la "$OUT".mp4 "$OUT".webm "$OUT".webp "$OUT".gif
