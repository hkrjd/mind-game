'use strict';
/* ================================================================
   games-read.js — Padhna Pack: matra building, Hindi word building,
   word reading and rhyming.
   Built on the shared quiz engine (app.js) and the slot/bank pattern
   the spelling game uses (games-skill.js).
   ================================================================ */

Object.assign(T, {
  matraHint: { en: 'Tap a letter, then a matra!', hi: 'अक्षर दबाओ, फिर मात्रा!' },
  hwHint: { en: 'Tap the letters in order!', hi: 'अक्षर क्रम में दबाओ!' },
  readwordDesc: { en: 'Read the word, then find its picture!', hi: 'शब्द पढ़ो, फिर उसकी तस्वीर ढूँढो!' },
  rhymeDesc: { en: 'Find the word that rhymes!', hi: 'तुक मिलाने वाला शब्द ढूँढो!' }
});

/* ================= Matra (क + ी = की) ================= */

GAME_TITLES.matra = { en: 'Matra', hi: 'मात्रा', hiSay: 'Matra' };

// Ten matras, each with the vowel it comes from and a romanized sound.
const MATRAS = [
  { sign: '', name: 'अ', rom: 'a' },
  { sign: 'ा', name: 'आ', rom: 'aa' },
  { sign: 'ि', name: 'इ', rom: 'i' },
  { sign: 'ी', name: 'ई', rom: 'ee' },
  { sign: 'ु', name: 'उ', rom: 'u' },
  { sign: 'ू', name: 'ऊ', rom: 'oo' },
  { sign: 'े', name: 'ए', rom: 'e' },
  { sign: 'ै', name: 'ऐ', rom: 'ai' },
  { sign: 'ो', name: 'ओ', rom: 'o' },
  { sign: 'ौ', name: 'औ', rom: 'au' }
];

const MATRA_CONS = [
  { ch: 'क', rom: 'k' }, { ch: 'ख', rom: 'kh' }, { ch: 'ग', rom: 'g' }, { ch: 'म', rom: 'm' },
  { ch: 'न', rom: 'n' }, { ch: 'प', rom: 'p' }, { ch: 'र', rom: 'r' }, { ch: 'स', rom: 's' }
];

const matraGame = (() => {
  buildScreen('matra',
    '<p class="hint" data-t="matraHint"></p>' +
    '<div id="matra-cons" class="chip-row"></div>' +
    '<div id="matra-big" data-cons="क" data-matra="" data-akshar="क">क</div>' +
    '<div id="matra-list" class="chip-row"></div>' +
    '<button id="matra-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

  const state = { c: 0, m: 0 };

  function akshar() { return MATRA_CONS[state.c].ch + MATRAS[state.m].sign; }
  function roman() { return MATRA_CONS[state.c].rom + MATRAS[state.m].rom; }

  function paint() {
    const big = $('matra-big');
    big.textContent = akshar();
    big.dataset.cons = MATRA_CONS[state.c].ch;
    big.dataset.matra = MATRAS[state.m].name;
    big.dataset.akshar = akshar();
    popIt(big);
    document.querySelectorAll('#matra-cons .chip').forEach((b, i) => b.classList.toggle('active', i === state.c));
    document.querySelectorAll('#matra-list .chip').forEach((b, i) => b.classList.toggle('active', i === state.m));
  }

  function say() {
    const c = MATRA_CONS[state.c];
    const m = MATRAS[state.m];
    sayPhrase(phrase(
      c.rom + ' and ' + m.rom + ' — ' + roman() + '!',
      c.ch + ' और ' + m.name + ' — ' + akshar() + '!',
      c.rom + ' aur ' + m.rom + ' — ' + roman() + '!'
    ));
  }

  function build() {
    const cons = $('matra-cons');
    cons.innerHTML = '';
    MATRA_CONS.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = c.ch;
      b.dataset.c = c.ch;
      b.addEventListener('click', () => { sfx.pop(); state.c = i; paint(); say(); });
      cons.appendChild(b);
    });
    const list = $('matra-list');
    list.innerHTML = '';
    MATRAS.forEach((m, i) => {
      const b = document.createElement('button');
      b.className = 'chip';
      // The bare sign renders oddly on its own, so chips show the vowel it comes from.
      b.textContent = m.name;
      b.dataset.m = m.name;
      b.addEventListener('click', () => { sfx.pop(); state.m = i; paint(); say(); });
      list.appendChild(b);
    });
    paint();
  }

  function question() {
    const c = rand(MATRA_CONS);
    const three = sample(MATRAS, 3);
    const ans = three[0];
    const word = c.ch + ans.sign;
    const rom = c.rom + ans.rom;
    return {
      key: 'MT' + word,
      // The Hindi prompt used to print the answer itself; ask from the parts.
      prompt: phrase(
        'Which one says ' + rom + '?',
        c.ch + ' और ' + ans.name + ' मिलकर क्या बनेगा?',
        c.rom + ' aur ' + ans.rom + ' milkar kya banega?'
      ),
      extra: '<div class="math-eq">' + c.ch + ' + ' + ans.name + ' = ?</div>',
      choices: shuffle(three).map((m) => ({ key: c.ch + m.sign, html: '<span class="akshar">' + c.ch + m.sign + '</span>' })),
      answer: word,
      answerPhrase: phrase(rom + '!', word + '!', rom + '!')
    };
  }

  build();
  $('matra-quiz').addEventListener('click', () => quiz.start({ make: question, backTo: 'screen-matra' }));

  return { enter() { paint(); } };
})();

GAMES.matra = { emoji: '✒️', color: 'var(--lilac)', screen: 'screen-matra', enter() { matraGame.enter(); } };

/* ================= Hindi Shabd Banao ================= */

GAME_TITLES.hindiword = { en: 'Hindi Words', hi: 'हिंदी शब्द', hiSay: 'Hindi shabd' };

// Each word is split into the units a child actually taps: a consonant
// carries its matra with it (मो, दू…), so the tile is one readable piece.
const HINDI_WORDS = [
  { parts: ['क', 'म', 'ल'], word: 'कमल', emoji: '🪷', en: 'Lotus', hiSay: 'Kamal' },
  { parts: ['न', 'ल'], word: 'नल', emoji: '🚰', en: 'Tap', hiSay: 'Nal' },
  { parts: ['घ', 'र'], word: 'घर', emoji: '🏠', en: 'House', hiSay: 'Ghar' },
  { parts: ['फ', 'ल'], word: 'फल', emoji: '🍎', en: 'Fruit', hiSay: 'Phal' },
  { parts: ['ब', 'स'], word: 'बस', emoji: '🚌', en: 'Bus', hiSay: 'Bus' },
  { parts: ['मो', 'र'], word: 'मोर', emoji: '🦚', en: 'Peacock', hiSay: 'Mor' },
  { parts: ['आ', 'म'], word: 'आम', emoji: '🥭', en: 'Mango', hiSay: 'Aam' },
  { parts: ['दू', 'ध'], word: 'दूध', emoji: '🥛', en: 'Milk', hiSay: 'Doodh' },
  { parts: ['क', 'ल', 'म'], word: 'कलम', emoji: '🖊️', en: 'Pen', hiSay: 'Kalam' },
  { parts: ['गा', 'य'], word: 'गाय', emoji: '🐄', en: 'Cow', hiSay: 'Gaay' },
  { parts: ['ना', 'व'], word: 'नाव', emoji: '⛵', en: 'Boat', hiSay: 'Naav' },
  { parts: ['पे', 'ड़'], word: 'पेड़', emoji: '🌳', en: 'Tree', hiSay: 'Ped' },
  { parts: ['सू', 'र', 'ज'], word: 'सूरज', emoji: '☀️', en: 'Sun', hiSay: 'Sooraj' },
  { parts: ['चा', 'बी'], word: 'चाबी', emoji: '🔑', en: 'Key', hiSay: 'Chaabi' }
];

const HW_EXTRA = ['त', 'ख', 'झ', 'ठ', 'व', 'श', 'ह', 'ज', 'ड', 'भ', 'थ', 'ट'];

const hindiwordGame = (() => {
  buildScreen('hindiword',
    '<p class="hint" data-t="hwHint"></p>' +
    '<div id="hw-dots" class="dots-row"></div>' +
    '<div id="hw-emoji" class="intro-emoji"></div>' +
    '<div id="hw-slots" data-word="" data-filled="0"></div>' +
    '<div id="hw-bank"></div>');

  const state = { words: [], i: 0, filled: 0 };

  function dots() { renderDots('hw-dots', 5, state.i); }

  function newWord() {
    const w = state.words[state.i];
    state.filled = 0;
    dots();
    $('hw-emoji').textContent = w.emoji;
    const slots = $('hw-slots');
    slots.dataset.word = w.word;
    slots.dataset.parts = w.parts.join(',');
    slots.dataset.filled = '0';
    slots.innerHTML = '';
    w.parts.forEach(() => {
      const s = document.createElement('span');
      s.className = 'slot';
      slots.appendChild(s);
    });
    const bank = $('hw-bank');
    bank.innerHTML = '';
    // Distractors must not look like a piece of this word.
    const extras = [];
    const pool = shuffle(HW_EXTRA);
    for (let k = 0; k < pool.length && extras.length < 2; k++) {
      const d = pool[k];
      if (!w.parts.some((p) => p.indexOf(d) === 0 || d.indexOf(p) === 0)) extras.push(d);
    }
    shuffle(w.parts.concat(extras)).forEach((ch) => {
      const b = document.createElement('button');
      b.className = 'bank-tile';
      b.textContent = ch;
      b.dataset.l = ch;
      b.addEventListener('click', () => pick(b, w));
      bank.appendChild(b);
    });
    sayPhrase(phrase('Make the word ' + w.hiSay + '!', w.word + ' बनाओ!', w.hiSay + ' banao!'));
  }

  function pick(tile, w) {
    if (tile.classList.contains('used')) return;
    const expect = w.parts[state.filled];
    if (tile.dataset.l !== expect) {
      nope(tile);
      return;
    }
    tile.classList.add('used');
    const slot = $('hw-slots').children[state.filled];
    slot.textContent = expect;
    slot.classList.add('filled', 'pop');
    state.filled++;
    $('hw-slots').dataset.filled = String(state.filled);
    sfx.pop();
    if (state.filled < w.parts.length) return;

    sfx.correct();
    store.addStars(1);
    starFly($('hw-slots'));
    sayPhrase(joinPhrase(rand(PRAISE), phrase(
      w.hiSay + ' — ' + w.en + '!',
      w.parts.join(', ') + ' — ' + w.word + '!',
      w.parts.join(', ') + ' — ' + w.hiSay + '!'
    )));
    state.i++;
    later(() => {
      if (state.i >= 5) {
        dots();
        celebrate({ again: () => { hideCelebrate(); start(); } });
      } else {
        newWord();
      }
    }, 2200);
  }

  function start() {
    state.words = sample(HINDI_WORDS, 5);
    state.i = 0;
    newWord();
  }

  return { start };
})();

GAMES.hindiword = { emoji: '🔤', color: 'var(--mint)', screen: 'screen-hindiword', enter() { hindiwordGame.start(); } };

/* ================= Shabd Padho (read the word) ================= */

GAME_TITLES.readword = { en: 'Read the Word', hi: 'शब्द पढ़ो', hiSay: 'Shabd padho' };

buildScreen('readword',
  '<div class="intro-emoji">📕</div>' +
  '<p class="hint" data-t="readwordDesc"></p>' +
  '<button id="readword-start" class="big-btn" data-t="startBtn"></button>');

function readwordQuestion() {
  const three = sample(SPELL_WORDS, 3);
  const ans = three[0];
  const lang = store.getLang();
  const shown = lang === 'hi' ? ans.hi : ans.word;
  return {
    key: 'RW' + ans.word,
    prompt: phrase('Read it — which picture?', 'पढ़ो — कौन सी तस्वीर?', 'Padho — kaunsi tasveer?'),
    extra: '<div class="read-word">' + shown + '</div>',
    choices: shuffle(three).map((w) => ({ key: w.word, html: '<span>' + w.emoji + '</span>' })),
    answer: ans.word,
    answerPhrase: phrase(ans.word + '!', ans.hi + '!', ans.hiSay + '!')
  };
}

$('readword-start').addEventListener('click', () => {
  quiz.start({ make: readwordQuestion, backTo: 'screen-readword' });
});

GAMES.readword = { emoji: '📕', color: 'var(--sky)', screen: 'screen-readword', enter() { } };

/* ================= Tukbandi (rhyming) ================= */

GAME_TITLES.rhymewords = { en: 'Rhyme Time', hi: 'तुकबंदी', hiSay: 'Tukbandi' };

// Rhyme only works in English, so these words stay English in both
// languages — exactly like the times tables are always recited in English.
const RHYME_SETS = [
  [{ w: 'cat', emoji: '🐱' }, { w: 'hat', emoji: '🎩' }, { w: 'bat', emoji: '🦇' }],
  [{ w: 'dog', emoji: '🐶' }, { w: 'log', emoji: '🪵' }, { w: 'frog', emoji: '🐸' }],
  [{ w: 'sun', emoji: '☀️' }, { w: 'bun', emoji: '🍞' }, { w: 'run', emoji: '🏃' }],
  [{ w: 'pig', emoji: '🐷' }, { w: 'wig', emoji: '👱' }, { w: 'twig', emoji: '🌿' }],
  [{ w: 'car', emoji: '🚗' }, { w: 'star', emoji: '⭐' }, { w: 'jar', emoji: '🫙' }],
  [{ w: 'bee', emoji: '🐝' }, { w: 'tree', emoji: '🌳' }, { w: 'key', emoji: '🔑' }],
  [{ w: 'cake', emoji: '🍰' }, { w: 'snake', emoji: '🐍' }, { w: 'rake', emoji: '🧹' }],
  [{ w: 'bell', emoji: '🔔' }, { w: 'shell', emoji: '🐚' }, { w: 'well', emoji: '🕳️' }]
];

buildScreen('rhymewords',
  '<div class="intro-emoji">🎶</div>' +
  '<p class="hint" data-t="rhymeDesc"></p>' +
  '<button id="rhyme-start" class="big-btn" data-t="startBtn"></button>');

function rhymeQuestion() {
  const sets = sample(RHYME_SETS, 3);
  const pair = sample(sets[0], 2);
  const cue = pair[0];
  const ans = pair[1];
  const others = [rand(sets[1]), rand(sets[2])];
  const shown = shuffle([ans].concat(others));
  const list = shown.map((c) => c.w).join(', ');
  return {
    key: 'RH' + cue.w + ans.w,
    prompt: phrase(
      'Which rhymes with ' + cue.w + '? ' + list,
      cue.w + ' के साथ कौन सा मिलता है? ' + list,
      cue.w + ' ke saath kaunsa milta hai? ' + list
    ),
    extra: '<div class="read-word">' + cue.emoji + ' ' + cue.w + '</div>',
    choices: shown.map((c) => ({ key: c.w, html: '<span>' + c.emoji + '</span><span class="t-word">' + c.w + '</span>' })),
    answer: ans.w,
    answerPhrase: phrase(cue.w + ' — ' + ans.w + '!', cue.w + ' — ' + ans.w + '!', cue.w + ' — ' + ans.w + '!')
  };
}

$('rhyme-start').addEventListener('click', () => {
  quiz.start({ make: rhymeQuestion, backTo: 'screen-rhymewords' });
});

GAMES.rhymewords = { emoji: '🎶', color: 'var(--tangerine)', screen: 'screen-rhymewords', enter() { } };
