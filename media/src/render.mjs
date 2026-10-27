// Deliverable media renderer.
//
// Each scene is a self-contained HTML file in ./scenes that declares
//   window.SCENE = { name, width, height, fps, duration, kind }
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

const wanted = process.argv.slice(2);
const files = readdirSync(scenesDir)
  .filter(f => f.endsWith('.html'))
  .filter(f => !wanted.length || wanted.includes(f.replace(/\.html$/, '')));
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
  await page.goto(pathToFileURL(join(scenesDir, file)).href, { waitUntil: 'load' });
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

  const frames = Math.round(duration * fps);
  const mp4 = join(mediaDir, `${name}.mp4`);
  const webm = join(mediaDir, `${name}.webm`);
  const poster = join(mediaDir, `${name}.webp`);
  const t0 = Date.now();
  const enc = ffmpeg([
    '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-map', '0:v', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4,
    '-map', '0:v', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', webm,
  ]);
  const stdin = ffmpeg.current.stdin;
  for (let i = 0; i < frames; i++) {
    await seek(i / fps);
    const png = await page.screenshot({ type: 'png' });
    if (i === 0) {
      writeFileSync(poster + '.png', png);
    }
    if (!stdin.write(png)) await new Promise(r => stdin.once('drain', r));
    if (i % (fps * 5) === 0) process.stdout.write(`\r${name}: frame ${i}/${frames}`);
  }
  stdin.end();
  await enc;
  await ffmpeg(['-i', poster + '.png', '-c:v', 'libwebp', '-quality', '82', poster]);
  execFileSync('rm', ['-f', poster + '.png']);
  console.log(`\r${name}: ${frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${name}.mp4 / .webm / .webp`);
  await page.close();
}

await browser.close();
