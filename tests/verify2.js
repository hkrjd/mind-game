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
  // Home is a shelf of six categories now, so most games are one tap deeper.
  const home = async () => {
    for (let i = 0; i < 4; i++) {
      if (await page.locator('#screen-home.active').count()) break;
      await page.click('#btn-back');
      await page.waitForTimeout(80);
    }
    await page.waitForSelector('#screen-home.active');
  };
  const openGame = async (id) => {
    const direct = '#home-grid .game-card[data-game="' + id + '"]';
    if (await page.locator(direct).count()) {
      await page.click(direct);
    } else {
      const cat = await page.evaluate((g) => HOME_SECTIONS.findIndex((s) => s.games.includes(g)), id);
      await page.click('#cat-tiles .cat-tile[data-cat="' + cat + '"]');
      await page.waitForSelector('#screen-cat.active');
      await page.click('#cat-grid .game-card[data-game="' + id + '"]');
    }
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
  await page.waitForSelector('#home-grid');
  if (await page.locator('#lang-pick.show').count()) await page.click('#lp-en');
  await page.waitForSelector('#cat-tiles .cat-tile');
  ok(await page.locator('#cat-tiles .cat-tile').count() === 6, 'home shows 6 category shelves');
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
  // The car emoji faces left, so a positive shift would look like reversing.
  // Read the target the transition is heading for, not the value mid-flight.
  const carShift = await page.evaluate(() => document.getElementById('traffic-car').style.transform);
  ok(/translateX\(-\d/.test(carShift), 'the car drives the way it faces, not backwards (' + carShift + ')');
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

  console.log('# dimaag pack');
  await openGame('pattern');
  await page.click('#pattern-start');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'pattern quiz advances');
  await shot('48-pattern.png');
  await back();
  await page.waitForSelector('#screen-pattern.active');
  await back();
  await home();
  await openGame('missing');
  await page.waitForFunction(() => document.getElementById('ms-stage').dataset.phase === 'ask', null, { timeout: 10000 });
  const msAns = await page.getAttribute('#ms-stage', 'data-missing');
  await page.click('#ms-choices .ms-choice[data-k="' + msAns + '"]');
  ok(await page.getAttribute('#ms-stage', 'data-score') === '1', 'found what vanished (' + msAns + ')');
  await shot('49-missing.png');
  await back();
  await home();
  await openGame('oddone');
  await page.click('#oddone-start');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'odd-one-out quiz advances');
  await back();
  await page.waitForSelector('#screen-oddone.active');
  await back();
  await home();
  await openGame('ispy');
  ok(await page.locator('#ispy-scene .ispy-item').count() === 24, 'i-spy scene has 24 items');
  const spyT = await page.getAttribute('#ispy-scene', 'data-target');
  await page.click('#ispy-scene .ispy-item[data-k="' + spyT + '"]');
  ok(await page.getAttribute('#ispy-scene', 'data-found') === '1', 'spied the ' + spyT);
  await shot('50-ispy.png');
  await back();
  await home();

  console.log('# desi pack');
  await openGame('coins');
  ok(await page.locator('#coins-row .coin-tile').count() === 4, '4 coins to learn');
  await page.click('#coins-row .coin-tile:nth-child(2)');
  await page.click('#coins-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'coins quiz advances');
  await shot('51-coins.png');
  await back();
  await page.waitForSelector('#screen-coins.active');
  await back();
  await home();
  await openGame('bharat');
  ok(await page.locator('#bharat-grid .tile').count() === 10, 'Mera Bharat: 10 items');
  await page.click('#bharat-grid .tile:nth-child(2)');
  await shot('52-bharat.png');
  await back();
  await home();
  await openGame('helpers');
  ok(await page.locator('#helpers-grid .tile').count() === 8, '8 helpers to learn');
  await page.click('#helpers-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'helpers quiz advances');
  await back();
  await page.waitForSelector('#screen-helpers.active');
  await back();
  await home();

  console.log('# bhasha pack');
  for (const gid of ['opposites', 'listen', 'compare']) {
    await openGame(gid);
    await page.click('#' + gid + '-start');
    await answerQuiz(1);
    await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
    ok(true, gid + ' quiz advances');
    if (gid === 'listen') await shot('53-listen.png');
    await back();
    await page.waitForSelector('#screen-' + gid + '.active');
    await back();
    await home();
  }
  await openGame('stories');
  ok(await page.locator('#stories-list .rhyme-card').count() === 4, '4 stories listed');
  await page.click('#stories-list .rhyme-card[data-story="rabbit"]');
  await page.waitForSelector('#story-view:not([hidden])');
  await page.click('#story-lines .rline:nth-child(2)');
  await page.click('#story-qbtn');
  const storyAns = await page.getAttribute('#story-choices', 'data-answer');
  await page.click('#story-choices .ms-choice[data-k="' + storyAns + '"]');
  ok(await page.getAttribute('#story-view', 'data-answered') === '1', 'story question answered (' + storyAns + ')');
  await shot('54-story.png');
  await page.waitForSelector('#stories-list:not([hidden])', { timeout: 6000 }); // story auto-closes
  await back();
  await home();

  console.log('# bazaar pack');
  await openGame('shop');
  await page.waitForSelector('#shop-shelf .shop-tile');
  const needRaw = await page.getAttribute('#shop-area', 'data-need');
  for (const part of needRaw.split(',')) {
    const [item, cnt] = part.split(':');
    for (let c = 0; c < Number(cnt); c++) {
      await page.click('#shop-shelf .shop-tile[data-k="' + item + '"]');
    }
  }
  await page.waitForFunction(() => document.getElementById('shop-area').dataset.phase === 'pay');
  ok(true, 'shopping list gathered (' + needRaw + ') — now paying');
  const total = Number(await page.getAttribute('#shop-area', 'data-total'));
  let left = total;
  for (const v of [10, 5, 2, 1]) {
    while (left >= v) {
      await page.click('#shop-coins .shop-coin[data-v="' + v + '"]');
      left -= v;
    }
  }
  await page.waitForFunction(() => document.getElementById('shop-area').dataset.round === '2');
  ok(true, 'paid exactly ₹' + total + ' — round 2 starts');
  await shot('55-shop.png');
  await back();
  await home();

  await openGame('feed');
  const foodAns = await page.getAttribute('#feed-scene', 'data-food');
  await page.click('#feed-choices .feed-food[data-k="' + foodAns + '"]');
  ok(await page.getAttribute('#feed-scene', 'data-fed') === '1', 'fed the right food (' + foodAns + ')');
  await shot('56-feed.png');
  await back();
  await home();

  await openGame('train');
  await page.waitForSelector('#train-tray .train-item');
  const grp = await page.getAttribute('#train-tray .train-item:nth-child(1)', 'data-group');
  await page.click('#train-tray .train-item:nth-child(1)');
  await page.click('#train-track .wagon[data-accept="' + grp + '"]');
  ok(await page.getAttribute('#train-track', 'data-sorted') === '1', 'sorted one item into the ' + grp + ' wagon');
  await shot('57-train.png');
  await back();
  await home();

  console.log('# samajh pack');
  await openGame('feelings');
  ok(await page.locator('#feelings-grid .tile').count() === 6, '6 feeling faces');
  await page.click('#feelings-grid .tile:nth-child(1)');
  await page.click('#feelings-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'feelings quiz advances');
  await back();
  await page.waitForSelector('#screen-feelings.active');
  await back();
  await home();

  await openGame('weather');
  ok(await page.locator('#weather-grid .tile').count() === 5, '5 weathers');
  await page.click('#weather-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'weather quiz advances');
  await back();
  await page.waitForSelector('#screen-weather.active');
  await back();
  await home();

  await openGame('leftright');
  const lrAns = await page.getAttribute('#lr-area', 'data-answer');
  await page.click('#lr-area .lr-zone[data-side="' + lrAns + '"]');
  ok(await page.getAttribute('#lr-area', 'data-score') === '1', 'tapped the correct side (' + lrAns + ')');
  await shot('58-leftright.png');
  await back();
  await home();

  await openGame('safety');
  await page.click('#safety-start');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'safety quiz advances');
  await back();
  await page.waitForSelector('#screen-safety.active');
  await back();
  await home();

  console.log('# kram pack');
  await openGame('order');
  await page.waitForSelector('#order-cards .cyc-card');
  for (let s = 0; s < 4; s++) {
    await page.click('#order-cards .cyc-card[data-stage="' + s + '"]:not(.used)');
  }
  ok(await page.getAttribute('#order-area', 'data-filled') === '4', 'morning routine put in order');
  await shot('59-order.png');
  await back();
  await home();

  await openGame('sizes');
  await page.waitForSelector('#sizes-cards .cyc-card');
  for (let r = 0; r < 4; r++) {
    await page.click('#sizes-cards .cyc-card[data-rank="' + r + '"]:not(.used)');
  }
  ok(await page.getAttribute('#sizes-area', 'data-filled') === '4', 'sizes arranged small to big');
  await shot('60-sizes.png');
  await back();
  await home();

  await openGame('week');
  ok(await page.locator('#week-learn .week-chip').count() === 7, '7 days of the week');
  await page.click('#week-learn .week-chip:nth-child(3)');
  await page.click('#week-order');
  await page.waitForSelector('#week-cards .cyc-card');
  for (let d = 0; d < 7; d++) {
    await page.click('#week-cards .cyc-card[data-d="' + d + '"]:not(.used)');
  }
  ok(await page.getAttribute('#week-game', 'data-filled') === '7', 'week ordered Monday to Sunday');
  await shot('61-week.png');
  await page.waitForSelector('#celebrate.show'); // full week = instant celebration
  await page.click('#btn-cele-home');
  await home();

  console.log('# padhna pack');
  await openGame('matra');
  await page.click('#matra-cons .chip[data-c="म"]');
  await page.click('#matra-list .chip[data-m="ई"]');
  ok(await page.getAttribute('#matra-big', 'data-akshar') === 'मी', 'matra builder joins म + ई into मी');
  await shot('62-matra.png');
  await page.click('#matra-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'matra quiz advances after a correct answer');
  await back();
  await page.waitForSelector('#screen-matra.active');
  await back();
  await home();

  await openGame('hindiword');
  const hwParts = (await page.getAttribute('#hw-slots', 'data-parts')).split(',');
  for (const part of hwParts) {
    await page.click('#hw-bank .bank-tile[data-l="' + part + '"]:not(.used)');
  }
  ok(await page.getAttribute('#hw-slots', 'data-filled') === String(hwParts.length),
    'hindi word built in order (' + hwParts.join('+') + ')');
  await shot('63-hindiword.png');
  await back();
  await home();

  await openGame('readword');
  await page.click('#readword-start');
  await page.waitForSelector('#screen-quiz.active');
  ok(await page.locator('#quiz-extra .read-word').count() === 1, 'read-the-word shows the written word');
  await shot('64-readword.png');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'readword quiz advances');
  await back();
  await back();
  await home();

  await openGame('rhymewords');
  await page.click('#rhyme-start');
  await page.waitForSelector('#screen-quiz.active');
  ok(await page.locator('#quiz-choices .quiz-tile .t-word').count() === 3, 'rhyme choices show their words');
  await shot('65-rhyme.png');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'rhyme quiz advances');
  await back();
  await back();
  await home();

  console.log('# math-2 pack');
  await openGame('countit');
  const cTotal = Number(await page.getAttribute('#count-scene', 'data-total'));
  ok(await page.locator('#count-scene .count-item').count() === cTotal, cTotal + ' things to count');
  for (let i = 0; i < cTotal; i++) await page.click('#count-scene .count-item:not(.counted)');
  ok(await page.getAttribute('#count-scene', 'data-counted') === String(cTotal),
    'each thing counts exactly once');
  await page.waitForSelector('#count-choices:not([hidden])');
  const cAns = await page.getAttribute('#count-choices', 'data-answer');
  ok(cAns === String(cTotal), 'the number to find is the count');
  await shot('66-countit.png');
  await page.click('#count-choices .count-choice[data-n="' + cAns + '"]');
  await page.waitForFunction(() => document.getElementById('countit-dots').querySelectorAll('.dot.filled').length === 1);
  ok(true, 'counting round completed');
  await back();
  await home();

  await openGame('numline');
  await page.click('#numline-start');
  await page.waitForSelector('#screen-quiz.active');
  ok(await page.locator('#quiz-extra .nl-cell').count() === 4, 'number line shows 4 cells');
  ok(await page.locator('#quiz-extra .nl-cell.nl-q').count() === 1, 'exactly one number is missing');
  await shot('67-numline.png');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'numline quiz advances');
  await back();
  await back();
  await home();

  await openGame('share');
  const plateCount = await page.locator('#share-plates .share-plate').count();
  let shareLeft = Number(await page.getAttribute('#share-tray', 'data-left'));
  ok(shareLeft % plateCount === 0, shareLeft + ' things share evenly between ' + plateCount + ' plates');
  for (let i = 0; shareLeft > 0 && i < 30; i++) {
    await page.click('#share-plates .share-plate:nth-child(' + ((i % plateCount) + 1) + ')');
    shareLeft = Number(await page.getAttribute('#share-tray', 'data-left'));
  }
  ok(Number(await page.getAttribute('#share-plates', 'data-per')) > 0,
    'sharing one-by-one round the plates ends up equal');
  await shot('68-share.png');
  await back();
  await home();

  await openGame('measure');
  const mNeed = Number(await page.getAttribute('#meas-area', 'data-need'));
  for (let i = 0; i < mNeed; i++) await page.click('#meas-add');
  ok(await page.getAttribute('#meas-area', 'data-blocks') === String(mNeed),
    'block tower built to ' + mNeed + ' blocks');
  await shot('69-measure.png');
  await back();
  await home();

  console.log('# vigyan pack');
  await openGame('floatsink');
  const fsAns = await page.getAttribute('#fs-tank', 'data-answer');
  await page.click('#fs-btns .fs-btn[data-side="' + fsAns + '"]');
  await page.waitForSelector('#fs-item.' + fsAns);
  ok(true, 'the tank shows what really happens (' + fsAns + ')');
  await shot('70-floatsink.png');
  await page.waitForFunction(() => document.getElementById('fs-tank').dataset.round === '2');
  ok(true, 'float/sink moves on to the next thing');
  await back();
  await home();

  await openGame('homes');
  const firstHome = await page.getAttribute('#homes-tray .home-item:nth-child(1)', 'data-home');
  await page.click('#homes-tray .home-item:nth-child(1)');
  await page.click('#homes-targets .home-target[data-accept="' + firstHome + '"]');
  ok(await page.getAttribute('#homes-tray', 'data-placed') === '1',
    'animal moves into its own home (' + firstHome + ')');
  ok(await page.locator('#homes-targets .home-target[data-accept="' + firstHome + '"] .home-mini').count() === 1,
    'the home now shows the animal inside');
  await shot('71-homes.png');
  await back();
  await home();

  await openGame('babies');
  const babyKey = await page.getAttribute('#babies-moms .mom-tile:nth-child(1)', 'data-pair');
  await page.click('#babies-moms .mom-tile:nth-child(1)');
  await page.click('#babies-kids .kid-tile[data-pair="' + babyKey + '"]');
  ok(await page.getAttribute('#babies-area', 'data-matched') === '1',
    'mother matched with her baby (' + babyKey + ')');
  await shot('72-babies.png');
  await back();
  await home();

  await openGame('mixcolors');
  await page.click('#mix-row .mix-blob[data-c="red"]');
  await page.click('#mix-row .mix-blob[data-c="yellow"]');
  ok(await page.getAttribute('#mix-bowl', 'data-result') === 'Orange', 'red + yellow makes orange');
  await shot('73-mixcolors.png');
  await page.click('#mix-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'colour-mixing quiz advances');
  await back();
  await page.waitForSelector('#screen-mixcolors.active');
  await back();
  await home();

  console.log('# gaadi pack');
  await openGame('vehicles');
  ok(await page.locator('#vehicles-grid .tile').count() === 12, '12 vehicles to tap');
  await page.click('#vehicles-grid .tile:nth-child(1)');
  await shot('74-vehicles.png');
  await page.click('#vehicles-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'vehicles quiz advances');
  await back();
  await page.waitForSelector('#screen-vehicles.active');
  await back();
  await home();

  await openGame('whereride');
  const wrZone = await page.getAttribute('#wr-tray .wr-item:nth-child(1)', 'data-zone');
  await page.click('#wr-tray .wr-item:nth-child(1)');
  await page.click('#wr-zones .wr-zone[data-accept="' + wrZone + '"]');
  ok(await page.getAttribute('#wr-tray', 'data-placed') === '1',
    'vehicle sent to where it travels (' + wrZone + ')');
  await shot('75-whereride.png');
  await back();
  await home();

  console.log('# ghar-parivar pack');
  await openGame('family');
  ok(await page.locator('#family-tree .fam-tile').count() === 8, 'family tree shows 8 people');
  ok(await page.locator('#family-tree .fam-row').count() === 3, 'three generations, three rows');
  await page.click('#family-tree .fam-tile[data-who="dada"]');
  await shot('76-family.png');
  await page.click('#family-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'family quiz advances');
  await back();
  await page.waitForSelector('#screen-family.active');
  await back();
  await home();

  await openGame('dress');
  const dressNeed = await page.getAttribute('#dress-scene', 'data-need');
  await page.click('#dress-choices .dress-choice[data-item="' + dressNeed + '"]');
  ok(await page.locator('#dress-worn .dress-item').count() === 1,
    'the right thing for the weather goes on (' + dressNeed + ')');
  await shot('77-dress.png');
  await back();
  await home();

  await openGame('tidy');
  const tidyBin = await page.getAttribute('#tidy-room .tidy-thing:nth-child(1)', 'data-bin');
  // Scattered things overlap, so click the element directly rather than by position.
  await page.$eval('#tidy-room .tidy-thing:nth-child(1)', (el) => el.click());
  await page.click('#tidy-bins .tidy-bin[data-accept="' + tidyBin + '"]');
  ok(await page.getAttribute('#tidy-room', 'data-left') === '9',
    'putting a thing away clears it from the room (' + tidyBin + ')');
  await shot('78-tidy.png');
  await back();
  await home();

  await openGame('festivals');
  ok(await page.locator('#fest-grid .tile').count() === 6, '6 festivals');
  await page.click('#fest-grid .tile:nth-child(1)');
  await shot('79-festivals.png');
  await page.click('#fest-quiz');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'festival quiz advances');
  await back();
  await page.waitForSelector('#screen-festivals.active');
  await back();
  await home();

  console.log('# masti pack');
  await openGame('rangoli');
  await page.click('#rangoli-grid .rdot[data-r="1"][data-c="2"]');
  ok(await page.getAttribute('#rangoli-grid', 'data-lit') === '4', 'one tap lights four dots (symmetry)');
  await page.click('#rangoli-colors .rang-chip:nth-child(4)');
  await page.click('#rangoli-grid .rdot[data-r="0"][data-c="0"]');
  ok(await page.getAttribute('#rangoli-grid', 'data-lit') === '8', 'a second colour adds four more');
  await shot('80-rangoli.png');
  await page.click('#rangoli-clear');
  ok(await page.getAttribute('#rangoli-grid', 'data-lit') === '0', 'clean wipes the rangoli');
  await back();
  await home();

  await openGame('facemaker');
  const face0 = await page.getAttribute('#face-scene', 'data-face');
  await page.click('.face-ctrl[data-kind="face"] .face-arrow[data-dir="1"]');
  ok(await page.getAttribute('#face-scene', 'data-face') !== face0, 'the face carousel changes the face');
  await page.click('.face-ctrl[data-kind="hat"] .face-arrow[data-dir="1"]');
  ok(await page.getAttribute('#face-scene', 'data-hat') === '1', 'a hat goes on');
  await page.click('#face-talk');
  await shot('81-facemaker.png');
  await back();
  await home();

  await openGame('cups');
  await page.waitForFunction(() => document.getElementById('cups-row').dataset.phase === 'guess');
  const ballCup = await page.getAttribute('#cups-row', 'data-ball');
  await shot('82-cups.png');
  await page.click('#cups-row .cup[data-cup="' + ballCup + '"]');
  await page.waitForSelector('#cups-row .cup[data-cup="' + ballCup + '"].open');
  ok(true, 'the ball is found under the cup it followed (' + ballCup + ')');
  await back();
  await home();

  console.log('# sangeet pack');
  await openGame('piano');
  ok(await page.locator('#piano-keys .pkey').count() === 7, '7 piano keys (Sa to Ni)');
  await page.click('#piano-keys .pkey[data-note="ga"]');
  ok(await page.getAttribute('#piano-keys', 'data-last') === 'ga', 'tapping a key plays that note');
  await shot('83-piano.png');
  await back();
  await home();

  // Both echo games: wait for the pattern to finish, then play it back.
  const echoCopy = async (id) => {
    await page.waitForFunction((x) => document.getElementById(x + '-area').dataset.phase === 'copy', id);
    const seq = (await page.getAttribute('#' + id + '-area', 'data-seq')).split(',');
    for (const k of seq) await page.click('#' + id + '-pads .echo-pad[data-pad="' + k + '"]');
    return seq;
  };

  await openGame('tune');
  const tuneSeq = await echoCopy('tune');
  ok(await page.getAttribute('#tune-area', 'data-step') === String(tuneSeq.length),
    'tune played back note for note (' + tuneSeq.join(' ') + ')');
  await shot('84-tune.png');
  await back();
  await home();

  await openGame('drum');
  const drumSeq = await echoCopy('drum');
  ok(await page.getAttribute('#drum-area', 'data-step') === String(drumSeq.length),
    'beat played back (' + drumSeq.join(' ') + ')');
  await shot('85-drum.png');
  await back();
  await home();

  await openGame('yoga');
  const pose0 = await page.getAttribute('#yoga-pose', 'data-pose');
  ok(!!pose0, 'a pose is shown: ' + pose0);
  await shot('86-yoga.png');
  await page.click('#yoga-next');
  ok(await page.getAttribute('#yoga-pose', 'data-pose') !== pose0, 'the next-pose button moves on');
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
  await page.click('#btn-parent');
  await page.waitForSelector('#screen-parent.active');
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
  const expectUnlocked = Math.min(Math.floor(starsNow / 25), 40);
  await openGame('stickers');
  ok(await page.locator('#sticker-shelf .sticker-tile').count() === 40, 'sticker shelf shows 40 stickers');
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

  console.log('# accessibility');
  const vp = await page.getAttribute('meta[name="viewport"]', 'content');
  ok(!/user-scalable=no/.test(vp), 'pinch zoom is allowed again');
  await openGame('shapes');
  await page.click('#shapes-quiz');
  await page.waitForSelector('#quiz-choices .quiz-tile');
  const tileLabels = await page.$$eval('#quiz-choices .quiz-tile', (els) => els.map((e) => e.getAttribute('aria-label')));
  ok(tileLabels.length > 0 && tileLabels.every((l) => l && l.length),
    'every answer tile has a name for screen readers (' + tileLabels.join(', ') + ')');
  await answerQuiz(1);
  ok((await page.textContent('#quiz-verdict')).length > 0, 'right and wrong are announced in a live region');
  await back();
  await back();
  await home();
  await openGame('memory');
  ok(await page.getAttribute('#memory-grid .mem-card:nth-child(1)', 'aria-pressed') === 'false',
    'memory cards start announced as face down');
  await page.click('#memory-grid .mem-card:nth-child(1)');
  ok(await page.getAttribute('#memory-grid .mem-card:nth-child(1)', 'aria-pressed') === 'true',
    'a flipped card is announced as turned over');
  await home();

  console.log('# leaving a game mid-round cancels its timers');
  await openGame('floatsink');
  const fsAns2 = await page.getAttribute('#fs-tank', 'data-answer');
  await page.click('#fs-btns .fs-btn[data-side="' + fsAns2 + '"]');
  await home();
  await page.waitForTimeout(3000);
  ok(await page.locator('#screen-home.active').count() === 1, 'still on home 3s after walking out mid-round');
  ok(await page.locator('#celebrate.show').count() === 0, 'no celebration pops up over the home screen');
  ok(await page.getAttribute('#fs-tank', 'data-round') === '1', 'the abandoned game did not advance by itself');

  console.log('# language switch inside a game');
  await openGame('leftright');
  const lrEn = await page.textContent('#lr-area .lr-zone[data-side="left"] .lr-tag');
  await page.click('#lang-toggle');
  const lrHi = await page.textContent('#lr-area .lr-zone[data-side="left"] .lr-tag');
  ok(lrEn !== lrHi && /[ऀ-ॿ]/.test(lrHi), 'left/right tags follow the language switch (' + lrEn + ' -> ' + lrHi + ')');
  await page.click('#lang-toggle');
  await home();

  console.log('# home shelves, streak and parent corner');
  await home();
  ok(await page.locator('#today-card').count() === 1, "home offers a game of the day");
  ok(await page.locator('#recent-row .recent-card').count() > 0, 'just-played row fills as games are played');
  const homeHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  ok(homeHeight < 2400, 'home stays about one screen tall (' + homeHeight + 'px)');
  await page.evaluate(() => {
    localStorage.setItem('mg-streak', JSON.stringify({ n: 3, last: '2020-01-01' }));
    renderHome();
  });
  ok(await page.getAttribute('#home-streak', 'data-days') === '3', 'streak pill shows the run of days');
  await shot('87-home-shelves.png');

  const catCount = await page.evaluate(() => HOME_SECTIONS[0].games.filter((g) => GAMES[g]).length);
  await page.click('#cat-tiles .cat-tile[data-cat="0"]');
  await page.waitForSelector('#screen-cat.active');
  ok(await page.locator('#cat-grid .game-card').count() === catCount,
    'a shelf opens with its own ' + catCount + ' games');
  await shot('88-category.png');
  await home();

  await page.evaluate(() => store.addSeconds(180));
  await page.click('#btn-parent');
  await page.waitForSelector('#screen-parent.active');
  ok(await page.locator('#pc-week .pc-day').count() === 7, 'parent corner charts the last 7 days');
  ok(Number(await page.getAttribute('#pc-week', 'data-today')) >= 3, 'play time is counted (minutes today)');
  ok(Number(await page.getAttribute('#pc-stats', 'data-played')) > 5, 'it counts how many games were tried');
  ok(await page.locator('#pc-top .pc-row').count() > 0, 'most-played list is filled in');
  await page.click('#pc-limit .speed-chip[data-min="30"]');
  ok(await page.evaluate(() => store.getLimit()) === 30, 'daily play limit saves (30 min)');
  await page.click('#pc-limit .speed-chip[data-min="0"]');
  ok(await page.evaluate(() => store.getLimit()) === 0, 'the limit can be switched off again');
  await shot('89-parent.png');

  // Difficulty: one setting, felt across every quiz in the app.
  await page.click('#pc-level .speed-chip[data-level="easy"]');
  ok(await page.evaluate(() => store.getLevel()) === 'easy', 'easy level saves');
  await home();
  await openGame('phonics');
  await page.click('#phonics-start');
  await page.waitForSelector('#quiz-choices .quiz-tile');
  ok(await page.getAttribute('#quiz-choices', 'data-count') === '2', 'easy shows only two answers to pick from');
  ok(await page.locator('#quiz-dots .dot').count() === 4, 'easy rounds are shorter (4 questions)');
  await back();
  await back();
  await home();
  await page.click('#btn-parent');
  await page.waitForSelector('#screen-parent.active');
  await page.click('#pc-level .speed-chip[data-level="hard"]');
  await home();
  await openGame('memory');
  ok(await page.locator('#memory-grid .mem-card').count() === 16, 'hard deals 8 pairs in memory match');
  await home();
  await page.click('#btn-parent');
  await page.waitForSelector('#screen-parent.active');
  await page.click('#pc-level .speed-chip[data-level="normal"]');
  ok(await page.evaluate(() => store.getLevel()) === 'normal', 'level goes back to normal');

  await page.evaluate(() => { store.setLimit(1); store.addSeconds(120); checkScreenTime(); });
  ok(await page.locator('#break-time.show').count() === 1, 'passing the daily limit shows a gentle break message');
  await page.click('#break-ok');
  await home();
  await page.click('#btn-parent');
  await page.waitForSelector('#screen-parent.active');
  await page.click('#pc-limit .speed-chip[data-min="0"]');
  const starsBefore = await page.evaluate(() => store.getStars());
  await page.click('#pc-reset');
  ok(await page.evaluate(() => store.getStars()) === starsBefore, 'one tap does not wipe the stars');
  await page.click('#pc-reset');
  ok(await page.evaluate(() => store.getStars()) === 0, 'a confirming second tap resets them');
  await home();

  console.log('# audit regressions');
  // Nothing may make the page itself scroll sideways on a small phone.
  const small = await browser.newPage({ viewport: { width: 360, height: 740 } });
  small.on('pageerror', (e) => errors.push('small pageerror: ' + e.message));
  await small.addInitScript(() => {
    try { localStorage.setItem('mg-mute', '1'); localStorage.setItem('mg-lang', 'hi'); } catch (e) { /* ignore */ }
  });
  await small.goto('file://' + path.join(ROOT, 'index.html'));
  await small.waitForSelector('#cat-tiles .cat-tile');
  const gameIds = await small.evaluate(() =>
    HOME_SECTIONS.reduce((a, s) => a.concat(s.games.filter((g) => GAMES[g])), []));
  const wide = [];
  for (const id of gameIds) {
    const over = await small.evaluate((g) => {
      const e = GAMES[g];
      showScreen(e.screen);
      e.enter();
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    }, id);
    if (over > 2) wide.push(id + ' +' + over + 'px');
  }
  ok(wide.length === 0, 'no game screen overflows a 360px phone sideways' + (wide.length ? ': ' + wide.join(', ') : ''));

  // The train leaves to the left, inside its own track — it used to drag the
  // page out to 825px and leave the engine behind.
  await small.evaluate(() => { const e = GAMES.train; showScreen(e.screen); e.enter(); });
  await small.evaluate(() => {
    const tr = document.getElementById('train-track');
    tr.style.setProperty('--train-go', '-' + (tr.clientWidth + 80) + 'px');
    tr.classList.add('going');
  });
  await small.waitForTimeout(500);
  ok(await small.evaluate(() => document.documentElement.scrollWidth) <= 362,
    'the departing train never makes the page scroll sideways');
  ok(await small.evaluate(() => {
    const s = getComputedStyle(document.getElementById('train-engine')).transform;
    return s !== 'none' && new DOMMatrix(s).m41 < 0;
  }), 'the engine leaves with its wagons, to the left');
  await small.close();

  // Ten floors have to fit even on a landscape phone.
  const wideShort = await browser.newPage({ viewport: { width: 740, height: 400 } });
  await wideShort.addInitScript(() => {
    try { localStorage.setItem('mg-mute', '1'); localStorage.setItem('mg-lang', 'en'); } catch (e) { /* ignore */ }
  });
  await wideShort.goto('file://' + path.join(ROOT, 'index.html'));
  await wideShort.waitForSelector('#cat-tiles .cat-tile');
  const towerFit = await wideShort.evaluate(() => {
    const e = GAMES.tower;
    showScreen(e.screen);
    e.enter();
    const area = document.getElementById('tower-area');
    const bh = parseInt(getComputedStyle(area).getPropertyValue('--tower-bh'), 10);
    return area.clientHeight - 10 * bh - bh - 8;
  });
  ok(towerFit >= 0, 'the tenth tower floor still fits in landscape (' + towerFit + 'px spare)');
  await wideShort.close();

  // A two-picture "which is different?" cannot be answered.
  await page.evaluate(() => store.setLevel('easy'));
  await openGame('oddone');
  await page.click('#oddone-start');
  await page.waitForSelector('#quiz-choices .quiz-tile');
  ok(await page.locator('#quiz-choices .quiz-tile').count() >= 3,
    'odd-one-out keeps at least three pictures, even on easy');
  await back();
  await back();
  await home();
  await page.evaluate(() => store.setLevel('normal'));

  // Letters that share a romanization must never appear together.
  ok(await page.evaluate(() => {
    for (let i = 0; i < 300; i++) {
      const q = abcGame.varnaQuestion();
      const roms = q.choices.map((c) => VARNAMALA.find((v) => v.ch === c.key).roman);
      if (new Set(roms).size !== roms.length) return false;
    }
    return true;
  }), 'no varnamala question offers two letters spelled the same way');

  // The shopping list used to say "2 potatos" and "2 grapess".
  ok(await page.evaluate(() => plural('potato', 2) === 'potatoes' && plural('grapes', 2) === 'grapes' &&
    plural('tomato', 3) === 'tomatoes' && plural('apple', 2) === 'apples'),
    'the shopping list says potatoes, tomatoes and grapes');

  // Baby-animal tiles used to stay in Hindi whatever the language.
  await openGame('babies');
  const babyWord = await page.textContent('#babies-moms .baby-tile:nth-child(1) .t-word');
  ok(!/[ऀ-ॿ]/.test(babyWord), 'baby-animal tiles follow the chosen language (' + babyWord + ')');
  await home();

  console.log('# emoji integrity');

  // Emoji added after the 2020 set are empty boxes on an older phone.
  const TOO_NEW = [[0x1F6DC, 0x1F6DC], [0x1FA75, 0x1FA77], [0x1FA7B, 0x1FA7C], [0x1FA88, 0x1FA89],
    [0x1FA8F, 0x1FA8F], [0x1FAA9, 0x1FAAF], [0x1FAB7, 0x1FABF], [0x1FAC3, 0x1FAC6],
    [0x1FAD7, 0x1FADF], [0x1FAE0, 0x1FAE9], [0x1FAF0, 0x1FAF8]];
  // Kept on purpose: nothing older draws an X-ray, a lotus or a nest.
  const ALLOWED_NEW = ['\u{1FA7B}', '\u{1FAB7}', '\u{1FABA}'];
  const tooNew = [];
  fs.readdirSync(ROOT).filter((f) => /\.(js|html|css)$/.test(f)).forEach((f) => {
    for (const ch of fs.readFileSync(path.join(ROOT, f), 'utf8')) {
      const cp = ch.codePointAt(0);
      if (TOO_NEW.some((r) => cp >= r[0] && cp <= r[1]) && ALLOWED_NEW.indexOf(ch) < 0) {
        tooNew.push(f + ' ' + ch);
      }
    }
  });
  ok(tooNew.length === 0, 'no emoji too new for a 2020 phone beyond the three kept on purpose (' + tooNew.join(', ') + ')');

  // The Helpers game is built from joined sequences; without the joiner in
  // range a doctor can come apart into two glyphs.
  ok(/unicode-range:[^;]*U\+200D/.test(fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8')),
    'the emoji font covers the zero-width joiner');

  // Memory pairs match on the emoji itself, so a repeat would be a false pair.
  ok(await page.evaluate(() => new Set(MEMORY_POOL.map((m) => m.emoji)).size === MEMORY_POOL.length),
    'every memory card has its own picture');

  // A bloom the flower pack does not know gets spoken as a bare "Flower".
  ok(await page.evaluate(() => GARDEN_BLOOMS.every((e) => PACK_FLOWERS.some((f) => f.emoji === e))),
    'every garden bloom has a name in the flower pack');

  // These two put all of their pictures on one board at once.
  ok(await page.evaluate(() => {
    const all = [].concat.apply([], RHYME_SETS).map((r) => r.emoji);
    return new Set(all).size === all.length;
  }), 'no two rhyming words share a picture');
  ok(await page.evaluate(() => {
    const all = BABY_PAIRS.map((b) => b.mom).concat(BABY_PAIRS.map((b) => b.baby));
    return new Set(all).size === all.length;
  }), 'every animal and every baby on the matching board looks different');

  // The old wig, rake, well and jar had no honest picture.
  ok(await page.evaluate(() => {
    const words = [].concat.apply([], RHYME_SETS).map((r) => r.w);
    return ['wig', 'rake', 'well'].every((w) => words.indexOf(w) < 0);
  }), 'the rhyme game no longer asks for a word it cannot draw');

  // A canvas does not inherit the page font, so the jigsaw needs it by name.
  ok(await page.evaluate(() => /KKEmoji/.test(getComputedStyle(document.body).fontFamily)),
    'the body font stack still leads with the colour emoji font');
  ok(!/270px system-ui/.test(fs.readFileSync(path.join(ROOT, 'games-arcade.js'), 'utf8')),
    'the jigsaw canvas draws with the page font, not the system default');

  console.log('# what comes after / before');
  ok(await page.evaluate(() => {
    for (let i = 0; i < 400; i++) {
      const dirs = [1, -1];
      for (let d = 0; d < 2; d++) {
        const q = stepQuestion(dirs[d]);
        const keys = q.choices.map((c) => c.key);
        if (new Set(keys).size !== keys.length) return false;
        if (keys.indexOf(q.answer) < 0) return false;
        if (keys.some((k) => Number(k) < 1 || Number(k) > 20)) return false;
        const shown = Number(q.extra.replace(/<[^>]*>/g, ' ').replace('?', ' ').trim());
        if (Number(q.answer) !== shown + dirs[d]) return false;
      }
    }
    return true;
  }), 'after/before always answer the neighbour, stay inside 1-20 and never repeat a choice');

  await openGame('after20');
  await page.click('#after20-start');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2', null, { timeout: 15000 });
  ok(true, 'what-comes-after moves on to the next question');
  await shot('50-after20.png');
  await home();

  await openGame('before20');
  await page.click('#before20-start');
  await answerQuiz(1);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2', null, { timeout: 15000 });
  ok(true, 'what-comes-before moves on to the next question');
  await shot('51-before20.png');
  await home();

  console.log('# speech: a line is never cut off by the next one');
  const p3 = await browser.newPage({ viewport: { width: 900, height: 760 } });
  p3.on('pageerror', (e) => errors.push('p3 pageerror: ' + e.message));
  p3.on('console', (m) => { if (m.type() === 'error') errors.push('p3 console: ' + m.text()); });
  // A stand-in voice that reports every speak, cancel and finish, and takes
  // __dur ms to say anything (-1 = an engine that never reports finishing).
  await p3.addInitScript(() => {
    window.__log = [];
    window.__dur = 2500;
    const ss = window.speechSynthesis;
    try {
      ss.speak = (u) => {
        window.__log.push({ t: 'speak', text: String(u.text) });
        if (window.__dur >= 0) {
          setTimeout(() => {
            window.__log.push({ t: 'end', text: String(u.text) });
            if (u.onend) u.onend({});
          }, window.__dur);
        }
      };
      ss.cancel = () => { window.__log.push({ t: 'cancel' }); };
    } catch (e) { /* ignore */ }
  });
  await p3.goto('file://' + path.join(ROOT, 'index.html'));
  await p3.waitForSelector('#home-grid');
  if (await p3.locator('#lang-pick.show').count()) await p3.click('#lp-en');
  await p3.waitForSelector('#cat-tiles .cat-tile');

  const openOn = async (pg, id) => {
    const cat = await pg.evaluate((g) => HOME_SECTIONS.findIndex((sec) => sec.games.includes(g)), id);
    await pg.click('#cat-tiles .cat-tile[data-cat="' + cat + '"]');
    await pg.waitForSelector('#screen-cat.active');
    await pg.click('#cat-grid .game-card[data-game="' + id + '"]');
    await pg.waitForSelector('#screen-' + id + '.active');
  };
  const homeOn = async (pg) => {
    for (let i = 0; i < 5; i++) {
      if (await pg.locator('#screen-home.active').count()) break;
      await pg.click('#btn-back');
      await pg.waitForTimeout(80);
    }
    await pg.waitForSelector('#screen-home.active');
  };

  await openOn(p3, 'after20');
  await p3.evaluate(() => { window.__dur = 200; });
  await p3.click('#after20-start');
  await p3.waitForSelector('#quiz-choices .quiz-tile');
  await p3.waitForTimeout(1500); // let the question be read out, then start clean
  await p3.evaluate(() => { window.__log.length = 0; window.__dur = 2500; });
  const rightKey = await p3.getAttribute('#quiz-choices', 'data-answer');
  await p3.click('#quiz-choices .quiz-tile[data-key="' + rightKey + '"]');
  // The next line is queued, so wait for it rather than for the screen.
  await p3.waitForFunction(() => {
    const l = window.__log;
    const a = l.findIndex((e) => e.t === 'speak');
    if (a < 0) return false;
    const b = l.findIndex((e, i) => i > a && e.t === 'end' && e.text === l[a].text);
    return b > a && l.findIndex((e, i) => i > b && e.t === 'speak') > b;
  }, null, { timeout: 20000 });
  const slog = await p3.evaluate(() => window.__log);
  const si = slog.findIndex((e) => e.t === 'speak');
  const praiseText = si >= 0 ? slog[si].text : '';
  const ei = slog.findIndex((e, i) => i > si && e.t === 'end' && e.text === praiseText);
  const ni = slog.findIndex((e, i) => i > si && e.t === 'speak');
  ok(si >= 0 && ei > si, 'the praise for a right answer is spoken all the way to the end');
  ok(ni > ei, 'the next question waits for the praise to finish (' + praiseText + ')');
  ok(!slog.slice(si, ei).some((e) => e.t === 'cancel'), 'nothing cancels the praise while it is being said');

  // An engine that never reports finishing must not freeze the game.
  await p3.evaluate(() => { window.__dur = -1; });
  const beforeQ = await p3.getAttribute('#quiz-choices', 'data-qnum');
  await p3.click('#quiz-choices .quiz-tile[data-key="' + (await p3.getAttribute('#quiz-choices', 'data-answer')) + '"]');
  await p3.waitForFunction((n) => document.getElementById('quiz-choices').dataset.qnum !== n, beforeQ, { timeout: 20000 });
  ok(true, 'the quiz still moves on when the voice never reports finishing');

  // Reaching for the mute button mid-round must not strand the quiz: it stops
  // the talking, it does not cancel what the talking was holding up.
  await p3.evaluate(() => { window.__dur = 2500; });
  const mutedMid = await p3.getAttribute('#quiz-choices', 'data-qnum');
  await p3.click('#quiz-choices .quiz-tile[data-key="' + (await p3.getAttribute('#quiz-choices', 'data-answer')) + '"]');
  await p3.click('#btn-mute');
  await p3.waitForFunction((n) => document.getElementById('quiz-choices').dataset.qnum !== n, mutedMid, { timeout: 10000 });
  ok(true, 'muting in the middle of a round still lets the quiz move on');
  await p3.click('#btn-mute');

  // Muted from the start, there is nothing to wait for.
  await p3.evaluate(() => { store.setMute(true); });
  const mutedQ = await p3.getAttribute('#quiz-choices', 'data-qnum');
  await p3.click('#quiz-choices .quiz-tile[data-key="' + (await p3.getAttribute('#quiz-choices', 'data-answer')) + '"]');
  await p3.waitForFunction((n) => document.getElementById('quiz-choices').dataset.qnum !== n, mutedQ, { timeout: 5000 });
  ok(true, 'a muted quiz moves on without waiting for a voice');
  await p3.evaluate(() => store.setMute(false));
  await homeOn(p3);

  // Rhyme lines used to be given "characters x 95ms", which ignored the speed
  // the parent picked and cut every line short on the slow setting.
  await p3.evaluate(() => { window.__dur = 700; store.setRate(0.7); });
  await openOn(p3, 'rhymes');
  await p3.click('#rhymes-list .rhyme-card[data-rhyme="machhli"]');
  await p3.waitForSelector('#rhyme-view:not([hidden])');
  await p3.evaluate(() => { window.__log.length = 0; });
  await p3.click('#rhyme-play');
  await p3.waitForFunction(() => window.__log.filter((e) => e.t === 'speak').length >= 3, null, { timeout: 25000 });
  const rlog = await p3.evaluate(() => window.__log);
  const at = [];
  rlog.forEach((e, i) => { if (e.t === 'speak') at.push(i); });
  let inOrder = true;
  for (let k = 1; k < Math.min(3, at.length); k++) {
    const between = rlog.slice(at[k - 1], at[k]);
    if (!between.some((e) => e.t === 'end' && e.text === rlog[at[k - 1]].text)) inOrder = false;
  }
  ok(inOrder, 'each rhyme line is read out in full before the next one starts');
  await p3.close();

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
  await p2.waitForSelector('#home-grid');
  if (await p2.locator('#lang-pick.show').count()) await p2.click('#lp-en');
  await p2.waitForSelector('#cat-tiles .cat-tile');
  const curV = await p2.evaluate(() => speech.current());
  ok(curV.en && curV.en.name === 'Google English India', 'en-IN voice auto-picked over en-US (' + (curV.en && curV.en.name) + ')');
  ok(curV.hi && curV.hi.name === 'Google हिन्दी', 'hi-IN voice auto-picked');
  await p2.evaluate(() => speech.setPreferred('en', 'BasicUS'));
  ok((await p2.evaluate(() => speech.current().en.name)) === 'BasicUS', 'parent voice override applies instantly');
  await p2.reload();
  await p2.waitForSelector('#cat-tiles .cat-tile');
  ok((await p2.evaluate(() => speech.current().en.name)) === 'BasicUS', 'voice override persists after reload');
  await p2.click('#btn-parent');
  await p2.waitForSelector('#screen-parent.active');
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
