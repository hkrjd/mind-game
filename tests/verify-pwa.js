'use strict';
/* PWA test: serves the app over http://127.0.0.1 (a secure context, so the
   service worker really registers) and proves install metadata + offline boot.
   Run from the repo root:
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=/opt/node22/lib/node_modules node tests/verify-pwa.js */
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = 8639;

let passed = 0;
function ok(cond, msg) {
  if (!cond) throw new Error('ASSERT FAIL: ' + msg);
  passed++;
  console.log('  ok - ' + msg);
}

function get(pathname) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path: pathname }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

async function waitServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await get('/index.html');
      if (r.status === 200) return;
    } catch (e) { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('http-server did not come up');
}

function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

(async () => {
  const server = spawn('/opt/node22/bin/http-server', [ROOT, '-p', String(PORT), '-c-1', '--silent'], { stdio: 'ignore' });
  let browser = null;
  try {
    await waitServer();

    console.log('# manifest & icons');
    const man = await get('/manifest.webmanifest');
    ok(man.status === 200, 'manifest served');
    const m = JSON.parse(man.body.toString());
    ok(m.name && m.start_url && m.display === 'standalone' && Array.isArray(m.icons) && m.icons.length === 5,
      'manifest has name/start_url/standalone/5 icons');
    for (const ic of m.icons) {
      const r = await get('/' + ic.src);
      ok(r.status === 200, 'icon served: ' + ic.src);
      const sz = pngSize(r.body);
      const want = ic.sizes.split('x').map(Number);
      ok(sz.w === want[0] && sz.h === want[1], ic.src + ' is really ' + sz.w + 'x' + sz.h);
    }
    ok((await get('/sw.js')).status === 200, 'sw.js served');

    console.log('# service worker on a secure context');
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });

    await page.goto('http://127.0.0.1:' + PORT + '/');
    await page.waitForSelector('#home-grid .game-card');
    ok(await page.locator('#home-grid .game-card').count() === 38, 'app boots over http with 38 cards');
    await page.waitForFunction(() => navigator.serviceWorker.getRegistration().then((r) => !!(r && r.active)), null, { timeout: 20000 });
    ok(true, 'service worker registered and active');
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 20000 });
    ok(true, 'service worker controls the page (clients.claim)');

    console.log('# offline');
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector('#home-grid .game-card', { timeout: 20000 });
    ok(await page.locator('#home-grid .game-card').count() === 38, 'OFFLINE reload still boots the full app');
    await page.click('#home-grid .game-card[data-game="abc"]');
    await page.waitForSelector('#screen-abc.active');
    ok(await page.locator('#abc-grid .tile').count() === 26, 'offline: a game opens and renders');
    await context.setOffline(false);

    await browser.close();
    browser = null;

    if (errors.length) {
      console.error('\nPAGE ERRORS:\n' + errors.join('\n'));
      process.exitCode = 1;
      return;
    }
    console.log('\nALL PASS (' + passed + ' assertions, 0 page errors)');
  } finally {
    if (browser) await browser.close().catch(() => { });
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
