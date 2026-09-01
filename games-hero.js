'use strict';
/* ================================================================
   games-hero.js — Spider Hero Pack: webs, legs, threads and mirrors.
   webdots — join the dots in order and a web spirals into being
   legs    — how many legs has it got? (a spider has eight, an ant six)
   thread  — walk the spider up 1..10, then back down 10..1
   suit    — mirror the pattern onto the other half of the suit
   ================================================================ */

Object.assign(T, {
  webHint: { en: 'Touch the dots in order — spin the web!', hi: 'क्रम से बिंदु छुओ — जाला बुनो!' },
  legsDesc: { en: 'How many legs has it got?', hi: 'इसके कितने पैर हैं?' },
  legsNone: { en: 'No legs!', hi: 'कोई पैर नहीं!', hiSay: 'Koi pair nahi!' },
  threadUp: { en: 'Climb up — start from the smallest!', hi: 'ऊपर चढ़ो — सबसे छोटे से शुरू!' },
  threadDown: { en: 'Come down — start from the biggest!', hi: 'नीचे आओ — सबसे बड़े से शुरू!' },
  suitHint: { en: 'Make the other half look just the same!', hi: 'दूसरा आधा हिस्सा बिल्कुल वैसा ही बनाओ!' },
  suitNew: { en: '🔁 New suit', hi: '🔁 नई पोशाक' }
});

const SVG_NS = 'http://www.w3.org/2000/svg';

/* ================= Jaala Banao (join the dots) ================= */

GAME_TITLES.webdots = { en: 'Make a Web', hi: 'जाला बनाओ', hiSay: 'Jaala banao' };

buildScreen('webdots',
  '<div class="tabs" id="web-tabs">' +
  '<button class="tab active" data-tab="numbers" aria-selected="true">123</button>' +
  '<button class="tab" data-tab="letters" aria-selected="false">ABC</button>' +
  '<button class="tab" data-tab="varna" aria-selected="false">कखग</button></div>' +
  '<p class="hint" data-t="webHint"></p>' +
  '<div id="web-area" data-next="1" data-done="0" data-tab="numbers">' +
  '<svg id="web-svg" viewBox="0 0 360 360" aria-hidden="true">' +
  '<g id="web-spokes"></g><g id="web-lines"></g></svg>' +
  '<span id="web-prize" hidden>🕷️</span></div>');

const webGame = (() => {
  // The SVG carries its own 360-unit space and the dots sit at percentages, so
  // nothing here has to measure the screen — it survives rotation for free.
  const CX = 180;
  const CY = 180;
  const R0 = 78;    // closer in than this and two dots would touch
  const R1 = 145;   // any wider and the outer dot leaves a 360px screen
  const SPOKES = 8; // a spider's eight legs, and eight threads to hang them on
  const state = { tab: 'numbers', pts: [], next: 1, n: 0, done: false };

  function items(n) {
    if (state.tab === 'letters') return LETTERS.slice(0, n);
    if (state.tab === 'varna') return VARNAMALA.slice(0, n);
    return [];
  }

  function label(i) {
    const list = items(state.n);
    if (state.tab === 'numbers') return String(i + 1);
    return list[i].ch;
  }

  // Spoken with the sound the child is learning, not the Devanagari an
  // English voice would stumble over.
  function dotPhrase(i) {
    const list = items(state.n);
    if (state.tab === 'numbers') return countWord(i + 1);
    if (state.tab === 'letters') return phrase(list[i].ch + '!', list[i].ch + '!', list[i].ch + '!');
    return phrase(list[i].roman + '!', list[i].ch + '!', list[i].roman + '!');
  }

  // One dot per spoke, creeping outward — which is how a real orb web is spun,
  // and it makes the joining threads land along the rings.
  function place(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / SPOKES;
      const r = R0 + (R1 - R0) * (n === 1 ? 0 : i / (n - 1));
      pts.push([CX + r * Math.cos(a), CY + r * Math.sin(a)]);
    }
    return pts;
  }

  function line(parent, cls, x1, y1, x2, y2) {
    const ln = document.createElementNS(SVG_NS, 'line');
    ln.setAttribute('class', cls);
    ln.setAttribute('x1', String(x1));
    ln.setAttribute('y1', String(y1));
    ln.setAttribute('x2', String(x2));
    ln.setAttribute('y2', String(y2));
    parent.appendChild(ln);
  }

  // Spokes and rings are scenery: they never change, so they are drawn once and
  // the web already looks like a web before the first dot is touched.
  function spokes() {
    const g = $('web-spokes');
    if (g.childNodes.length) return;
    for (let i = 0; i < SPOKES; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / SPOKES;
      line(g, 'web-spoke', CX, CY, CX + R1 * Math.cos(a), CY + R1 * Math.sin(a));
    }
    [0.45, 0.72, 1].forEach((f) => {
      const ring = document.createElementNS(SVG_NS, 'polygon');
      const pts = [];
      for (let i = 0; i < SPOKES; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / SPOKES;
        pts.push((CX + R1 * f * Math.cos(a)) + ',' + (CY + R1 * f * Math.sin(a)));
      }
      ring.setAttribute('class', 'web-spoke');
      ring.setAttribute('points', pts.join(' '));
      ring.setAttribute('fill', 'none');
      g.appendChild(ring);
    });
  }

  function render() {
    const area = $('web-area');
    spokes();
    area.querySelectorAll('.web-dot').forEach((d) => d.remove());
    $('web-lines').innerHTML = '';
    $('web-prize').hidden = true;
    state.n = lvl(6, 8, 10);
    state.pts = place(state.n);
    state.next = 1;
    state.done = false;
    area.dataset.next = '1';
    area.dataset.done = '0';
    area.dataset.tab = state.tab;
    state.pts.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'web-dot';
      b.dataset.n = String(i + 1);
      b.textContent = label(i);
      b.style.left = (p[0] / 3.6) + '%';
      b.style.top = (p[1] / 3.6) + '%';
      b.addEventListener('click', () => tap(i + 1, b));
      area.appendChild(b);
    });
  }

  function tap(n, b) {
    if (state.done) return;
    if (n !== state.next) {
      nope(b);
      return;
    }
    sfx.pop();
    popIt(b);
    b.classList.add('on');
    if (n > 1) {
      const a = state.pts[n - 2];
      const c = state.pts[n - 1];
      line($('web-lines'), 'web-thread', a[0], a[1], c[0], c[1]);
    }
    sayPhrase(dotPhrase(n - 1));
    state.next = n + 1;
    $('web-area').dataset.next = String(state.next);
    if (state.next > state.n) {
      state.done = true;
      $('web-area').dataset.done = '1';
      $('web-prize').hidden = false;
      sfx.correct();
      store.addStars(2);
      starFly($('web-prize'));
      confetti(20);
      later(() => celebrate({ again: () => { hideCelebrate(); render(); } }), 900);
    }
  }

  document.querySelectorAll('#web-tabs .tab').forEach((t) => {
    t.addEventListener('click', () => {
      sfx.pop();
      state.tab = t.dataset.tab;
      document.querySelectorAll('#web-tabs .tab').forEach((x) => {
        x.classList.toggle('active', x === t);
        x.setAttribute('aria-selected', x === t ? 'true' : 'false');
      });
      render();
    });
  });

  return { render };
})();

GAMES.webdots = {
  emoji: '🕸️', color: 'var(--lilac)', screen: 'screen-webdots',
  enter() { webGame.render(); }
};

/* ================= Kitne Paer? (how many legs) ================= */

GAME_TITLES.legs = { en: 'How Many Legs', hi: 'कितने पैर', hiSay: 'Kitne pair' };

// A spider is not an insect: eight legs against an insect's six. Snakes and
// fish are here so that zero is a real answer too.
// Whole bodies only — a face emoji has no legs to ask about.
const LEG_CREATURES = [
  { emoji: '🕷️', legs: 8, en: 'Spider', hi: 'मकड़ी', hiSay: 'Makdi' },
  { emoji: '🐜', legs: 6, en: 'Ant', hi: 'चींटी', hiSay: 'Cheenti' },
  { emoji: '🐝', legs: 6, en: 'Bee', hi: 'मधुमक्खी', hiSay: 'Madhumakkhi' },
  { emoji: '🦋', legs: 6, en: 'Butterfly', hi: 'तितली', hiSay: 'Titli' },
  { emoji: '🐕', legs: 4, en: 'Dog', hi: 'कुत्ता', hiSay: 'Kutta' },
  { emoji: '🐈', legs: 4, en: 'Cat', hi: 'बिल्ली', hiSay: 'Billi' },
  { emoji: '🐄', legs: 4, en: 'Cow', hi: 'गाय', hiSay: 'Gaay' },
  { emoji: '🐦', legs: 2, en: 'Bird', hi: 'चिड़िया', hiSay: 'Chidiya' },
  { emoji: '🐔', legs: 2, en: 'Hen', hi: 'मुर्गी', hiSay: 'Murgi' },
  { emoji: '🧍', legs: 2, en: 'Person', hi: 'इंसान', hiSay: 'Insaan' },
  { emoji: '🐍', legs: 0, en: 'Snake', hi: 'साँप', hiSay: 'Saanp' },
  { emoji: '🐟', legs: 0, en: 'Fish', hi: 'मछली', hiSay: 'Machhli' }
];

const LEG_COUNTS = [0, 2, 4, 6, 8];

// numPhrase100 reads HINDI_100[n - 1], which has nothing to say about zero.
function legsPhrase(n) {
  return n === 0 ? T.legsNone : numPhrase100(n);
}

buildScreen('legs',
  '<div class="intro-emoji">🕷️</div>' +
  '<p class="hint" data-t="legsDesc"></p>' +
  '<button id="legs-start" class="big-btn" data-t="startBtn"></button>');

function legsQuestion() {
  const it = rand(LEG_CREATURES);
  // Wrong answers are other real leg counts, never invented numbers.
  const wrong = shuffle(LEG_COUNTS.filter((n) => n !== it.legs)).slice(0, 2);
  return {
    key: 'LG' + it.en,
    prompt: phrase(
      'How many legs does the ' + it.en.toLowerCase() + ' have?',
      it.hi + ' के कितने पैर हैं?',
      it.hiSay + ' ke kitne pair hain?'
    ),
    extra: '<div class="legs-big">' + it.emoji + '</div>',
    choices: shuffle([it.legs].concat(wrong)).map((n) => ({
      key: String(n),
      html: '<span class="nl-big">' + n + '</span>'
    })),
    answer: String(it.legs),
    answerPhrase: joinPhrase(wordPhrase(it), legsPhrase(it.legs))
  };
}

$('legs-start').addEventListener('click', () => {
  quiz.start({ make: legsQuestion, backTo: 'screen-legs' });
});

GAMES.legs = { emoji: '🕷️', color: 'var(--mint)', screen: 'screen-legs', enter() { } };

/* ================= Makdi Utri (up 1..10, down 10..1) ================= */

GAME_TITLES.thread = { en: 'Spider on a Thread', hi: 'धागे पर मकड़ी', hiSay: 'Dhaage par makdi' };

buildScreen('thread',
  '<p class="hint" id="thread-hint"></p>' +
  '<div id="thread-dots" class="dots-row"></div>' +
  '<div id="thread-area" data-next="" data-dir="up" data-done="0">' +
  '<div id="thread-top">🕸️<span id="thread-spider">🕷️</span></div></div>');

const threadGame = (() => {
  // Rungs sit in normal flow, so there is no height to measure and a landscape
  // phone cannot cut the ladder off.
  const state = { nums: [], idx: 0, dir: 'up', round: 0, done: false };

  function build() {
    const step = lvl(1, 1, 2); // hard counts in twos
    const count = lvl(5, 10, 10);
    const nums = [];
    for (let i = 1; i <= count; i++) nums.push(i * step);
    state.nums = state.dir === 'up' ? nums : nums.slice().reverse();
    state.idx = 0;
    state.done = false;
  }

  function hint() {
    $('thread-hint').textContent = (state.dir === 'up' ? T.threadUp : T.threadDown)[store.getLang()];
  }

  function render() {
    const area = $('thread-area');
    // The spider is sitting inside one of the rungs by now, so it has to be
    // lifted back to the thread before they are cleared away with it.
    let spider = $('thread-spider');
    if (!spider) {
      spider = document.createElement('span');
      spider.id = 'thread-spider';
      spider.textContent = '🕷️';
    }
    $('thread-top').appendChild(spider);
    area.querySelectorAll('.rung').forEach((r) => r.remove());
    // The ladder always reads big at the top, whichever way the child walks it.
    state.nums.slice().sort((a, b) => b - a).forEach((n) => {
      const b = document.createElement('button');
      b.className = 'rung';
      b.dataset.n = String(n);
      b.innerHTML = '<span class="rung-perch"></span><span class="rung-num">' + n + '</span>';
      b.addEventListener('click', () => tap(n, b));
      area.appendChild(b);
    });
    area.dataset.dir = state.dir;
    area.dataset.next = String(state.nums[0]);
    area.dataset.done = '0';
    hint();
    renderDots('thread-dots', state.nums.length, 0);
  }

  function tap(n, b) {
    if (state.done) return;
    if (n !== state.nums[state.idx]) {
      nope(b);
      return;
    }
    sfx.pop();
    b.classList.add('on');
    b.querySelector('.rung-perch').appendChild($('thread-spider'));
    sayPhrase(countWord(n));
    state.idx++;
    renderDots('thread-dots', state.nums.length, state.idx);
    const area = $('thread-area');
    if (state.idx < state.nums.length) {
      area.dataset.next = String(state.nums[state.idx]);
      return;
    }
    state.done = true;
    area.dataset.next = '';
    area.dataset.done = '1';
    sfx.correct();
    store.addStars(2);
    starFly(b);
    confetti(18);
    state.round++;
    later(() => {
      if (state.round >= 2) {
        celebrate({ again: () => { hideCelebrate(); start(); } });
        return;
      }
      // Having walked up, the child walks back down — the only place in the
      // app that asks for the numbers in reverse.
      state.dir = 'down';
      build();
      render();
    }, 1100);
  }

  function start() {
    state.round = 0;
    state.dir = 'up';
    build();
    render();
  }

  return { start, onLang: hint };
})();

GAMES.thread = {
  emoji: '🧗', color: 'var(--sky)', screen: 'screen-thread',
  enter() { threadGame.start(); }, onLang() { threadGame.onLang(); }
};

/* ================= Hero ki Poshak (mirror the pattern) ================= */

GAME_TITLES.suit = { en: 'Hero Suit', hi: 'हीरो की पोशाक', hiSay: 'Hero ki poshak' };

const SUIT_COLORS = [
  { hex: '#E53935', en: 'Red', hi: 'लाल', hiSay: 'Laal' },
  { hex: '#1E88E5', en: 'Blue', hi: 'नीला', hiSay: 'Neela' },
  { hex: '#37474F', en: 'Black', hi: 'काला', hiSay: 'Kaala' }
];

buildScreen('suit',
  '<p class="hint" data-t="suitHint"></p>' +
  '<div id="suit-grid" data-done="0"></div>' +
  '<div id="suit-colors" class="chip-row"></div>' +
  '<button id="suit-new" class="big-btn alt" data-t="suitNew"></button>');

const suitGame = (() => {
  const state = { rows: 4, half: 3, colors: 1, color: 0, left: [], right: [], done: false };

  // The right half is the mirror image, so column c answers to the column the
  // same distance from the middle on the other side.
  function want(r, c) {
    return state.left[r][state.half - 1 - c];
  }

  function start() {
    state.rows = lvl(3, 4, 5);
    state.half = lvl(2, 3, 3);
    state.colors = lvl(1, 2, 3); // easy is one colour, so it is purely about place
    state.color = 0;
    state.done = false;
    state.left = [];
    state.right = [];
    for (let r = 0; r < state.rows; r++) {
      state.left.push([]);
      state.right.push([]);
      for (let c = 0; c < state.half; c++) {
        state.left[r].push(Math.random() < 0.6 ? Math.floor(Math.random() * state.colors) : -1);
        state.right[r].push(-1);
      }
    }
    // An all-empty half would already be mirrored, and nothing would ever ask
    // the child to tap — so at least one square always carries a colour.
    if (!state.left.some((row) => row.some((v) => v >= 0))) {
      state.left[Math.floor(Math.random() * state.rows)][Math.floor(Math.random() * state.half)] = 0;
    }
    render();
  }

  function paint(b, v) {
    b.dataset.color = String(v);
    b.style.background = v >= 0 ? SUIT_COLORS[v].hex : '';
  }

  function render() {
    const grid = $('suit-grid');
    grid.innerHTML = '';
    // Rangoli's grid hardcodes nine columns in CSS, so this one sets its own.
    grid.style.gridTemplateColumns = 'repeat(' + (state.half * 2) + ', 1fr)';
    for (let r = 0; r < state.rows; r++) {
      for (let col = 0; col < state.half * 2; col++) {
        const isLeft = col < state.half;
        const c = isLeft ? col : col - state.half;
        const b = document.createElement('button');
        b.className = 'suit-cell' + (isLeft ? ' fixed' : '');
        b.dataset.r = String(r);
        b.dataset.c = String(c);
        b.dataset.side = isLeft ? 'left' : 'right';
        paint(b, isLeft ? state.left[r][c] : state.right[r][c]);
        if (isLeft) b.disabled = true;
        else b.addEventListener('click', () => tap(r, c, b));
        grid.appendChild(b);
      }
    }
    grid.dataset.done = state.done ? '1' : '0';
    renderColors();
  }

  function renderColors() {
    const row = $('suit-colors');
    row.innerHTML = '';
    SUIT_COLORS.slice(0, state.colors).forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'chip suit-chip' + (i === state.color ? ' active' : '');
      b.dataset.c = c.en;
      b.innerHTML = '<span class="blob mini-blob" style="background:' + c.hex + '"></span>';
      b.addEventListener('click', () => {
        sfx.pop();
        state.color = i;
        renderColors();
        sayPhrase(wordPhrase(c));
      });
      row.appendChild(b);
    });
  }

  function tap(r, c, b) {
    if (state.done) return;
    // Tapping the same colour again clears the cell, so a slip is fixable.
    state.right[r][c] = state.right[r][c] === state.color ? -1 : state.color;
    paint(b, state.right[r][c]);
    sfx.pop();
    popIt(b);
    check();
  }

  function check() {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.half; c++) {
        if (state.right[r][c] !== want(r, c)) return;
      }
    }
    state.done = true;
    $('suit-grid').dataset.done = '1';
    sfx.correct();
    store.addStars(2);
    starFly($('suit-grid'));
    confetti(20);
    later(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 900);
  }

  $('suit-new').addEventListener('click', () => { sfx.pop(); start(); });

  return { start, onLang: renderColors };
})();

GAMES.suit = {
  emoji: '🦸', color: 'var(--coral)', screen: 'screen-suit',
  enter() { suitGame.start(); }, onLang() { suitGame.onLang(); }
};
