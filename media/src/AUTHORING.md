# Authoring scenes for the Deliverable renderer

Scenes live in `media/src/scenes/<name>.html`. Render one with
`cd media/src && node render.mjs <name>`; it writes `media/<name>.mp4`,
`media/<name>.webm` and a first-frame poster `media/<name>.webp`.
Then `sh sheet.sh <name>` writes `frames/<name>-sheet.png` (12 evenly spaced
frames) and `frames/<name>-loop.png` (last frame beside first frame). Look at
both with the Read tool before calling a scene done.

## Scene contract
- Declare `window.SCENE = { name, width, height, fps: 30, duration, kind }`
  in a `<script>` in `<head>`. `kind` is `"loop"` (seamless, 5 to 6 s),
  `"video"` (the full demos) or `"still"` (one PNG; add `out: "../og-image.png"`
  relative to `media/`, optional `time` in seconds).
- `html, body` must be exactly `width x height`, `margin:0`, `overflow:hidden`.
- The renderer pauses every animation and sets `currentTime` frame by frame, so
  ALL motion must come from CSS `animation` declared in the stylesheet (use
  `animation-delay` + `animation-fill-mode: both` to sequence scenes), or from
  Web Animations created synchronously at load, or from an optional
  `window.seek(seconds)` function that sets state for that time. No CSS
  transitions, no `requestAnimationFrame`, no timers, no `Math.random()`,
  no `Date`. Nothing may be created after load.
- A loop's state at `t = duration` must equal its state at `t = 0`. Make every
  animation period divide the loop length.
- Fonts: `font-family: Inter, sans-serif` (Inter is installed locally; weights
  400 and 500 only, 600 for one small label at most). Wait for nothing; the
  renderer waits for fonts.

## Brand rules (hard)
- Canvas `#F7F4F1` (warm cream), lifted surface `#FCFBFA`, amber band `#FEF3E2`,
  amber `#E8940A`, deep amber `#D18409`, amber dark text on tint `#854F0B`,
  ink `#141413`, secondary text `#6B6763`, muted `#A09B95`, hairline `#DDD6CD`.
  Pain red only where a "before" is shown: bg `#FBF1EE`, text `#A32D2D`.
- Flat. No gradients, no drop shadows heavier than `0 12px 24px rgba(0,0,0,0.06)`,
  no 3D, no glow, no blur, no stock photos, no emoji, no icon fonts.
- Radii: 20px small, 24px cards, 40px media, 999px pills. Nothing between.
- Type: Inter 500 for headings with letter-spacing about -0.02em; 400 for body.
  Eyebrows: 12px, 700, uppercase, letter-spacing 0.56px, amber dark `#854F0B`,
  with a 7px amber dot before them. Never render dark mode; the canvas is
  always cream.
- Copy: no em-dashes anywhere (use commas or full stops), no "AI" buzzwords as
  the headline, plain confident B2B language, no exclamation marks.
- Minimum readable text in a 16:9 1280x720 frame is 22px; in an 800x800
  portrait loop it is 26px. Dense text holds on screen for at least
  (words / 3) seconds plus 1 s.
- Easing: `cubic-bezier(0.22,0.61,0.36,1)` for entrances, 0.5 to 0.7 s.
  Movement is calm. Nothing bounces, nothing spins.
