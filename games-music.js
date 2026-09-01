'use strict';
/* ================================================================
   games-music.js — Sangeet Pack.
   piano — seven coloured keys, Sa Re Ga Ma Pa Dha Ni
   tune  — the keys play a little tune, you play it back
   drum  — the same game with three drums, for rhythm
   Sound comes from sfx.note() (Web Audio), so there are no audio files
   and it still works offline.
   ================================================================ */

Object.assign(T, {
  pianoHint: { en: 'Tap the keys and make music!', hi: 'चाबियाँ दबाओ और संगीत बनाओ!' },
  pianoSay: { en: '🔤 Say the notes', hi: '🔤 सुर बोलो' },
  echoListen: { en: 'Listen…', hi: 'सुनो…', hiSay: 'Suno…' },
  echoCopy: { en: 'Now you play it!', hi: 'अब तुम बजाओ!', hiSay: 'Ab tum bajao!' },
  echoAgain: { en: 'Listen once more…', hi: 'एक बार और सुनो…', hiSay: 'Ek baar aur suno…' },
  tuneHint: { en: 'Listen to the tune, then play it back!', hi: 'धुन सुनो, फिर वैसे ही बजाओ!' },
  drumHint: { en: 'Listen to the beat, then play it back!', hi: 'ताल सुनो, फिर वैसे ही बजाओ!' }
});

const SUR = [
  { key: 'sa', label: 'सा', en: 'Sa', freq: 261.63, hex: '#E53935' },
  { key: 're', label: 'रे', en: 'Re', freq: 293.66, hex: '#FB8C00' },
  { key: 'ga', label: 'ग', en: 'Ga', freq: 329.63, hex: '#FDD835' },
  { key: 'ma', label: 'म', en: 'Ma', freq: 349.23, hex: '#43A047' },
  { key: 'pa', label: 'प', en: 'Pa', freq: 392.00, hex: '#1E88E5' },
  { key: 'dha', label: 'ध', en: 'Dha', freq: 440.00, hex: '#8E24AA' },
  { key: 'ni', label: 'नि', en: 'Ni', freq: 493.88, hex: '#F06292' }
];

/* ================= Baja (piano) ================= */

GAME_TITLES.piano = { en: 'Baja', hi: 'बाजा', hiSay: 'Baja' };

const pianoGame = (() => {
  buildScreen('piano',
    '<p class="hint" data-t="pianoHint"></p>' +
    '<div id="piano-keys" data-last=""></div>' +
    '<button id="piano-say" class="big-btn alt" data-t="pianoSay"></button>');

  const state = { say: true };

  function hit(n, el) {
    sfx.note(n.freq, 0.6);
    $('piano-keys').dataset.last = n.key;
    el.classList.remove('playing');
    void el.offsetWidth;
    el.classList.add('playing');
    if (state.say) sayPhrase(phrase(n.en, n.label, n.en));
  }

  function build() {
    const keys = $('piano-keys');
    keys.innerHTML = '';
    SUR.forEach((n) => {
      const b = document.createElement('button');
      b.className = 'pkey';
      b.dataset.note = n.key;
      b.style.background = n.hex;
      b.innerHTML = '<span class="pkey-label">' + n.label + '</span>';
      b.addEventListener('click', () => hit(n, b));
      keys.appendChild(b);
    });
  }

  build();
  $('piano-say').addEventListener('click', () => {
    state.say = !state.say;
    sfx.pop();
    $('piano-say').classList.toggle('off', !state.say);
  });

  return { enter() { } };
})();

GAMES.piano = { emoji: '🎹', color: 'var(--sky)', screen: 'screen-piano', enter() { pianoGame.enter(); } };

/* ================= Echo games (tune & drum) =================
   Both games are the same idea — hear a short pattern, play it back —
   so they share one builder. Nothing can be lost: a wrong tap simply
   replays the pattern. */

function makeEcho(id, cfg) {
  buildScreen(id,
    '<p class="hint" data-t="' + cfg.hintKey + '"></p>' +
    '<div id="' + id + '-dots" class="dots-row"></div>' +
    '<div id="' + id + '-area" class="echo-area" data-seq="" data-phase="listen" data-step="0">' +
    '<div id="' + id + '-pads" class="echo-pads"></div>' +
    '</div>');

  const state = { round: 0, seq: [], step: 0, phase: 'listen', timeouts: [] };
  const area = () => $(id + '-area');

  function tmo(fn, ms) {
    const t = later(fn, ms);
    state.timeouts.push(t);
    return t;
  }
  function stop() {
    state.timeouts.forEach(clearTimeout);
    state.timeouts = [];
  }

  function dots() {
    const d = $(id + '-dots');
    d.innerHTML = '';
    for (let k = 0; k < 4; k++) {
      const s = document.createElement('span');
      s.className = 'dot' + (k < state.round ? ' filled' : '');
      d.appendChild(s);
    }
  }

  function padEl(key) {
    return $(id + '-pads').querySelector('.echo-pad[data-pad="' + key + '"]');
  }

  function play(item, el) {
    sfx.note(item.freq, item.dur || 0.5, item.type);
    const pad = el || padEl(item.key);
    if (!pad) return;
    pad.classList.remove('playing');
    void pad.offsetWidth;
    pad.classList.add('playing');
  }

  function setPhase(p) {
    state.phase = p;
    area().dataset.phase = p;
  }

  function playSeq(first) {
    setPhase('listen');
    state.step = 0;
    area().dataset.step = '0';
    sayPhrase(first ? T.echoListen : T.echoAgain);
    state.seq.forEach((key, i) => {
      tmo(() => play(cfg.items.find((x) => x.key === key)), 900 + i * 620);
    });
    tmo(() => {
      setPhase('copy');
      sayPhrase(T.echoCopy);
    }, 900 + state.seq.length * 620);
  }

  function newRound() {
    stop();
    dots();
    const len = Math.min(lvl(2, 2, 3) + state.round, lvl(4, 5, 6));
    state.seq = [];
    for (let i = 0; i < len; i++) state.seq.push(rand(cfg.items).key);
    area().dataset.seq = state.seq.join(',');
    playSeq(true);
  }

  function tap(item) {
    if (state.phase === 'listen') return;
    play(item);
    if (state.phase !== 'copy') return;
    if (item.key !== state.seq[state.step]) {
      sfx.wrong();
      const pad = padEl(item.key);
      pad.classList.add('wiggle');
      pad.addEventListener('animationend', () => pad.classList.remove('wiggle'), { once: true });
      setPhase('listen');
      tmo(() => playSeq(false), 900);
      return;
    }
    state.step++;
    area().dataset.step = String(state.step);
    if (state.step < state.seq.length) return;

    setPhase('done');
    sfx.correct();
    store.addStars(2);
    starFly(area());
    confetti(16);
    sayPhrase(rand(PRAISE));
    state.round++;
    dots();
    tmo(() => {
      if (state.round >= 4) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 1800);
  }

  function build() {
    const pads = $(id + '-pads');
    pads.innerHTML = '';
    cfg.items.forEach((item) => {
      const b = document.createElement('button');
      b.className = 'echo-pad ' + (cfg.padClass || '');
      b.dataset.pad = item.key;
      if (item.hex) b.style.background = item.hex;
      b.innerHTML = '<span class="echo-face">' + item.label + '</span>';
      b.addEventListener('click', () => tap(item));
      pads.appendChild(b);
    });
  }

  function start() {
    stop();
    state.round = 0;
    build();
    newRound();
  }

  GAMES[id] = {
    emoji: cfg.emoji, color: cfg.color, screen: 'screen-' + id,
    enter() { start(); }, onLeave() { stop(); }
  };
}

/* ---- Dhun Copy ---- */

GAME_TITLES.tune = { en: 'Copy the Tune', hi: 'धुन कॉपी', hiSay: 'Dhun copy' };

makeEcho('tune', {
  emoji: '🎶', color: 'var(--lilac)', hintKey: 'tuneHint',
  padClass: 'tune-pad',
  items: SUR.slice(0, 5).map((n) => ({ key: n.key, label: n.label, freq: n.freq, hex: n.hex, dur: 0.5 }))
});

/* ---- Taal ---- */

GAME_TITLES.drum = { en: 'Keep the Beat', hi: 'ताल', hiSay: 'Taal' };

makeEcho('drum', {
  emoji: '🥁', color: 'var(--tangerine)', hintKey: 'drumHint',
  padClass: 'drum-pad',
  items: [
    { key: 'dhol', label: '🪘', freq: 150, dur: 0.35, type: 'sine' },
    { key: 'tabla', label: '🥁', freq: 260, dur: 0.28, type: 'triangle' },
    { key: 'manjira', label: '🔔', freq: 900, dur: 0.22, type: 'square' }
  ]
});
