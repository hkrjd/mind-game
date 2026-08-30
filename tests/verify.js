'use strict';
/* Playwright smoke test for Khel Khel Mein Seekho.
   Run from the repo root:
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=/opt/node22/lib/node_modules node tests/verify.js
   Notes: headless Chromium has no TTS voices and may mute audio — the game
   must run silently without a single page error; that is what this verifies. */
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
  const page = await browser.newPage({ viewport: { width: 900, height: 720 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  // animations:'disabled' fast-forwards the fade-in so shots are never mid-animation
  const shot = (name) => page.screenshot({ path: path.join(SHOTS, name), animations: 'disabled' });

  console.log('# load');
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForSelector('#home-grid .game-card');
  ok(await page.locator('#home-grid .game-card').count() === 4, 'home shows 4 game cards');
  await shot('01-home.png');

  // Answers the currently shown quiz question via the data-answer hook.
  async function answerQuestion(qnum, tryWrongFirst) {
    await page.waitForFunction((n) => {
      const el = document.getElementById('quiz-choices');
      return el && el.dataset.qnum === String(n);
    }, qnum);
    const answer = await page.getAttribute('#quiz-choices', 'data-answer');
    if (tryWrongFirst) {
      const keys = await page.$$eval('#quiz-choices .quiz-tile', (els) => els.map((e) => e.dataset.key));
      const wrong = keys.find((k) => k !== answer);
      await page.click(`#quiz-choices .quiz-tile[data-key="${wrong}"]`);
      await page.waitForTimeout(400);
      ok((await page.getAttribute('#quiz-choices', 'data-qnum')) === String(qnum),
        'wrong answer does not advance (gentle retry)');
      ok(await page.locator(`#quiz-choices .quiz-tile[data-key="${wrong}"].dim`).count() === 1,
        'wrong tile is dimmed');
    }
    await page.click(`#quiz-choices .quiz-tile[data-key="${answer}"]`);
  }

  console.log('# abc & ginti');
  await page.click('#home-grid .game-card[data-game="abc"]');
  await page.waitForSelector('#screen-abc.active');
  ok(await page.locator('#abc-grid .tile').count() === 26, 'ABC tab shows 26 letters');
  await page.click('#abc-grid .tile:nth-child(1)'); // tap "A" — must not crash without voices
  await page.click('#screen-abc .tab[data-tab="numbers"]');
  ok(await page.locator('#abc-grid .tile').count() === 10, '123 tab shows 10 numbers');
  await page.click('#abc-grid .tile:nth-child(3)');
  await shot('02-abc.png');

  console.log('# abc quiz — full round of 5');
  const starsBefore = parseInt(await page.textContent('#star-count'), 10);
  await page.click('#abc-quiz');
  await page.waitForSelector('#screen-quiz.active');
  await shot('03-abc-quiz.png');
  for (let q = 1; q <= 5; q++) await answerQuestion(q, q === 1);
  await page.waitForSelector('#celebrate.show');
  ok(true, 'celebration overlay appears after 5 correct answers');
  const starsAfter = parseInt(await page.textContent('#star-count'), 10);
  ok(starsAfter >= starsBefore + 7, `stars increased ${starsBefore} -> ${starsAfter} (5 answers + 2 bonus)`);
  await shot('04-celebrate.png');
  await page.click('#btn-cele-home');
  await page.waitForSelector('#screen-home.active');

  console.log('# shapes & colors');
  await page.click('#home-grid .game-card[data-game="shapes"]');
  await page.waitForSelector('#screen-shapes.active');
  ok(await page.locator('#shapes-grid .tile').count() === 8, '8 shape tiles');
  ok(await page.locator('#colors-row .blob-tile').count() === 8, '8 color blobs');
  await page.click('#shapes-grid .tile:nth-child(1)');
  await shot('05-shapes.png');
  await page.click('#shapes-quiz');
  await answerQuestion(1, false);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'shapes quiz advances to question 2');
  await page.click('#btn-back'); // quiz -> shapes learn screen
  await page.waitForSelector('#screen-shapes.active');
  await page.click('#btn-back');
  await page.waitForSelector('#screen-home.active');

  console.log('# memory match');
  await page.click('#home-grid .game-card[data-game="memory"]');
  await page.waitForSelector('#screen-memory.active');
  ok(await page.locator('#memory-grid .mem-card').count() === 12, '12 memory cards dealt');
  const emojis = await page.$$eval('#memory-grid .mem-card', (els) => els.map((e) => e.dataset.emoji));
  let i1 = -1, i2 = -1;
  outer: for (let i = 0; i < emojis.length; i++) {
    for (let j = i + 1; j < emojis.length; j++) {
      if (emojis[i] === emojis[j]) { i1 = i; i2 = j; break outer; }
    }
  }
  await page.click(`#memory-grid .mem-card:nth-child(${i1 + 1})`);
  await page.click(`#memory-grid .mem-card:nth-child(${i2 + 1})`);
  await page.waitForSelector(`#memory-grid .mem-card:nth-child(${i1 + 1}).matched`);
  await page.waitForSelector(`#memory-grid .mem-card:nth-child(${i2 + 1}).matched`);
  ok(true, 'matching pair stays matched');
  let m1 = -1, m2 = -1;
  outer2: for (let i = 0; i < emojis.length; i++) {
    if (i === i1 || i === i2) continue;
    for (let j = i + 1; j < emojis.length; j++) {
      if (j === i1 || j === i2) continue;
      if (emojis[i] !== emojis[j]) { m1 = i; m2 = j; break outer2; }
    }
  }
  await page.click(`#memory-grid .mem-card:nth-child(${m1 + 1})`);
  await shot('06-memory.png');
  await page.click(`#memory-grid .mem-card:nth-child(${m2 + 1})`);
  await page.waitForFunction(([a, b]) => {
    const cards = document.querySelectorAll('#memory-grid .mem-card');
    return !cards[a].classList.contains('flipped') && !cards[b].classList.contains('flipped');
  }, [m1, m2]);
  ok(true, 'mismatched pair flips back');
  await page.click('#btn-back');
  await page.waitForSelector('#screen-home.active');

  console.log('# animals & sounds');
  await page.click('#home-grid .game-card[data-game="animals"]');
  await page.waitForSelector('#screen-animals.active');
  ok(await page.locator('#animals-grid .tile').count() === 12, '12 animal tiles');
  await page.click('#animals-grid .tile:nth-child(2)');
  await shot('07-animals.png');
  await page.click('#animals-quiz');
  await answerQuestion(1, false);
  await page.waitForFunction(() => document.getElementById('quiz-choices').dataset.qnum === '2');
  ok(true, 'animals quiz advances to question 2');
  await page.click('#btn-back');
  await page.click('#btn-back');
  await page.waitForSelector('#screen-home.active');

  console.log('# hindi mode');
  await page.click('#lang-toggle');
  const hiTitle = await page.textContent('#home-title');
  ok(/[ऀ-ॿ]/.test(hiTitle), 'home title switches to Devanagari: ' + hiTitle);
  ok((await page.getAttribute('html', 'lang')) === 'hi', '<html lang> becomes hi');
  await shot('08-hindi-home.png');
  await page.click('#home-grid .game-card[data-game="abc"]');
  await page.click('#abc-grid .tile:nth-child(5)'); // speak path in hindi mode — no crash
  await page.click('#btn-back');
  await page.waitForSelector('#screen-home.active');

  console.log('# persistence across reload');
  const starsPre = await page.textContent('#star-count');
  await page.reload();
  await page.waitForSelector('#home-grid .game-card');
  const starsPost = await page.textContent('#star-count');
  ok(starsPre === starsPost && parseInt(starsPost, 10) > 0, `stars persist after reload (${starsPost})`);
  ok(/[ऀ-ॿ]/.test(await page.textContent('#home-title')), 'language choice persists after reload');

  console.log('# responsive');
  await page.setViewportSize({ width: 390, height: 844 });
  await shot('09-mobile-portrait.png');
  await page.click('#home-grid .game-card[data-game="memory"]');
  await shot('10-mobile-memory.png');
  await page.click('#btn-back');
  await page.setViewportSize({ width: 844, height: 390 });
  await shot('11-mobile-landscape.png');

  await browser.close();

  if (errors.length) {
    console.error('\nPAGE ERRORS:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log(`\nALL PASS (${passed} assertions, 0 page errors). Screenshots in tests/screenshots/`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
