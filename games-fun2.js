'use strict';
/* ================================================================
   games-fun2.js — Masti Pack: play for its own sake.
   rangoli   — tap one dot, four light up (symmetry)
   facemaker — build a silly face and make it talk
   cups      — follow the ball under the shuffling cups
   yoga      — copy the pose and hold it while the count runs down
   ================================================================ */

Object.assign(T, {
  rangoliHint: { en: 'Tap a dot — it draws four at once!', hi: 'एक बिंदी दबाओ — चार बन जाएँगी!' },
  faceHint: { en: 'Make a funny face, then make it talk!', hi: 'मज़ेदार चेहरा बनाओ, फिर उसे बुलवाओ!' },
  faceTalk: { en: '💬 Say something!', hi: '💬 कुछ बोलो!' },
  faceDice: { en: '🎲 Surprise me', hi: '🎲 कुछ भी बनाओ' },
  cupsHint: { en: 'Watch the ball, then find it!', hi: 'गेंद पर नज़र रखो, फिर ढूँढो!' },
  cupsWatch: { en: 'Watch carefully…', hi: 'ध्यान से देखो…', hiSay: 'Dhyan se dekho…' },
  cupsAsk: { en: 'Where is the ball?', hi: 'गेंद कहाँ है?', hiSay: 'Gend kahan hai?' },
  yogaHint: { en: 'Copy the pose and hold it!', hi: 'ऐसा ही करो और रुके रहो!' },
  yogaNext: { en: '⏭️ Next pose', hi: '⏭️ अगला' }
});

/* ================= Rangoli ================= */

GAME_TITLES.rangoli = { en: 'Rangoli', hi: 'रंगोली', hiSay: 'Rangoli' };

const RANGOLI_N = 9;
const RANGOLI_COLORS = [
  { hex: '#E53935', en: 'Red', hi: 'लाल', hiSay: 'Laal' },
  { hex: '#FB8C00', en: 'Orange', hi: 'नारंगी', hiSay: 'Narangi' },
  { hex: '#FDD835', en: 'Yellow', hi: 'पीला', hiSay: 'Peela' },
  { hex: '#43A047', en: 'Green', hi: 'हरा', hiSay: 'Hara' },
  { hex: '#1E88E5', en: 'Blue', hi: 'नीला', hiSay: 'Neela' },
  { hex: '#8E24AA', en: 'Purple', hi: 'बैंगनी', hiSay: 'Baingani' }
];

const rangoliGame = (() => {
  buildScreen('rangoli',
    '<p class="hint" data-t="rangoliHint"></p>' +
    '<div id="rangoli-grid" data-lit="0"></div>' +
    '<div id="rangoli-colors" class="chip-row"></div>' +
    '<button id="rangoli-clear" class="big-btn alt" data-t="mixClear"></button>');

  const state = { color: 0, lit: 0, awarded: 0 };

  function cell(r, c) {
    return $('rangoli-grid').children[r * RANGOLI_N + c];
  }

  function light(r, c, hex) {
    const el = cell(r, c);
    if (!el) return;
    if (!el.classList.contains('lit')) state.lit++;
    el.classList.add('lit');
    el.style.background = hex;
  }

  function tap(r, c) {
    const hex = RANGOLI_COLORS[state.color].hex;
    const m = RANGOLI_N - 1;
    // One tap, four dots: the rangoli stays symmetric whatever the child does.
    light(r, c, hex);
    light(r, m - c, hex);
    light(m - r, c, hex);
    light(m - r, m - c, hex);
    $('rangoli-grid').dataset.lit = String(state.lit);
    sfx.pop();
    // A star for every sixteen dots filled in.
    if (Math.floor(state.lit / 16) > state.awarded) {
      state.awarded = Math.floor(state.lit / 16);
      store.addStars(1);
      starFly($('rangoli-grid'));
      confetti(10);
      sayPhrase(rand(PRAISE));
    }
  }

  function build() {
    const grid = $('rangoli-grid');
    grid.innerHTML = '';
    for (let r = 0; r < RANGOLI_N; r++) {
      for (let c = 0; c < RANGOLI_N; c++) {
        const b = document.createElement('button');
        b.className = 'rdot';
        b.dataset.r = String(r);
        b.dataset.c = String(c);
        b.addEventListener('click', () => tap(r, c));
        grid.appendChild(b);
      }
    }
    clear();
  }

  function clear() {
    state.lit = 0;
    state.awarded = 0;
    $('rangoli-grid').dataset.lit = '0';
    document.querySelectorAll('#rangoli-grid .rdot').forEach((d) => {
      d.classList.remove('lit');
      d.style.background = '';
    });
  }

  function renderColors() {
    const row = $('rangoli-colors');
    row.innerHTML = '';
    RANGOLI_COLORS.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'chip rang-chip' + (i === state.color ? ' active' : '');
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

  build();
  renderColors();
  $('rangoli-clear').addEventListener('click', () => { sfx.pop(); clear(); });

  return { enter() { renderColors(); } };
})();

GAMES.rangoli = { emoji: '🌺', color: 'var(--coral)', screen: 'screen-rangoli', enter() { rangoliGame.enter(); } };

/* ================= Chehra Banao ================= */

GAME_TITLES.facemaker = { en: 'Silly Faces', hi: 'चेहरा बनाओ', hiSay: 'Chehra banao' };

const FACE_PARTS = {
  face: ['😀', '😃', '😁', '😆', '😊', '😎', '🤓', '🥳'],
  hat: ['', '🎩', '👑', '🧢', '🎓', '👒'],
  glass: ['', '👓', '🕶️', '🥽'],
  extra: ['', '🎀', '🌸', '🦋', '⭐', '🍭']
};

const FACE_LINES = [
  { en: 'Hello! I am a silly face!', hi: 'नमस्ते! मैं मज़ेदार चेहरा हूँ!', hiSay: 'Namaste! Main mazedar chehra hoon!' },
  { en: 'Ha ha ha! Look at me!', hi: 'हा हा हा! मुझे देखो!', hiSay: 'Ha ha ha! Mujhe dekho!' },
  { en: 'Do you like my hat?', hi: 'मेरी टोपी अच्छी है ना?', hiSay: 'Meri topi achhi hai na?' },
  { en: 'Let us play again!', hi: 'चलो फिर से खेलें!', hiSay: 'Chalo phir se khelein!' }
];

const facemakerGame = (() => {
  const kinds = ['face', 'hat', 'glass', 'extra'];
  const labels = { face: '😀', hat: '🎩', glass: '👓', extra: '⭐' };

  buildScreen('facemaker',
    '<p class="hint" data-t="faceHint"></p>' +
    '<div id="face-scene" data-face="0" data-hat="0" data-glass="0" data-extra="0">' +
    '<span class="face-base"></span>' +
    '<span class="face-layer face-hat"></span>' +
    '<span class="face-layer face-glass"></span>' +
    '<span class="face-layer face-extra"></span>' +
    '</div>' +
    '<div id="face-controls">' +
    kinds.map((k) =>
      '<div class="face-ctrl" data-kind="' + k + '">' +
      '<button class="face-arrow" data-dir="-1">◀</button>' +
      '<span class="face-icon">' + labels[k] + '</span>' +
      '<button class="face-arrow" data-dir="1">▶</button>' +
      '</div>').join('') +
    '</div>' +
    '<div class="row-btns">' +
    '<button id="face-dice" class="big-btn alt" data-t="faceDice"></button>' +
    '<button id="face-talk" class="big-btn" data-t="faceTalk"></button>' +
    '</div>');

  const state = { face: 0, hat: 0, glass: 0, extra: 0 };

  function paint() {
    const scene = $('face-scene');
    scene.dataset.face = String(state.face);
    scene.dataset.hat = String(state.hat);
    scene.dataset.glass = String(state.glass);
    scene.dataset.extra = String(state.extra);
    scene.querySelector('.face-base').textContent = FACE_PARTS.face[state.face];
    scene.querySelector('.face-hat').textContent = FACE_PARTS.hat[state.hat];
    scene.querySelector('.face-glass').textContent = FACE_PARTS.glass[state.glass];
    scene.querySelector('.face-extra').textContent = FACE_PARTS.extra[state.extra];
    popIt(scene);
  }

  function step(kind, dir) {
    const list = FACE_PARTS[kind];
    state[kind] = (state[kind] + dir + list.length) % list.length;
    sfx.flip();
    paint();
  }

  document.querySelectorAll('#face-controls .face-ctrl').forEach((row) => {
    const kind = row.dataset.kind;
    row.querySelectorAll('.face-arrow').forEach((b) => {
      b.addEventListener('click', () => step(kind, Number(b.dataset.dir)));
    });
  });

  $('face-dice').addEventListener('click', () => {
    sfx.flip();
    kinds.forEach((k) => { state[k] = Math.floor(Math.random() * FACE_PARTS[k].length); });
    paint();
    confetti(8);
  });

  $('face-talk').addEventListener('click', () => {
    sfx.correct();
    popIt($('face-scene'));
    store.addStars(1);
    starFly($('face-scene'));
    sayPhrase(rand(FACE_LINES));
  });

  paint();

  return { enter() { paint(); } };
})();

GAMES.facemaker = { emoji: '😜', color: 'var(--sunny)', screen: 'screen-facemaker', enter() { facemakerGame.enter(); } };

/* ================= Katori Khel (cups) ================= */

GAME_TITLES.cups = { en: 'Find the Ball', hi: 'कटोरी खेल', hiSay: 'Katori khel' };

const cupsGame = (() => {
  buildScreen('cups',
    '<p class="hint" data-t="cupsHint"></p>' +
    '<div id="cups-dots" class="dots-row"></div>' +
    '<div id="cups-row" data-ball="" data-phase="show"></div>');

  const CUP_W = 116;
  const state = { round: 0, cups: [], ball: null, phase: 'show', timeouts: [] };

  function tmo(fn, ms) {
    const id = later(fn, ms);
    state.timeouts.push(id);
    return id;
  }
  function stop() {
    state.timeouts.forEach(clearTimeout);
    state.timeouts = [];
  }

  function dots() { renderDots('cups-dots', 5, state.round); }

  // Spacing comes from the row's real width, so the third bowl is always
  // on screen and tappable, even on a 360px phone.
  function slotW() {
    const row = $('cups-row');
    return Math.max(CUP_W + 4, Math.min(124, (row.clientWidth - CUP_W) / 2));
  }

  function place(cup) {
    cup.el.style.transform = 'translateX(' + Math.round(cup.slot * slotW()) + 'px)';
  }

  function build() {
    const row = $('cups-row');
    row.innerHTML = '';
    state.cups = [];
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('button');
      el.className = 'cup';
      el.dataset.cup = 'c' + i;
      el.innerHTML = '<span class="cup-ball">🔴</span><span class="cup-body">🥣</span>';
      const cup = { el, slot: i, id: 'c' + i };
      el.addEventListener('click', () => guess(cup));
      row.appendChild(el);
      state.cups.push(cup);
      place(cup);
    }
  }

  function setPhase(p) {
    state.phase = p;
    $('cups-row').dataset.phase = p;
  }

  function newRound() {
    stop();
    dots();
    build();
    state.ball = rand(state.cups);
    $('cups-row').dataset.ball = state.ball.id;
    state.ball.el.classList.add('has-ball');
    setPhase('show');
    state.ball.el.classList.add('open');
    sayPhrase(T.cupsWatch);
    tmo(() => {
      state.ball.el.classList.remove('open');
      shuffleCups(0);
    }, 1200);
  }

  function shuffleCups(n) {
    const swaps = 3 + state.round;
    const gap = Math.max(240, 520 - state.round * 50);
    if (n >= swaps) {
      setPhase('guess');
      sayPhrase(T.cupsAsk);
      return;
    }
    setPhase('shuffle');
    const pair = sample(state.cups, 2);
    const t = pair[0].slot;
    pair[0].slot = pair[1].slot;
    pair[1].slot = t;
    place(pair[0]);
    place(pair[1]);
    sfx.flip();
    tmo(() => shuffleCups(n + 1), gap);
  }

  function guess(cup) {
    if (state.phase !== 'guess') return;
    setPhase('done');
    cup.el.classList.add('open');
    const right = cup.id === state.ball.id;
    if (right) {
      sfx.correct();
      store.addStars(2);
      starFly(cup.el);
      confetti(16);
      sayPhrase(joinPhrase(rand(PRAISE), phrase('You found it!', 'मिल गई!', 'Mil gayi!')));
    } else {
      sfx.wrong();
      tmo(() => state.ball.el.classList.add('open'), 500);
      sayPhrase(phrase('It was here!', 'ये यहाँ थी!', 'Ye yahan thi!'));
    }
    state.round++;
    dots();
    tmo(() => {
      if (state.round >= 5) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 2200);
  }

  function start() {
    stop();
    state.round = 0;
    newRound();
  }

  return { start, stop };
})();

GAMES.cups = {
  emoji: '🥣', color: 'var(--lilac)', screen: 'screen-cups',
  enter() { cupsGame.start(); }, onLeave() { cupsGame.stop(); }
};

/* ================= Kasrat (yoga) ================= */

GAME_TITLES.yoga = { en: 'Move & Stretch', hi: 'कसरत', hiSay: 'Kasrat' };

const YOGA_POSES = [
  { emoji: '🧘', en: 'Sit like a yogi', hi: 'योगी की तरह बैठो', hiSay: 'Yogi ki tarah baitho' },
  { emoji: '🙆', en: 'Arms up high!', hi: 'हाथ ऊपर करो!', hiSay: 'Haath upar karo!' },
  { emoji: '🤸', en: 'Make a star!', hi: 'तारा बनो!', hiSay: 'Tara bano!' },
  { emoji: '🦩', en: 'Stand on one leg', hi: 'एक पैर पर खड़े हो', hiSay: 'Ek pair par khade ho' },
  { emoji: '🙇', en: 'Bend forward', hi: 'आगे झुको', hiSay: 'Aage jhuko' },
  { emoji: '💪', en: 'Show your muscles!', hi: 'ताकत दिखाओ!', hiSay: 'Taakat dikhao!' },
  { emoji: '🕺', en: 'Dance!', hi: 'नाचो!', hiSay: 'Nacho!' },
  { emoji: '🐈', en: 'Stretch like a cat', hi: 'बिल्ली जैसे खिंचो', hiSay: 'Billi jaise khincho' }
];

const yogaGame = (() => {
  buildScreen('yoga',
    '<p class="hint" data-t="yogaHint"></p>' +
    '<div id="yoga-dots" class="dots-row"></div>' +
    '<div id="yoga-pose" data-i="0" data-pose="" data-count="5">' +
    '<div id="yoga-emoji"></div>' +
    '<div id="yoga-name"></div>' +
    '<div id="yoga-count"></div>' +
    '</div>' +
    '<button id="yoga-next" class="big-btn" data-t="yogaNext"></button>');

  const HOLD = 5;
  const state = { poses: [], i: 0, left: HOLD, timer: 0 };

  function dots() { renderDots('yoga-dots', 6, state.i); }

  function paintName() {
    const p = state.poses[state.i];
    if (p) $('yoga-name').textContent = p[store.getLang()];
  }

  function tick() {
    state.left--;
    $('yoga-pose').dataset.count = String(state.left);
    $('yoga-count').textContent = state.left > 0 ? String(state.left) : '⭐';
    if (state.left > 0) {
      sfx.pop();
      state.timer = later(tick, 1000);
      return;
    }
    sfx.correct();
    store.addStars(1);
    starFly($('yoga-pose'));
    confetti(12);
    sayPhrase(rand(PRAISE));
    state.i++;
    dots();
    state.timer = later(() => {
      if (state.i >= 6) celebrate({ again: () => { hideCelebrate(); start(); } });
      else showPose();
    }, 1400);
  }

  function showPose() {
    clearTimeout(state.timer);
    const p = state.poses[state.i];
    state.left = HOLD;
    const box = $('yoga-pose');
    box.dataset.i = String(state.i);
    box.dataset.pose = p.en;
    box.dataset.count = String(HOLD);
    $('yoga-emoji').textContent = p.emoji;
    paintName();
    $('yoga-count').textContent = String(HOLD);
    popIt(box);
    sayPhrase(phrase(p.en, p.hi, p.hiSay));
    state.timer = later(tick, 1200);
  }

  function skip() {
    sfx.pop();
    clearTimeout(state.timer);
    state.i++;
    dots();
    if (state.i >= 6) { state.i = 0; }
    showPose();
  }

  function start() {
    clearTimeout(state.timer);
    state.poses = sample(YOGA_POSES, 6);
    state.i = 0;
    showPose();
  }
  function stop() { clearTimeout(state.timer); }

  $('yoga-next').addEventListener('click', skip);

  return { start, stop, paintName };
})();

GAMES.yoga = {
  emoji: '🤸', color: 'var(--mint)', screen: 'screen-yoga',
  enter() { yogaGame.start(); }, onLang() { yogaGame.paintName(); }, onLeave() { yogaGame.stop(); }
};
