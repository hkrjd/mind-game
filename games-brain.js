'use strict';
/* ================================================================
   games-brain.js — Dimaag Pack: Pattern Poora Karo, Kya Gayab Hua?,
   Alag Kaun? (odd one out), Jasoos (I Spy).
   ================================================================ */

Object.assign(T, {
  patternHint: { en: 'What comes next? Look at the pattern!', hi: 'आगे क्या आएगा? पैटर्न देखो!' },
  patternPrompt: { en: 'What comes next?', hi: 'आगे क्या आएगा?', hiSay: 'Aage kya aayega?' },
  missingHint: { en: 'Look carefully — one will disappear!', hi: 'ध्यान से देखो — एक गायब हो जाएगा!' },
  missingLook: { en: 'Look and remember!', hi: 'देखो और याद करो!', hiSay: 'Dekho aur yaad karo!' },
  missingAsk: { en: 'What is missing?', hi: 'क्या गायब हुआ?', hiSay: 'Kya gayab hua?' },
  oddHint: { en: 'Three belong together — tap the different one!', hi: 'तीन एक जैसे हैं — जो अलग है उसे दबाओ!' },
  oddPrompt: { en: 'Which one is different?', hi: 'कौन अलग है?', hiSay: 'Kaun alag hai?' },
  ispyFind: { en: 'Find', hi: 'ढूँढो', hiSay: 'dhoondho' }
});

const BRAIN_POOL = []
  .concat(PACK_FRUITS.slice(0, 8))
  .concat(ANIMALS.slice(0, 8).map((a) => ({ emoji: a.emoji, en: a.en, hi: a.hi, hiSay: a.hiSay })))
  .concat(PACK_OBJECTS.slice(0, 8));

/* ================= Pattern Poora Karo ================= */

buildScreen('pattern',
  '<div class="intro-emoji">🔴🔵🔴</div>' +
  '<p class="hint" data-t="patternHint"></p>' +
  '<button id="pattern-start" class="big-btn" data-t="startBtn"></button>');
GAME_TITLES.pattern = { en: 'Patterns', hi: 'पैटर्न', hiSay: 'Pattern' };

function patternQuestion() {
  const TPLS = [
    [0, 1, 0, 1, 0, 1],    // ABAB
    [0, 0, 1, 1, 0, 0],    // AABB
    [0, 1, 2, 0, 1, 2]     // ABCABC
  ];
  const kind = rand(['color', 'shape', 'emoji']);
  const tpl = rand(kind === 'shape' ? TPLS.slice(0, 2) : TPLS); // shapes stay simpler
  const need = Math.max.apply(null, tpl) + 1;
  let pool, html, keyOf;
  if (kind === 'color') {
    pool = COLORS;
    html = (c) => '<span class="blob pat-blob" style="background:' + c.hex + '"></span>';
    keyOf = (c) => 'c' + c.key;
  } else if (kind === 'shape') {
    const hex = rand(COLORS).hex;
    pool = SHAPES;
    html = (s) => shapeSVG(s.key, hex);
    keyOf = (s) => 's' + s.key;
  } else {
    pool = BRAIN_POOL;
    html = (it) => '<span>' + it.emoji + '</span>';
    keyOf = (it) => 'e' + it.en;
  }
  const items = sample(pool, Math.max(need, 3));
  const answer = items[tpl[5]];
  let row = '';
  for (let i = 0; i < 5; i++) row += '<span class="pat-item">' + html(items[tpl[i]]) + '</span>';
  row += '<span class="pat-item pat-q">❓</span>';
  return {
    key: 'P' + kind + tpl.join('') + keyOf(items[0]),
    prompt: T.patternPrompt,
    extra: '<div class="pat-row">' + row + '</div>',
    choices: shuffle(items.slice(0, 3)).map((it) => ({ key: keyOf(it), html: html(it) })),
    answer: keyOf(answer),
    answerPhrase: wordPhrase(answer)
  };
}

$('pattern-start').addEventListener('click', () => {
  quiz.start({ make: patternQuestion, backTo: 'screen-pattern' });
});
GAMES.pattern = { emoji: '🔴', color: 'var(--sky)', screen: 'screen-pattern', enter() { } };

/* ================= Kya Gayab Hua? ================= */

const missingGame = (() => {
  buildScreen('missing',
    '<p class="hint" data-t="missingHint"></p>' +
    '<div id="ms-dots"></div>' +
    '<div id="ms-stage" data-phase="show" data-missing="" data-score="0"></div>' +
    '<div id="ms-choices"></div>');
  GAME_TITLES.missing = { en: 'What Vanished?', hi: 'क्या गायब हुआ?', hiSay: 'Kya gayab hua' };

  const state = { round: 0, items: [], missing: null, timers: [] };

  function tmo(fn, ms) { state.timers.push(setTimeout(fn, ms)); }
  function clearTimers() { state.timers.forEach(clearTimeout); state.timers = []; }

  function dots() {
    const d = $('ms-dots');
    d.innerHTML = '';
    for (let k = 0; k < 5; k++) {
      const s = document.createElement('span');
      s.className = 'dot' + (k < state.round ? ' filled' : '');
      d.appendChild(s);
    }
  }

  function tile(it) {
    const s = document.createElement('span');
    s.className = 'ms-tile';
    s.textContent = it.emoji;
    return s;
  }

  function startRound() {
    clearTimers();
    state.items = sample(BRAIN_POOL, 4);
    dots();
    const stage = $('ms-stage');
    stage.dataset.phase = 'show';
    stage.dataset.missing = '';
    stage.innerHTML = '';
    state.items.forEach((it) => stage.appendChild(tile(it)));
    $('ms-choices').innerHTML = '';
    sayPhrase(T.missingLook);
    tmo(ask, 3500);
  }

  function ask() {
    state.missing = rand(state.items);
    const remaining = shuffle(state.items.filter((it) => it !== state.missing));
    const stage = $('ms-stage');
    stage.dataset.phase = 'ask';
    stage.dataset.missing = state.missing.en;
    stage.innerHTML = '';
    remaining.forEach((it) => stage.appendChild(tile(it)));
    const box = $('ms-choices');
    box.innerHTML = '';
    shuffle([state.missing].concat(remaining.slice(0, 2))).forEach((it) => {
      const b = document.createElement('button');
      b.className = 'quiz-tile ms-choice';
      b.dataset.k = it.en;
      b.innerHTML = '<span>' + it.emoji + '</span>';
      b.addEventListener('click', () => pick(b, it));
      box.appendChild(b);
    });
    sayPhrase(T.missingAsk);
  }

  function pick(b, it) {
    if ($('ms-stage').dataset.phase !== 'ask') return;
    if (it === state.missing) {
      $('ms-stage').dataset.phase = 'done';
      sfx.correct();
      store.addStars(1);
      starFly(b);
      b.classList.add('pop');
      state.round++;
      $('ms-stage').dataset.score = String(state.round);
      dots();
      sayPhrase(joinPhrase(rand(PRAISE), wordPhrase(it)));
      tmo(() => {
        if (state.round >= 5) {
          celebrate({ again: () => { hideCelebrate(); start(); } });
        } else {
          startRound();
        }
      }, 1700);
    } else {
      sfx.wrong();
      b.classList.add('wiggle');
      b.addEventListener('animationend', () => b.classList.remove('wiggle'), { once: true });
      sayPhrase(rand(ENCOURAGE));
    }
  }

  function start() {
    state.round = 0;
    $('ms-stage').dataset.score = '0';
    startRound();
  }

  return { start, stop: clearTimers };
})();

GAMES.missing = {
  emoji: '👀', color: 'var(--lilac)', screen: 'screen-missing',
  enter() { missingGame.start(); }, onLeave() { missingGame.stop(); }
};

/* ================= Alag Kaun? (odd one out) ================= */

buildScreen('oddone',
  '<div class="intro-emoji">🤔</div>' +
  '<p class="hint" data-t="oddHint"></p>' +
  '<button id="oddone-start" class="big-btn" data-t="startBtn"></button>');
GAME_TITLES.oddone = { en: 'Odd One Out', hi: 'अलग कौन?', hiSay: 'Alag kaun' };

const ODD_CATS = [
  { items: PACK_FRUITS, name: { en: 'fruits', hi: 'फल', hiSay: 'phal' } },
  { items: PACK_VEGGIES, name: { en: 'vegetables', hi: 'सब्ज़ियाँ', hiSay: 'sabziyan' } },
  { items: ANIMALS, name: { en: 'animals', hi: 'जानवर', hiSay: 'janwar' } },
  { items: PACK_OBJECTS, name: { en: 'things', hi: 'चीज़ें', hiSay: 'cheezein' } },
  { items: PACK_FLOWERS, name: { en: 'flowers', hi: 'फूल', hiSay: 'phool' } }
];

function oddQuestion() {
  const cats = sample(ODD_CATS, 2);
  const three = sample(cats[0].items, 3);
  const odd = rand(cats[1].items);
  return {
    key: 'O' + odd.en + three[0].en,
    prompt: T.oddPrompt,
    extra: '',
    choices: shuffle(three.concat([odd])).map((it) => ({ key: it.en, html: '<span>' + it.emoji + '</span>' })),
    answer: odd.en,
    answerPhrase: phrase(
      odd.en + '! The others are ' + cats[0].name.en + '!',
      odd.hi + '! बाकी सब ' + cats[0].name.hi + ' हैं!',
      odd.hiSay + '! Baaki sab ' + cats[0].name.hiSay + ' hain!'
    )
  };
}

$('oddone-start').addEventListener('click', () => {
  quiz.start({ make: oddQuestion, backTo: 'screen-oddone' });
});
GAMES.oddone = { emoji: '🤔', color: 'var(--tangerine)', screen: 'screen-oddone', enter() { } };

/* ================= Jasoos (I Spy) ================= */

const ispyGame = (() => {
  buildScreen('ispy',
    '<div id="ispy-prompt"><button id="ispy-say" aria-label="Repeat">🔊</button>' +
    '<span id="ispy-text"></span></div>' +
    '<div id="ispy-scene" data-target="" data-found="0"></div>');
  GAME_TITLES.ispy = { en: 'I Spy', hi: 'जासूस', hiSay: 'Jasoos' };

  const state = { placed: [], targets: [], found: 0, lastWrong: 0 };

  function speakTarget() {
    const t = state.targets[state.found];
    if (!t) return;
    sayPhrase(phrase('Find the ' + t.en + '!', t.hi + ' ढूँढो!', t.hiSay + ' dhoondho!'));
  }

  function setTarget() {
    const t = state.targets[state.found];
    $('ispy-scene').dataset.target = t.en;
    $('ispy-text').textContent = '🔍 ' + (store.getLang() === 'hi' ? t.hi + ' ढूँढो!' : 'Find the ' + t.en + '!');
    speakTarget();
  }

  function start() {
    const scene = $('ispy-scene');
    scene.innerHTML = '';
    state.found = 0;
    scene.dataset.found = '0';
    state.placed = sample(BRAIN_POOL, 24);
    state.targets = sample(state.placed, 5);
    // scatter on a 6x4 grid with jitter so nothing fully overlaps
    state.placed.forEach((it, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const b = document.createElement('button');
      b.className = 'ispy-item';
      b.dataset.k = it.en;
      b.textContent = it.emoji;
      b.style.left = (3 + col * 16 + Math.random() * 7) + '%';
      b.style.top = (4 + row * 24 + Math.random() * 9) + '%';
      b.style.fontSize = (1.5 + Math.random() * 0.7) + 'rem';
      b.style.transform = 'rotate(' + Math.round(Math.random() * 30 - 15) + 'deg)';
      b.addEventListener('click', () => tap(b, it));
      scene.appendChild(b);
    });
    setTarget();
  }

  function tap(b, it) {
    const t = state.targets[state.found];
    if (!t) return;
    if (it.en === t.en) {
      sfx.correct();
      store.addStars(1);
      starFly(b);
      confetti(8);
      b.classList.add('pop', 'ispy-found');
      sayPhrase(joinPhrase(rand(PRAISE), wordPhrase(it)));
      state.found++;
      $('ispy-scene').dataset.found = String(state.found);
      if (state.found >= 5) {
        setTimeout(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 900);
      } else {
        setTimeout(setTarget, 1500);
      }
    } else {
      sfx.wrong();
      b.classList.add('wiggle');
      b.addEventListener('animationend', () => b.classList.remove('wiggle'), { once: true });
      const now = Date.now();
      if (now - state.lastWrong > 2200) {
        state.lastWrong = now;
        sayPhrase(rand(ENCOURAGE));
      }
    }
  }

  $('ispy-say').addEventListener('click', () => { sfx.pop(); speakTarget(); });

  return {
    start,
    onLang() { if (state.targets[state.found]) setTarget(); }
  };
})();

GAMES.ispy = {
  emoji: '🔍', color: 'var(--mint)', screen: 'screen-ispy',
  enter() { ispyGame.start(); }, onLang() { ispyGame.onLang(); }
};
