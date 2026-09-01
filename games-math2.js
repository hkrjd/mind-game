'use strict';
/* ================================================================
   games-math2.js — Math Pack 2: hands-on number sense.
   countit  — touch every object once while it counts aloud
   numline  — which number is missing from the line
   share    — deal things out equally between plates
   measure  — build a block tower as tall as the thing
   ================================================================ */

Object.assign(T, {
  countHint: { en: 'Touch each one — count them all!', hi: 'हर एक को छुओ — सब गिनो!' },
  countAsk: { en: 'How many? Tap the number!', hi: 'कितने हुए? नंबर दबाओ!', hiSay: 'Kitne hue? Number dabao!' },
  numlineDesc: { en: 'Which number ran away?', hi: 'कौन सा नंबर भाग गया?' },
  shareHint: { en: 'Tap a plate to give it one — everyone gets the same!', hi: 'प्लेट दबाकर एक-एक दो — सबको बराबर!' },
  shareUneven: { en: 'Not equal! Let us share again.', hi: 'बराबर नहीं! फिर से बाँटते हैं।', hiSay: 'Barabar nahi! Phir se baantte hain.' },
  measureHint: { en: 'Add blocks until they are as tall!', hi: 'उतने ब्लॉक लगाओ जितना लंबा है!' },
  measureAdd: { en: '➕ Block', hi: '➕ ब्लॉक' }
});

// Speaks just the number word, for counting out loud.
function countWord(n) {
  return phrase(enNumberName(n), HINDI_100[n - 1], HINDI_100_SAY[n - 1]);
}

/* ================= Gino aur Milao (touch counting) ================= */

GAME_TITLES.countit = { en: 'Count Them', hi: 'गिनो और मिलाओ', hiSay: 'Gino aur milao' };

const COUNT_THINGS = ['🍎', '⭐', '🎈', '🐟', '🌸', '🍌', '🐞', '🧁', '🍓', '🐥'];

const countitGame = (() => {
  buildScreen('countit',
    '<p class="hint" data-t="countHint"></p>' +
    '<div id="countit-dots" class="dots-row"></div>' +
    '<div id="count-scene" data-counted="0" data-total="0"></div>' +
    '<div id="count-choices" data-answer="" hidden></div>');

  const state = { round: 0, total: 0, counted: 0, timer: 0 };

  function dots() { renderDots('countit-dots', 4, state.round); }

  function newRound() {
    clearTimeout(state.timer);
    state.total = lvl(2, 3, 5) + Math.floor(Math.random() * lvl(4, 7, 8)); // more to count on hard
    state.counted = 0;
    dots();
    const emoji = rand(COUNT_THINGS);
    const scene = $('count-scene');
    scene.dataset.total = String(state.total);
    scene.dataset.counted = '0';
    scene.innerHTML = '';
    for (let i = 0; i < state.total; i++) {
      const b = document.createElement('button');
      b.className = 'count-item';
      b.innerHTML = '<span>' + emoji + '</span>';
      // A little jitter so it feels scattered, not like a table.
      b.style.transform = 'rotate(' + (Math.random() * 24 - 12).toFixed(1) + 'deg)';
      b.addEventListener('click', () => tap(b));
      scene.appendChild(b);
    }
    const box = $('count-choices');
    box.hidden = true;
    box.innerHTML = '';
    sayPhrase(T.countHint);
  }

  function tap(b) {
    if (b.classList.contains('counted')) return;
    b.classList.add('counted', 'pop');
    state.counted++;
    $('count-scene').dataset.counted = String(state.counted);
    sfx.pop();
    sayPhrase(countWord(state.counted));
    if (state.counted >= state.total) state.timer = later(ask, 900);
  }

  function ask() {
    const box = $('count-choices');
    const opts = [state.total];
    while (opts.length < 3) {
      const n = Math.max(1, Math.min(lvl(10, 10, 15), state.total + (Math.floor(Math.random() * 5) - 2)));
      if (!opts.includes(n)) opts.push(n);
    }
    box.dataset.answer = String(state.total);
    box.innerHTML = '';
    shuffle(opts).forEach((n) => {
      const b = document.createElement('button');
      b.className = 'quiz-tile count-choice';
      b.dataset.n = String(n);
      b.textContent = String(n);
      b.addEventListener('click', () => choose(b, n));
      box.appendChild(b);
    });
    box.hidden = false;
    sayPhrase(T.countAsk);
  }

  function choose(b, n) {
    if (n !== state.total) {
      nope(b, true);
      return;
    }
    sfx.correct();
    b.classList.add('pop');
    store.addStars(1);
    starFly(b);
    confetti(12);
    sayPhrase(joinPhrase(rand(PRAISE), numPhrase100(state.total)));
    state.round++;
    dots();
    state.timer = later(() => {
      if (state.round >= 4) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 1800);
  }

  function start() { state.round = 0; newRound(); }
  function stop() { clearTimeout(state.timer); }

  return { start, stop };
})();

GAMES.countit = {
  emoji: '🔢', color: 'var(--coral)', screen: 'screen-countit',
  enter() { countitGame.start(); }, onLeave() { countitGame.stop(); }
};

/* ================= Number Gayab (number line) ================= */

GAME_TITLES.numline = { en: 'Missing Number', hi: 'नंबर गायब', hiSay: 'Number gayab' };

buildScreen('numline',
  '<div class="intro-emoji">🔢</div>' +
  '<p class="hint" data-t="numlineDesc"></p>' +
  '<button id="numline-start" class="big-btn" data-t="startBtn"></button>');

function numlineQuestion() {
  const start = 1 + Math.floor(Math.random() * lvl(4, 6, 16)); // higher windows on hard
  const cells = [start, start + 1, start + 2, start + 3];
  // Half the rounds hide a number in the middle, half ask what comes next.
  const hideAt = Math.random() < 0.5 ? 3 : 1 + Math.floor(Math.random() * 2);
  const ans = cells[hideAt];
  const opts = [ans];
  while (opts.length < 3) {
    const n = Math.max(1, Math.min(lvl(10, 10, 20), ans + (Math.floor(Math.random() * 5) - 2)));
    if (!opts.includes(n)) opts.push(n);
  }
  const strip = cells.map((n, i) =>
    '<span class="nl-cell' + (i === hideAt ? ' nl-q' : '') + '">' + (i === hideAt ? '?' : n) + '</span>').join('');
  return {
    key: 'NL' + ans + hideAt,
    prompt: hideAt === 3
      ? phrase('What comes next?', 'आगे क्या आता है?', 'Aage kya aata hai?')
      : phrase('Which number is missing?', 'कौन सा नंबर गायब है?', 'Kaunsa number gayab hai?'),
    extra: '<div class="numline-strip">' + strip + '</div>',
    choices: shuffle(opts).map((n) => ({ key: String(n), html: '<span class="nl-big">' + n + '</span>' })),
    answer: String(ans),
    answerPhrase: numPhrase100(ans)
  };
}

$('numline-start').addEventListener('click', () => {
  quiz.start({ make: numlineQuestion, backTo: 'screen-numline' });
});

GAMES.numline = { emoji: '❓', color: 'var(--sky)', screen: 'screen-numline', enter() { } };

/* ================= Baraabar Baanto (equal sharing) ================= */

GAME_TITLES.share = { en: 'Share Equally', hi: 'बराबर बाँटो', hiSay: 'Barabar baanto' };

const SHARE_SETS = [
  { n: 4, p: 2, emoji: '🍪' },
  { n: 6, p: 2, emoji: '🍬' },
  { n: 6, p: 3, emoji: '🍎' },
  { n: 8, p: 2, emoji: '🍩' },
  { n: 9, p: 3, emoji: '🍌' },
  { n: 6, p: 3, emoji: '🧁' }
];

const shareGame = (() => {
  buildScreen('share',
    '<p class="hint" data-t="shareHint"></p>' +
    '<div id="share-dots" class="dots-row"></div>' +
    '<div id="share-tray" data-left="0"></div>' +
    '<div id="share-plates" data-per="0"></div>');

  const state = { sets: [], i: 0, left: 0, got: [], timer: 0, locked: false };

  function dots() { renderDots('share-dots', 4, state.i); }

  function paintTray(set) {
    const tray = $('share-tray');
    tray.dataset.left = String(state.left);
    tray.innerHTML = '';
    for (let k = 0; k < state.left; k++) {
      const s = document.createElement('span');
      s.className = 'share-item';
      s.textContent = set.emoji;
      tray.appendChild(s);
    }
  }

  function newRound() {
    clearTimeout(state.timer);
    state.locked = false;
    const set = state.sets[state.i];
    state.left = set.n;
    state.got = [];
    dots();
    paintTray(set);
    const plates = $('share-plates');
    plates.dataset.per = '0';
    plates.innerHTML = '';
    for (let k = 0; k < set.p; k++) {
      state.got.push(0);
      const b = document.createElement('button');
      b.className = 'share-plate';
      b.dataset.got = '0';
      b.innerHTML = '<span class="plate-face">🍽️</span><span class="plate-items"></span>';
      b.addEventListener('click', () => give(k, b, set));
      plates.appendChild(b);
    }
    sayPhrase(phrase(
      'Share ' + set.n + ' between ' + set.p + ' plates!',
      set.n + ' चीज़ें ' + set.p + ' प्लेट में बाँटो!',
      set.n + ' cheezein ' + set.p + ' plate mein baanto!'
    ));
  }

  function give(k, btn, set) {
    if (state.locked || state.left <= 0) return;
    state.left--;
    state.got[k]++;
    btn.dataset.got = String(state.got[k]);
    const items = btn.querySelector('.plate-items');
    const s = document.createElement('span');
    s.textContent = set.emoji;
    items.appendChild(s);
    popIt(btn);
    sfx.pop();
    paintTray(set);
    if (state.left > 0) return;

    const per = set.n / set.p;
    const even = state.got.every((g) => g === per);
    if (!even) {
      state.locked = true;
      sfx.wrong();
      document.querySelectorAll('#share-plates .share-plate').forEach((p) => {
        p.classList.add('wiggle');
        p.addEventListener('animationend', () => p.classList.remove('wiggle'), { once: true });
      });
      sayPhrase(T.shareUneven);
      state.timer = later(newRound, 1800);
      return;
    }
    state.locked = true;
    $('share-plates').dataset.per = String(per);
    sfx.correct();
    store.addStars(2);
    starFly($('share-plates'));
    confetti(16);
    sayPhrase(joinPhrase(rand(PRAISE), phrase(
      'Everyone gets ' + per + '!',
      'हर एक को ' + HINDI_100[per - 1] + '!',
      'Har ek ko ' + per + '!'
    )));
    state.i++;
    dots();
    state.timer = later(() => {
      if (state.i >= 4) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 2200);
  }

  function start() {
    state.sets = sample(SHARE_SETS, 4);
    state.i = 0;
    newRound();
  }
  function stop() { clearTimeout(state.timer); }

  return { start, stop };
})();

GAMES.share = {
  emoji: '🍪', color: 'var(--sunny)', screen: 'screen-share',
  enter() { shareGame.start(); }, onLeave() { shareGame.stop(); }
};

/* ================= Kitna Lamba (measuring) ================= */

GAME_TITLES.measure = { en: 'How Tall?', hi: 'कितना लंबा', hiSay: 'Kitna lamba' };

const MEASURE_ITEMS = [
  { emoji: '🐛', need: 2, en: 'Caterpillar', hi: 'इल्ली', hiSay: 'Illi' },
  { emoji: '🐟', need: 3, en: 'Fish', hi: 'मछली', hiSay: 'Machhli' },
  { emoji: '🚌', need: 4, en: 'Bus', hi: 'बस', hiSay: 'Bus' },
  { emoji: '🌳', need: 5, en: 'Tree', hi: 'पेड़', hiSay: 'Ped' },
  { emoji: '🦒', need: 6, en: 'Giraffe', hi: 'जिराफ़', hiSay: 'Giraffe' },
  { emoji: '🏠', need: 4, en: 'House', hi: 'घर', hiSay: 'Ghar' }
];

const BLOCK_PX = 40;

// Draw the thing exactly as tall as the finished tower. Emoji glyphs fill
// different fractions of their em box in different fonts, so the ink is
// measured rather than guessed from font-size.
function fitToBlocks(el, emoji, blocks) {
  const target = blocks * BLOCK_PX - 2; // the stack: N blocks of 38px + 2px gaps
  let size = target;
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '100px ' + (getComputedStyle(el).fontFamily || 'sans-serif');
    const m = ctx.measureText(emoji);
    const ink = (m.actualBoundingBoxAscent || 0) + (m.actualBoundingBoxDescent || 0);
    if (ink > 10) size = Math.round((target * 100) / ink);
  } catch (e) { /* fall back to the plain size */ }
  el.style.fontSize = size + 'px';
}

const measureGame = (() => {
  buildScreen('measure',
    '<p class="hint" data-t="measureHint"></p>' +
    '<div id="meas-dots" class="dots-row"></div>' +
    '<div id="meas-area" data-need="0" data-blocks="0">' +
    '<div id="meas-obj"></div>' +
    '<div id="meas-stack"></div>' +
    '</div>' +
    '<button id="meas-add" class="big-btn" data-t="measureAdd"></button>');

  const state = { items: [], i: 0, blocks: 0, timer: 0, locked: false };

  function dots() { renderDots('meas-dots', 4, state.i); }

  function newRound() {
    clearTimeout(state.timer);
    state.locked = false;
    state.blocks = 0;
    const it = state.items[state.i];
    dots();
    const area = $('meas-area');
    area.dataset.need = String(it.need);
    area.dataset.blocks = '0';
    const obj = $('meas-obj');
    obj.textContent = it.emoji;
    fitToBlocks(obj, it.emoji, it.need);
    $('meas-stack').innerHTML = '';
    sayPhrase(phrase(
      'How many blocks tall is the ' + it.en.toLowerCase() + '?',
      it.hi + ' कितने ब्लॉक लंबा है?',
      it.hiSay + ' kitne block lamba hai?'
    ));
  }

  function add() {
    if (state.locked) return;
    const it = state.items[state.i];
    const stack = $('meas-stack');
    const b = document.createElement('div');
    b.className = 'meas-block';
    stack.appendChild(b);
    if (state.blocks + 1 > it.need) {
      // Never let the tower overshoot — the extra block bounces off.
      sfx.wrong();
      b.classList.add('too-many', 'wiggle');
      sayPhrase(phrase('That is too many!', 'ये ज़्यादा हो गया!', 'Ye zyada ho gaya!'));
      later(() => b.remove(), 600);
      return;
    }
    state.blocks++;
    $('meas-area').dataset.blocks = String(state.blocks);
    sfx.pop();
    popIt(b);
    sayPhrase(countWord(state.blocks));
    if (state.blocks < it.need) return;

    state.locked = true;
    sfx.correct();
    store.addStars(2);
    starFly(stack);
    confetti(16);
    sayPhrase(joinPhrase(rand(PRAISE), phrase(
      it.en + ' is ' + it.need + ' blocks tall!',
      it.hi + ' ' + HINDI_100[it.need - 1] + ' ब्लॉक लंबा है!',
      it.hiSay + ' ' + it.need + ' block lamba hai!'
    )));
    state.i++;
    dots();
    state.timer = later(() => {
      if (state.i >= 4) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 2400);
  }

  function start() {
    state.items = sample(MEASURE_ITEMS, 4);
    state.i = 0;
    newRound();
  }
  function stop() { clearTimeout(state.timer); }

  $('meas-add').addEventListener('click', add);

  return { start, stop };
})();

GAMES.measure = {
  emoji: '📐', color: 'var(--mint)', screen: 'screen-measure',
  enter() { measureGame.start(); }, onLeave() { measureGame.stop(); }
};
