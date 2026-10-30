# Authoring scenes for the Deliverable renderer

Scenes live in `media/src/scenes/<name>.html`. Render one with
`cd media/src && node render.mjs <name>`. For a loop it writes `media/<name>.mp4`,
`media/<name>.webm`, a poster `media/<name>.webp` (frame 0 unless `posterTime`), optionally
`media/<name>-master.mp4` (full scene size) and `media/<name>.gif`.
Then `sh sheet.sh <name>` writes `frames/<name>-sheet.png` (evenly spaced
frames) and `frames/<name>-loop.png` (last frame beside first). Look at both
with the Read tool before calling a scene done. A still is not proof of motion.

## Scene contract
- Declare in `<head>`:
  `window.SCENE = { name, width, height, fps: 30, duration, kind,
  outWidth, outHeight, master: true, gif: { width: 480, fps: 15 } }`.
  `width/height` is the master canvas the scene is laid out at; `outWidth/outHeight`
  is the web export size (ffmpeg scales down). `kind` is `"loop"` or `"still"`
  (a still takes `out: "../<file>.png"` relative to `media/`).
- Optional `hold: { at, for }` (seconds) freezes the scene at time `at` for `for`
  seconds, so a loop lasts `duration + for`. Put `at` at the latest moment the
  end state is fully settled, before any exit or fade; the action is unchanged.
  Do not use a hold on site loops: Ethan read the frozen end as lag (2026-10-27).
  A site loop keeps moving for its whole length (about 7 to 8 s) and restarts.
- Site loops carry no progress rail, timeline dot or module progress bar, and
  show a small "Concept piece" pill inside the frame (the page has no caption
  under them). The full pieces render with `?loop` (`node render.mjs
  demo-explainer?loop`) to get that version as `<name>-loopsrc.mp4`, the
  source `excerpt.sh` and `carry.sh` cut from; delete the loopsrc files after.
- Optional `posterTime` (seconds, in output time, so after a hold add `for`)
  picks the poster frame; the default is frame 0, which is blank on a loop
  that fades in, so point it at a settled frame.
- `html, body` must be exactly `width x height`, `margin:0`, `overflow:hidden`.
- The renderer pauses every animation and sets time frame by frame, so ALL
  motion must come from CSS `animation` declared in the stylesheet, Web
  Animations created synchronously at load, or a `window.seek(seconds)` function
  that sets state for that time (simplest for precise choreography). No CSS
  transitions, no `requestAnimationFrame`, no timers, no `Math.random()`, no
  `Date`. Nothing may be created after load.
- A loop's state at `t = duration` must equal its state at `t = 0`.
- Fonts: link `../../../fonts/fonts.css` (relative to `scenes/`) and use
  `font-family: 'Geist', sans-serif`. The renderer waits for fonts.

## Visual direction (from files/VISUAL_DIRECTION.md and VIDEO_PRODUCTION_BRIEF.md)
- Tokens: canvas `#F8F7F3`, ink `#20211E`, amber `#E8940A`, quiet slate surface
  `#E3E9EA`, warm illustration surface `#F2E3C4`, paper `#FFFEFA`, secondary
  text `#6D6E67`, rule `#DEDED5`. Amber marks the active item only.
- Original warm studio treatment: cream/paper surfaces, charcoal text, modest
  spatial depth with one controlled soft shadow (no heavier than
  `0 18px 40px rgba(32,33,30,0.10)`). No gradients, glow, blur, 3D, stock
  imagery, emoji, icon fonts, fake browser chrome or miniature dashboards.
- One main focal point, generous clear space, no required content in the outer
  10 percent of the frame. On a 1600x1200 master, main text 72 to 96 px,
  essential labels at least 48 px. Verify at the 960x720 export.
- Motion: one meaningful transformation with restrained easing
  (`cubic-bezier(0.22,0.61,0.36,1)` entrances, 0.5 to 0.8 s). The end result
  gets most of the reading time. No bobbing, shake, spin or surprise cuts.
- Copy: only the exact on-screen words the brief gives. No em-dashes, no
  numbers or claims that are not in the brief.

## Sound on the long pieces
The four long pieces (`process-explainer`, `demo-explainer`, `demo-course-module`, `demo-sales`, each
with its `-45` portrait twin) carry narration, a music bed and sound effects; loops and GIFs stay silent.
Each is described in `audio/<name>.json`: one narration line per scene (`at`, or `null` to follow the
previous line; `until`, the scene end it should finish by) and effect cues (`t`, `fx`, optional `gain`).
- `python3 audio.py vo <name>` voices new or changed lines with VoiceStudio (app open, API on
  `localhost:3900`, voice "Outwords Narrator A", profile `d3fd62c4`). Lines are cached in `audio/vo/`.
- `python3 audio.py fit <name>` shows where each line lands; shorten any line marked OVER.
- `python3 audio.py mix <name>` builds the soundtrack and muxes it into both shapes, mp4 and webm.
`render.mjs` writes silent files, so run `mix` again after any re-render of a long piece.
Levels: narration -16 LUFS, effects -15 dB, music about 10 dB under the voice and ducked a further
7 dB while the narrator speaks. The music is synthesised in `audio.py`. Effects come from Ethan's
`~/code-project/Infographic sound fx` and `~/code-project/Swooshes` folders (not in the repo).
Check a new line by transcribing it (`/v1/audio/transcriptions`); the voice occasionally misreads a word.
