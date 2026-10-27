#!/bin/sh
# Contact sheet of a rendered video: sh sheet.sh <name> [columns] [rows]
# Writes media/src/frames/<name>-sheet.png with evenly spaced frames,
# plus <name>-loop.png showing the last frame next to the first (wrap check).
set -e
cd "$(dirname "$0")"
FF="$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')"
NAME="$1"; COLS="${2:-4}"; ROWS="${3:-3}"
N=$((COLS*ROWS))
TOTAL=$("$FF" -hide_banner -i "../$NAME.mp4" 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print ($1*3600+$2*60+$3)*30}' | cut -d. -f1)
STEP=$((TOTAL/N)); [ "$STEP" -lt 1 ] && STEP=1
"$FF" -hide_banner -loglevel error -y -i "../$NAME.mp4" -vf "select='not(mod(n\,$STEP))',scale=iw/2:-1,tile=${COLS}x${ROWS}:padding=4:color=white" -frames:v 1 "frames/$NAME-sheet.png"
"$FF" -hide_banner -loglevel error -y -i "../$NAME.mp4" -vf "select='eq(n\,$((TOTAL-1)))+eq(n\,0)',scale=iw/2:-1,tile=2x1:padding=4:color=white" -frames:v 1 "frames/$NAME-loop.png"
echo "frames/$NAME-sheet.png  frames/$NAME-loop.png  (total frames: $TOTAL)"
