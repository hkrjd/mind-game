'use strict';
/* ================================================================
   games-life.js — Bazaar Pack (Dukaan, Khana Khilao, Rail Gaadi),
   Samajh Pack (Bhavna, Mausam, Baayan-Daayan, Suraksha) and
   Kram Pack (Pehle-Phir, Chhota-se-Bada, Hafte ke Din).
   ================================================================ */

Object.assign(T, {
  shopHint: { en: 'Get everything on the list, then pay!', hi: 'लिस्ट की चीज़ें लो, फिर पैसे दो!' },
  shopTooMuch: { en: 'Oh! That is too much — try again!', hi: 'अरे! ज़्यादा हो गया — फिर से!', hiSay: 'Are! Zyada ho gaya — phir se!' },
  shopThanks: { en: 'Thank you! Come again!', hi: 'धन्यवाद! फिर आना!', hiSay: 'Dhanyavaad! Phir aana!' },
  feedHint: { en: 'Listen — feed the right food!', hi: 'सुनो — सही खाना खिलाओ!' },
  feedYum: { en: 'Mmm! Thank you!', hi: 'मम्म! धन्यवाद!', hiSay: 'Mmm! Dhanyavaad!' },
  trainHint: { en: 'Tap a thing, then its wagon!', hi: 'चीज़ दबाओ, फिर उसका डिब्बा!' },
  trainGo: { en: 'Chhuk chhuk! All sorted!', hi: 'छुक छुक! सब लग गया!', hiSay: 'Chhuk chhuk! Sab lag gaya!' },
  feelHint: { en: 'Tap a face and listen!', hi: 'चेहरा दबाओ और सुनो!' },
  weatherHint: { en: 'Tap the weather and listen!', hi: 'मौसम दबाओ और सुनो!' },
  lrHint: { en: 'Listen — left or right?', hi: 'सुनो — बायाँ या दायाँ?' },
  safetyHint: { en: 'What is the safe thing to do?', hi: 'सही और सुरक्षित क्या है?' },
  orderHint: { en: 'What happens first? Put it in order!', hi: 'पहले क्या होता है? क्रम में लगाओ!' },
  sizesHint: { en: 'Small to big — tap in order!', hi: 'छोटे से बड़ा — क्रम में दबाओ!' },
  weekHint: { en: 'Tap a day and listen!', hi: 'दिन दबाओ और सुनो!' },
  weekOrderBtn: { en: '🔀 Put in order!', hi: '🔀 क्रम में लगाओ!' }
});

/* ================= Dukaan (shop) ================= */

GAME_TITLES.shop = { en: 'Dukaan', hi: 'दुकान', hiSay: 'Dukaan' };

const SHOP_ITEMS = [
  { emoji: '🍎', en: 'Apple', hi: 'सेब', hiSay: 'Seb', price: 2 },
  { emoji: '🍌', en: 'Banana', hi: 'केला', hiSay: 'Kela', price: 1 },
  { emoji: '🥭', en: 'Mango', hi: 'आम', hiSay: 'Aam', price: 2 },
  { emoji: '🍊', en: 'Orange', hi: 'संतरा', hiSay: 'Santra', price: 1 },
  { emoji: '🥕', en: 'Carrot', hi: 'गाजर', hiSay: 'Gaajar', price: 1 },
  { emoji: '🍅', en: 'Tomato', hi: 'टमाटर', hiSay: 'Tamatar', price: 1 },
  { emoji: '🥔', en: 'Potato', hi: 'आलू', hiSay: 'Aaloo', price: 1 },
  { emoji: '🍇', en: 'Grapes', hi: 'अंगूर', hiSay: 'Angoor', price: 2 }
];

const shopGame = (() => {
  buildScreen('shop',
    '<p class="hint" data-t="shopHint"></p>' +
    '<div id="shop-dots"></div>' +
    '<div id="shop-list"></div>' +
    '<div id="shop-area" data-phase="gather" data-need="" data-total="0" data-paid="0" data-round="1">' +
    '<div id="shop-shelf"></div>' +
    '<div id="shop-basket"><span class="basket-icon">🧺</span><span id="shop-basket-items"></span></div>' +
    '<div id="shop-pay" hidden>' +
    '<div id="shop-pay-line"></div>' +
    '<div id="shop-coins"></div></div></div>');

  const state = { round: 0, need: [], got: {}, total: 0, paid: 0 };

  function dots() { renderDots('shop-dots', 3, state.round); }


  function speakList() {
    const parts = state.need.map((n) => ({
      en: n.count + ' ' + n.item.en.toLowerCase() + (n.count > 1 ? 's' : ''),
      hi: n.count + ' ' + n.item.hi,
      hiSay: n.count + ' ' + n.item.hiSay
    }));
    sayPhrase(phrase(
      'Please bring ' + parts.map((p) => p.en).join(' and ') + '!',
      parts.map((p) => p.hi).join(' और ') + ' लाओ!',
      parts.map((p) => p.hiSay).join(' aur ') + ' lao!'
    ));
  }

  function updateList() {
    $('shop-list').innerHTML = state.need.map((n) => {
      const done = (state.got[n.item.en] || 0) >= n.count;
      return '<span class="shop-chip' + (done ? ' done' : '') + '">' + n.item.emoji + '×' + n.count + '</span>';
    }).join('');
  }

  function newRound() {
    const items = sample(SHOP_ITEMS, 2);
    state.need = items.map((item) => ({ item, count: 1 + Math.floor(Math.random() * 3) }));
    state.got = {};
    state.total = state.need.reduce((s, n) => s + n.item.price * n.count, 0);
    state.paid = 0;
    const area = $('shop-area');
    area.dataset.phase = 'gather';
    area.dataset.need = state.need.map((n) => n.item.en + ':' + n.count).join(',');
    area.dataset.total = String(state.total);
    area.dataset.paid = '0';
    area.dataset.round = String(state.round + 1);
    dots();
    updateList();
    $('shop-basket-items').textContent = '';
    $('shop-pay').hidden = true;
    const shelf = $('shop-shelf');
    shelf.innerHTML = '';
    shuffle(SHOP_ITEMS.slice()).forEach((item) => {
      const b = document.createElement('button');
      b.className = 'tile shop-tile';
      b.dataset.k = item.en;
      b.innerHTML = '<span class="t-big">' + item.emoji + '</span><span class="t-word">₹' + item.price + '</span>';
      b.addEventListener('click', () => take(b, item));
      shelf.appendChild(b);
    });
    speakList();
  }

  function take(b, item) {
    if ($('shop-area').dataset.phase !== 'gather') return;
    const need = state.need.find((n) => n.item.en === item.en);
    const got = state.got[item.en] || 0;
    if (need && got < need.count) {
      state.got[item.en] = got + 1;
      sfx.pop();
      popIt(b);
      $('shop-basket-items').textContent += item.emoji;
      updateList();
      if (state.need.every((n) => (state.got[n.item.en] || 0) >= n.count)) {
        startPay();
      }
    } else {
      nope(b);
    }
  }

  function payLine() {
    $('shop-pay-line').innerHTML =
      '<span class="shop-paid">₹' + state.paid + '</span> / <b>₹' + state.total + '</b>';
  }

  function startPay() {
    const area = $('shop-area');
    area.dataset.phase = 'pay';
    $('shop-pay').hidden = false;
    payLine();
    const box = $('shop-coins');
    if (!box.children.length) {
      COINS.forEach((c) => {
        const b = document.createElement('button');
        b.className = 'coin-tile shop-coin';
        b.dataset.v = String(c.v);
        b.innerHTML = coinHtml(c.v);
        b.addEventListener('click', () => pay(c.v));
        box.appendChild(b);
      });
    }
    sfx.correct();
    sayPhrase(phrase(
      'Now pay ' + state.total + ' rupees!',
      'अब ₹' + state.total + ' दो!',
      'Ab ' + state.total + ' rupaye do!'
    ));
  }

  function pay(v) {
    if ($('shop-area').dataset.phase !== 'pay') return;
    state.paid += v;
    $('shop-area').dataset.paid = String(state.paid);
    sfx.flip();
    payLine();
    if (state.paid === state.total) {
      $('shop-area').dataset.phase = 'done';
      sfx.correct();
      store.addStars(2);
      starFly($('shop-pay-line'));
      confetti(14);
      sayPhrase(T.shopThanks);
      state.round++;
      dots();
      later(() => {
        if (state.round >= 3) {
          celebrate({ again: () => { hideCelebrate(); start(); } });
        } else {
          newRound();
        }
      }, 2000);
    } else if (state.paid > state.total) {
      sfx.wrong();
      state.paid = 0;
      $('shop-area').dataset.paid = '0';
      payLine();
      sayPhrase(T.shopTooMuch);
    }
  }

  function start() {
    state.round = 0;
    newRound();
  }

  return { start };
})();

GAMES.shop = { emoji: '🛒', color: 'var(--coral)', screen: 'screen-shop', enter() { shopGame.start(); } };

/* ================= Khana Khilao (feed) ================= */

GAME_TITLES.feed = { en: 'Khana Khilao', hi: 'खाना खिलाओ', hiSay: 'Khana khilao' };

const FEED_PAIRS = [
  { animal: { emoji: '🐵', en: 'Monkey', hi: 'बंदर', hiSay: 'Bandar' }, food: { emoji: '🍌', en: 'Banana', hi: 'केला', hiSay: 'Kela' } },
  { animal: { emoji: '🐰', en: 'Rabbit', hi: 'खरगोश', hiSay: 'Khargosh' }, food: { emoji: '🥕', en: 'Carrot', hi: 'गाजर', hiSay: 'Gaajar' } },
  { animal: { emoji: '🐄', en: 'Cow', hi: 'गाय', hiSay: 'Gaay' }, food: { emoji: '🌿', en: 'Grass', hi: 'घास', hiSay: 'Ghaas' } },
  { animal: { emoji: '🐶', en: 'Dog', hi: 'कुत्ता', hiSay: 'Kutta' }, food: { emoji: '🦴', en: 'Bone', hi: 'हड्डी', hiSay: 'Haddi' } },
  { animal: { emoji: '🐱', en: 'Cat', hi: 'बिल्ली', hiSay: 'Billi' }, food: { emoji: '🥛', en: 'Milk', hi: 'दूध', hiSay: 'Doodh' } },
  { animal: { emoji: '🐘', en: 'Elephant', hi: 'हाथी', hiSay: 'Haathi' }, food: { emoji: '🍉', en: 'Watermelon', hi: 'तरबूज', hiSay: 'Tarbooj' } },
  { animal: { emoji: '🐦', en: 'Bird', hi: 'चिड़िया', hiSay: 'Chidiya' }, food: { emoji: '🪱', en: 'Worm', hi: 'कीड़ा', hiSay: 'Keeda' } },
  { animal: { emoji: '🐸', en: 'Frog', hi: 'मेंढक', hiSay: 'Mendhak' }, food: { emoji: '🪰', en: 'Fly', hi: 'मक्खी', hiSay: 'Makkhi' } }
];

const feedGame = (() => {
  buildScreen('feed',
    '<p class="hint" data-t="feedHint"></p>' +
    '<div id="feed-dots"></div>' +
    '<div id="feed-scene" data-food="" data-fed="0">' +
    '<div id="feed-bubble"></div>' +
    '<div id="feed-animal"></div></div>' +
    '<div id="feed-choices"></div>');

  const state = { round: 0, pair: null, lastAnimal: '' };

  function dots() { renderDots('feed-dots', 5, state.round); }

  function newRound() {
    let pair = rand(FEED_PAIRS);
    if (pair.animal.en === state.lastAnimal) pair = rand(FEED_PAIRS);
    state.pair = pair;
    state.lastAnimal = pair.animal.en;
    dots();
    const scene = $('feed-scene');
    scene.dataset.food = pair.food.en;
    scene.dataset.fed = '0';
    $('feed-animal').textContent = pair.animal.emoji;
    $('feed-bubble').textContent = store.getLang() === 'hi'
      ? 'मुझे ' + pair.food.hi + ' दो!'
      : 'Give me ' + pair.food.en.toLowerCase() + '!';
    const foods = shuffle([pair.food].concat(
      sample(FEED_PAIRS.filter((p) => p !== pair), 3).map((p) => p.food)));
    const box = $('feed-choices');
    box.innerHTML = '';
    foods.forEach((f) => {
      const b = document.createElement('button');
      b.className = 'quiz-tile feed-food';
      b.dataset.k = f.en;
      b.innerHTML = '<span>' + f.emoji + '</span>';
      b.addEventListener('click', () => give(b, f));
      box.appendChild(b);
    });
    sayPhrase(phrase(
      pair.animal.en + ' says: give me ' + pair.food.en.toLowerCase() + '!',
      pair.animal.hi + ' बोला: मुझे ' + pair.food.hi + ' दो!',
      pair.animal.hiSay + ' bola: mujhe ' + pair.food.hiSay + ' do!'
    ));
  }

  function give(b, f) {
    if ($('feed-scene').dataset.fed === '1') return;
    if (f.en === state.pair.food.en) {
      $('feed-scene').dataset.fed = '1';
      sfx.correct();
      store.addStars(1);
      starFly($('feed-animal'));
      $('feed-animal').textContent = '😋';
      $('feed-bubble').textContent = T.feedYum[store.getLang()];
      sayPhrase(joinPhrase(T.feedYum, wordPhrase(state.pair.animal)));
      state.round++;
      later(() => {
        if (state.round >= 5) {
          dots();
          celebrate({ again: () => { hideCelebrate(); start(); } });
        } else {
          newRound();
        }
      }, 1800);
    } else {
      nope(b);
    }
  }

  function start() {
    state.round = 0;
    newRound();
  }

  return { start };
})();

GAMES.feed = { emoji: '🍽️', color: 'var(--mint)', screen: 'screen-feed', enter() { feedGame.start(); } };

/* ================= Rail Gaadi (sorting train) ================= */

GAME_TITLES.train = { en: 'Rail Gaadi', hi: 'रेल गाड़ी', hiSay: 'Rail gaadi' };

const trainGame = (() => {
  buildScreen('train',
    '<p class="hint" data-t="trainHint"></p>' +
    '<div id="train-dots"></div>' +
    '<div id="train-track" data-sorted="0" data-round="1">' +
    '<span id="train-engine">🚂</span>' +
    '<button class="wagon" data-w="0"><span class="wagon-label"></span><span class="wagon-items"></span></button>' +
    '<button class="wagon" data-w="1"><span class="wagon-label"></span><span class="wagon-items"></span></button></div>' +
    '<div id="train-tray"></div>');

  const state = { round: 0, groups: [], items: [], selected: null, sorted: 0 };

  function roundSpec() {
    if (state.round === 0) {
      return [
        { label: '🍎', name: { en: 'fruits', hi: 'फल', hiSay: 'phal' }, items: sample(PACK_FRUITS, 4).map((it) => ({ html: '<span>' + it.emoji + '</span>', it })) },
        { label: '🐾', name: { en: 'animals', hi: 'जानवर', hiSay: 'janwar' }, items: sample(ANIMALS, 4).map((it) => ({ html: '<span>' + it.emoji + '</span>', it })) }
      ];
    }
    if (state.round === 1) {
      return [
        { label: '🥕', name: { en: 'vegetables', hi: 'सब्ज़ी', hiSay: 'sabzi' }, items: sample(PACK_VEGGIES, 4).map((it) => ({ html: '<span>' + it.emoji + '</span>', it })) },
        { label: '🪑', name: { en: 'things', hi: 'चीज़ें', hiSay: 'cheezein' }, items: sample(PACK_OBJECTS, 4).map((it) => ({ html: '<span>' + it.emoji + '</span>', it })) }
      ];
    }
    const red = COLORS[0];
    const blue = COLORS[1];
    const shapes = sample(SHAPES, 4);
    return [
      { label: '<span class="blob mini-blob" style="background:' + red.hex + '"></span>', name: { en: 'red', hi: 'लाल', hiSay: 'laal' }, items: shapes.map((s) => ({ html: shapeSVG(s.key, red.hex), it: s })) },
      { label: '<span class="blob mini-blob" style="background:' + blue.hex + '"></span>', name: { en: 'blue', hi: 'नीला', hiSay: 'neela' }, items: sample(SHAPES, 4).map((s) => ({ html: shapeSVG(s.key, blue.hex), it: s })) }
    ];
  }

  function dots() { renderDots('train-dots', 3, state.round); }

  function newRound() {
    state.groups = roundSpec();
    state.selected = null;
    state.sorted = 0;
    dots();
    const track = $('train-track');
    track.dataset.sorted = '0';
    track.dataset.round = String(state.round + 1);
    document.querySelectorAll('#train-track .wagon').forEach((w, i) => {
      w.dataset.accept = state.groups[i].name.en;
      w.querySelector('.wagon-label').innerHTML = state.groups[i].label;
      w.querySelector('.wagon-items').innerHTML = '';
      w.classList.remove('slide-off');
    });
    const tray = $('train-tray');
    tray.innerHTML = '';
    const all = [];
    state.groups.forEach((g, gi) => g.items.forEach((x) => all.push({ gi, x })));
    shuffle(all).forEach((entry) => {
      const b = document.createElement('button');
      b.className = 'tile train-item';
      b.dataset.group = state.groups[entry.gi].name.en;
      b.innerHTML = entry.x.html;
      b.addEventListener('click', () => {
        if (b.classList.contains('used')) return;
        sfx.pop();
        document.querySelectorAll('#train-tray .train-item').forEach((t) => t.classList.remove('selected'));
        b.classList.add('selected');
        state.selected = b;
      });
      tray.appendChild(b);
    });
    const g0 = state.groups[0].name;
    const g1 = state.groups[1].name;
    sayPhrase(phrase(
      'Sort them: ' + g0.en + ' and ' + g1.en + '!',
      'छाँटो: ' + g0.hi + ' और ' + g1.hi + '!',
      'Chhanto: ' + g0.hiSay + ' aur ' + g1.hiSay + '!'
    ));
  }

  function dropIn(wagon) {
    const b = state.selected;
    if (!b || b.classList.contains('used')) return;
    if (b.dataset.group === wagon.dataset.accept) {
      sfx.correct();
      b.classList.remove('selected');
      b.classList.add('used');
      wagon.querySelector('.wagon-items').innerHTML += '<span class="wagon-mini">' + b.innerHTML + '</span>';
      state.selected = null;
      state.sorted++;
      $('train-track').dataset.sorted = String(state.sorted);
      if (state.sorted >= 8) {
        store.addStars(2);
        starFly(wagon);
        confetti(12);
        sayPhrase(T.trainGo);
        document.querySelectorAll('#train-track .wagon').forEach((w) => w.classList.add('slide-off'));
        state.round++;
        dots();
        later(() => {
          if (state.round >= 3) {
            celebrate({ again: () => { hideCelebrate(); start(); } });
          } else {
            newRound();
          }
        }, 1900);
      }
    } else {
      nope(wagon);
    }
  }

  document.querySelectorAll('#train-track .wagon').forEach((w) => {
    w.addEventListener('click', () => dropIn(w));
  });

  function start() {
    state.round = 0;
    newRound();
  }

  return { start };
})();

GAMES.train = { emoji: '🚂', color: 'var(--sky)', screen: 'screen-train', enter() { trainGame.start(); } };

/* ================= Bhavna (feelings) ================= */

GAME_TITLES.feelings = { en: 'Bhavna', hi: 'भावना', hiSay: 'Bhavna' };

const FEELINGS = [
  { emoji: '😃', en: 'Happy', hi: 'खुश', hiSay: 'Khush' },
  { emoji: '😢', en: 'Sad', hi: 'उदास', hiSay: 'Udaas' },
  { emoji: '😡', en: 'Angry', hi: 'गुस्सा', hiSay: 'Gussa' },
  { emoji: '😨', en: 'Scared', hi: 'डरा हुआ', hiSay: 'Dara hua' },
  { emoji: '😴', en: 'Sleepy', hi: 'नींद', hiSay: 'Neend' },
  { emoji: '😲', en: 'Surprised', hi: 'हैरान', hiSay: 'Hairan' }
];
const FEEL_SITUATIONS = [
  { a: 'Happy', q: { en: 'You got a gift — how do you feel?', hi: 'तुम्हें गिफ्ट मिला — कैसा लगेगा?', hiSay: 'Tumhe gift mila — kaisa lagega?' } },
  { a: 'Sad', q: { en: 'Your toy broke — how do you feel?', hi: 'खिलौना टूट गया — कैसा लगेगा?', hiSay: 'Khilona toot gaya — kaisa lagega?' } },
  { a: 'Scared', q: { en: 'It is very dark — how do you feel?', hi: 'बहुत अंधेरा है — कैसा लगेगा?', hiSay: 'Bahut andhera hai — kaisa lagega?' } },
  { a: 'Sleepy', q: { en: 'It is late night — how do you feel?', hi: 'बहुत रात हो गई — कैसा लगेगा?', hiSay: 'Bahut raat ho gayi — kaisa lagega?' } },
  { a: 'Surprised', q: { en: 'You saw magic — how do you feel?', hi: 'जादू देखा — कैसा लगेगा?', hiSay: 'Jaadu dekha — kaisa lagega?' } },
  { a: 'Happy', q: { en: 'You are playing with friends!', hi: 'दोस्तों के साथ खेल रहे हो!', hiSay: 'Doston ke saath khel rahe ho!' } }
];

buildScreen('feelings',
  '<p class="hint" data-t="feelHint"></p>' +
  '<div id="feelings-grid" class="tile-grid"></div>' +
  '<button id="feelings-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

function feelingsRender() {
  const grid = $('feelings-grid');
  grid.innerHTML = '';
  FEELINGS.forEach((f) => {
    const b = document.createElement('button');
    b.className = 'tile animal-tile';
    b.innerHTML = '<span class="t-big">' + f.emoji + '</span><span class="t-word">' + f[store.getLang()] + '</span>';
    b.addEventListener('click', () => { sfx.pop(); popIt(b); sayPhrase(wordPhrase(f)); });
    grid.appendChild(b);
  });
}

function feelingsQuestion() {
  if (Math.random() < 0.5) {
    const three = sample(FEELINGS, 3);
    const ans = three[0];
    return {
      key: 'FF' + ans.en,
      prompt: phrase('Who is ' + ans.en.toLowerCase() + '?', ans.hi + ' कौन है?', ans.hiSay + ' kaun hai?'),
      extra: '',
      choices: shuffle(three).map((f) => ({ key: f.en, html: '<span>' + f.emoji + '</span>' })),
      answer: ans.en,
      answerPhrase: wordPhrase(ans)
    };
  }
  const sit = rand(FEEL_SITUATIONS);
  const ans = FEELINGS.find((f) => f.en === sit.a);
  const others = sample(FEELINGS.filter((f) => f.en !== sit.a), 2);
  return {
    key: 'FS' + sit.q.en,
    prompt: sit.q,
    extra: '',
    choices: shuffle([ans].concat(others)).map((f) => ({ key: f.en, html: '<span>' + f.emoji + '</span>' })),
    answer: ans.en,
    answerPhrase: wordPhrase(ans)
  };
}

$('feelings-quiz').addEventListener('click', () => quiz.start({ make: feelingsQuestion, backTo: 'screen-feelings' }));
GAMES.feelings = { emoji: '😊', color: 'var(--sunny)', screen: 'screen-feelings', enter() { feelingsRender(); }, onLang() { feelingsRender(); } };

/* ================= Mausam (weather) ================= */

GAME_TITLES.weather = { en: 'Mausam', hi: 'मौसम', hiSay: 'Mausam' };

const WEATHERS = [
  { emoji: '☀️', en: 'Sunny', hi: 'धूप', hiSay: 'Dhoop' },
  { emoji: '🌧️', en: 'Rainy', hi: 'बारिश', hiSay: 'Baarish' },
  { emoji: '❄️', en: 'Snowy', hi: 'बर्फ़', hiSay: 'Barf' },
  { emoji: '💨', en: 'Windy', hi: 'हवा', hiSay: 'Hawa' },
  { emoji: '☁️', en: 'Cloudy', hi: 'बादल', hiSay: 'Baadal' }
];
const WEATHER_QA = [
  {
    q: { en: 'It is raining — what will you take?', hi: 'बारिश हो रही है — क्या लोगे?', hiSay: 'Baarish ho rahi hai — kya loge?' },
    choices: [
      { emoji: '☂️', en: 'Umbrella', hi: 'छाता', hiSay: 'Chhata' },
      { emoji: '🕶️', en: 'Sunglasses', hi: 'चश्मा', hiSay: 'Chashma' },
      { emoji: '🧤', en: 'Gloves', hi: 'दस्ताने', hiSay: 'Dastane' }
    ], a: 'Umbrella'
  },
  {
    q: { en: 'The sun is very bright — what will you wear?', hi: 'धूप तेज़ है — क्या पहनोगे?', hiSay: 'Dhoop tez hai — kya pahnoge?' },
    choices: [
      { emoji: '🧢', en: 'Cap', hi: 'टोपी', hiSay: 'Topi' },
      { emoji: '🧣', en: 'Muffler', hi: 'मफलर', hiSay: 'Muffler' },
      { emoji: '☂️', en: 'Umbrella', hi: 'छाता', hiSay: 'Chhata' }
    ], a: 'Cap'
  },
  {
    q: { en: 'It is very cold — what will you wear?', hi: 'बहुत सर्दी है — क्या पहनोगे?', hiSay: 'Bahut sardi hai — kya pahnoge?' },
    choices: [
      { emoji: '🧥', en: 'Jacket', hi: 'जैकेट', hiSay: 'Jacket' },
      { emoji: '🩳', en: 'Shorts', hi: 'निक्कर', hiSay: 'Nikkar' },
      { emoji: '🕶️', en: 'Sunglasses', hi: 'चश्मा', hiSay: 'Chashma' }
    ], a: 'Jacket'
  },
  {
    q: { en: 'It is very hot — what will you drink?', hi: 'बहुत गर्मी है — क्या पियोगे?', hiSay: 'Bahut garmi hai — kya piyoge?' },
    choices: [
      { emoji: '🧃', en: 'Juice', hi: 'जूस', hiSay: 'Juice' },
      { emoji: '☕', en: 'Hot tea', hi: 'गरम चाय', hiSay: 'Garam chai' },
      { emoji: '🧤', en: 'Gloves', hi: 'दस्ताने', hiSay: 'Dastane' }
    ], a: 'Juice'
  },
  {
    q: { en: 'Snow is falling — what will you wear on your hands?', hi: 'बर्फ़ गिर रही है — हाथों में क्या पहनोगे?', hiSay: 'Barf gir rahi hai — haathon mein kya pahnoge?' },
    choices: [
      { emoji: '🧤', en: 'Gloves', hi: 'दस्ताने', hiSay: 'Dastane' },
      { emoji: '🩴', en: 'Slippers', hi: 'चप्पल', hiSay: 'Chappal' },
      { emoji: '🧢', en: 'Cap', hi: 'टोपी', hiSay: 'Topi' }
    ], a: 'Gloves'
  }
];

buildScreen('weather',
  '<p class="hint" data-t="weatherHint"></p>' +
  '<div id="weather-grid" class="tile-grid"></div>' +
  '<button id="weather-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

function weatherRender() {
  const grid = $('weather-grid');
  grid.innerHTML = '';
  WEATHERS.forEach((w) => {
    const b = document.createElement('button');
    b.className = 'tile animal-tile';
    b.innerHTML = '<span class="t-big">' + w.emoji + '</span><span class="t-word">' + w[store.getLang()] + '</span>';
    b.addEventListener('click', () => { sfx.pop(); popIt(b); sayPhrase(wordPhrase(w)); });
    grid.appendChild(b);
  });
}

function weatherQuestion() {
  const qa = rand(WEATHER_QA);
  const ans = qa.choices.find((c) => c.en === qa.a);
  return {
    key: 'W' + qa.a + qa.q.en.length,
    prompt: qa.q,
    extra: '',
    choices: shuffle(qa.choices.slice()).map((c) => ({ key: c.en, html: '<span>' + c.emoji + '</span>' })),
    answer: qa.a,
    answerPhrase: wordPhrase(ans)
  };
}

$('weather-quiz').addEventListener('click', () => quiz.start({ make: weatherQuestion, backTo: 'screen-weather' }));
GAMES.weather = { emoji: '🌦️', color: 'var(--sky)', screen: 'screen-weather', enter() { weatherRender(); }, onLang() { weatherRender(); } };

/* ================= Baayan-Daayan (left/right) ================= */

GAME_TITLES.leftright = { en: 'Left-Right', hi: 'बायाँ-दायाँ', hiSay: 'Bayan dayan' };

const leftrightGame = (() => {
  buildScreen('leftright',
    '<p class="hint" data-t="lrHint"></p>' +
    '<div id="lr-dots"></div>' +
    '<div id="lr-area" data-answer="" data-score="0">' +
    '<button class="lr-zone" data-side="left"><span class="lr-item"></span><span class="lr-tag"></span></button>' +
    '<button class="lr-zone" data-side="right"><span class="lr-item"></span><span class="lr-tag"></span></button></div>');

  const LR_ITEMS = ['✋', '🐶', '🍎', '⭐', '🎈', '🐰'];
  const state = { round: 0, answer: 'left', item: '✋' };

  function dots() { renderDots('lr-dots', 6, state.round); }

  function newRound() {
    state.answer = Math.random() < 0.5 ? 'left' : 'right';
    state.item = rand(LR_ITEMS);
    dots();
    $('lr-area').dataset.answer = state.answer;
    const lang = store.getLang();
    document.querySelectorAll('#lr-area .lr-zone').forEach((z) => {
      z.querySelector('.lr-item').textContent = state.item;
      z.querySelector('.lr-tag').textContent = z.dataset.side === 'left'
        ? (lang === 'hi' ? 'बायाँ' : 'LEFT')
        : (lang === 'hi' ? 'दायाँ' : 'RIGHT');
      z.classList.remove('lr-win');
    });
    const side = state.answer === 'left'
      ? { en: 'LEFT', hi: 'बायाँ', hiSay: 'bayan' }
      : { en: 'RIGHT', hi: 'दायाँ', hiSay: 'dayan' };
    sayPhrase(phrase(
      'Tap the ' + side.en + ' one!',
      side.hi + ' वाला दबाओ!',
      side.hiSay + ' wala dabao!'
    ));
  }

  function pick(zone) {
    if (zone.dataset.side === state.answer) {
      zone.classList.add('lr-win', 'pop');
      sfx.correct();
      store.addStars(1);
      starFly(zone);
      state.round++;
      $('lr-area').dataset.score = String(state.round);
      dots();
      sayPhrase(joinPhrase(rand(PRAISE), state.answer === 'left'
        ? phrase('Left!', 'बायाँ!', 'Bayan!')
        : phrase('Right!', 'दायाँ!', 'Dayan!')));
      later(() => {
        if (state.round >= 6) {
          celebrate({ again: () => { hideCelebrate(); start(); } });
        } else {
          newRound();
        }
      }, 1500);
    } else {
      nope(zone);
    }
  }

  document.querySelectorAll('#lr-area .lr-zone').forEach((z) => {
    z.addEventListener('click', () => pick(z));
  });

  function start() {
    state.round = 0;
    $('lr-area').dataset.score = '0';
    newRound();
  }

  return { start, onLang: newRound };
})();

GAMES.leftright = {
  emoji: '✋', color: 'var(--tangerine)', screen: 'screen-leftright',
  enter() { leftrightGame.start(); }, onLang() { leftrightGame.onLang(); }
};

/* ================= Suraksha (safety) ================= */

GAME_TITLES.safety = { en: 'Suraksha', hi: 'सुरक्षा', hiSay: 'Suraksha' };

const SAFETY_QA = [
  {
    q: { en: 'Before crossing the road, what do you look at?', hi: 'सड़क पार करने से पहले क्या देखोगे?', hiSay: 'Sadak paar karne se pehle kya dekhoge?' },
    choices: ['🚦', '📺', '🍭'], a: '🚦',
    why: { en: 'Look at the light, then cross!', hi: 'पहले बत्ती देखो, फिर पार करो!', hiSay: 'Pehle batti dekho, phir paar karo!' }
  },
  {
    q: { en: 'The pan is very hot — what will you do?', hi: 'तवा बहुत गरम है — क्या करोगे?', hiSay: 'Tawa bahut garam hai — kya karoge?' },
    choices: ['🙅', '✋', '😋'], a: '🙅',
    why: { en: 'Stay away from hot things!', hi: 'गरम चीज़ों से दूर रहो!', hiSay: 'Garam cheezon se door raho!' }
  },
  {
    q: { en: 'A stranger offers a toffee — what will you do?', hi: 'अनजान आदमी टॉफी दे — क्या करोगे?', hiSay: 'Anjaan aadmi toffee de — kya karoge?' },
    choices: ['🙅', '😋', '🤝'], a: '🙅',
    why: { en: 'Say no and tell mummy-papa!', hi: 'मना करो और मम्मी-पापा को बताओ!', hiSay: 'Mana karo aur mummy papa ko batao!' }
  },
  {
    q: { en: 'Riding a cycle — what goes on your head?', hi: 'साइकिल चलाते समय सिर पर क्या?', hiSay: 'Cycle chalate samay sir par kya?' },
    choices: ['⛑️', '🧢', '🎩'], a: '⛑️',
    why: { en: 'A helmet keeps your head safe!', hi: 'हेलमेट सिर को बचाता है!', hiSay: 'Helmet sir ko bachata hai!' }
  },
  {
    q: { en: 'Before eating, what do you do?', hi: 'खाना खाने से पहले क्या करोगे?', hiSay: 'Khana khane se pehle kya karoge?' },
    choices: ['🧼', '📺', '🎮'], a: '🧼',
    why: { en: 'Wash your hands with soap!', hi: 'साबुन से हाथ धोओ!', hiSay: 'Saabun se haath dhoo!' }
  },
  {
    q: { en: 'You see fire — whom do you call?', hi: 'आग दिखे तो किसे बुलाओगे?', hiSay: 'Aag dikhe to kise bulaoge?' },
    choices: ['🧑‍🚒', '🤡', '🐶'], a: '🧑‍🚒',
    why: { en: 'Call the firefighter and the elders!', hi: 'फायरमैन और बड़ों को बुलाओ!', hiSay: 'Fireman aur badon ko bulao!' }
  }
];

buildScreen('safety',
  '<div class="intro-emoji">🦺</div>' +
  '<p class="hint" data-t="safetyHint"></p>' +
  '<button id="safety-start" class="big-btn" data-t="startBtn"></button>');

function safetyQuestion() {
  const qa = rand(SAFETY_QA);
  return {
    key: 'SF' + qa.a + qa.q.en.length,
    prompt: qa.q,
    extra: '',
    choices: shuffle(qa.choices.slice()).map((e) => ({ key: e, html: '<span>' + e + '</span>' })),
    answer: qa.a,
    answerPhrase: qa.why
  };
}

$('safety-start').addEventListener('click', () => quiz.start({ make: safetyQuestion, backTo: 'screen-safety' }));
GAMES.safety = { emoji: '🦺', color: 'var(--coral)', screen: 'screen-safety', enter() { } };

/* ================= Pehle-Phir (sequences) ================= */

GAME_TITLES.order = { en: 'Pehle-Phir', hi: 'पहले-फिर', hiSay: 'Pehle phir' };

const LIFE_SEQUENCES = [
  {
    name: { en: 'Good Morning!', hi: 'सुप्रभात!' },
    stages: [
      { emoji: '🛌', en: 'Wake up', hi: 'उठो', hiSay: 'Utho' },
      { emoji: '🪥', en: 'Brush', hi: 'ब्रश करो', hiSay: 'Brush karo' },
      { emoji: '🛁', en: 'Bath', hi: 'नहाओ', hiSay: 'Nahao' },
      { emoji: '🏫', en: 'School', hi: 'स्कूल जाओ', hiSay: 'School jao' }
    ]
  },
  {
    name: { en: 'Good Night!', hi: 'शुभ रात्रि!' },
    stages: [
      { emoji: '🧼', en: 'Wash hands', hi: 'हाथ धोओ', hiSay: 'Haath dhoo' },
      { emoji: '🍽️', en: 'Dinner', hi: 'खाना खाओ', hiSay: 'Khana khao' },
      { emoji: '🪥', en: 'Brush', hi: 'ब्रश करो', hiSay: 'Brush karo' },
      { emoji: '🛌', en: 'Sleep', hi: 'सो जाओ', hiSay: 'So jao' }
    ]
  },
  {
    name: { en: 'Cooking Time!', hi: 'खाना बनाओ!' },
    stages: [
      { emoji: '🛒', en: 'Buy', hi: 'खरीदो', hiSay: 'Khareedo' },
      { emoji: '🍳', en: 'Cook', hi: 'पकाओ', hiSay: 'Pakao' },
      { emoji: '🍽️', en: 'Eat', hi: 'खाओ', hiSay: 'Khao' },
      { emoji: '🧽', en: 'Clean', hi: 'साफ़ करो', hiSay: 'Saaf karo' }
    ]
  },
  {
    name: { en: 'Grow a Flower!', hi: 'फूल उगाओ!' },
    stages: [
      { emoji: '🌰', en: 'Sow the seed', hi: 'बीज बोओ', hiSay: 'Beej boo' },
      { emoji: '💧', en: 'Water it', hi: 'पानी दो', hiSay: 'Paani do' },
      { emoji: '🌱', en: 'It sprouts', hi: 'अंकुर निकला', hiSay: 'Ankur nikla' },
      { emoji: '🌸', en: 'Flower!', hi: 'फूल खिला!', hiSay: 'Phool khila!' }
    ]
  }
];

const orderGame = (() => {
  buildScreen('order',
    '<p class="hint" data-t="orderHint"></p>' +
    '<div id="order-dots"></div>' +
    '<div id="order-area" data-filled="0" data-round="1"></div>');

  const state = { round: 0, filled: 0, timers: [] };

  function tmo(fn, ms) { state.timers.push(later(fn, ms)); }
  function clearTimers() { state.timers.forEach(clearTimeout); state.timers = []; }

  function dots() { renderDots('order-dots', LIFE_SEQUENCES.length, state.round); }

  function newRound() {
    const seq = LIFE_SEQUENCES[state.round];
    state.filled = 0;
    dots();
    const lang = store.getLang();
    const area = $('order-area');
    area.dataset.filled = '0';
    area.dataset.round = String(state.round + 1);
    let slots = '';
    for (let i = 0; i < 4; i++) slots += '<div class="cyc-slot"><span class="cyc-num">' + (i + 1) + '</span><span class="cyc-fill"></span></div>';
    area.innerHTML = '<h3 class="cyc-title">' + seq.name[lang] + '</h3>' +
      '<div class="cyc-row" id="order-slots">' + slots + '</div>' +
      '<div class="cyc-row" id="order-cards"></div>';
    let ord = shuffle([0, 1, 2, 3]);
    if (ord.every((v, i) => v === i)) ord = [3, 2, 1, 0];
    ord.forEach((stageIdx) => {
      const st = seq.stages[stageIdx];
      const b = document.createElement('button');
      b.className = 'cyc-card';
      b.dataset.stage = String(stageIdx);
      b.innerHTML = '<span class="t-big">' + st.emoji + '</span><span class="t-word">' + st[lang] + '</span>';
      b.addEventListener('click', () => pick(b, seq, st));
      $('order-cards').appendChild(b);
    });
  }

  function pick(b, seq, st) {
    if (b.classList.contains('used')) return;
    if (Number(b.dataset.stage) === state.filled) {
      b.classList.add('used');
      const slot = $('order-slots').children[state.filled];
      slot.querySelector('.cyc-fill').textContent = st.emoji;
      slot.classList.add('filled', 'pop');
      sfx.pop();
      sayPhrase(wordPhrase(st));
      state.filled++;
      $('order-area').dataset.filled = String(state.filled);
      if (state.filled >= 4) {
        sfx.correct();
        store.addStars(2);
        starFly(slot);
        confetti(14);
        const n = seq.stages;
        sayPhrase(phrase(
          'First ' + n[0].en.toLowerCase() + ', then ' + n[1].en.toLowerCase() + ', then ' + n[2].en.toLowerCase() + ', then ' + n[3].en.toLowerCase() + '!',
          'पहले ' + n[0].hi + ', फिर ' + n[1].hi + ', फिर ' + n[2].hi + ', फिर ' + n[3].hi + '!',
          'Pehle ' + n[0].hiSay + ', phir ' + n[1].hiSay + ', phir ' + n[2].hiSay + ', phir ' + n[3].hiSay + '!'
        ));
        state.round++;
        dots();
        tmo(() => {
          if (state.round >= LIFE_SEQUENCES.length) {
            celebrate({ again: () => { hideCelebrate(); start(); } });
          } else {
            newRound();
          }
        }, 2600);
      }
    } else {
      nope(b);
    }
  }

  function start() {
    clearTimers();
    state.round = 0;
    newRound();
  }

  return { start, stop: clearTimers };
})();

GAMES.order = { emoji: '🌅', color: 'var(--lilac)', screen: 'screen-order', enter() { orderGame.start(); }, onLeave() { orderGame.stop(); } };

/* ================= Chhota-se-Bada (sizes) ================= */

GAME_TITLES.sizes = { en: 'Chhota-se-Bada', hi: 'छोटे से बड़ा', hiSay: 'Chhote se bada' };

const sizesGame = (() => {
  buildScreen('sizes',
    '<p class="hint" data-t="sizesHint"></p>' +
    '<div id="sizes-dots"></div>' +
    '<div id="sizes-area" data-filled="0" data-round="1">' +
    '<div class="cyc-row" id="sizes-slots"></div>' +
    '<div class="cyc-row" id="sizes-cards"></div></div>');

  const SIZE_ITEMS = ['🐘', '⭐', '🌳', '🐟', '🎈', '🚗'];
  const SIZE_REMS = [1.4, 2, 2.6, 3.3];
  const state = { round: 0, filled: 0 };

  function dots() { renderDots('sizes-dots', 4, state.round); }

  function newRound() {
    const em = SIZE_ITEMS[state.round % SIZE_ITEMS.length];
    state.filled = 0;
    dots();
    const area = $('sizes-area');
    area.dataset.filled = '0';
    area.dataset.round = String(state.round + 1);
    const slots = $('sizes-slots');
    slots.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const s = document.createElement('div');
      s.className = 'cyc-slot';
      s.innerHTML = '<span class="cyc-num">' + (i === 0 ? (store.getLang() === 'hi' ? 'छोटा' : 'small') : i === 3 ? (store.getLang() === 'hi' ? 'बड़ा' : 'BIG') : '•') + '</span><span class="cyc-fill"></span>';
      slots.appendChild(s);
    }
    const cards = $('sizes-cards');
    cards.innerHTML = '';
    let ord = shuffle([0, 1, 2, 3]);
    if (ord.every((v, i) => v === i)) ord = [3, 2, 1, 0];
    ord.forEach((rank) => {
      const b = document.createElement('button');
      b.className = 'cyc-card size-card';
      b.dataset.rank = String(rank);
      b.innerHTML = '<span style="font-size:' + SIZE_REMS[rank] + 'rem">' + em + '</span>';
      b.addEventListener('click', () => pick(b, em, rank));
      cards.appendChild(b);
    });
    sayPhrase(phrase('Small to big!', 'छोटे से बड़ा लगाओ!', 'Chhote se bada lagao!'));
  }

  function pick(b, em, rank) {
    if (b.classList.contains('used')) return;
    if (rank === state.filled) {
      b.classList.add('used');
      const slot = $('sizes-slots').children[state.filled];
      slot.querySelector('.cyc-fill').innerHTML = '<span style="font-size:' + SIZE_REMS[rank] + 'rem">' + em + '</span>';
      slot.classList.add('filled', 'pop');
      sfx.pop();
      state.filled++;
      $('sizes-area').dataset.filled = String(state.filled);
      if (state.filled >= 4) {
        sfx.correct();
        store.addStars(2);
        starFly(slot);
        confetti(12);
        sayPhrase(joinPhrase(rand(PRAISE), phrase('Small to big!', 'छोटे से बड़ा!', 'Chhote se bada!')));
        state.round++;
        dots();
        later(() => {
          if (state.round >= 4) {
            celebrate({ again: () => { hideCelebrate(); start(); } });
          } else {
            newRound();
          }
        }, 1900);
      }
    } else {
      nope(b);
    }
  }

  function start() {
    state.round = 0;
    newRound();
  }

  return { start };
})();

GAMES.sizes = { emoji: '📏', color: 'var(--mint)', screen: 'screen-sizes', enter() { sizesGame.start(); } };

/* ================= Hafte ke Din (days of the week) ================= */

GAME_TITLES.week = { en: 'Hafte ke Din', hi: 'हफ़्ते के दिन', hiSay: 'Hafte ke din' };

const WEEK_DAYS = [
  { en: 'Monday', hi: 'सोमवार', hiSay: 'Somvar' },
  { en: 'Tuesday', hi: 'मंगलवार', hiSay: 'Mangalvar' },
  { en: 'Wednesday', hi: 'बुधवार', hiSay: 'Budhvar' },
  { en: 'Thursday', hi: 'गुरुवार', hiSay: 'Guruvar' },
  { en: 'Friday', hi: 'शुक्रवार', hiSay: 'Shukravar' },
  { en: 'Saturday', hi: 'शनिवार', hiSay: 'Shanivar' },
  { en: 'Sunday', hi: 'रविवार', hiSay: 'Ravivar' }
];

const weekGame = (() => {
  buildScreen('week',
    '<p class="hint" data-t="weekHint"></p>' +
    '<div id="week-learn"></div>' +
    '<div class="tables-btns">' +
    '<button id="week-play" class="big-btn" data-t="playAllBtn"></button>' +
    '<button id="week-order" class="big-btn quiz-btn" data-t="weekOrderBtn"></button></div>' +
    '<div id="week-game" data-filled="0" hidden>' +
    '<div class="cyc-row" id="week-slots"></div>' +
    '<div class="cyc-row" id="week-cards"></div></div>');

  const state = { playing: false, timer: null, filled: 0 };

  function stopPlay() {
    state.playing = false;
    clearTimeout(state.timer);
    $('week-play').textContent = T.playAllBtn[store.getLang()];
  }

  function speakDay(i) {
    document.querySelectorAll('#week-learn .week-chip').forEach((c, k) => c.classList.toggle('active', k === i));
    const d = WEEK_DAYS[i];
    sayPhrase(phrase(d.en + '!', d.hi + '!', d.hiSay + '!'));
  }

  function playFrom(i) {
    if (!state.playing || i >= 7) { stopPlay(); return; }
    speakDay(i);
    state.timer = later(() => playFrom(i + 1), 1500);
  }

  function render() {
    const lang = store.getLang();
    const learn = $('week-learn');
    learn.innerHTML = '';
    WEEK_DAYS.forEach((d, i) => {
      const b = document.createElement('button');
      b.className = 'week-chip';
      b.innerHTML = '<span class="week-num">' + (i + 1) + '</span>' + d[lang];
      b.addEventListener('click', () => { stopPlay(); sfx.pop(); speakDay(i); });
      learn.appendChild(b);
    });
  }

  function startOrder() {
    stopPlay();
    state.filled = 0;
    const game = $('week-game');
    game.hidden = false;
    game.dataset.filled = '0';
    const lang = store.getLang();
    const slots = $('week-slots');
    slots.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('div');
      s.className = 'cyc-slot week-slot';
      s.innerHTML = '<span class="cyc-num">' + (i + 1) + '</span><span class="cyc-fill"></span>';
      slots.appendChild(s);
    }
    const cards = $('week-cards');
    cards.innerHTML = '';
    let ord = shuffle([0, 1, 2, 3, 4, 5, 6]);
    if (ord.every((v, i) => v === i)) ord = ord.reverse();
    ord.forEach((di) => {
      const d = WEEK_DAYS[di];
      const b = document.createElement('button');
      b.className = 'cyc-card week-card';
      b.dataset.d = String(di);
      b.textContent = d[lang];
      b.addEventListener('click', () => pick(b, d, di));
      cards.appendChild(b);
    });
    sayPhrase(phrase('Start from Monday!', 'सोमवार से शुरू करो!', 'Somvar se shuru karo!'));
  }

  function pick(b, d, di) {
    if (b.classList.contains('used')) return;
    if (di === state.filled) {
      b.classList.add('used');
      const slot = $('week-slots').children[state.filled];
      slot.querySelector('.cyc-fill').textContent = d[store.getLang()];
      slot.classList.add('filled', 'pop');
      sfx.pop();
      sayPhrase(phrase(d.en + '!', d.hi + '!', d.hiSay + '!'));
      state.filled++;
      $('week-game').dataset.filled = String(state.filled);
      if (state.filled >= 7) {
        sfx.correct();
        store.addStars(3);
        starFly(slot);
        confetti(18);
        later(() => celebrate({ again: () => { hideCelebrate(); startOrder(); } }), 1200);
      }
    } else {
      nope(b);
    }
  }

  $('week-play').addEventListener('click', () => {
    if (state.playing) { stopPlay(); speech.stop(); return; }
    state.playing = true;
    $('week-play').textContent = T.stopBtn[store.getLang()];
    playFrom(0);
  });
  $('week-order').addEventListener('click', () => { sfx.pop(); startOrder(); });

  return {
    enter() { stopPlay(); $('week-game').hidden = true; render(); },
    onLang() { render(); if (!$('week-game').hidden) startOrder(); },
    onLeave: stopPlay
  };
})();

GAMES.week = {
  emoji: '📅', color: 'var(--coral)', screen: 'screen-week',
  enter() { weekGame.enter(); }, onLang() { weekGame.onLang(); }, onLeave() { weekGame.onLeave(); }
};
