#!/bin/sh
# Five-second excerpt of a finished piece as a GIF-style loop:
#   sh excerpt.sh <out-name> <source.mp4> <start-seconds> [hold-seconds]
# Writes media/<out>.mp4 (960x540 H.264), .webm, .webp poster and .gif,
# with a 0.25 s fade in and out so the loop restarts cleanly. With a hold, the
# last settled frame before the fade-out (4.75 s in) is frozen for that long,
# then fades out, so the loop lasts 5 + hold seconds.
set -e
cd "$(dirname "$0")/.."
FF="$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')"
OUT="$1"; SRC="$2"; START="$3"; HOLD="${4:-0}"; DUR=5
if [ "$(echo "$HOLD > 0" | bc)" = 1 ]; then
  # 30 fps: frames 0-142 play (to 4.733 s), frame 142 is cloned to fill the
  # hold and the 0.25 s fade-out, total (5 + HOLD) x 30 frames.
  TOTAL=$(echo "(($DUR + $HOLD) * 30 + 0.5) / 1" | bc)
  PRE="fps=30,trim=end_frame=143,tpad=stop_mode=clone:stop=$((TOTAL - 143)),fps=30,"
  OUTST=$(echo "$DUR + $HOLD - 0.25" | bc)
else
  PRE=""; OUTST=4.75
fi
VF="${PRE}fade=t=in:st=0:d=0.25:color=0xF7F4F1,fade=t=out:st=$OUTST:d=0.25:color=0xF7F4F1,scale=960:540:flags=lanczos"
"$FF" -hide_banner -loglevel error -y -ss "$START" -t "$DUR" -i "$SRC" -vf "$VF" -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -movflags +faststart -an "$OUT.mp4"
"$FF" -hide_banner -loglevel error -y -ss "$START" -t "$DUR" -i "$SRC" -vf "$VF" -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -pix_fmt yuv420p -an "$OUT.webm"
"$FF" -hide_banner -loglevel error -y -ss "$(echo "$START + 0.3" | bc)" -i "$SRC" -vf "scale=960:540:flags=lanczos" -frames:v 1 -c:v libwebp -quality 82 "$OUT.webp"
"$FF" -hide_banner -loglevel error -y -i "$OUT.mp4" -vf "fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 "$OUT.gif"
ls -la "$OUT".mp4 "$OUT".webm "$OUT".webp "$OUT".gif
