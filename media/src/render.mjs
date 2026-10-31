// Deliverable media renderer.
//
// Each scene is a self-contained HTML file in ./scenes that declares
//   window.SCENE = { name, width, height, fps, duration, kind }
// optional: hold: { at, for } (freeze scene time `at` for `for` s; output
// lasts duration + for) and posterTime (output seconds; default 0).
// kind: "loop" | "video" (mp4 + webm + webp poster into ../)  or
//       "still" (one PNG, written to `out`, relative to ../).
// Motion must be driven by CSS animations / Web Animations API, or by an
// optional window.seek(seconds) function; the renderer pauses every animation
// and steps time deterministically, so wall-clock timers never affect output.
//
// Usage: node render.mjs            (all scenes)
//        node render.mjs process og (by name, without .html)

import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const scenesDir = join(here, 'scenes');
const mediaDir = resolve(here, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG = execFileSync('python3', ['-c', 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())']).toString().trim();

// Each argument is a scene name, optionally with a query the scene can read,
// e.g. `demo-explainer?loop` (the scene then picks its own output name).
const wanted = new Map(process.argv.slice(2).map(a => { const [n, q = ''] = a.split('?'); return [n, q]; }));
const files = readdirSync(scenesDir)
  .filter(f => f.endsWith('.html'))
  .filter(f => !wanted.size || wanted.has(f.replace(/\.html$/, '')));
if (!files.length) { console.error('No scenes matched'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--font-render-hinting=none', '--force-device-scale-factor=1'],
});

function ffmpeg(args) {
  return new Promise((res, rej) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
    p.on('close', code => code === 0 ? res() : rej(new Error('ffmpeg exited ' + code)));
    p.on('error', rej);
    ffmpeg.current = p;
  });
}

for (const file of files) {
  const page = await browser.newPage();
  const query = wanted.get(file.replace(/\.html$/, ''));
  await page.goto(pathToFileURL(join(scenesDir, file)).href + (query ? '?' + query : ''), { waitUntil: 'load' });
  const scene = await page.evaluate(() => window.SCENE);
  if (!scene) { console.error(`${file}: no window.SCENE declared, skipped`); await page.close(); continue; }
  const { name, width, height, fps = 30, duration = 0, kind = 'loop' } = scene;
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.evaluate(() => document.fonts.ready);
  // Freeze every animation so time is ours to set.
  await page.evaluate(() => {
    document.getAnimations().forEach(a => a.pause());
  });
  const seek = async (t) => page.evaluate((ms, s) => {
    document.getAnimations().forEach(a => { a.currentTime = ms; });
    if (typeof window.seek === 'function') window.seek(s);
  }, Math.round(t * 1000), t);

  if (kind === 'still') {
    await seek(scene.time || 0);
    const out = resolve(mediaDir, scene.out || `${name}.png`);
    mkdirSync(dirname(out), { recursive: true });
    await page.screenshot({ path: out, type: 'png', omitBackground: !!scene.transparent });
    console.log(`${name}: still -> ${out}`);
    await page.close();
    continue;
  }

  if (kind === 'deck') {
    // Every .slide (width x height, stacked) becomes media/deck/<name>-NN.webp at the
    // web size, and the whole document prints to media/<name>.pdf, one slide a page.
    const ow = scene.outWidth || width, oh = scene.outHeight || height;
    const dir = join(mediaDir, 'deck');
    mkdirSync(dir, { recursive: true });
    const slides = await page.$$('.slide');
    for (const [i, el] of slides.entries()) {
      const out = join(dir, `${name}-${String(i + 1).padStart(2, '0')}.webp`);
      writeFileSync(out + '.png', await el.screenshot({ type: 'png' }));
      await ffmpeg(['-i', out + '.png', '-vf', `scale=${ow}:${oh}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '86', out]);
      execFileSync('rm', ['-f', out + '.png']);
    }
    await page.pdf({ path: join(mediaDir, `${name}.pdf`), width: `${width}px`, height: `${height}px`, printBackground: true });
    console.log(`${name}: ${slides.length} slides -> deck/${name}-NN.webp, ${name}.pdf`);
    await page.close();
    continue;
  }

  // Optional hold: freeze scene time `at` for `for` seconds, so output time t
  // shows scene time t (t < at), at (at <= t < at + for), t - for (after).
  // Optional posterTime (output seconds) picks the poster frame; default frame 0.
  const hold = scene.hold ? { at: +scene.hold.at, for: +scene.hold.for } : { at: Infinity, for: 0 };
  const frames = Math.round((duration + hold.for) * fps);
  const posterFrame = Math.min(frames - 1, Math.max(0, Math.round((scene.posterTime || 0) * fps)));
  const EPS = 1e-6;
  const sceneTime = (t) => t < hold.at - EPS ? t : t < hold.at + hold.for - EPS ? hold.at : t - hold.for;
  const mp4 = join(mediaDir, `${name}.mp4`);
  const webm = join(mediaDir, `${name}.webm`);
  const poster = join(mediaDir, `${name}.webp`);
  // Optional web export size (scene renders at its master size, ffmpeg scales
  // down for the site). Optional GIF derivative for placements that need one.
  const ow = scene.outWidth || width, oh = scene.outHeight || height;
  const vf = `scale=${ow}:${oh}:flags=lanczos`;
  const t0 = Date.now();
  const enc = ffmpeg([
    '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-map', '0:v', '-vf', vf, '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4,
    '-map', '0:v', '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', webm,
    ...(scene.master ? ['-map', '0:v', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', join(mediaDir, `${name}-master.mp4`)] : []),
  ]);
  const stdin = ffmpeg.current.stdin;
  let lastT = null, png = null;
  for (let i = 0; i < frames; i++) {
    const st = sceneTime(i / fps);
    if (st !== lastT) { await seek(st); png = await page.screenshot({ type: 'png' }); lastT = st; }
    if (i === posterFrame) {
      writeFileSync(poster + '.png', png);
    }
    if (!stdin.write(png)) await new Promise(r => stdin.once('drain', r));
    if (i % (fps * 5) === 0) process.stdout.write(`\r${name}: frame ${i}/${frames}`);
  }
  stdin.end();
  await enc;
  await ffmpeg(['-i', poster + '.png', '-vf', vf, '-c:v', 'libwebp', '-quality', '82', poster]);
  execFileSync('rm', ['-f', poster + '.png']);
  if (scene.gif) {
    // Two-pass palette GIF from the web mp4: smaller frame, lower frame rate.
    const gw = scene.gif.width || Math.round(ow / 2), gfps = scene.gif.fps || 15;
    const gif = join(mediaDir, `${name}.gif`);
    await ffmpeg(['-i', mp4, '-vf', `fps=${gfps},scale=${gw}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0', gif]);
  }
  console.log(`\r${name}: ${frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${name}.mp4 / .webm / .webp`);
  await page.close();
}

await browser.close();
