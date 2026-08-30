'use strict';
/* Regenerates the PWA icons in icons/ using headless Chromium.
   Run from the repo root:
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=/opt/node22/lib/node_modules node tools/make-icons.js */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, '..', 'icons');

// Maskable icons keep the emoji inside Android's safe zone (~40% radius),
// so their emojiScale is smaller and the background bleeds to the edges.
async function icon(page, size, emojiScale, file) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    '<body style="margin:0"><div style="width:100vw;height:100vh;display:flex;' +
    'align-items:center;justify-content:center;' +
    'background:linear-gradient(135deg,#FFF9EC 0%,#FFD93D 100%);">' +
    '<span style="font-size:' + Math.round(size * emojiScale) + 'px;line-height:1">🎈</span>' +
    '</div></body>');
  await page.screenshot({ path: path.join(OUT, file) });
  console.log('wrote', file, size + 'x' + size);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await icon(page, 192, 0.62, 'icon-192.png');
  await icon(page, 512, 0.62, 'icon-512.png');
  await icon(page, 192, 0.46, 'maskable-192.png');
  await icon(page, 512, 0.46, 'maskable-512.png');
  await icon(page, 180, 0.62, 'apple-touch-icon-180.png');
  await browser.close();
  console.log('done ->', OUT);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
