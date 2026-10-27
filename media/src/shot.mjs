// Full-page screenshots of the local site: node shot.mjs <outDir> [width...]
import puppeteer from 'puppeteer-core';
const [outDir, ...widths] = process.argv.slice(2);
const ws = widths.length ? widths.map(Number) : [1380, 390];
const pages = ['index', 'work', 'how-it-works', 'who-its-for', 'about', 'contact', '404'];
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--disable-gpu', '--no-sandbox', '--hide-scrollbars'],
});
for (const w of ws) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
  for (const p of pages) {
    await page.goto(`http://localhost:8787/${p}.html`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 600));
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: `${outDir}/${p}-${w}.png`, fullPage: true });
    console.log(p, w, h);
  }
  await page.close();
}
await browser.close();
