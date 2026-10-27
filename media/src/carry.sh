#!/bin/sh
# "Same system" loop: 2.5 s of one piece, straight cut to 2.5 s of another (5 s total):
#   sh carry.sh <out-name> <srcA.mp4> <startA-seconds> <srcB.mp4> <startB-seconds> [half-seconds]
# half-seconds (default 2.5) sets the length of each half, e.g. 3.5 for a 7 s loop.
# Same output spec as excerpt.sh: media/<out>.mp4 (960x540 H.264), .webm, .webp poster
# (from piece A at startA + 1 s) and .gif, with a 0.25 s fade in and out only at the
# loop ends, so the restart is clean and the middle stays a hard cut.
set -e
cd "$(dirname "$0")/.."
FF="$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')"
OUT="$1"; SRCA="$2"; STARTA="$3"; SRCB="$4"; STARTB="$5"; HALF="${6:-2.5}"
HF=$(echo "($HALF * 30 + 0.5) / 1" | bc)
OUTST=$(echo "2 * $HALF - 0.25" | bc)
FC="[0:v]fps=30,setpts=PTS-STARTPTS,trim=end_frame=$HF[a];[1:v]fps=30,setpts=PTS-STARTPTS,trim=end_frame=$HF[b];[a][b]concat=n=2:v=1:a=0,setpts=PTS-STARTPTS,fps=30,fade=t=in:st=0:d=0.25:color=0xF7F4F1,fade=t=out:st=$OUTST:d=0.25:color=0xF7F4F1,scale=960:540:flags=lanczos[v]"
IN="-ss $STARTA -t $HALF -i $SRCA -ss $STARTB -t $HALF -i $SRCB"
"$FF" -hide_banner -loglevel error -y $IN -filter_complex "$FC" -map "[v]" -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -movflags +faststart -an "$OUT.mp4"
"$FF" -hide_banner -loglevel error -y $IN -filter_complex "$FC" -map "[v]" -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -pix_fmt yuv420p -an "$OUT.webm"
"$FF" -hide_banner -loglevel error -y -ss "$(echo "$STARTA + 1" | bc)" -i "$SRCA" -vf "scale=960:540:flags=lanczos" -frames:v 1 -c:v libwebp -quality 82 "$OUT.webp"
"$FF" -hide_banner -loglevel error -y -i "$OUT.mp4" -vf "fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 "$OUT.gif"
ls -la "$OUT".mp4 "$OUT".webm "$OUT".webp "$OUT".gif
