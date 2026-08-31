'use strict';
/* Playwright test for the 20 new games. Run from the repo root:
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=/opt/node22/lib/node_modules node tests/verify2.js */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(__dirname, 'screenshots');

let passed = 0;
function ok(cond, msg) {
  if (!cond) throw new Error('ASSERT FAIL: ' + msg);
  passed++;
  console.log('  ok - ' + msg);
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 760 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  const shot = (name) => page.screenshot({ path: path.join(SHOTS, name), animations: 'disabled' });
  const back = async () => { await page.click('#btn-back'); };
  const home = async () => { await page.waitForSelector('#screen-home.active'); };
  const openGame = async (id) => {
    await page.click('#home-grid .game-card[data-game="' + id + '"]');
    await page.waitForSelector('#screen-' + id + '.active');
  };
  const answerQuiz = async (qnum) => {
    await page.waitForFunction((n) => {
      const el = document.getElementById('quiz-choices');
      return el && el.dataset.qnum === String(n);
    }, qnum);
    const answer = await page.getAttribute('#quiz-choices', 'data-answer');
    await page.click('#quiz-choices .quiz-tile[data-key="' + answer + '"]');
  };

  console.log('# load');
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForSelector('#home-grid .game-card');
  ok(await page.locator('#home-grid .game-card').count() === 27, 'home shows all 27 game cards');
  await shot('20-home-all.png');

  console.log('# vocab packs');
  await openGame('fruits');
  ok(await page.locator('#fruits-grid .tile').count() === 12, 'fruits tab: 12 tiles');
  await page.click('#fruits-grid .tile:nth-child(2)');
  await page.click('#fruits-tabs .tab[data-tab="sabzi"]');
  ok(await page.locator('#fruits-grid .tile').count() === 12, 'veggies tab: 12 tiles');
  await shot('21-fruits.png');
  await page.click('#fruits-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'fruits quiz advances after correct answer');
  await back();
  await back();
  await home();
  for (const [id, n] of [['body', 12], ['objects', 12], ['flowers', 8]]) {
    await openGame(id);
    ok(await page.locator('#' + id + '-grid .tile').count() === n, id + ': ' + n + ' tiles');
    await page.click('#' + id + '-grid .tile:nth-child(1)');
    await back();
    await home();
  }

  console.log('# devanagari varnamala');
  await openGame('abc');
  await page.click('#screen-abc .tab[data-tab="varna"]');
  ok(await page.locator('#abc-grid .varna-tile').count() === 48, 'varnamala shows 48 letters');
  await page.click('#abc-grid .varna-tile:nth-child(13)'); // क — speaks, must not crash
  await page.click('#abc-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'varnamala quiz advances after correct answer');
  await shot('39-varnamala.png');
  await back();
  await page.waitForSelector('#screen-abc.active');
  await back();
  await home();

  console.log('# tracing');
  await openGame('tracing');
  const traceOnce = async () => {
    const box = await page.locator('#trace-canvas').boundingBox();
    const pts = JSON.parse(await page.getAttribute('#trace-wrap', 'data-testpath'));
    const scale = box.width / 360;
    for (const pass of [0, 1]) {
      const seq = pass === 0 ? pts : pts.slice().reverse();
      await page.mouse.move(box.x + seq[0][0] * scale, box.y + seq[0][1] * scale);
      await page.mouse.down();
      for (const [px, py] of seq) {
        await page.mouse.move(box.x + (px + (pass ? 5 : 0)) * scale, box.y + py * scale);
      }
      await page.mouse.up();
      if (await page.getAttribute('#trace-wrap', 'data-done') === '1') return true;
    }
    return await page.getAttribute('#trace-wrap', 'data-done') === '1';
  };
  ok(await traceOnce(), 'tracing letter A reaches coverage -> done');
  await shot('22-tracing.png');
  await page.click('#tracing-tabs .tab[data-tab="numbers"]');
  ok(await page.getAttribute('#trace-wrap', 'data-item') === '1', 'tracing 123 tab shows number 1');
  await page.click('#tracing-tabs .tab[data-tab="varna"]');
  ok(await page.getAttribute('#trace-wrap', 'data-item') === 'अ', 'tracing कखग tab shows अ');
  await shot('40-tracing-varna.png');
  await back();
  await home();

  console.log('# word banao (spelling)');
  await openGame('spelling');
  const word = await page.getAttribute('#spell-slots', 'data-word');
  ok(word && word.length >= 3, 'spelling shows a word: ' + word);
  const wrongL = await page.$$eval('#spell-bank .bank-tile', (els, w) => {
    const t = els.find((e) => !w.includes(e.dataset.l));
    return t ? t.dataset.l : null;
  }, word);
  if (wrongL) {
    await page.click('#spell-bank .bank-tile[data-l="' + wrongL + '"]');
    ok(await page.getAttribute('#spell-slots', 'data-filled') === '0', 'wrong letter does not fill a slot');
  }
  for (const ch of word.split('')) {
    await page.click('#spell-bank .bank-tile[data-l="' + ch + '"]:not(.used)');
  }
  ok(await page.getAttribute('#spell-slots', 'data-filled') === String(word.length), 'word completed: ' + word);
  await shot('23-spelling.png');
  await back();
  await home();

  console.log('# phonics');
  await openGame('phonics');
  await page.click('#phonics-start');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'phonics quiz advances');
  await shot('24-phonics.png');
  await back();
  await back();
  await home();

  console.log('# bada-chhota (capital/small)');
  await openGame('capsmall');
  const capL = await page.getAttribute('#cs-caps .cs-tile:nth-child(1)', 'data-l');
  await page.click('#cs-caps .cs-tile:nth-child(1)');
  await page.click('#cs-smalls .cs-tile[data-l="' + capL + '"]');
  ok(await page.getAttribute('#cs-area', 'data-matched') === '1', 'capital ' + capL + ' matched with its small letter');
  ok(await page.locator('#cs-lines line').count() === 1, 'a connecting line joins the matched pair');
  await shot('25-capsmall.png');
  await back();
  await home();

  console.log('# shadow match');
  await openGame('shadow');
  ok(await page.locator('#shadow-items .shadow-tile').count() === 6, 'shadow: 6 items');
  const shK = await page.getAttribute('#shadow-items .shadow-tile:nth-child(1)', 'data-k');
  await page.click('#shadow-items .shadow-tile:nth-child(1)');
  await page.click('#shadow-shadows .shadow-tile[data-k="' + shK + '"]');
  ok(await page.getAttribute('#shadow-area', 'data-matched') === '1', 'shadow matched for ' + shK);
  await shot('26-shadow.png');
  await back();
  await home();

  console.log('# tables (pahade)');
  await openGame('tables');
  ok(await page.locator('#tables-picker .hour-btn').count() === 10, 'tables 1-10 picker');
  await page.click('#tables-picker .hour-btn[data-a="3"]');
  ok(await page.getAttribute('#tables-rows', 'data-table') === '3', 'table of 3 selected');
  ok(await page.locator('#tables-rows .trow').count() === 10, 'ten rows shown');
  ok((await page.textContent('#tables-rows .trow:nth-child(4)')).includes('3 × 4 = 12'), 'row shows 3 × 4 = 12');
  await page.click('#tables-rows .trow:nth-child(2)'); // speaks "Three twos are six"
  await page.click('#tables-play'); // start recitation
  await page.click('#tables-play'); // stop it again — no crash
  await shot('42-tables.png');
  await page.click('#tables-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'tables quiz advances after correct answer');
  await back();
  await page.waitForSelector('#screen-tables.active');
  await back();
  await home();

  console.log('# jod-ghatao (math)');
  await openGame('math');
  await page.click('#math-plus');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'addition quiz advances');
  await shot('27-math.png');
  await back();
  await page.waitForSelector('#screen-math.active');
  await page.click('#math-minus');
  ok((await page.textContent('#quiz-extra')).includes('−'), 'subtraction question shows minus equation');
  await answerQuiz(1);
  await back();
  await page.waitForSelector('#screen-math.active');
  await back();
  await home();

  console.log('# clock');
  await openGame('clock');
  await page.click('#clock-hours .hour-btn[data-h="5"]');
  ok(await page.getAttribute('#clock-face', 'data-hour') === '5', 'clock hands move to 5 o\'clock');
  await shot('28-clock.png');
  await page.click('#clock-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'clock quiz advances');
  await back();
  await back();
  await home();

  console.log('# ginti 1-100');
  await openGame('board100');
  ok(await page.locator('#board-grid .num-cell').count() === 100, 'board shows 100 numbers');
  await page.click('#board-grid .num-cell[data-n="7"]');
  await page.click('#board-find');
  const target = await page.getAttribute('#board-grid', 'data-target');
  await page.click('#board-grid .num-cell[data-n="' + target + '"]');
  ok(await page.getAttribute('#board-grid', 'data-found') === '1', 'found number ' + target + ' on the board');
  await shot('29-board100.png');
  await back();
  await home();

  console.log('# rhymes');
  await openGame('rhymes');
  ok(await page.locator('#rhymes-list .rhyme-card').count() === 4, '4 rhymes listed');
  await page.click('#rhymes-list .rhyme-card[data-rhyme="machhli"]');
  await page.waitForSelector('#rhyme-view:not([hidden])');
  await page.click('#rhyme-lines .rline:nth-child(1)');
  ok(await page.getAttribute('#rhyme-view', 'data-line') === '0', 'tapping a line highlights it');
  await shot('30-rhymes.png');
  await back(); // closes rhyme view
  await page.waitForSelector('#rhymes-list:not([hidden])');
  ok(true, 'back from rhyme returns to rhyme list');
  await back();
  await home();

  console.log('# sky pop');
  await openGame('skypop');
  ok(await page.locator('#skypop-area .bubble').count() >= 3, 'sky starts with bubbles already floating');
  await page.waitForFunction(() => {
    const area = document.getElementById('skypop-area');
    const t = area.dataset.target;
    return Array.from(area.querySelectorAll('.bubble')).some((b) => b.textContent === t);
  }, { timeout: 15000 });
  await shot('31-skypop.png');
  await page.evaluate(() => {
    const area = document.getElementById('skypop-area');
    const t = area.dataset.target;
    Array.from(area.querySelectorAll('.bubble')).find((b) => b.textContent === t).click();
  });
  ok(await page.getAttribute('#skypop-area', 'data-popped') === '1', 'popped the right bubble');
  await back();
  await home();

  console.log('# maze');
  await openGame('maze');
  const n = Number(await page.getAttribute('#maze-grid', 'data-size'));
  const walls = await page.$$eval('#maze-grid .maze-cell', (els) => els.map((e) => e.dataset.walls));
  // BFS shortest path 0 -> n*n-1
  const prev = new Array(n * n).fill(-1);
  const q = [0];
  prev[0] = 0;
  while (q.length) {
    const cur = q.shift();
    const r = Math.floor(cur / n);
    const c = cur % n;
    const opts = [
      [!walls[cur].includes('N') && r > 0, cur - n],
      [!walls[cur].includes('S') && r < n - 1, cur + n],
      [!walls[cur].includes('W') && c > 0, cur - 1],
      [!walls[cur].includes('E') && c < n - 1, cur + 1]
    ];
    for (const [okMove, nxt] of opts) {
      if (okMove && prev[nxt] === -1) { prev[nxt] = cur; q.push(nxt); }
    }
  }
  const pathCells = [];
  for (let v = n * n - 1; v !== 0; v = prev[v]) pathCells.unshift(v);
  ok(prev[n * n - 1] !== -1, 'maze has a path (' + pathCells.length + ' steps)');
  let cur = 0;
  for (const nxt of pathCells) {
    const d = nxt === cur - n ? 'up' : nxt === cur + n ? 'down' : nxt === cur - 1 ? 'left' : 'right';
    await page.click('#maze-arrows .maze-arrow[data-d="' + d + '"]');
    cur = nxt;
  }
  ok(await page.getAttribute('#maze-grid', 'data-solved') === '1', 'maze level 1 solved via arrows');
  await shot('32-maze.png');
  await page.waitForFunction(() => document.getElementById('maze-grid').dataset.level === '2');
  ok(true, 'maze advances to level 2');
  await back();
  await home();

  console.log('# tower');
  await openGame('tower');
  const tbox = await page.locator('#tower-area').boundingBox();
  await page.mouse.click(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
  await page.waitForFunction(() => document.getElementById('tower-area').dataset.floors === '1');
  ok(true, 'first block lands (floor 1)');
  // wait until the mover lines up with the placed block, then drop again
  await page.waitForFunction(() => {
    const m = document.getElementById('tower-mover');
    const b = document.querySelector('.tower-block');
    if (!m || !b) return false;
    const mx = new DOMMatrixReadOnly(getComputedStyle(m).transform).m41;
    return Math.abs(mx - parseFloat(b.style.left)) < 18;
  }, { timeout: 20000 });
  await page.mouse.click(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
  await page.waitForFunction(() => document.getElementById('tower-area').dataset.floors === '2');
  ok(true, 'second block stacks (floor 2)');
  await shot('33-tower.png');
  await back();
  await home();

  console.log('# puzzle');
  await openGame('puzzle');
  for (let guard = 0; guard < 12; guard++) {
    const order = await page.$$eval('#puzzle-board .puz-tile', (els) => els.map((e) => Number(e.dataset.pos)));
    const i = order.findIndex((v, k) => v !== k);
    if (i === -1) break;
    const j = order.indexOf(i);
    await page.click('#puzzle-board .puz-tile[data-i="' + i + '"]');
    await page.click('#puzzle-board .puz-tile[data-i="' + j + '"]');
  }
  ok(await page.getAttribute('#puzzle-board', 'data-solved') === '1', 'puzzle picture 1 solved by swapping');
  await shot('34-puzzle.png');
  await back();
  await home();

  console.log('# gardener');
  await openGame('gardener');
  const gbox = await page.locator('#garden-scene').boundingBox();
  await page.mouse.move(gbox.x + gbox.width * 0.1, gbox.y + gbox.height * 0.4);
  await page.mouse.down();
  await page.waitForFunction(() => {
    const s = document.getElementById('garden-scene').dataset.stages.split(',');
    return s[0] === '3';
  }, { timeout: 8000 });
  await page.mouse.up();
  ok(true, 'holding rain grows the first plant to bloom');
  await shot('35-gardener.png');
  await back();
  await home();

  console.log('# traffic');
  await openGame('traffic');
  ok(await page.getAttribute('#traffic-scene', 'data-light') === 'red', 'traffic starts on red');
  await page.click('#traffic-go'); // pressing on red must not drive
  ok(await page.getAttribute('#traffic-scene', 'data-cross') === '0', 'GO on red does not cross');
  await page.waitForFunction(() => document.getElementById('traffic-scene').dataset.light === 'green', { timeout: 15000 });
  await page.click('#traffic-go');
  await page.waitForFunction(() => document.getElementById('traffic-scene').dataset.cross === '1');
  ok(true, 'GO on green crosses the road');
  await shot('36-traffic.png');
  await back();
  await home();

  console.log('# murgi farm');
  await openGame('farm');
  ok(await page.locator('#farm-tabs .tab').count() === 4, 'farm has 4 mode tabs');
  await page.waitForSelector('#fc-hen');
  await page.waitForFunction(() => document.getElementById('fc-eggs').children.length > 0, null, { timeout: 8000 });
  ok(true, 'eggs start dropping from the hen');
  await shot('44-farm-catch.png');
  await page.click('#farm-tabs .tab[data-mode="hatch"]');
  ok(await page.locator('.fh-egg').count() === 8, 'surprise mode shows 8 eggs');
  await page.click('.fh-egg[data-i="0"]');
  await page.waitForSelector('.fh-egg.hatched', { timeout: 4000 });
  ok(await page.getAttribute('#farm-area', 'data-opened') === '1', 'egg opens with a surprise inside');
  await shot('45-farm-hatch.png');
  await page.click('#farm-tabs .tab[data-mode="cycle"]');
  await page.waitForSelector('.cyc-card');
  for (let s = 0; s < 4; s++) {
    await page.click('.cyc-card[data-stage="' + s + '"]:not(.used)');
  }
  ok(await page.getAttribute('#farm-area', 'data-filled') === '4', 'life cycle ordered correctly (egg→chick→hen)');
  await shot('46-farm-cycle.png');
  await page.click('#farm-tabs .tab[data-mode="fox"]');
  await page.waitForFunction(() => {
    const a = Array.from(document.querySelectorAll('#fx-grid .pop-actor'));
    return a.some((x) => !x.hidden && x.textContent === '🦊');
  }, null, { timeout: 15000 });
  await page.evaluate(() => {
    const actor = Array.from(document.querySelectorAll('#fx-grid .pop-actor')).find((x) => !x.hidden && x.textContent === '🦊');
    actor.closest('.bush').click();
  });
  ok(await page.getAttribute('#farm-area', 'data-bonked') === '1', 'fox bonked, hen saved');
  await shot('47-farm-fox.png');
  await back();
  await home();

  console.log('# drawing');
  await openGame('drawing');
  const dbox = await page.locator('#draw-canvas').boundingBox();
  await page.mouse.move(dbox.x + 60, dbox.y + 60);
  await page.mouse.down();
  await page.mouse.move(dbox.x + 200, dbox.y + 160);
  await page.mouse.up();
  await page.click('#draw-glow');
  ok(await page.getAttribute('#draw-canvas', 'data-mode') === 'glow', 'glow mode toggles');
  await page.mouse.move(dbox.x + 80, dbox.y + 120);
  await page.mouse.down();
  await page.mouse.move(dbox.x + 240, dbox.y + 200);
  await page.mouse.up();
  await shot('37-drawing.png');
  await page.click('#draw-clear');
  await back();
  await home();

  console.log('# mute toggle');
  await page.click('#btn-mute');
  ok((await page.textContent('#btn-mute')).includes('🔇'), 'mute button switches to muted');
  ok(await page.evaluate(() => store.getMute()), 'mute state persisted in store');
  await page.click('#btn-mute');
  ok((await page.textContent('#btn-mute')).includes('🔊'), 'mute button switches back to sound on');

  console.log('# voice settings');
  await page.click('#btn-settings');
  await page.waitForSelector('#screen-settings.active');
  ok(await page.locator('#set-en-list .hint').count() === 1, 'no-voice placeholder shows (headless has no voices)');
  ok(await page.locator('#set-hi-missing').isVisible(), 'Hindi install guidance shows when no Hindi voice');
  await page.click('#set-speed .speed-chip[data-rate="0.7"]');
  ok(await page.evaluate(() => store.getRate()) === 0.7, 'speed choice persists (0.7 slow)');
  await page.click('#set-speed .speed-chip[data-rate="0.85"]');
  await shot('43-settings.png');
  await back();
  await home();

  console.log('# sticker book');
  const starsNow = parseInt(await page.textContent('#star-count'), 10);
  const expectUnlocked = Math.min(Math.floor(starsNow / 25), 20);
  await openGame('stickers');
  ok(await page.locator('#sticker-shelf .sticker-tile').count() === 20, 'sticker shelf shows 20 stickers');
  ok(await page.getAttribute('#sticker-shelf', 'data-unlocked') === String(expectUnlocked),
    'unlocked count matches stars (' + starsNow + ' stars -> ' + expectUnlocked + ')');
  await back();
  await home();
  await page.evaluate(() => store.addStars(25));
  ok(await page.evaluate(() => document.getElementById('toast').classList.contains('show')),
    'earning 25 stars pops the new-sticker toast');
  await openGame('stickers');
  ok(await page.getAttribute('#sticker-shelf', 'data-unlocked') === String(expectUnlocked + 1),
    'a new sticker is unlocked after +25 stars');
  await shot('41-stickers.png');
  await back();
  await home();

  console.log('# phone back button (history)');
  await openGame('fruits');
  await page.goBack();
  await home();
  ok(true, 'browser/phone back returns to home instead of leaving the app');

  console.log('# hindi smoke over new games');
  await page.click('#lang-toggle');
  await openGame('fruits');
  await page.click('#fruits-grid .tile:nth-child(1)');
  const tabTxt = await page.textContent('#fruits-tabs .tab[data-tab="phal"]');
  ok(/[ऀ-ॿ]/.test(tabTxt), 'fruits tab label switches to Devanagari: ' + tabTxt);
  await shot('38-hindi-fruits.png');
  await back();
  await home();
  await page.click('#lang-toggle'); // back to EN

  console.log('# indian voice picking (mocked voices)');
  const p2 = await browser.newPage({ viewport: { width: 900, height: 700 } });
  p2.on('pageerror', (e) => errors.push('p2 pageerror: ' + e.message));
  p2.on('console', (m) => { if (m.type() === 'error') errors.push('p2 console: ' + m.text()); });
  await p2.addInitScript(() => {
    const mk = (name, lang, local) => ({ name, lang, localService: local, voiceURI: name, default: false });
    const fake = [
      mk('BasicUS', 'en-US', true),
      mk('Google हिन्दी', 'hi-IN', true),
      mk('Google English India', 'en-IN', true)
    ];
    try { window.speechSynthesis.getVoices = () => fake; } catch (e) { /* ignore */ }
  });
  await p2.goto('file://' + path.join(ROOT, 'index.html'));
  await p2.waitForSelector('#home-grid .game-card');
  const curV = await p2.evaluate(() => speech.current());
  ok(curV.en && curV.en.name === 'Google English India', 'en-IN voice auto-picked over en-US (' + (curV.en && curV.en.name) + ')');
  ok(curV.hi && curV.hi.name === 'Google हिन्दी', 'hi-IN voice auto-picked');
  await p2.evaluate(() => speech.setPreferred('en', 'BasicUS'));
  ok((await p2.evaluate(() => speech.current().en.name)) === 'BasicUS', 'parent voice override applies instantly');
  await p2.reload();
  await p2.waitForSelector('#home-grid .game-card');
  ok((await p2.evaluate(() => speech.current().en.name)) === 'BasicUS', 'voice override persists after reload');
  await p2.click('#btn-settings');
  await p2.waitForSelector('#screen-settings.active');
  ok(await p2.locator('#set-en-list .voice-opt').count() === 3, 'settings lists all 3 voices for English');
  ok(await p2.locator('#set-hi-list .voice-opt').count() === 1, 'settings lists the Hindi voice');
  ok(await p2.locator('#set-hi-missing').isHidden(), 'install guidance hidden when Hindi voice exists');
  await p2.close();

  await browser.close();

  if (errors.length) {
    console.error('\nPAGE ERRORS:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log('\nALL PASS (' + passed + ' assertions, 0 page errors). Screenshots in tests/screenshots/');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
