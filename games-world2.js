'use strict';
/* ================================================================
   games-world2.js — Gaadi Pack + Ghar-Parivar Pack.
   vehicles   — vehicles and the noises they make
   whereride  — sky, road or water?
   family     — the family tree and what we call everyone
   dress      — dress for the weather
   tidy       — put everything back where it belongs
   festivals  — which festival does this belong to?
   ================================================================ */

Object.assign(T, {
  whereHint: { en: 'Tap a vehicle, then where it goes!', hi: 'गाड़ी दबाओ, फिर वो कहाँ चलती है!' },
  familyHint: { en: 'Tap someone and hear who they are!', hi: 'किसी को दबाओ और सुनो वो कौन है!' },
  dressHint: { en: 'Pick the right thing to wear!', hi: 'सही चीज़ चुनो पहनने के लिए!' },
  tidyHint: { en: 'Tap a thing, then where it belongs!', hi: 'चीज़ दबाओ, फिर उसकी जगह!' },
  tidyDone: { en: 'The room is clean!', hi: 'कमरा साफ़ हो गया!', hiSay: 'Kamra saaf ho gaya!' },
  festHint: { en: 'Tap a festival and listen!', hi: 'त्योहार दबाओ और सुनो!' }
});

/* ================= Gaadiyan ================= */

GAME_TITLES.vehicles = { en: 'Vehicles', hi: 'गाड़ियाँ', hiSay: 'Gaadiyan' };

const VEHICLES = [
  { emoji: '🚌', en: 'Bus', hi: 'बस', hiSay: 'Bus', sEn: 'Pom pom!', sHi: 'पों पों!', sSay: 'Pom pom!' },
  { emoji: '🚗', en: 'Car', hi: 'गाड़ी', hiSay: 'Gaadi', sEn: 'Vroom!', sHi: 'वूम!', sSay: 'Vroom!' },
  { emoji: '🛺', en: 'Auto', hi: 'ऑटो', hiSay: 'Auto', sEn: 'Tuk tuk!', sHi: 'टुक टुक!', sSay: 'Tuk tuk!' },
  { emoji: '🚂', en: 'Train', hi: 'रेलगाड़ी', hiSay: 'Railgaadi', sEn: 'Chhuk chhuk!', sHi: 'छुक छुक!', sSay: 'Chhuk chhuk!' },
  { emoji: '✈️', en: 'Aeroplane', hi: 'हवाई जहाज़', hiSay: 'Hawai jahaz', sEn: 'Whoosh!', sHi: 'सूँ!', sSay: 'Soon!' },
  { emoji: '🚲', en: 'Cycle', hi: 'साइकिल', hiSay: 'Cycle', sEn: 'Ting ting!', sHi: 'टिंग टिंग!', sSay: 'Ting ting!' },
  { emoji: '🚜', en: 'Tractor', hi: 'ट्रैक्टर', hiSay: 'Tractor', sEn: 'Phat phat!', sHi: 'फट फट!', sSay: 'Phat phat!' },
  { emoji: '⛵', en: 'Boat', hi: 'नाव', hiSay: 'Naav', sEn: 'Splash!', sHi: 'छप छप!', sSay: 'Chhap chhap!' },
  { emoji: '🚑', en: 'Ambulance', hi: 'एम्बुलेंस', hiSay: 'Ambulance', sEn: 'Ooo eee!', sHi: 'ऊँ ईं!', sSay: 'Ooo eee!' },
  { emoji: '🚒', en: 'Fire engine', hi: 'दमकल', hiSay: 'Damkal', sEn: 'Ding ding!', sHi: 'डिंग डिंग!', sSay: 'Ding ding!' },
  { emoji: '🚁', en: 'Helicopter', hi: 'हेलीकॉप्टर', hiSay: 'Helicopter', sEn: 'Tak tak tak!', sHi: 'टक टक टक!', sSay: 'Tak tak tak!' },
  { emoji: '🛵', en: 'Scooter', hi: 'स्कूटर', hiSay: 'Scooter', sEn: 'Vroom vroom!', sHi: 'वूम वूम!', sSay: 'Vroom vroom!' }
];

const vehiclesGame = (() => {
  buildScreen('vehicles',
    '<div id="vehicles-grid" class="tile-grid"></div>' +
    '<button id="vehicles-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

  function render() {
    const lang = store.getLang();
    const grid = $('vehicles-grid');
    grid.innerHTML = '';
    VEHICLES.forEach((v) => {
      const b = document.createElement('button');
      b.className = 'tile vehicle-tile';
      b.dataset.v = v.en;
      b.innerHTML = '<span class="t-big">' + v.emoji + '</span><span class="t-word">' + v[lang] + '</span>';
      b.addEventListener('click', () => {
        sfx.pop();
        popIt(b);
        sayPhrase(phrase(v.en + '! ' + v.sEn, v.hi + '! ' + v.sHi, v.hiSay + '! ' + v.sSay));
      });
      grid.appendChild(b);
    });
  }

  // Half the questions ask for the name, half for the sound it makes.
  function question(i) {
    const three = sample(VEHICLES, 3);
    const ans = three[0];
    const bySound = i % 2 === 1;
    return {
      key: 'VH' + ans.en + (bySound ? 'S' : 'N'),
      prompt: bySound
        ? phrase('Who says ' + ans.sEn + '?', ans.sHi + ' कौन करती है?', ans.sSay + ' kaun karti hai?')
        : phrase('Where is the ' + ans.en.toLowerCase() + '?', ans.hi + ' कहाँ है?', ans.hiSay + ' kahan hai?'),
      extra: '',
      choices: shuffle(three).map((v) => ({ key: v.en, html: '<span>' + v.emoji + '</span>' })),
      answer: ans.en,
      answerPhrase: phrase(ans.en + '! ' + ans.sEn, ans.hi + '! ' + ans.sHi, ans.hiSay + '! ' + ans.sSay)
    };
  }

  $('vehicles-quiz').addEventListener('click', () => quiz.start({ make: question, backTo: 'screen-vehicles' }));

  return { render };
})();

GAMES.vehicles = {
  emoji: '🚌', color: 'var(--sunny)', screen: 'screen-vehicles',
  enter() { vehiclesGame.render(); }, onLang() { vehiclesGame.render(); }
};

/* ================= Zameen-Paani-Aasmaan ================= */

GAME_TITLES.whereride = { en: 'Sky, Road, Water', hi: 'ज़मीन-पानी-आसमान', hiSay: 'Zameen paani aasmaan' };

const RIDE_ZONES = [
  { key: 'sky', emoji: '☁️', en: 'Sky', hi: 'आसमान', hiSay: 'Aasmaan' },
  { key: 'road', emoji: '🛣️', en: 'Road', hi: 'ज़मीन', hiSay: 'Zameen' },
  { key: 'water', emoji: '🌊', en: 'Water', hi: 'पानी', hiSay: 'Paani' }
];

const RIDE_ITEMS = [
  { emoji: '✈️', zone: 'sky', en: 'Aeroplane', hi: 'हवाई जहाज़', hiSay: 'Hawai jahaz' },
  { emoji: '🚁', zone: 'sky', en: 'Helicopter', hi: 'हेलीकॉप्टर', hiSay: 'Helicopter' },
  { emoji: '🎈', zone: 'sky', en: 'Balloon', hi: 'गुब्बारा', hiSay: 'Gubbara' },
  { emoji: '🚌', zone: 'road', en: 'Bus', hi: 'बस', hiSay: 'Bus' },
  { emoji: '🚗', zone: 'road', en: 'Car', hi: 'गाड़ी', hiSay: 'Gaadi' },
  { emoji: '🚲', zone: 'road', en: 'Cycle', hi: 'साइकिल', hiSay: 'Cycle' },
  { emoji: '⛵', zone: 'water', en: 'Boat', hi: 'नाव', hiSay: 'Naav' },
  { emoji: '🚤', zone: 'water', en: 'Speedboat', hi: 'मोटरबोट', hiSay: 'Motorboat' },
  { emoji: '🛶', zone: 'water', en: 'Canoe', hi: 'डोंगी', hiSay: 'Dongi' }
];

const whererideGame = (() => {
  buildScreen('whereride',
    '<p class="hint" data-t="whereHint"></p>' +
    '<div id="wr-zones"></div>' +
    '<div id="wr-tray" data-placed="0"></div>');

  const state = { selected: null, placed: 0, timer: 0 };

  function start() {
    clearTimeout(state.timer);
    state.selected = null;
    state.placed = 0;
    const zones = $('wr-zones');
    zones.innerHTML = '';
    RIDE_ZONES.forEach((z) => {
      const b = document.createElement('button');
      b.className = 'wr-zone wr-' + z.key;
      b.dataset.accept = z.key;
      b.innerHTML = '<span class="wr-label">' + z.emoji + '</span><span class="wr-holds"></span>';
      b.addEventListener('click', () => drop(b, z));
      zones.appendChild(b);
    });
    const tray = $('wr-tray');
    tray.dataset.placed = '0';
    tray.innerHTML = '';
    shuffle(RIDE_ITEMS).forEach((it) => {
      const b = document.createElement('button');
      b.className = 'tile wr-item';
      b.dataset.zone = it.zone;
      b.innerHTML = '<span class="t-big">' + it.emoji + '</span>';
      b.addEventListener('click', () => {
        if (b.classList.contains('used')) return;
        sfx.pop();
        document.querySelectorAll('#wr-tray .wr-item').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        state.selected = { btn: b, item: it };
        sayPhrase(wordPhrase(it));
      });
      tray.appendChild(b);
    });
    sayPhrase(T.whereHint);
  }

  function drop(zoneEl, z) {
    const sel = state.selected;
    if (!sel) return;
    if (sel.item.zone !== z.key) {
      nope(zoneEl);
      return;
    }
    sfx.correct();
    sel.btn.classList.remove('selected');
    sel.btn.classList.add('used');
    const mini = document.createElement('span');
    mini.className = 'wr-mini';
    mini.textContent = sel.item.emoji;
    zoneEl.querySelector('.wr-holds').appendChild(mini);
    state.selected = null;
    state.placed++;
    $('wr-tray').dataset.placed = String(state.placed);
    store.addStars(1);
    starFly(zoneEl);
    sayPhrase(phrase(
      'The ' + sel.item.en.toLowerCase() + ' goes on the ' + z.en.toLowerCase() + '!',
      sel.item.hi + ' ' + z.hi + ' में चलती है!',
      sel.item.hiSay + ' ' + z.hiSay + ' mein chalti hai!'
    ));
    if (state.placed >= RIDE_ITEMS.length) {
      state.timer = later(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 1600);
    }
  }

  function stop() { clearTimeout(state.timer); }

  return { start, stop };
})();

GAMES.whereride = {
  emoji: '🛣️', color: 'var(--sky)', screen: 'screen-whereride',
  enter() { whererideGame.start(); }, onLeave() { whererideGame.stop(); }
};

/* ================= Mera Parivar ================= */

GAME_TITLES.family = { en: 'My Family', hi: 'मेरा परिवार', hiSay: 'Mera parivar' };

const FAMILY = [
  { key: 'dada', emoji: '👴', row: 0, en: 'Grandpa', hi: 'दादा', hiSay: 'Dada' },
  { key: 'dadi', emoji: '👵', row: 0, en: 'Grandma', hi: 'दादी', hiSay: 'Dadi' },
  { key: 'papa', emoji: '👨', row: 1, en: 'Papa', hi: 'पापा', hiSay: 'Papa' },
  { key: 'mummy', emoji: '👩', row: 1, en: 'Mummy', hi: 'मम्मी', hiSay: 'Mummy' },
  { key: 'chacha', emoji: '🧔', row: 1, en: 'Uncle', hi: 'चाचा', hiSay: 'Chacha' },
  { key: 'bhaiya', emoji: '👦', row: 2, en: 'Big brother', hi: 'भैया', hiSay: 'Bhaiya' },
  { key: 'didi', emoji: '👧', row: 2, en: 'Big sister', hi: 'दीदी', hiSay: 'Didi' },
  { key: 'me', emoji: '🧒', row: 2, en: 'Me', hi: 'मैं', hiSay: 'Main' }
];

const FAMILY_QA = [
  { a: 'dada', q: { en: "Who is papa's papa?", hi: 'पापा के पापा कौन हैं?', hiSay: 'Papa ke papa kaun hain?' } },
  { a: 'dadi', q: { en: "Who is papa's mummy?", hi: 'पापा की मम्मी कौन हैं?', hiSay: 'Papa ki mummy kaun hain?' } },
  { a: 'chacha', q: { en: "Who is papa's brother?", hi: 'पापा के भाई कौन हैं?', hiSay: 'Papa ke bhai kaun hain?' } },
  { a: 'bhaiya', q: { en: 'Who is the big brother?', hi: 'भैया कौन है?', hiSay: 'Bhaiya kaun hai?' } },
  { a: 'didi', q: { en: 'Who is the big sister?', hi: 'दीदी कौन है?', hiSay: 'Didi kaun hai?' } },
  { a: 'mummy', q: { en: 'Who is mummy?', hi: 'मम्मी कौन हैं?', hiSay: 'Mummy kaun hain?' } }
];

const familyGame = (() => {
  buildScreen('family',
    '<p class="hint" data-t="familyHint"></p>' +
    '<div id="family-tree"></div>' +
    '<button id="family-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

  function render() {
    const lang = store.getLang();
    const tree = $('family-tree');
    tree.innerHTML = '';
    [0, 1, 2].forEach((r) => {
      const row = document.createElement('div');
      row.className = 'fam-row';
      FAMILY.filter((f) => f.row === r).forEach((f) => {
        const b = document.createElement('button');
        b.className = 'tile fam-tile';
        b.dataset.who = f.key;
        b.innerHTML = '<span class="t-big">' + f.emoji + '</span><span class="t-word">' + f[lang] + '</span>';
        b.addEventListener('click', () => {
          sfx.pop();
          popIt(b);
          sayPhrase(phrase(f.en + '!', f.hi + '!', f.hiSay + '!'));
        });
        row.appendChild(b);
      });
      tree.appendChild(row);
    });
  }

  function question() {
    const qa = rand(FAMILY_QA);
    const ans = FAMILY.find((f) => f.key === qa.a);
    const others = sample(FAMILY.filter((f) => f.key !== ans.key), 2);
    return {
      key: 'FM' + qa.a,
      prompt: qa.q,
      extra: '',
      choices: shuffle([ans].concat(others)).map((f) => ({ key: f.key, html: '<span>' + f.emoji + '</span>' })),
      answer: ans.key,
      answerPhrase: phrase(ans.en + '!', ans.hi + '!', ans.hiSay + '!')
    };
  }

  $('family-quiz').addEventListener('click', () => quiz.start({ make: question, backTo: 'screen-family' }));

  return { render };
})();

GAMES.family = {
  emoji: '👨‍👩‍👧', color: 'var(--coral)', screen: 'screen-family',
  enter() { familyGame.render(); }, onLang() { familyGame.render(); }
};

/* ================= Kapde Pehnao ================= */

GAME_TITLES.dress = { en: 'Get Dressed', hi: 'कपड़े पहनाओ', hiSay: 'Kapde pehnao' };

const DRESS_ROUNDS = [
  {
    sky: '☀️', wEn: 'It is sunny', wHi: 'तेज़ धूप है', wSay: 'Tez dhoop hai',
    right: { emoji: '🕶️', en: 'Sunglasses', hi: 'चश्मा', hiSay: 'Chashma' },
    wrong: [{ emoji: '🧥', en: 'Coat', hi: 'कोट', hiSay: 'Coat' }, { emoji: '🧤', en: 'Gloves', hi: 'दस्ताने', hiSay: 'Dastane' }]
  },
  {
    sky: '🌧️', wEn: 'It is raining', wHi: 'बारिश हो रही है', wSay: 'Baarish ho rahi hai',
    right: { emoji: '☂️', en: 'Umbrella', hi: 'छाता', hiSay: 'Chhata' },
    wrong: [{ emoji: '🕶️', en: 'Sunglasses', hi: 'चश्मा', hiSay: 'Chashma' }, { emoji: '🩴', en: 'Slippers', hi: 'चप्पल', hiSay: 'Chappal' }]
  },
  {
    sky: '❄️', wEn: 'It is very cold', wHi: 'बहुत सर्दी है', wSay: 'Bahut sardi hai',
    right: { emoji: '🧥', en: 'Coat', hi: 'कोट', hiSay: 'Coat' },
    wrong: [{ emoji: '🩳', en: 'Shorts', hi: 'निक्कर', hiSay: 'Nikkar' }, { emoji: '🕶️', en: 'Sunglasses', hi: 'चश्मा', hiSay: 'Chashma' }]
  },
  {
    sky: '💨', wEn: 'It is windy', wHi: 'तेज़ हवा चल रही है', wSay: 'Tez hawa chal rahi hai',
    right: { emoji: '🧣', en: 'Scarf', hi: 'स्कार्फ़', hiSay: 'Scarf' },
    wrong: [{ emoji: '☂️', en: 'Umbrella', hi: 'छाता', hiSay: 'Chhata' }, { emoji: '🩴', en: 'Slippers', hi: 'चप्पल', hiSay: 'Chappal' }]
  },
  {
    sky: '🌧️', wEn: 'Puddles everywhere', wHi: 'हर जगह पानी भरा है', wSay: 'Har jagah paani bhara hai',
    right: { emoji: '🥾', en: 'Boots', hi: 'बूट', hiSay: 'Boot' },
    wrong: [{ emoji: '🧢', en: 'Cap', hi: 'टोपी', hiSay: 'Topi' }, { emoji: '🕶️', en: 'Sunglasses', hi: 'चश्मा', hiSay: 'Chashma' }]
  },
  {
    sky: '❄️', wEn: 'Your hands are cold', wHi: 'हाथ ठंडे हो रहे हैं', wSay: 'Haath thande ho rahe hain',
    right: { emoji: '🧤', en: 'Gloves', hi: 'दस्ताने', hiSay: 'Dastane' },
    wrong: [{ emoji: '🩳', en: 'Shorts', hi: 'निक्कर', hiSay: 'Nikkar' }, { emoji: '☂️', en: 'Umbrella', hi: 'छाता', hiSay: 'Chhata' }]
  }
];

const dressGame = (() => {
  buildScreen('dress',
    '<p class="hint" data-t="dressHint"></p>' +
    '<div id="dress-dots" class="dots-row"></div>' +
    '<div id="dress-scene" data-need="" data-round="0">' +
    '<div id="dress-sky"></div>' +
    '<div id="dress-kid">🧒</div>' +
    '<div id="dress-worn"></div>' +
    '</div>' +
    '<div id="dress-choices"></div>');

  const state = { rounds: [], i: 0, locked: false, timer: 0 };

  function dots() { renderDots('dress-dots', 5, state.i); }

  function newRound() {
    clearTimeout(state.timer);
    state.locked = false;
    const r = state.rounds[state.i];
    dots();
    const scene = $('dress-scene');
    scene.dataset.need = r.right.en;
    scene.dataset.round = String(state.i + 1);
    $('dress-sky').textContent = r.sky;
    const box = $('dress-choices');
    box.innerHTML = '';
    shuffle([r.right].concat(r.wrong)).forEach((item) => {
      const b = document.createElement('button');
      b.className = 'quiz-tile dress-choice';
      b.dataset.item = item.en;
      b.innerHTML = '<span>' + item.emoji + '</span>';
      b.addEventListener('click', () => choose(b, item, r));
      box.appendChild(b);
    });
    sayPhrase(phrase(r.wEn + ' — what will you wear?', r.wHi + ' — क्या पहनोगे?', r.wSay + ' — kya pehnoge?'));
  }

  function choose(btn, item, r) {
    if (state.locked) return;
    if (item.en !== r.right.en) {
      nope(btn, true);
      return;
    }
    state.locked = true;
    sfx.correct();
    const worn = document.createElement('span');
    worn.className = 'dress-item';
    worn.textContent = item.emoji;
    $('dress-worn').appendChild(worn);
    popIt($('dress-kid'));
    store.addStars(1);
    starFly(btn);
    confetti(10);
    sayPhrase(joinPhrase(rand(PRAISE), phrase(
      item.en + ' for ' + r.wEn.toLowerCase() + '!',
      r.wHi + ' — ' + item.hi + '!',
      r.wSay + ' — ' + item.hiSay + '!'
    )));
    state.i++;
    dots();
    state.timer = later(() => {
      if (state.i >= 5) celebrate({ again: () => { hideCelebrate(); start(); } });
      else newRound();
    }, 2000);
  }

  function start() {
    state.rounds = sample(DRESS_ROUNDS, 5);
    state.i = 0;
    $('dress-worn').innerHTML = '';
    newRound();
  }
  function stop() { clearTimeout(state.timer); }

  return { start, stop };
})();

GAMES.dress = {
  emoji: '🧥', color: 'var(--lilac)', screen: 'screen-dress',
  enter() { dressGame.start(); }, onLeave() { dressGame.stop(); }
};

/* ================= Sahi Jagah Rakho ================= */

GAME_TITLES.tidy = { en: 'Tidy Up', hi: 'सही जगह रखो', hiSay: 'Sahi jagah rakho' };

const TIDY_BINS = [
  { key: 'laundry', emoji: '🧺', en: 'Laundry basket', hi: 'कपड़ों की टोकरी', hiSay: 'Kapdon ki tokri' },
  { key: 'toys', emoji: '🧸', en: 'Toy box', hi: 'खिलौनों का डिब्बा', hiSay: 'Khilaunon ka dibba' },
  { key: 'shelf', emoji: '📚', en: 'Book shelf', hi: 'किताबों की शेल्फ़', hiSay: 'Kitabon ki shelf' },
  { key: 'bin', emoji: '🗑️', en: 'Dustbin', hi: 'कूड़ेदान', hiSay: 'Koodedan' }
];

const TIDY_THINGS = [
  { emoji: '👕', bin: 'laundry', en: 'Shirt', hi: 'कमीज़', hiSay: 'Kameez' },
  { emoji: '🧦', bin: 'laundry', en: 'Socks', hi: 'मोज़े', hiSay: 'Moze' },
  { emoji: '👖', bin: 'laundry', en: 'Pants', hi: 'पैंट', hiSay: 'Pant' },
  { emoji: '🪀', bin: 'toys', en: 'Yoyo', hi: 'लट्टू', hiSay: 'Lattu' },
  { emoji: '⚽', bin: 'toys', en: 'Ball', hi: 'गेंद', hiSay: 'Gend' },
  { emoji: '🧩', bin: 'toys', en: 'Puzzle', hi: 'पज़ल', hiSay: 'Puzzle' },
  { emoji: '📕', bin: 'shelf', en: 'Book', hi: 'किताब', hiSay: 'Kitab' },
  { emoji: '📓', bin: 'shelf', en: 'Notebook', hi: 'कॉपी', hiSay: 'Copy' },
  { emoji: '🍬', bin: 'bin', en: 'Wrapper', hi: 'रैपर', hiSay: 'Wrapper' },
  { emoji: '🥤', bin: 'bin', en: 'Empty cup', hi: 'खाली गिलास', hiSay: 'Khali glass' }
];

const tidyGame = (() => {
  buildScreen('tidy',
    '<p class="hint" data-t="tidyHint"></p>' +
    '<div id="tidy-room" data-left="0"></div>' +
    '<div id="tidy-bins"></div>');

  const state = { selected: null, left: 0, timer: 0 };

  function start() {
    clearTimeout(state.timer);
    state.selected = null;
    state.left = TIDY_THINGS.length;
    const room = $('tidy-room');
    room.dataset.left = String(state.left);
    room.innerHTML = '';
    shuffle(TIDY_THINGS).forEach((it, i) => {
      const b = document.createElement('button');
      b.className = 'tidy-thing';
      b.dataset.bin = it.bin;
      b.textContent = it.emoji;
      // Messy-looking, but on a jittered grid so nothing ever hides another thing.
      const col = i % 5;
      const row = Math.floor(i / 5);
      b.style.left = (5 + col * 18 + Math.random() * 5) + '%';
      b.style.top = (10 + row * 40 + Math.random() * 12) + '%';
      b.addEventListener('click', () => {
        if (b.classList.contains('gone')) return;
        sfx.pop();
        room.querySelectorAll('.tidy-thing').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        state.selected = { btn: b, item: it };
        sayPhrase(wordPhrase(it));
      });
      room.appendChild(b);
    });
    const bins = $('tidy-bins');
    bins.innerHTML = '';
    TIDY_BINS.forEach((bn) => {
      const b = document.createElement('button');
      b.className = 'tidy-bin';
      b.dataset.accept = bn.key;
      b.innerHTML = '<span class="t-big">' + bn.emoji + '</span>';
      b.addEventListener('click', () => drop(b, bn));
      bins.appendChild(b);
    });
    sayPhrase(T.tidyHint);
  }

  function drop(binEl, bn) {
    const sel = state.selected;
    if (!sel) return;
    if (sel.item.bin !== bn.key) {
      nope(binEl);
      return;
    }
    sfx.correct();
    sel.btn.classList.remove('selected');
    sel.btn.classList.add('gone');
    popIt(binEl);
    state.selected = null;
    state.left--;
    $('tidy-room').dataset.left = String(state.left);
    store.addStars(1);
    starFly(binEl);
    sayPhrase(phrase(
      sel.item.en + ' in the ' + bn.en.toLowerCase() + '!',
      sel.item.hi + ' — ' + bn.hi + ' में!',
      sel.item.hiSay + ' — ' + bn.hiSay + ' mein!'
    ));
    if (state.left <= 0) {
      sayPhrase(T.tidyDone);
      state.timer = later(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 1600);
    }
  }

  function stop() { clearTimeout(state.timer); }

  return { start, stop };
})();

GAMES.tidy = {
  emoji: '🧺', color: 'var(--mint)', screen: 'screen-tidy',
  enter() { tidyGame.start(); }, onLeave() { tidyGame.stop(); }
};

/* ================= Tyohaar ================= */

GAME_TITLES.festivals = { en: 'Festivals', hi: 'त्योहार', hiSay: 'Tyohaar' };

const FESTIVALS = [
  { emoji: '🪔', en: 'Diwali', hi: 'दिवाली', hiSay: 'Diwali', item: { emoji: '🧨', en: 'firecracker', hi: 'पटाखा', hiSay: 'patakha' } },
  { emoji: '🎨', en: 'Holi', hi: 'होली', hiSay: 'Holi', item: { emoji: '💦', en: 'water gun', hi: 'पिचकारी', hiSay: 'pichkari' } },
  { emoji: '🕌', en: 'Eid', hi: 'ईद', hiSay: 'Eid', item: { emoji: '🌙', en: 'moon', hi: 'चाँद', hiSay: 'chaand' } },
  { emoji: '🧵', en: 'Raksha Bandhan', hi: 'रक्षाबंधन', hiSay: 'Raksha bandhan', item: { emoji: '🎀', en: 'rakhi', hi: 'राखी', hiSay: 'rakhi' } },
  { emoji: '🎄', en: 'Christmas', hi: 'क्रिसमस', hiSay: 'Christmas', item: { emoji: '🎅', en: 'Santa', hi: 'सांता', hiSay: 'Santa' } },
  { emoji: '🍚', en: 'Pongal', hi: 'पोंगल', hiSay: 'Pongal', item: { emoji: '🌾', en: 'crop', hi: 'फ़सल', hiSay: 'fasal' } }
];

const festivalsGame = (() => {
  buildScreen('festivals',
    '<p class="hint" data-t="festHint"></p>' +
    '<div id="fest-grid" class="tile-grid"></div>' +
    '<button id="fest-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

  function render() {
    const lang = store.getLang();
    const grid = $('fest-grid');
    grid.innerHTML = '';
    FESTIVALS.forEach((f) => {
      const b = document.createElement('button');
      b.className = 'tile fest-tile';
      b.dataset.f = f.en;
      b.innerHTML = '<span class="t-big">' + f.emoji + '</span><span class="t-word">' + f[lang] + '</span>';
      b.addEventListener('click', () => {
        sfx.pop();
        popIt(b);
        sayPhrase(phrase(
          f.en + '! We use a ' + f.item.en + '!',
          f.hi + '! इसमें ' + f.item.hi + ' होती है!',
          f.hiSay + '! Isme ' + f.item.hiSay + ' hoti hai!'
        ));
      });
      grid.appendChild(b);
    });
  }

  function question() {
    const three = sample(FESTIVALS, 3);
    const ans = three[0];
    return {
      key: 'FS' + ans.en,
      prompt: phrase(
        'Which festival is the ' + ans.item.en + ' for?',
        ans.item.hi + ' किस त्योहार की है?',
        ans.item.hiSay + ' kis tyohaar ki hai?'
      ),
      extra: '<div class="fest-item">' + ans.item.emoji + '</div>',
      choices: shuffle(three).map((f) => ({ key: f.en, html: '<span>' + f.emoji + '</span>' })),
      answer: ans.en,
      answerPhrase: phrase(ans.en + '!', ans.hi + '!', ans.hiSay + '!')
    };
  }

  $('fest-quiz').addEventListener('click', () => quiz.start({ make: question, backTo: 'screen-festivals' }));

  return { render };
})();

GAMES.festivals = {
  emoji: '🪔', color: 'var(--tangerine)', screen: 'screen-festivals',
  enter() { festivalsGame.render(); }, onLang() { festivalsGame.render(); }
};
