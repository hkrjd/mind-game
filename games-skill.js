'use strict';
/* ================================================================
   games-skill.js — learning games: Tracing, Word Banao, Phonics,
   Bada-Chhota (Aa), Shadow Match, Jod-Ghatao, Ghadi (clock),
   Ginti 1-100, Rhymes.
   ================================================================ */

Object.assign(T, {
  phonicsDesc: { en: 'Which one starts with the letter? Listen and tap!', hi: 'कौन सा उस अक्षर से शुरू होता है? सुनो और दबाओ!' },
  mathDesc: { en: 'Count the pictures and answer!', hi: 'चित्र गिनो और जवाब दो!' },
  pickCapFirst: { en: 'First tap a BIG letter!', hi: 'पहले बड़ा अक्षर दबाओ!', hiSay: 'Pehle bada akshar dabao!' }
});

/* ================= Tracing (Likhna Seekho) ================= */

const tracingGame = (() => {
  const SIZE = 360;
  buildScreen('tracing',
    '<div class="tabs" id="tracing-tabs">' +
    '<button class="tab active" data-tab="letters">ABC</button>' +
    '<button class="tab" data-tab="numbers">123</button>' +
    '<button class="tab" data-tab="varna">कखग</button>' +
    '<button class="tab" data-tab="shapes">🔺</button></div>' +
    '<p class="hint" data-t="traceHint"></p>' +
    '<div id="trace-wrap" data-item="" data-done="0">' +
    '<button id="trace-prev" class="icon-btn" aria-label="Previous">⬅️</button>' +
    '<canvas id="trace-canvas" width="' + SIZE + '" height="' + SIZE + '"></canvas>' +
    '<button id="trace-next" class="icon-btn" aria-label="Next">➡️</button></div>' +
    '<button id="trace-clear" class="big-btn alt" data-t="clearBtn"></button>');

  const TRACE_SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
  const state = { tab: 'letters', idx: 0, samples: [], done: false, drawing: false, last: null, stroke: 0 };
  let canvas, ctx, paint, pctx; // paint = offscreen coverage layer

  function itemsLen() {
    return state.tab === 'letters' ? LETTERS.length
      : state.tab === 'numbers' ? NUMBERS.length
        : state.tab === 'varna' ? VARNAMALA.length
          : TRACE_SHAPES.length;
  }

  function drawGlyph(c) {
    c.clearRect(0, 0, SIZE, SIZE);
    c.fillStyle = '#E7DCCF';
    c.strokeStyle = '#E7DCCF';
    if (state.tab === 'shapes') {
      const key = TRACE_SHAPES[state.idx];
      c.lineWidth = 36;
      c.lineJoin = 'round';
      c.beginPath();
      if (key === 'circle') c.arc(180, 180, 125, 0, Math.PI * 2);
      else if (key === 'square') c.rect(60, 60, 240, 240);
      else if (key === 'triangle') { c.moveTo(180, 45); c.lineTo(315, 315); c.lineTo(45, 315); c.closePath(); }
      else if (key === 'diamond') { c.moveTo(180, 25); c.lineTo(325, 180); c.lineTo(180, 335); c.lineTo(35, 180); c.closePath(); }
      else if (key === 'star') {
        const pts = [[50, 4], [61, 35], [95, 35], [67, 56], [78, 91], [50, 71], [22, 91], [33, 56], [5, 35], [39, 35]];
        pts.forEach((p, i) => { const x = p[0] * 3.6, y = p[1] * 3.6; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); });
        c.closePath();
      } else if (key === 'heart') {
        c.save();
        c.scale(3.6, 3.6);
        c.lineWidth = 10;
        const p = new Path2D('M50 88 C22 66 6 46 10 27 C13 12 31 7 42 17 C46 21 49 25 50 29 C51 25 54 21 58 17 C69 7 87 12 90 27 C94 46 78 66 50 88 Z');
        c.stroke(p);
        c.restore();
        return;
      }
      c.stroke();
    } else {
      const str = state.tab === 'letters' ? LETTERS[state.idx].ch
        : state.tab === 'numbers' ? String(NUMBERS[state.idx].n)
          : VARNAMALA[state.idx].ch;
      c.font = 'bold ' + (str.length > 1 ? 230 : 300) + 'px system-ui, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(str, SIZE / 2, SIZE / 2 + 14);
    }
  }

  function prepare(speakIt) {
    state.done = false;
    state.stroke = 0;
    drawGlyph(ctx);
    pctx.clearRect(0, 0, SIZE, SIZE);
    // Sample glyph pixels for coverage checking
    const g = document.createElement('canvas');
    g.width = SIZE; g.height = SIZE;
    const gc = g.getContext('2d');
    const saveTab = drawGlyph(gc);
    void saveTab;
    const img = gc.getImageData(0, 0, SIZE, SIZE).data;
    const pts = [];
    for (let y = 4; y < SIZE; y += 7) {
      for (let x = 4; x < SIZE; x += 7) {
        if (img[(y * SIZE + x) * 4 + 3] > 100) pts.push([x, y]);
      }
    }
    state.samples = shuffle(pts).slice(0, 260);
    const wrap = $('trace-wrap');
    const label = state.tab === 'letters' ? LETTERS[state.idx].ch
      : state.tab === 'numbers' ? String(NUMBERS[state.idx].n)
        : state.tab === 'varna' ? VARNAMALA[state.idx].ch
          : TRACE_SHAPES[state.idx];
    wrap.dataset.item = label;
    wrap.dataset.done = '0';
    // Ordered path of glyph points for automated tests (and future hint arrows)
    const path = state.samples.slice(0, 44).sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
    wrap.dataset.testpath = JSON.stringify(path);
    if (speakIt) speakItem();
  }

  function speakItem() {
    if (state.tab === 'letters') {
      const l = LETTERS[state.idx];
      sayPhrase(phrase(l.ch + '!', l.ch + '!', l.ch + '!'));
    } else if (state.tab === 'numbers') {
      const n = NUMBERS[state.idx];
      sayPhrase(phrase(n.n + '! ' + n.en + '!', n.n + '! ' + n.hi + '!', n.n + '! ' + n.hiSay + '!'));
    } else if (state.tab === 'varna') {
      sayPhrase(varnaPhrase(VARNAMALA[state.idx]));
    } else {
      sayPhrase(wordPhrase(SHAPES.find((s) => s.key === TRACE_SHAPES[state.idx])));
    }
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * (SIZE / r.width), (e.clientY - r.top) * (SIZE / r.height)];
  }

  function strokeTo(p, begin) {
    const col = COLORS[state.stroke % COLORS.length].hex;
    [[ctx, 24], [pctx, 34]].forEach(([c, w]) => {
      c.strokeStyle = col;
      c.lineWidth = w;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      c.moveTo(begin ? p[0] : state.last[0], begin ? p[1] : state.last[1]);
      c.lineTo(p[0], p[1] + (begin ? 0.01 : 0));
      c.stroke();
    });
    state.last = p;
  }

  function coverage() {
    if (!state.samples.length) return 0;
    const img = pctx.getImageData(0, 0, SIZE, SIZE).data;
    let hit = 0;
    state.samples.forEach(([x, y]) => {
      if (img[(y * SIZE + x) * 4 + 3] > 0) hit++;
    });
    return hit / state.samples.length;
  }

  function checkDone() {
    if (state.done) return;
    if (coverage() >= 0.55) {
      state.done = true;
      state.drawing = false; // an ongoing drag must not scribble on the next glyph
      $('trace-wrap').dataset.done = '1';
      sfx.correct();
      store.addStars(1);
      starFly(canvas);
      confetti(16);
      if (state.tab === 'letters') {
        const l = LETTERS[state.idx];
        sayPhrase(joinPhrase(rand(PRAISE), phrase(l.ch + '! ' + l.ch + ' for ' + l.en + '!', l.ch + '! ' + l.ch + ' से ' + l.hi + '!', l.ch + '! ' + l.ch + ' se ' + l.hiSay + '!')));
      } else if (state.tab === 'numbers') {
        sayPhrase(joinPhrase(rand(PRAISE), countPhrase(NUMBERS[state.idx].n)));
      } else if (state.tab === 'varna') {
        sayPhrase(joinPhrase(rand(PRAISE), varnaPhrase(VARNAMALA[state.idx])));
      } else {
        sayPhrase(joinPhrase(rand(PRAISE), wordPhrase(SHAPES.find((s) => s.key === TRACE_SHAPES[state.idx]))));
      }
      later(() => { move(1, false); }, 1700);
    }
  }

  function move(d, speakIt) {
    state.idx = (state.idx + d + itemsLen()) % itemsLen();
    prepare(speakIt !== false);
  }

  function render() {
    document.querySelectorAll('#tracing-tabs .tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === state.tab);
    });
    prepare(false);
  }

  function init() {
    canvas = $('trace-canvas');
    ctx = canvas.getContext('2d');
    paint = document.createElement('canvas');
    paint.width = SIZE; paint.height = SIZE;
    pctx = paint.getContext('2d');
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      state.drawing = true;
      state.stroke++;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      strokeTo(pos(e), true);
    });
    let moveCount = 0;
    canvas.addEventListener('pointermove', (e) => {
      if (!state.drawing) return;
      strokeTo(pos(e), false);
      // Live check so the praise lands the moment the glyph is covered,
      // without waiting for the child to lift their finger.
      if (++moveCount % 12 === 0) checkDone();
    });
    ['pointerup', 'pointercancel'].forEach((ev) => canvas.addEventListener(ev, () => {
      if (!state.drawing) return;
      state.drawing = false;
      checkDone();
    }));
    document.querySelectorAll('#tracing-tabs .tab').forEach((t) => {
      t.addEventListener('click', () => { sfx.pop(); state.tab = t.dataset.tab; state.idx = 0; render(); speakItem(); });
    });
    $('trace-prev').addEventListener('click', () => { sfx.pop(); move(-1); });
    $('trace-next').addEventListener('click', () => { sfx.pop(); move(1); });
    $('trace-clear').addEventListener('click', () => { sfx.pop(); prepare(false); });
  }

  init();
  return { render };
})();

GAMES.tracing = { emoji: '✏️', color: 'var(--mint)', screen: 'screen-tracing', enter() { tracingGame.render(); } };

/* ================= Word Banao (Spelling) ================= */

const spellingGame = (() => {
  buildScreen('spelling',
    '<p class="hint" data-t="spellHint"></p>' +
    '<div id="spell-dots"></div>' +
    '<div id="spell-emoji" class="intro-emoji"></div>' +
    '<div id="spell-slots" data-word="" data-filled="0"></div>' +
    '<div id="spell-bank"></div>');

  const state = { words: [], i: 0, filled: 0 };

  function dots() { renderDots('spell-dots', 5, state.i); }

  function newWord() {
    const w = state.words[state.i];
    state.filled = 0;
    dots();
    $('spell-emoji').textContent = w.emoji;
    const slots = $('spell-slots');
    slots.dataset.word = w.word;
    slots.dataset.filled = '0';
    slots.innerHTML = '';
    w.word.split('').forEach(() => {
      const s = document.createElement('span');
      s.className = 'slot';
      slots.appendChild(s);
    });
    const bank = $('spell-bank');
    bank.innerHTML = '';
    const distractors = [];
    while (distractors.length < 3) {
      const ch = LETTERS[Math.floor(Math.random() * 26)].ch;
      if (!w.word.includes(ch) && !distractors.includes(ch)) distractors.push(ch);
    }
    shuffle(w.word.split('').concat(distractors)).forEach((ch) => {
      const b = document.createElement('button');
      b.className = 'bank-tile';
      b.textContent = ch;
      b.dataset.l = ch;
      b.addEventListener('click', () => pick(b, w));
      bank.appendChild(b);
    });
    sayPhrase(phrase('Make the word ' + cap(w.word) + '!', cap(w.word) + ' बनाओ!', cap(w.word) + ' banao!'));
  }

  function cap(s) { return s.charAt(0) + s.slice(1).toLowerCase(); }

  function pick(tile, w) {
    if (tile.classList.contains('used')) return;
    const expect = w.word[state.filled];
    if (tile.dataset.l === expect) {
      tile.classList.add('used');
      const slot = $('spell-slots').children[state.filled];
      slot.textContent = expect;
      slot.classList.add('filled', 'pop');
      state.filled++;
      $('spell-slots').dataset.filled = String(state.filled);
      sfx.pop();
      if (state.filled >= w.word.length) {
        sfx.correct();
        store.addStars(1);
        starFly($('spell-slots'));
        const spelt = w.word.split('').join('! ') + '! ' + cap(w.word) + '!';
        sayPhrase(joinPhrase(rand(PRAISE), phrase(spelt, spelt + ' मतलब ' + w.hi + '!', spelt + ' matlab ' + w.hiSay + '!')));
        state.i++;
        later(() => {
          if (state.i >= 5) {
            dots();
            celebrate({ again: () => { hideCelebrate(); start(); } });
          } else {
            newWord();
          }
        }, 2000);
      }
    } else {
      nope(tile);
    }
  }

  function start() {
    state.words = sample(SPELL_WORDS, 5);
    state.i = 0;
    newWord();
  }

  return { start };
})();

GAMES.spelling = { emoji: '🔡', color: 'var(--coral)', screen: 'screen-spelling', enter() { spellingGame.start(); } };

/* ================= Phonics ================= */

buildScreen('phonics',
  '<div class="intro-emoji">🔤</div>' +
  '<p class="hint" data-t="phonicsDesc"></p>' +
  '<button id="phonics-start" class="big-btn" data-t="startBtn"></button>');

function phonicsQuestion() {
  const three = sample(LETTERS, 3);
  const ans = three[0];
  return {
    key: 'PH' + ans.ch,
    prompt: phrase('Which one starts with ' + ans.ch + '?', ans.ch + ' से क्या शुरू होता है?', ans.ch + ' se kya shuru hota hai?'),
    extra: '<div class="math-eq">' + ans.ch + '</div>',
    choices: shuffle(three).map((l) => ({ key: l.ch, html: '<span>' + l.emoji + '</span>' })),
    answer: ans.ch,
    answerPhrase: phrase(ans.en + '! ' + ans.ch + ' for ' + ans.en + '!', ans.hi + '! ' + ans.ch + ' से ' + ans.hi + '!', ans.hiSay + '! ' + ans.ch + ' se ' + ans.hiSay + '!')
  };
}
$('phonics-start').addEventListener('click', () => {
  quiz.start({ make: phonicsQuestion, backTo: 'screen-phonics' });
});
GAMES.phonics = { emoji: '🗣️', color: 'var(--sky)', screen: 'screen-phonics', enter() { } };

/* ================= Bada-Chhota (Capital ↔ small) ================= */

const capsmallGame = (() => {
  buildScreen('capsmall',
    '<p class="hint" data-t="capsmallHint"></p>' +
    '<div id="cs-dots"></div>' +
    '<div id="cs-area" data-round="0" data-matched="0">' +
    '<svg id="cs-lines" aria-hidden="true"></svg>' +
    '<div id="cs-caps" class="cs-col"></div>' +
    '<div id="cs-smalls" class="cs-col"></div></div>');

  const state = { round: 0, letters: [], selected: null, matched: 0 };
  const matches = []; // {capEl, smallEl, hex} — connecting lines of the current round

  function lineCenter(el) {
    const area = $('cs-area').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2 - area.left, r.top + r.height / 2 - area.top];
  }

  function drawLine(m, animate) {
    const a = lineCenter(m.capEl);
    const b = lineCenter(m.smallEl);
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('x1', a[0]);
    ln.setAttribute('y1', a[1]);
    ln.setAttribute('x2', b[0]);
    ln.setAttribute('y2', b[1]);
    ln.setAttribute('stroke', m.hex);
    ln.setAttribute('stroke-width', '6');
    ln.setAttribute('stroke-linecap', 'round');
    if (animate && !REDUCED) {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      ln.style.strokeDasharray = String(len);
      ln.style.strokeDashoffset = String(len);
      ln.style.transition = 'stroke-dashoffset .4s ease';
      requestAnimationFrame(() => { ln.style.strokeDashoffset = '0'; });
    }
    $('cs-lines').appendChild(ln);
  }

  function redrawLines() {
    const svg = $('cs-lines');
    svg.innerHTML = '';
    matches.forEach((m) => drawLine(m, false));
  }
  window.addEventListener('resize', redrawLines);

  function dots() { renderDots('cs-dots', 3, state.round); }

  function nextRound() {
    state.letters = sample(LETTERS, 4).map((l) => l.ch);
    state.selected = null;
    state.matched = 0;
    matches.length = 0;
    $('cs-lines').innerHTML = '';
    $('cs-area').dataset.round = String(state.round + 1);
    $('cs-area').dataset.matched = '0';
    dots();
    const caps = $('cs-caps');
    const smalls = $('cs-smalls');
    caps.innerHTML = '';
    smalls.innerHTML = '';
    state.letters.forEach((ch) => {
      const b = document.createElement('button');
      b.className = 'cs-tile';
      b.textContent = ch;
      b.dataset.l = ch;
      b.addEventListener('click', () => pickCap(b));
      caps.appendChild(b);
    });
    shuffle(state.letters).forEach((ch) => {
      const b = document.createElement('button');
      b.className = 'cs-tile cs-small';
      b.textContent = ch.toLowerCase();
      b.dataset.l = ch;
      b.addEventListener('click', () => pickSmall(b));
      smalls.appendChild(b);
    });
  }

  function pickCap(b) {
    if (b.classList.contains('matched')) return;
    sfx.pop();
    document.querySelectorAll('#cs-caps .cs-tile').forEach((t) => t.classList.remove('selected'));
    b.classList.add('selected');
    state.selected = b;
    sayPhrase(phrase('Big ' + b.dataset.l + '! Find small ' + b.dataset.l.toLowerCase() + '!',
      'बड़ा ' + b.dataset.l + '! छोटा ' + b.dataset.l.toLowerCase() + ' ढूँढो!',
      'Bada ' + b.dataset.l + '! Chhota ' + b.dataset.l.toLowerCase() + ' dhoondho!'));
  }

  function pickSmall(b) {
    if (b.classList.contains('matched')) return;
    if (!state.selected) {
      b.classList.add('wiggle');
      b.addEventListener('animationend', () => b.classList.remove('wiggle'), { once: true });
      sayPhrase(T.pickCapFirst);
      return;
    }
    if (b.dataset.l === state.selected.dataset.l) {
      b.classList.add('matched');
      state.selected.classList.add('matched');
      state.selected.classList.remove('selected');
      const ch = b.dataset.l;
      const m = { capEl: state.selected, smallEl: b, hex: COLORS[state.matched % COLORS.length].hex };
      matches.push(m);
      drawLine(m, true);
      state.selected = null;
      state.matched++;
      $('cs-area').dataset.matched = String(state.matched);
      sfx.correct();
      store.addStars(1);
      starFly(b);
      sayPhrase(phrase(ch + ' and ' + ch.toLowerCase() + '! Great!', 'बड़ा ' + ch + ' और छोटा ' + ch.toLowerCase() + '! वाह!', 'Bada ' + ch + ' aur chhota ' + ch.toLowerCase() + '! Wah!'));
      if (state.matched >= 4) {
        state.round++;
        dots();
        later(() => {
          if (state.round >= 3) {
            celebrate({ again: () => { hideCelebrate(); start(); } });
          } else {
            nextRound();
          }
        }, 1400);
      }
    } else {
      nope(b);
    }
  }

  function start() {
    state.round = 0;
    nextRound();
  }

  return { start };
})();

GAMES.capsmall = { emoji: '🔠', color: 'var(--tangerine)', screen: 'screen-capsmall', enter() { capsmallGame.start(); } };

/* ================= Shadow Match ================= */

const shadowGame = (() => {
  buildScreen('shadow',
    '<p class="hint" data-t="shadowHint"></p>' +
    '<div id="shadow-dots"></div>' +
    '<div id="shadow-area" data-round="0" data-matched="0">' +
    '<div id="shadow-items" class="shadow-row"></div>' +
    '<div id="shadow-shadows" class="shadow-row"></div></div>');

  const state = { round: 0, items: [], selected: null, matched: 0 };

  function dots() { renderDots('shadow-dots', 2, state.round); }

  function nextRound() {
    state.items = state.round === 0 ? sample(ANIMALS, 6) : sample(MEMORY_POOL, 6);
    state.selected = null;
    state.matched = 0;
    $('shadow-area').dataset.round = String(state.round + 1);
    $('shadow-area').dataset.matched = '0';
    dots();
    const top = $('shadow-items');
    const bottom = $('shadow-shadows');
    top.innerHTML = '';
    bottom.innerHTML = '';
    state.items.forEach((it) => {
      const b = document.createElement('button');
      b.className = 'tile shadow-tile';
      b.dataset.k = it.en;
      b.innerHTML = '<span class="t-big">' + it.emoji + '</span>';
      b.addEventListener('click', () => {
        if (b.classList.contains('matched')) return;
        sfx.pop();
        document.querySelectorAll('#shadow-items .shadow-tile').forEach((t) => t.classList.remove('selected'));
        b.classList.add('selected');
        state.selected = b;
        sayPhrase(wordPhrase(it));
      });
      top.appendChild(b);
    });
    shuffle(state.items).forEach((it) => {
      const b = document.createElement('button');
      b.className = 'tile shadow-tile shadow-dark';
      b.dataset.k = it.en;
      b.innerHTML = '<span class="t-big silhouette">' + it.emoji + '</span>';
      b.addEventListener('click', () => pickShadow(b, it));
      bottom.appendChild(b);
    });
  }

  function pickShadow(b, it) {
    if (b.classList.contains('matched')) return;
    if (!state.selected) {
      b.classList.add('wiggle');
      b.addEventListener('animationend', () => b.classList.remove('wiggle'), { once: true });
      return;
    }
    if (b.dataset.k === state.selected.dataset.k) {
      b.classList.add('matched');
      b.querySelector('.silhouette').classList.remove('silhouette');
      state.selected.classList.add('matched');
      state.selected.classList.remove('selected');
      state.selected = null;
      state.matched++;
      $('shadow-area').dataset.matched = String(state.matched);
      sfx.correct();
      store.addStars(1);
      starFly(b);
      sayPhrase(joinPhrase(rand(PRAISE), wordPhrase(it)));
      if (state.matched >= 6) {
        state.round++;
        dots();
        later(() => {
          if (state.round >= 2) {
            celebrate({ again: () => { hideCelebrate(); start(); } });
          } else {
            nextRound();
          }
        }, 1400);
      }
    } else {
      nope(b);
    }
  }

  function start() {
    state.round = 0;
    nextRound();
  }

  return { start };
})();

GAMES.shadow = { emoji: '🔍', color: 'var(--lilac)', screen: 'screen-shadow', enter() { shadowGame.start(); } };

/* ================= Jod-Ghatao (Math) ================= */

buildScreen('math',
  '<div class="intro-emoji">➕</div>' +
  '<p class="hint" data-t="mathDesc"></p>' +
  '<div class="overlay-btns">' +
  '<button id="math-plus" class="big-btn" data-t="plusBtn"></button>' +
  '<button id="math-minus" class="big-btn alt" data-t="minusBtn"></button></div>');

function mathChoices(ans) {
  const top = lvl(10, 10, 20);
  const cands = shuffle([ans - 2, ans - 1, ans + 1, ans + 2].filter((x) => x >= 0 && x <= top && x !== ans)).slice(0, 2);
  return shuffle([ans].concat(cands)).map((n) => ({ key: String(n), html: '<span>' + n + '</span>' }));
}

function emojiRow(em, n, crossedFrom) {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += (crossedFrom !== undefined && i >= crossedFrom)
      ? '<span class="crossed">' + em + '</span> '
      : '<span>' + em + '</span> ';
  }
  return out.trim();
}

function plusQuestion() {
  const a = 1 + Math.floor(Math.random() * lvl(3, 5, 9));
  const b = 1 + Math.floor(Math.random() * lvl(3, 4, 9));
  const sum = a + b;
  const em = rand(COUNT_EMOJIS);
  return {
    key: 'P' + a + '_' + b,
    prompt: phrase('How many is ' + a + ' plus ' + b + '?', a + ' और ' + b + ' कितने होते हैं?', a + ' aur ' + b + ' kitne hote hain?'),
    extra: '<div class="math-eq">' + a + ' + ' + b + ' = ?</div>' +
      '<div class="math-row">' + emojiRow(em, a) + ' <b>+</b> ' + emojiRow(em, b) + '</div>',
    choices: mathChoices(sum),
    answer: String(sum),
    answerPhrase: phrase(sum + '! ' + a + ' plus ' + b + ' is ' + sum + '!',
      sum + '! ' + a + ' और ' + b + ' ' + HINDI_100[sum - 1] + ' होते हैं!',
      sum + '! ' + a + ' aur ' + b + ' ' + HINDI_100_SAY[sum - 1] + ' hote hain!')
  };
}

function minusQuestion() {
  const a = 3 + Math.floor(Math.random() * lvl(4, 7, 14)); // 3..9 (more on hard)
  const b = 1 + Math.floor(Math.random() * (a - 1)); // 1..a-1
  const res = a - b;
  const em = rand(COUNT_EMOJIS);
  return {
    key: 'M' + a + '_' + b,
    prompt: phrase('How many are left? ' + a + ' minus ' + b + '!', a + ' में से ' + b + ' गए, कितने बचे?', a + ' mein se ' + b + ' gaye, kitne bache?'),
    extra: '<div class="math-eq">' + a + ' − ' + b + ' = ?</div>' +
      '<div class="math-row">' + emojiRow(em, a, res) + '</div>',
    choices: mathChoices(res),
    answer: String(res),
    answerPhrase: phrase(res + '! ' + a + ' minus ' + b + ' is ' + res + '!',
      res + '! ' + HINDI_100[res - 1] + ' बचे!',
      res + '! ' + HINDI_100_SAY[res - 1] + ' bache!')
  };
}

$('math-plus').addEventListener('click', () => quiz.start({ make: plusQuestion, backTo: 'screen-math' }));
$('math-minus').addEventListener('click', () => quiz.start({ make: minusQuestion, backTo: 'screen-math' }));
GAMES.math = { emoji: '➕', color: 'var(--mint)', screen: 'screen-math', enter() { } };

/* ================= Ghadi (Clock) ================= */

const clockGame = (() => {
  buildScreen('clock',
    '<p class="hint" data-t="clockHint"></p>' +
    '<div id="clock-face" data-hour="3"></div>' +
    '<div id="clock-hours"></div>' +
    '<button id="clock-quiz" class="big-btn quiz-btn" data-t="findBtn"></button>');

  function clockSVG(h) {
    let ticks = '';
    for (let i = 1; i <= 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      const x = 100 + 76 * Math.cos(a);
      const y = 100 + 76 * Math.sin(a) + 7;
      ticks += '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" font-size="20" font-weight="700" fill="#4E342E">' + i + '</text>';
    }
    const ha = (h * 30 - 90) * Math.PI / 180;
    const hx = 100 + 44 * Math.cos(ha);
    const hy = 100 + 44 * Math.sin(ha);
    return '<svg viewBox="0 0 200 200" class="clock-svg" aria-hidden="true">' +
      '<circle cx="100" cy="100" r="95" fill="#FFFFFF" stroke="#FFD93D" stroke-width="8"/>' +
      ticks +
      '<line x1="100" y1="100" x2="100" y2="38" stroke="#4D96FF" stroke-width="6" stroke-linecap="round"/>' +
      '<line x1="100" y1="100" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" stroke="#E53935" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="100" cy="100" r="7" fill="#4E342E"/></svg>';
  }

  function timePhrase(h) {
    return phrase("It's " + h + " o'clock!",
      h === 1 ? '1 बजा है!' : h + ' बजे हैं!',
      h === 1 ? '1 baja hai!' : h + ' baje hain!');
  }

  function setHour(h, speakIt) {
    $('clock-face').innerHTML = clockSVG(h);
    $('clock-face').dataset.hour = String(h);
    document.querySelectorAll('#clock-hours .hour-btn').forEach((b) => {
      b.classList.toggle('selected', Number(b.dataset.h) === h);
    });
    if (speakIt) sayPhrase(timePhrase(h));
  }

  function render() {
    const row = $('clock-hours');
    if (!row.children.length) {
      for (let h = 1; h <= 12; h++) {
        const b = document.createElement('button');
        b.className = 'hour-btn';
        b.textContent = h;
        b.dataset.h = String(h);
        b.addEventListener('click', () => { sfx.pop(); setHour(h, true); });
        row.appendChild(b);
      }
    }
    setHour(Number($('clock-face').dataset.hour) || 3, false);
  }

  function makeQuestion() {
    const h = 1 + Math.floor(Math.random() * 12);
    const opts = [h];
    while (opts.length < 3) {
      const o = 1 + Math.floor(Math.random() * 12);
      if (!opts.includes(o)) opts.push(o);
    }
    return {
      key: 'H' + h,
      prompt: T.whatTime,
      extra: clockSVG(h),
      choices: shuffle(opts).map((n) => ({ key: String(n), html: '<span>' + n + '</span>' })),
      answer: String(h),
      answerPhrase: timePhrase(h)
    };
  }

  return { render, makeQuestion };
})();

$('clock-quiz').addEventListener('click', () => quiz.start({ make: () => clockGame.makeQuestion(), backTo: 'screen-clock' }));
GAMES.clock = { emoji: '🕐', color: 'var(--sunny)', screen: 'screen-clock', enter() { clockGame.render(); } };

/* ================= Ginti 1-100 ================= */

const board100Game = (() => {
  buildScreen('board100',
    '<p class="hint" id="board-hint" data-t="boardHint"></p>' +
    '<div id="board-grid" data-target="0" data-found="0"></div>' +
    '<button id="board-find" class="big-btn quiz-btn" data-t="findBtn"></button>');

  const state = { mode: 'learn', target: 0, found: 0 };

  function hintFind() {
    $('board-hint').textContent = store.getLang() === 'hi' ? state.target + ' ढूँढो!' : 'Find ' + state.target + '!';
  }

  function nextTarget() {
    let t = 1 + Math.floor(Math.random() * 100);
    if (t === state.target) t = (t % 100) + 1;
    state.target = t;
    $('board-grid').dataset.target = String(t);
    hintFind();
    sayPhrase(phrase('Find ' + t + '!', t + ' ढूँढो!', t + ' dhoondho!'));
  }

  function tap(b, n) {
    if (state.mode === 'learn') {
      sfx.pop();
      popIt(b);
      sayPhrase(numPhrase100(n));
      return;
    }
    if (n === state.target) {
      sfx.correct();
      b.classList.add('found', 'pop');
      store.addStars(1);
      starFly(b);
      state.found++;
      $('board-grid').dataset.found = String(state.found);
      sayPhrase(joinPhrase(rand(PRAISE), numPhrase100(n)));
      if (state.found >= lvl(3, 5, 7)) {
        state.mode = 'learn';
        $('board-hint').textContent = T.boardHint[store.getLang()];
        later(() => celebrate({ again: () => { hideCelebrate(); startFind(); } }), 1200);
      } else {
        later(nextTarget, 1500);
      }
    } else {
      sfx.wrong();
      b.classList.add('wiggle');
      b.addEventListener('animationend', () => b.classList.remove('wiggle'), { once: true });
    }
  }

  function render() {
    const grid = $('board-grid');
    if (!grid.children.length) {
      for (let n = 1; n <= 100; n++) {
        const b = document.createElement('button');
        b.className = 'num-cell' + (Math.floor((n - 1) / 10) % 2 ? ' num-alt' : '');
        b.textContent = n;
        b.dataset.n = String(n);
        b.addEventListener('click', () => tap(b, n));
        grid.appendChild(b);
      }
    }
  }

  function startFind() {
    state.mode = 'find';
    state.found = 0;
    $('board-grid').dataset.found = '0';
    document.querySelectorAll('#board-grid .found').forEach((b) => b.classList.remove('found'));
    nextTarget();
  }

  function onLang() {
    if (state.mode === 'find') hintFind();
  }

  function enter() {
    state.mode = 'learn';
    $('board-hint').textContent = T.boardHint[store.getLang()];
    render();
  }

  return { enter, startFind, onLang };
})();

$('board-find').addEventListener('click', () => board100Game.startFind());
GAMES.board100 = { emoji: '💯', color: 'var(--coral)', screen: 'screen-board100', enter() { board100Game.enter(); }, onLang() { board100Game.onLang(); } };

/* ================= Rhymes ================= */

const rhymesGame = (() => {
  buildScreen('rhymes',
    '<div id="rhymes-list" class="rhymes-grid"></div>' +
    '<div id="rhyme-view" data-open="" data-line="-1" hidden>' +
    '<div id="rhyme-emoji" class="intro-emoji"></div>' +
    '<div id="rhyme-lines"></div>' +
    '<button id="rhyme-play" class="big-btn" data-t="playAllBtn"></button></div>');

  const state = { open: null, timer: null, playing: false, line: -1 };

  function speakLine(r, i) {
    highlight(i);
    if (r.lang === 'en') {
      speech.speak(r.lines[i], 'en');
    } else if (speech.hasHindi()) {
      speech.speak(r.lines[i].hi, 'hi');
    } else {
      if (speech.supported()) speech.warnNoHindiOnce();
      speech.speak(r.lines[i].hiSay, 'en');
    }
  }

  function highlight(i) {
    state.line = i;
    $('rhyme-view').dataset.line = String(i);
    document.querySelectorAll('#rhyme-lines .rline').forEach((el, k) => {
      el.classList.toggle('active', k === i);
    });
  }

  function stopPlay() {
    state.playing = false;
    speech.cancelAfter(state.timer);
    $('rhyme-play').textContent = T.playAllBtn[store.getLang()];
  }

  function playFrom(i) {
    const r = state.open;
    if (!r || i >= r.lines.length) { stopPlay(); highlight(-1); return; }
    speakLine(r, i);
    // A line used to be given `characters x 95ms`, which ignored the speech
    // speed the parent picked and measured the Devanagari even when the
    // romanized line was the one being read. Wait for the voice instead.
    state.timer = speech.after(() => playFrom(i + 1), { min: 500, gap: 350 });
  }

  function openRhyme(r) {
    state.open = r;
    $('rhymes-list').hidden = true;
    const view = $('rhyme-view');
    view.hidden = false;
    view.dataset.open = r.id;
    $('rhyme-emoji').textContent = r.emoji;
    const box = $('rhyme-lines');
    box.innerHTML = '';
    r.lines.forEach((ln, i) => {
      const d = document.createElement('button');
      d.className = 'rline';
      d.textContent = r.lang === 'en' ? ln : ln.hi;
      d.addEventListener('click', () => { stopPlay(); speakLine(r, i); });
      box.appendChild(d);
    });
    highlight(-1);
  }

  function closeRhyme() {
    stopPlay();
    state.open = null;
    $('rhyme-view').hidden = true;
    $('rhyme-view').dataset.open = '';
    $('rhymes-list').hidden = false;
  }

  function render() {
    const lang = store.getLang();
    const list = $('rhymes-list');
    list.innerHTML = '';
    RHYMES.forEach((r) => {
      const b = document.createElement('button');
      b.className = 'game-card rhyme-card';
      b.style.background = r.lang === 'en' ? 'var(--sky)' : 'var(--tangerine)';
      b.dataset.rhyme = r.id;
      b.innerHTML = '<span class="g-emoji">' + r.emoji + '</span><span class="g-title">' + r.title[lang] + '</span>';
      b.addEventListener('click', () => { sfx.pop(); openRhyme(r); });
      list.appendChild(b);
    });
  }

  function enter() {
    closeRhyme();
    render();
  }

  $('rhyme-play').addEventListener('click', () => {
    if (state.playing) { stopPlay(); speech.stop(); return; }
    state.playing = true;
    $('rhyme-play').textContent = T.stopBtn[store.getLang()];
    playFrom(0);
  });

  return {
    enter,
    onLang: render,
    onBack() {
      if (state.open) { closeRhyme(); return true; }
      return false;
    },
    onLeave: stopPlay
  };
})();

GAMES.rhymes = {
  emoji: '🎵', color: 'var(--sunny)', screen: 'screen-rhymes',
  enter() { rhymesGame.enter(); },
  onLang() { rhymesGame.onLang(); },
  onBack() { return rhymesGame.onBack(); },
  onLeave() { rhymesGame.onLeave(); }
};

/* ================= Sticker Book ================= */

const stickersGame = (() => {
  buildScreen('stickers',
    '<p class="hint" data-t="stickerHint"></p>' +
    '<div id="sticker-shelf" class="tile-grid" data-unlocked="0"></div>');

  function render() {
    const unlocked = Math.min(Math.floor(store.getStars() / STICKER_STEP), STICKERS.length);
    const shelf = $('sticker-shelf');
    shelf.dataset.unlocked = String(unlocked);
    shelf.innerHTML = '';
    STICKERS.forEach((s, i) => {
      const has = i < unlocked;
      const b = document.createElement('button');
      b.className = 'tile sticker-tile' + (has ? '' : ' locked');
      b.innerHTML = '<span class="t-big' + (has ? '' : ' silhouette') + '">' + s.emoji + '</span>' +
        '<span class="t-word">' + (has ? s[store.getLang()] : '⭐ ' + ((i + 1) * STICKER_STEP)) + '</span>';
      b.addEventListener('click', () => {
        sfx.pop();
        popIt(b);
        if (has) sayPhrase(wordPhrase(s));
      });
      shelf.appendChild(b);
    });
  }

  return { render };
})();

GAMES.stickers = {
  emoji: '🏆', color: 'var(--sunny)', screen: 'screen-stickers',
  enter() { stickersGame.render(); }, onLang() { stickersGame.render(); }
};

/* ================= Tables (Pahade) ================= */

Object.assign(T, {
  tablesHint: { en: 'Pick a table, listen, and learn!', hi: 'टेबल चुनो, सुनो और याद करो!' }
});
GAME_TITLES.tables = { en: 'Tables', hi: 'पहाड़े', hiSay: 'Pahade' };

const tablesGame = (() => {
  buildScreen('tables',
    '<p class="hint" data-t="tablesHint"></p>' +
    '<div id="tables-picker"></div>' +
    '<div id="tables-rows" data-table="2"></div>' +
    '<div class="tables-btns">' +
    '<button id="tables-play" class="big-btn" data-t="playAllBtn"></button>' +
    '<button id="tables-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button></div>');

  const PLURALS = ['', 'ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights', 'nines', 'tens'];
  const state = { table: 2, playing: false, timer: null, line: -1 };

  // Indian school rote style: "Two ones are two, two twos are four..."
  function tableLine(a, b) {
    const prod = enNumberName(a * b).toLowerCase();
    if (a === 1) return 'One ' + enNumberName(b).toLowerCase() + ' is ' + prod;
    return enNumberName(a) + ' ' + PLURALS[b] + ' are ' + prod;
  }

  function highlight(i) {
    state.line = i;
    document.querySelectorAll('#tables-rows .trow').forEach((el, k) => {
      el.classList.toggle('active', k === i);
    });
  }

  // Recitation is always English — that is the point of this game.
  function speakLine(b) {
    highlight(b - 1);
    speech.speak(tableLine(state.table, b) + '!', 'en');
  }

  function stopPlay() {
    state.playing = false;
    speech.cancelAfter(state.timer);
    $('tables-play').textContent = T.playAllBtn[store.getLang()];
  }

  function playFrom(b) {
    if (!state.playing || b > 10) {
      stopPlay();
      highlight(-1);
      return;
    }
    speakLine(b);
    // "Two ones are two" has to finish before "two twos are four" begins.
    state.timer = speech.after(() => playFrom(b + 1), { min: 500, gap: 350 });
  }

  function render() {
    const picker = $('tables-picker');
    if (!picker.children.length) {
      for (let a = 1; a <= 10; a++) {
        const btn = document.createElement('button');
        btn.className = 'hour-btn';
        btn.textContent = a;
        btn.dataset.a = String(a);
        btn.addEventListener('click', () => {
          sfx.pop();
          stopPlay();
          speech.stop();
          state.table = a;
          state.line = -1;
          render();
        });
        picker.appendChild(btn);
      }
    }
    picker.querySelectorAll('.hour-btn').forEach((btn) => {
      btn.classList.toggle('selected', Number(btn.dataset.a) === state.table);
    });
    const rows = $('tables-rows');
    rows.dataset.table = String(state.table);
    rows.innerHTML = '';
    for (let b = 1; b <= 10; b++) {
      const r = document.createElement('button');
      r.className = 'trow';
      r.innerHTML = '<span class="tr-eq">' + state.table + ' × ' + b + ' = ' + (state.table * b) + '</span>' +
        '<span class="tr-words">' + tableLine(state.table, b) + '</span>';
      r.addEventListener('click', () => { sfx.pop(); stopPlay(); speakLine(b); });
      rows.appendChild(r);
    }
    highlight(state.line);
  }

  function makeQuestion() {
    const a = state.table;
    const b = 1 + Math.floor(Math.random() * 10);
    const prod = a * b;
    const opts = [prod];
    [a * (b + 1), a * (b - 1), prod + a, prod - a, prod + 1, prod + 2, prod - 1, prod + a * 2].forEach((c) => {
      if (opts.length < 3 && c > 0 && c <= 120 && !opts.includes(c)) opts.push(c);
    });
    const line = prod + '! ' + tableLine(a, b) + '!';
    return {
      key: 'T' + a + '_' + b,
      prompt: phrase('What is ' + a + ' times ' + b + '?', a + ' गुणा ' + b + ' कितना होता है?', a + ' guna ' + b + ' kitna hota hai?'),
      extra: '<div class="math-eq">' + a + ' × ' + b + ' = ?</div>',
      choices: shuffle(opts).map((n) => ({ key: String(n), html: '<span>' + n + '</span>' })),
      answer: String(prod),
      answerPhrase: phrase(line, line, line) // English recitation in both language modes
    };
  }

  $('tables-play').addEventListener('click', () => {
    if (state.playing) {
      stopPlay();
      speech.stop();
      return;
    }
    state.playing = true;
    $('tables-play').textContent = T.stopBtn[store.getLang()];
    playFrom(1);
  });
  $('tables-quiz').addEventListener('click', () => {
    stopPlay();
    quiz.start({ make: makeQuestion, backTo: 'screen-tables' });
  });

  return {
    enter() { stopPlay(); render(); },
    onLang() {
      render();
      $('tables-play').textContent = (state.playing ? T.stopBtn : T.playAllBtn)[store.getLang()];
    },
    onLeave: stopPlay
  };
})();

GAMES.tables = {
  emoji: '✖️', color: 'var(--sky)', screen: 'screen-tables',
  enter() { tablesGame.enter(); }, onLang() { tablesGame.onLang(); }, onLeave() { tablesGame.onLeave(); }
};
