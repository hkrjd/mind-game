'use strict';
/* ================================================================
   games-nature.js — Vigyan Pack: little science.
   floatsink  — will it float or sink? (the tank always shows the truth)
   homes      — put each animal in its home
   babies     — match every animal to its baby
   mixcolors  — mix two colours and watch the new one appear
   ================================================================ */

Object.assign(T, {
  fsHint: { en: 'Will it float or sink?', hi: 'ये तैरेगा या डूबेगा?' },
  fsFloat: { en: 'Floats', hi: 'तैरेगा' },
  fsSink: { en: 'Sinks', hi: 'डूबेगा' },
  homesHint: { en: 'Tap an animal, then its home!', hi: 'जानवर दबाओ, फिर उसका घर!' },
  babiesHint: { en: 'Match each animal with its baby!', hi: 'हर जानवर को उसके बच्चे से मिलाओ!' },
  mixHint: { en: 'Tap two colours and see what happens!', hi: 'दो रंग दबाओ और देखो क्या बनता है!' },
  mixClear: { en: '🧽 Clean', hi: '🧽 साफ़ करो' },
  mixSame: { en: 'Same colour!', hi: 'वही रंग!', hiSay: 'Wahi rang!' }
});

/* ================= Tairta ya Doobta ================= */

GAME_TITLES.floatsink = { en: 'Float or Sink', hi: 'तैरता या डूबता', hiSay: 'Tairta ya doobta' };

const FLOAT_SINK = [
  { emoji: '🍂', ans: 'float', en: 'Leaf', hi: 'पत्ता', hiSay: 'Patta' },
  { emoji: '🪨', ans: 'sink', en: 'Stone', hi: 'पत्थर', hiSay: 'Patthar' },
  { emoji: '🍎', ans: 'float', en: 'Apple', hi: 'सेब', hiSay: 'Seb' },
  { emoji: '🔑', ans: 'sink', en: 'Key', hi: 'चाबी', hiSay: 'Chaabi', g: 'f' },
  { emoji: '🏀', ans: 'float', en: 'Ball', hi: 'गेंद', hiSay: 'Gend', g: 'f' },
  { emoji: '🥄', ans: 'sink', en: 'Spoon', hi: 'चम्मच', hiSay: 'Chammach' },
  { emoji: '🦆', ans: 'float', en: 'Duck', hi: 'बत्तख', hiSay: 'Batakh', g: 'f' },
  { emoji: '🪙', ans: 'sink', en: 'Coin', hi: 'सिक्का', hiSay: 'Sikka' },
  { emoji: '🧊', ans: 'float', en: 'Ice', hi: 'बर्फ़', hiSay: 'Barf', g: 'f' },
  { emoji: '⚓', ans: 'sink', en: 'Anchor', hi: 'लंगर', hiSay: 'Langar' }
];

const floatsinkGame = (() => {
  buildScreen('floatsink',
    '<p class="hint" data-t="fsHint"></p>' +
    '<div id="fs-dots" class="dots-row"></div>' +
    '<div id="fs-tank" data-answer="" data-round="0">' +
    '<div id="fs-item"></div>' +
    '<div id="fs-water"></div>' +
    '</div>' +
    '<div id="fs-btns">' +
    '<button class="big-btn fs-btn" data-side="float">🛟 <span data-t="fsFloat"></span></button>' +
    '<button class="big-btn alt fs-btn" data-side="sink">⬇️ <span data-t="fsSink"></span></button>' +
    '</div>');

  const state = { items: [], i: 0, locked: false, timer: 0 };

  function dots() { renderDots('fs-dots', 6, state.i); }

  function newRound() {
    clearTimeout(state.timer);
    state.locked = false;
    const it = state.items[state.i];
    dots();
    const tank = $('fs-tank');
    tank.dataset.answer = it.ans;
    tank.dataset.round = String(state.i + 1);
    const el = $('fs-item');
    el.className = '';
    el.textContent = it.emoji;
    sayPhrase(phrase(
      'The ' + it.en.toLowerCase() + ' — will it float or sink?',
      it.hi + ' — तैरेगा या डूबेगा?',
      it.hiSay + ' — tairega ya doobega?'
    ));
  }

  function answer(side) {
    if (state.locked) return;
    const it = state.items[state.i];
    state.locked = true;
    // Either way the tank shows what really happens — that is the lesson.
    $('fs-item').className = it.ans;
    const right = side === it.ans;
    if (right) {
      sfx.correct();
      store.addStars(1);
      starFly($('fs-tank'));
      confetti(10);
    } else {
      sfx.wrong();
    }
    const truth = it.ans === 'float'
      ? phrase(it.en + ' floats!', it.hi + ' ' + hiVerb(it, 'तैरता', 'तैरती') + ' है!',
        it.hiSay + ' ' + hiVerb(it, 'tairta', 'tairti') + ' hai!')
      : phrase(it.en + ' sinks!', it.hi + ' ' + hiVerb(it, 'डूब जाता', 'डूब जाती') + ' है!',
        it.hiSay + ' ' + hiVerb(it, 'doob jata', 'doob jati') + ' hai!');
    sayPhrase(right ? joinPhrase(rand(PRAISE), truth) : joinPhrase(phrase('Look!', 'देखो!', 'Dekho!'), truth));
    state.i++;
    dots();
    state.timer = later(() => {
      if (state.i >= 6) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 2400);
  }

  document.querySelectorAll('#fs-btns .fs-btn').forEach((b) => {
    b.addEventListener('click', () => answer(b.dataset.side));
  });

  function start() {
    state.items = sample(FLOAT_SINK, 6);
    state.i = 0;
    newRound();
  }
  function stop() { clearTimeout(state.timer); }

  return { start, stop };
})();

GAMES.floatsink = {
  emoji: '🛟', color: 'var(--sky)', screen: 'screen-floatsink',
  enter() { floatsinkGame.start(); }, onLeave() { floatsinkGame.stop(); }
};

/* ================= Janwar ke Ghar ================= */

GAME_TITLES.homes = { en: 'Animal Homes', hi: 'जानवर के घर', hiSay: 'Janwar ke ghar' };

const HOME_TARGETS = [
  { key: 'nest', emoji: '🪺', en: 'Nest', hi: 'घोंसला', hiSay: 'Ghosla' },
  { key: 'burrow', emoji: '🕳️', en: 'Burrow', hi: 'बिल', hiSay: 'Bil' },
  { key: 'kennel', emoji: '🏠', en: 'House', hi: 'घर', hiSay: 'Ghar' },
  { key: 'water', emoji: '💧', en: 'Water', hi: 'पानी', hiSay: 'Paani' }
];

const HOME_ANIMALS = [
  { emoji: '🐦', home: 'nest', en: 'Bird', hi: 'चिड़िया', hiSay: 'Chidiya', g: 'f' },
  { emoji: '🦉', home: 'nest', en: 'Owl', hi: 'उल्लू', hiSay: 'Ullu' },
  { emoji: '🐭', home: 'burrow', en: 'Mouse', hi: 'चूहा', hiSay: 'Chooha' },
  { emoji: '🐜', home: 'burrow', en: 'Ant', hi: 'चींटी', hiSay: 'Cheenti', g: 'f' },
  { emoji: '🐶', home: 'kennel', en: 'Dog', hi: 'कुत्ता', hiSay: 'Kutta' },
  { emoji: '🐱', home: 'kennel', en: 'Cat', hi: 'बिल्ली', hiSay: 'Billi', g: 'f' },
  { emoji: '🐟', home: 'water', en: 'Fish', hi: 'मछली', hiSay: 'Machhli', g: 'f' },
  { emoji: '🐢', home: 'water', en: 'Turtle', hi: 'कछुआ', hiSay: 'Kachhua' }
];

const homesGame = (() => {
  buildScreen('homes',
    '<p class="hint" data-t="homesHint"></p>' +
    '<div id="homes-targets"></div>' +
    '<div id="homes-tray" data-placed="0"></div>');

  const state = { selected: null, placed: 0, timer: 0 };

  function start() {
    clearTimeout(state.timer);
    state.selected = null;
    state.placed = 0;
    const targets = $('homes-targets');
    targets.innerHTML = '';
    HOME_TARGETS.forEach((h) => {
      const b = document.createElement('button');
      b.className = 'home-target';
      b.dataset.accept = h.key;
      b.innerHTML = '<span class="t-big">' + h.emoji + '</span><span class="home-kids"></span>';
      b.addEventListener('click', () => drop(b, h));
      targets.appendChild(b);
    });
    const tray = $('homes-tray');
    tray.dataset.placed = '0';
    tray.innerHTML = '';
    shuffle(HOME_ANIMALS).forEach((a) => {
      const b = document.createElement('button');
      b.className = 'tile home-item';
      b.dataset.home = a.home;
      b.innerHTML = '<span class="t-big">' + a.emoji + '</span>';
      b.addEventListener('click', () => {
        if (b.classList.contains('used')) return;
        sfx.pop();
        document.querySelectorAll('#homes-tray .home-item').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        state.selected = { btn: b, animal: a };
        sayPhrase(wordPhrase(a));
      });
      tray.appendChild(b);
    });
    sayPhrase(T.homesHint);
  }

  function drop(target, h) {
    const sel = state.selected;
    if (!sel) return;
    if (sel.animal.home !== h.key) {
      nope(target);
      return;
    }
    sfx.correct();
    sel.btn.classList.remove('selected');
    sel.btn.classList.add('used');
    const mini = document.createElement('span');
    mini.className = 'home-mini';
    mini.textContent = sel.animal.emoji;
    target.querySelector('.home-kids').appendChild(mini);
    popIt(target);
    state.selected = null;
    state.placed++;
    $('homes-tray').dataset.placed = String(state.placed);
    store.addStars(1);
    starFly(target);
    sayPhrase(phrase(
      sel.animal.en + ' lives in the ' + h.en.toLowerCase() + '!',
      sel.animal.hi + ' ' + h.hi + ' में ' + hiVerb(sel.animal, 'रहता', 'रहती') + ' है!',
      sel.animal.hiSay + ' ' + h.hiSay + ' mein ' + hiVerb(sel.animal, 'rehta', 'rehti') + ' hai!'
    ));
    if (state.placed >= HOME_ANIMALS.length) {
      state.timer = later(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 1600);
    }
  }

  function stop() { clearTimeout(state.timer); }

  return { start, stop };
})();

GAMES.homes = {
  emoji: '🪺', color: 'var(--mint)', screen: 'screen-homes',
  enter() { homesGame.start(); }, onLeave() { homesGame.stop(); }
};

/* ================= Janwar ke Bachche ================= */

GAME_TITLES.babies = { en: 'Animal Babies', hi: 'जानवर के बच्चे', hiSay: 'Janwar ke bachche' };

const BABY_PAIRS = [
  { key: 'hen', mom: '🐔', baby: '🐣', mEn: 'Hen', mHi: 'मुर्गी', mSay: 'Murgi', bEn: 'Chick', bHi: 'चूज़ा', bSay: 'Chooza' },
  { key: 'cow', mom: '🐄', baby: '🐮', mEn: 'Cow', mHi: 'गाय', mSay: 'Gaay', bEn: 'Calf', bHi: 'बछड़ा', bSay: 'Bachhda' },
  { key: 'dog', mom: '🐕', baby: '🐶', mEn: 'Dog', mHi: 'कुत्ता', mObl: 'कुत्ते', mSay: 'Kutta', mSayObl: 'Kutte', bEn: 'Puppy', bHi: 'पिल्ला', bSay: 'Pilla' },
  { key: 'cat', mom: '🐈', baby: '🐱', mEn: 'Cat', mHi: 'बिल्ली', mSay: 'Billi', bEn: 'Kitten', bHi: 'बिल्ली का बच्चा', bSay: 'Billi ka bachcha' },
  { key: 'duck', mom: '🦆', baby: '🐥', mEn: 'Duck', mHi: 'बत्तख', mSay: 'Batakh', bEn: 'Duckling', bHi: 'बत्तख का बच्चा', bSay: 'Batakh ka bachcha' },
  { key: 'butterfly', mom: '🦋', baby: '🐛', mEn: 'Butterfly', mHi: 'तितली', mSay: 'Titli', bEn: 'Caterpillar', bHi: 'इल्ली', bSay: 'Illi' }
];

const babiesGame = (() => {
  buildScreen('babies',
    '<p class="hint" data-t="babiesHint"></p>' +
    '<div id="babies-area" data-matched="0">' +
    '<div id="babies-moms" class="baby-col"></div>' +
    '<div id="babies-kids" class="baby-col"></div>' +
    '</div>');

  const state = { round: 0, matched: 0, need: 0, selected: null, timer: 0 };

  function newRound() {
    clearTimeout(state.timer);
    state.selected = null;
    state.matched = 0;
    const pairs = sample(BABY_PAIRS, 5);
    state.need = pairs.length;
    $('babies-area').dataset.matched = '0';
    const moms = $('babies-moms');
    const kids = $('babies-kids');
    moms.innerHTML = '';
    kids.innerHTML = '';
    pairs.forEach((p) => {
      const m = document.createElement('button');
      m.className = 'tile baby-tile mom-tile';
      m.dataset.pair = p.key;
      m.dataset.en = p.mEn;
      m.dataset.hi = p.mHi;
      m.innerHTML = '<span class="t-big">' + p.mom + '</span><span class="t-word">' +
        (store.getLang() === 'hi' ? p.mHi : p.mEn) + '</span>';
      m.addEventListener('click', () => {
        if (m.classList.contains('matched')) return;
        sfx.pop();
        moms.querySelectorAll('.baby-tile').forEach((x) => x.classList.remove('selected'));
        m.classList.add('selected');
        state.selected = { btn: m, pair: p };
        sayPhrase(phrase(p.mEn + '!', p.mHi + '!', p.mSay + '!'));
      });
      moms.appendChild(m);
    });
    shuffle(pairs).forEach((p) => {
      const k = document.createElement('button');
      k.className = 'tile baby-tile kid-tile';
      k.dataset.pair = p.key;
      k.dataset.en = p.bEn;
      k.dataset.hi = p.bHi;
      k.innerHTML = '<span class="t-big">' + p.baby + '</span><span class="t-word">' +
        (store.getLang() === 'hi' ? p.bHi : p.bEn) + '</span>';
      k.addEventListener('click', () => match(k, p));
      kids.appendChild(k);
    });
    sayPhrase(T.babiesHint);
  }

  function match(kid, p) {
    if (kid.classList.contains('matched')) return;
    const sel = state.selected;
    if (!sel) { sfx.pop(); return; }
    if (sel.pair.key !== p.key) {
      nope(kid);
      return;
    }
    sfx.correct();
    sel.btn.classList.remove('selected');
    sel.btn.classList.add('matched');
    kid.classList.add('matched');
    state.selected = null;
    state.matched++;
    $('babies-area').dataset.matched = String(state.matched);
    store.addStars(1);
    starFly(kid);
    sayPhrase(phrase(
      'The baby ' + p.mEn.toLowerCase() + ' is a ' + p.bEn.toLowerCase() + '!',
      (p.mObl || p.mHi) + ' का बच्चा — ' + p.bHi + '!',
      (p.mSayObl || p.mSay) + ' ka bachcha — ' + p.bSay + '!'
    ));
    if (state.matched < state.need) return;
    state.round++;
    state.timer = later(() => {
      if (state.round >= 2) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 2000);
  }

  function relabel() {
    const hi = store.getLang() === 'hi';
    document.querySelectorAll('#babies-area .baby-tile').forEach((el) => {
      const w = el.querySelector('.t-word');
      if (w) w.textContent = hi ? el.dataset.hi : el.dataset.en;
    });
  }

  function start() { state.round = 0; newRound(); }
  function stop() { clearTimeout(state.timer); }

  return { start, stop, relabel };
})();

GAMES.babies = {
  emoji: '🐤', color: 'var(--sunny)', screen: 'screen-babies',
  enter() { babiesGame.start(); }, onLang() { babiesGame.relabel(); }, onLeave() { babiesGame.stop(); }
};

/* ================= Rang Milao (colour mixing) ================= */

GAME_TITLES.mixcolors = { en: 'Mix Colours', hi: 'रंग मिलाओ', hiSay: 'Rang milao' };

const MIX_BASE = [
  { key: 'red', hex: '#E53935', en: 'Red', hi: 'लाल', hiSay: 'Laal' },
  { key: 'yellow', hex: '#FDD835', en: 'Yellow', hi: 'पीला', hiSay: 'Peela' },
  { key: 'blue', hex: '#1E88E5', en: 'Blue', hi: 'नीला', hiSay: 'Neela' },
  { key: 'white', hex: '#FFFFFF', en: 'White', hi: 'सफ़ेद', hiSay: 'Safed' },
  { key: 'black', hex: '#37474F', en: 'Black', hi: 'काला', hiSay: 'Kaala' }
];

// Every pair has an answer, so a child can never hit a dead end.
const MIX_RULES = [
  { a: 'red', b: 'yellow', hex: '#FB8C00', en: 'Orange', hi: 'नारंगी', hiSay: 'Narangi', star: true },
  { a: 'blue', b: 'yellow', hex: '#43A047', en: 'Green', hi: 'हरा', hiSay: 'Hara', star: true },
  { a: 'red', b: 'blue', hex: '#8E24AA', en: 'Purple', hi: 'बैंगनी', hiSay: 'Baingani', star: true },
  { a: 'red', b: 'white', hex: '#F48FB1', en: 'Pink', hi: 'गुलाबी', hiSay: 'Gulabi', star: true },
  { a: 'blue', b: 'white', hex: '#90CAF9', en: 'Sky blue', hi: 'आसमानी', hiSay: 'Aasmani', star: true },
  { a: 'black', b: 'white', hex: '#9E9E9E', en: 'Grey', hi: 'स्लेटी', hiSay: 'Slaty', star: true },
  { a: 'red', b: 'black', hex: '#7B1E22', en: 'Maroon', hi: 'गहरा लाल', hiSay: 'Gehra laal' },
  { a: 'yellow', b: 'white', hex: '#FFF59D', en: 'Light yellow', hi: 'हल्का पीला', hiSay: 'Halka peela' },
  { a: 'yellow', b: 'black', hex: '#827717', en: 'Olive', hi: 'मेहँदी', hiSay: 'Mehndi' },
  { a: 'blue', b: 'black', hex: '#0D47A1', en: 'Dark blue', hi: 'गहरा नीला', hiSay: 'Gehra neela' }
];

function mixRule(a, b) {
  return MIX_RULES.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a)) || null;
}

const mixGame = (() => {
  buildScreen('mixcolors',
    '<p class="hint" data-t="mixHint"></p>' +
    '<div id="mix-bowl" data-a="" data-b="" data-result="">' +
    '<div id="mix-liquid"></div>' +
    '<div id="mix-drops"></div>' +
    '</div>' +
    '<div id="mix-name"></div>' +
    '<div id="mix-row"></div>' +
    '<div class="row-btns">' +
    '<button id="mix-clear" class="big-btn alt" data-t="mixClear"></button>' +
    '<button id="mix-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>' +
    '</div>');

  const state = { a: null, b: null };

  function clear() {
    state.a = null;
    state.b = null;
    const bowl = $('mix-bowl');
    bowl.dataset.a = '';
    bowl.dataset.b = '';
    bowl.dataset.result = '';
    $('mix-liquid').style.background = 'rgba(255,255,255,.35)';
    $('mix-drops').innerHTML = '';
    $('mix-name').textContent = '';
  }

  function drop(c) {
    const d = document.createElement('span');
    d.className = 'mix-drop';
    d.style.background = c.hex;
    $('mix-drops').appendChild(d);
  }

  function pick(c) {
    sfx.pop();
    const bowl = $('mix-bowl');
    if (state.a && state.b) clear();
    if (!state.a) {
      state.a = c;
      bowl.dataset.a = c.key;
      drop(c);
      $('mix-liquid').style.background = c.hex;
      sayPhrase(wordPhrase(c));
      return;
    }
    state.b = c;
    bowl.dataset.b = c.key;
    drop(c);
    if (c.key === state.a.key) {
      $('mix-liquid').style.background = c.hex;
      bowl.dataset.result = c.en;
      $('mix-name').textContent = c[store.getLang()];
      sayPhrase(T.mixSame);
      return;
    }
    const r = mixRule(state.a.key, c.key);
    $('mix-liquid').style.background = r.hex;
    bowl.dataset.result = r.en;
    $('mix-name').textContent = r[store.getLang()];
    popIt($('mix-bowl'));
    sfx.correct();
    confetti(10);
    store.addStars(1);
    starFly($('mix-bowl'));
    sayPhrase(phrase(
      state.a.en + ' and ' + c.en + ' make ' + r.en + '!',
      state.a.hi + ' और ' + c.hi + ' — ' + r.hi + '!',
      state.a.hiSay + ' aur ' + c.hiSay + ' — ' + r.hiSay + '!'
    ));
  }

  function render() {
    const row = $('mix-row');
    row.innerHTML = '';
    MIX_BASE.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'blob-tile mix-blob';
      b.dataset.c = c.key;
      b.innerHTML = '<span class="blob" style="background:' + c.hex + '"></span>' +
        '<span class="t-word">' + c[store.getLang()] + '</span>';
      b.addEventListener('click', () => pick(c));
      row.appendChild(b);
    });
    if ($('mix-bowl').dataset.result) {
      const done = MIX_RULES.concat(MIX_BASE).find((x) => x.en === $('mix-bowl').dataset.result);
      if (done) $('mix-name').textContent = done[store.getLang()];
    }
  }

  function question() {
    const rules = sample(MIX_RULES.filter((r) => r.star), 3);
    const ans = rules[0];
    const hexOf = (k) => MIX_BASE.find((c) => c.key === k).hex;
    return {
      key: 'MX' + ans.en,
      prompt: phrase(
        'Which two make ' + ans.en.toLowerCase() + '?',
        ans.hi + ' कौन से दो रंगों से बनता है?',
        ans.hiSay + ' kaunse do rangon se banta hai?'
      ),
      extra: '<span class="blob mix-target" style="background:' + ans.hex + '"></span>',
      choices: shuffle(rules).map((r) => ({
        key: r.en,
        html: '<span class="mix-pair">' +
          '<span class="blob mini-blob" style="background:' + hexOf(r.a) + '"></span>' +
          '<span class="blob mini-blob" style="background:' + hexOf(r.b) + '"></span></span>'
      })),
      answer: ans.en,
      answerPhrase: phrase(ans.en + '!', ans.hi + '!', ans.hiSay + '!')
    };
  }

  $('mix-clear').addEventListener('click', () => { sfx.pop(); clear(); });
  $('mix-quiz').addEventListener('click', () => quiz.start({ make: question, backTo: 'screen-mixcolors' }));

  return { enter() { clear(); render(); }, render };
})();

GAMES.mixcolors = {
  emoji: '🎨', color: 'var(--lilac)', screen: 'screen-mixcolors',
  enter() { mixGame.enter(); }, onLang() { mixGame.render(); }
};
