'use strict';
/* ================================================================
   games-more.js — Desi Pack (Sikke, Mera Bharat, Madadgaar) and
   Bhasha Pack (Ulta-Pulta, Suno aur Karo, Zyada ya Kam, Kahaniyan).
   ================================================================ */

Object.assign(T, {
  coinsHint: { en: 'Tap a coin and listen!', hi: 'सिक्का दबाओ और सुनो!' },
  oppHint: { en: 'Find the opposite!', hi: 'उल्टा ढूँढो!' },
  listenHint: { en: 'Listen and tap the right body part!', hi: 'सुनो और सही अंग दबाओ!' },
  cmpHint: { en: 'Count both sides and answer!', hi: 'दोनों तरफ गिनो और बताओ!' },
  cmpMore: { en: 'Which has MORE?', hi: 'किसमें ज़्यादा है?', hiSay: 'Kismein zyada hai?' },
  cmpLess: { en: 'Which has LESS?', hi: 'किसमें कम है?', hiSay: 'Kismein kam hai?' },
  storyQBtn: { en: '❓ Question!', hi: '❓ सवाल!' }
});

/* ================= Sikke (₹ coins) ================= */

const COINS = [
  { v: 1, en: 'One rupee', hi: 'एक रुपया', hiSay: 'Ek rupaya' },
  { v: 2, en: 'Two rupees', hi: 'दो रुपये', hiSay: 'Do rupaye' },
  { v: 5, en: 'Five rupees', hi: 'पाँच रुपये', hiSay: 'Paanch rupaye' },
  { v: 10, en: 'Ten rupees', hi: 'दस रुपये', hiSay: 'Das rupaye' }
];
GAME_TITLES.coins = { en: 'Sikke ₹', hi: 'सिक्के ₹', hiSay: 'Sikke' };

const coinHtml = (v) => '<span class="coin coin-' + v + '">₹' + v + '</span>';

buildScreen('coins',
  '<p class="hint" data-t="coinsHint"></p>' +
  '<div id="coins-row"></div>' +
  '<button id="coins-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

function coinsRender() {
  const row = $('coins-row');
  if (row.children.length) return;
  COINS.forEach((c) => {
    const b = document.createElement('button');
    b.className = 'coin-tile';
    b.innerHTML = coinHtml(c.v);
    b.addEventListener('click', () => {
      sfx.pop();
      popIt(b);
      sayPhrase(phrase('₹' + c.v + '! ' + c.en + '!', '₹' + c.v + '! ' + c.hi + '!', '₹' + c.v + '! ' + c.hiSay + '!'));
    });
    row.appendChild(b);
  });
}

function coinQuestion() {
  if (Math.random() < 0.5) {
    const three = sample(COINS, 3);
    const ans = three[0];
    return {
      key: 'CF' + ans.v,
      prompt: phrase('Find ₹' + ans.v + '!', '₹' + ans.v + ' ढूँढो!', ans.v + ' rupaye dhoondho!'),
      extra: '',
      choices: shuffle(three).map((c) => ({ key: String(c.v), html: coinHtml(c.v) })),
      answer: String(ans.v),
      answerPhrase: phrase('₹' + ans.v + '! ' + ans.en + '!', '₹' + ans.v + '! ' + ans.hi + '!', '₹' + ans.v + '! ' + ans.hiSay + '!')
    };
  }
  const a = rand([1, 2, 5]);
  const b = rand([1, 2, a === 5 ? 5 : 2]);
  const sum = a + b;
  const opts = [sum];
  [sum - 1, sum + 1, sum + 2, sum - 2].forEach((c) => {
    if (opts.length < 3 && c > 0 && c <= 12 && !opts.includes(c)) opts.push(c);
  });
  return {
    key: 'CA' + a + '_' + b,
    prompt: phrase('₹' + a + ' plus ₹' + b + ' — how many rupees?', '₹' + a + ' और ₹' + b + ' — कितने रुपये?', a + ' aur ' + b + ' — kitne rupaye?'),
    extra: '<div class="coin-eq">' + coinHtml(a) + ' <b>+</b> ' + coinHtml(b) + '</div>',
    choices: shuffle(opts).map((n) => ({ key: String(n), html: '<span>₹' + n + '</span>' })),
    answer: String(sum),
    answerPhrase: phrase('₹' + sum + '! ' + sum + ' rupees!', '₹' + sum + '! ' + HINDI_100[sum - 1] + ' रुपये!', sum + '! ' + HINDI_100_SAY[sum - 1] + ' rupaye!')
  };
}

$('coins-quiz').addEventListener('click', () => quiz.start({ make: coinQuestion, backTo: 'screen-coins' }));
GAMES.coins = { emoji: '💰', color: 'var(--sunny)', screen: 'screen-coins', enter() { coinsRender(); } };

/* ================= Mera Bharat ================= */

makeVocabPack('bharat', {
  emoji: '🇮🇳', color: 'var(--coral)',
  groups: [{
    key: 'all',
    items: [
      { emoji: '🇮🇳', en: 'Tiranga', hi: 'तिरंगा', hiSay: 'Tiranga' },
      { emoji: '🦚', en: 'Peacock', hi: 'मोर', hiSay: 'Mor' },
      { emoji: '🐅', en: 'Tiger', hi: 'बाघ', hiSay: 'Baagh' },
      { emoji: '🪷', en: 'Lotus', hi: 'कमल', hiSay: 'Kamal' },
      { emoji: '🥭', en: 'Mango', hi: 'आम', hiSay: 'Aam' },
      { emoji: '🏏', en: 'Cricket', hi: 'क्रिकेट', hiSay: 'Cricket' },
      { emoji: '🪔', en: 'Diya', hi: 'दीया', hiSay: 'Diya' },
      { emoji: '🙏', en: 'Namaste', hi: 'नमस्ते', hiSay: 'Namaste' },
      { emoji: '🫓', en: 'Roti', hi: 'रोटी', hiSay: 'Roti' },
      { emoji: '🛕', en: 'Mandir', hi: 'मंदिर', hiSay: 'Mandir' }
    ]
  }]
});
GAME_TITLES.bharat = { en: 'Mera Bharat', hi: 'मेरा भारत', hiSay: 'Mera Bharat' };

/* ================= Madadgaar (community helpers) ================= */

const HELPERS = [
  { emoji: '👨‍⚕️', en: 'Doctor', hi: 'डॉक्टर', hiSay: 'Doctor' },
  { emoji: '👮', en: 'Police', hi: 'पुलिस', hiSay: 'Police' },
  { emoji: '🧑‍🏫', en: 'Teacher', hi: 'टीचर', hiSay: 'Teacher' },
  { emoji: '🧑‍🚒', en: 'Fireman', hi: 'फायरमैन', hiSay: 'Fireman' },
  { emoji: '🧑‍🌾', en: 'Farmer', hi: 'किसान', hiSay: 'Kisaan' },
  { emoji: '🧑‍🍳', en: 'Cook', hi: 'रसोइया', hiSay: 'Rasoiya' },
  { emoji: '🧑‍🔧', en: 'Mechanic', hi: 'मिस्त्री', hiSay: 'Mistri' },
  { emoji: '🧑‍✈️', en: 'Pilot', hi: 'पायलट', hiSay: 'Pilot' }
];
const SITUATIONS = [
  { a: 'Doctor', q: { en: 'Who helps when you are sick?', hi: 'बीमार होने पर कौन मदद करता है?', hiSay: 'Bimaar hone par kaun madad karta hai?' } },
  { a: 'Fireman', q: { en: 'Who puts out the fire?', hi: 'आग कौन बुझाता है?', hiSay: 'Aag kaun bujhata hai?' } },
  { a: 'Teacher', q: { en: 'Who teaches you at school?', hi: 'स्कूल में कौन पढ़ाता है?', hiSay: 'School mein kaun padhata hai?' } },
  { a: 'Police', q: { en: 'Who catches the thief?', hi: 'चोर को कौन पकड़ता है?', hiSay: 'Chor ko kaun pakadta hai?' } },
  { a: 'Cook', q: { en: 'Who cooks tasty food?', hi: 'खाना कौन बनाता है?', hiSay: 'Khana kaun banata hai?' } },
  { a: 'Farmer', q: { en: 'Who grows food in the fields?', hi: 'खेत में अनाज कौन उगाता है?', hiSay: 'Khet mein anaaj kaun ugata hai?' } },
  { a: 'Mechanic', q: { en: 'Who fixes a broken car?', hi: 'खराब गाड़ी कौन ठीक करता है?', hiSay: 'Kharab gaadi kaun theek karta hai?' } },
  { a: 'Pilot', q: { en: 'Who flies the aeroplane?', hi: 'हवाई जहाज कौन उड़ाता है?', hiSay: 'Hawai jahaz kaun udata hai?' } }
];
GAME_TITLES.helpers = { en: 'Madadgaar', hi: 'मददगार', hiSay: 'Madadgaar' };

buildScreen('helpers',
  '<div id="helpers-grid" class="tile-grid"></div>' +
  '<button id="helpers-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

function helpersRender() {
  const grid = $('helpers-grid');
  grid.innerHTML = '';
  HELPERS.forEach((h) => {
    const b = document.createElement('button');
    b.className = 'tile animal-tile';
    b.innerHTML = '<span class="t-big">' + h.emoji + '</span><span class="t-word">' + h[store.getLang()] + '</span>';
    b.addEventListener('click', () => { sfx.pop(); popIt(b); sayPhrase(wordPhrase(h)); });
    grid.appendChild(b);
  });
}

function helperQuestion() {
  const sit = rand(SITUATIONS);
  const ans = HELPERS.find((h) => h.en === sit.a);
  const others = sample(HELPERS.filter((h) => h.en !== sit.a), 2);
  return {
    key: 'H' + sit.a,
    prompt: sit.q,
    extra: '',
    choices: shuffle([ans].concat(others)).map((h) => ({ key: h.en, html: '<span>' + h.emoji + '</span>' })),
    answer: ans.en,
    answerPhrase: wordPhrase(ans)
  };
}

$('helpers-quiz').addEventListener('click', () => quiz.start({ make: helperQuestion, backTo: 'screen-helpers' }));
GAMES.helpers = { emoji: '🧑‍🚒', color: 'var(--mint)', screen: 'screen-helpers', enter() { helpersRender(); }, onLang() { helpersRender(); } };

/* ================= Ulta-Pulta (opposites) ================= */

const OPPOSITES = [
  { a: { emoji: '🐘', en: 'Big', hi: 'बड़ा', hiSay: 'Bada' }, b: { emoji: '🐜', en: 'Small', hi: 'छोटा', hiSay: 'Chhota' } },
  { a: { emoji: '🔥', en: 'Hot', hi: 'गरम', hiSay: 'Garam' }, b: { emoji: '❄️', en: 'Cold', hi: 'ठंडा', hiSay: 'Thanda' } },
  { a: { emoji: '☀️', en: 'Day', hi: 'दिन', hiSay: 'Din' }, b: { emoji: '🌙', en: 'Night', hi: 'रात', hiSay: 'Raat' } },
  { a: { emoji: '😃', en: 'Happy', hi: 'खुश', hiSay: 'Khush' }, b: { emoji: '😢', en: 'Sad', hi: 'उदास', hiSay: 'Udaas' } },
  { a: { emoji: '🐇', en: 'Fast', hi: 'तेज़', hiSay: 'Tez' }, b: { emoji: '🐢', en: 'Slow', hi: 'धीमा', hiSay: 'Dheema' } },
  { a: { emoji: '☝️', en: 'Up', hi: 'ऊपर', hiSay: 'Oopar' }, b: { emoji: '👇', en: 'Down', hi: 'नीचे', hiSay: 'Neeche' } },
  { a: { emoji: '🔓', en: 'Open', hi: 'खुला', hiSay: 'Khula' }, b: { emoji: '🔒', en: 'Closed', hi: 'बंद', hiSay: 'Band' } },
  { a: { emoji: '⬛', en: 'Black', hi: 'काला', hiSay: 'Kaala' }, b: { emoji: '⬜', en: 'White', hi: 'सफेद', hiSay: 'Safed' } }
];
GAME_TITLES.opposites = { en: 'Ulta-Pulta', hi: 'उल्टा-पुल्टा', hiSay: 'Ulta pulta' };

buildScreen('opposites',
  '<div class="intro-emoji">🐘🐜</div>' +
  '<p class="hint" data-t="oppHint"></p>' +
  '<button id="opposites-start" class="big-btn" data-t="startBtn"></button>');

function oppositeQuestion() {
  const pair = rand(OPPOSITES);
  const flip = Math.random() < 0.5;
  const item = flip ? pair.b : pair.a;
  const ans = flip ? pair.a : pair.b;
  const others = sample(
    OPPOSITES.filter((p) => p !== pair).map((p) => (Math.random() < 0.5 ? p.a : p.b)), 2);
  return {
    key: 'U' + item.en,
    prompt: phrase(
      'What is the opposite of ' + item.en.toLowerCase() + '?',
      item.hi + ' का उल्टा क्या?',
      item.hiSay + ' ka ulta kya?'),
    extra: '<div class="opp-show">' + item.emoji + ' <b>' + item[store.getLang()] + '</b></div>',
    choices: shuffle([ans].concat(others)).map((it) => ({ key: it.en, html: '<span>' + it.emoji + '</span>' })),
    answer: ans.en,
    answerPhrase: phrase(
      ans.en + '! Opposite of ' + item.en.toLowerCase() + '!',
      ans.hi + '! ' + item.hi + ' का उल्टा ' + ans.hi + '!',
      ans.hiSay + '! ' + item.hiSay + ' ka ulta ' + ans.hiSay + '!')
  };
}

$('opposites-start').addEventListener('click', () => quiz.start({ make: oppositeQuestion, backTo: 'screen-opposites' }));
GAMES.opposites = { emoji: '↔️', color: 'var(--lilac)', screen: 'screen-opposites', enter() { } };

/* ================= Suno aur Karo (listen & touch) ================= */

GAME_TITLES.listen = { en: 'Suno aur Karo', hi: 'सुनो और करो', hiSay: 'Suno aur karo' };

buildScreen('listen',
  '<div class="intro-emoji">🙋</div>' +
  '<p class="hint" data-t="listenHint"></p>' +
  '<button id="listen-start" class="big-btn" data-t="startBtn"></button>');

function listenQuestion() {
  const six = sample(PACK_BODY, 6);
  const ans = six[0];
  return {
    key: 'L' + ans.en,
    prompt: phrase(
      'Touch your ' + ans.en.toLowerCase() + '!',
      'अपनी ' + ans.hi + ' छुओ!',
      'Apni ' + ans.hiSay + ' chhuo!'),
    extra: '',
    choices: shuffle(six).map((it) => ({ key: it.en, html: '<span>' + it.emoji + '</span>' })),
    answer: ans.en,
    answerPhrase: wordPhrase(ans)
  };
}

$('listen-start').addEventListener('click', () => quiz.start({ make: listenQuestion, backTo: 'screen-listen' }));
GAMES.listen = { emoji: '🙋', color: 'var(--coral)', screen: 'screen-listen', enter() { } };

/* ================= Zyada ya Kam? (compare) ================= */

GAME_TITLES.compare = { en: 'Zyada ya Kam?', hi: 'ज़्यादा या कम?', hiSay: 'Zyada ya kam' };

buildScreen('compare',
  '<div class="intro-emoji">⚖️</div>' +
  '<p class="hint" data-t="cmpHint"></p>' +
  '<button id="compare-start" class="big-btn" data-t="startBtn"></button>');

function cmpGroup(em, n) {
  let out = '';
  for (let i = 0; i < n; i++) out += em + (i % 3 === 2 ? '<br>' : ' ');
  return '<span class="cmp-group">' + out + '</span>';
}

function compareQuestion() {
  const a = 1 + Math.floor(Math.random() * 6);
  let b = 1 + Math.floor(Math.random() * 6);
  if (b === a) b = (a % 6) + 1;
  const em = rand(COUNT_EMOJIS);
  const more = Math.random() < 0.5;
  const winner = more ? Math.max(a, b) : Math.min(a, b);
  const key = winner === a ? 'a' : 'b';
  return {
    key: 'Z' + a + '_' + b + more,
    prompt: more ? T.cmpMore : T.cmpLess,
    extra: '',
    choices: [
      { key: 'a', html: cmpGroup(em, a) },
      { key: 'b', html: cmpGroup(em, b) }
    ],
    answer: key,
    answerPhrase: phrase(
      winner + '! ' + winner + ' is ' + (more ? 'more' : 'less') + '!',
      HINDI_100[winner - 1] + '! ' + winner + ' ' + (more ? 'ज़्यादा' : 'कम') + ' है!',
      HINDI_100_SAY[winner - 1] + '! ' + winner + ' ' + (more ? 'zyada' : 'kam') + ' hai!')
  };
}

$('compare-start').addEventListener('click', () => quiz.start({ make: compareQuestion, backTo: 'screen-compare' }));
GAMES.compare = { emoji: '⚖️', color: 'var(--sky)', screen: 'screen-compare', enter() { } };

/* ================= Chhoti Kahaniyan (little stories) ================= */

const STORIES = [
  {
    id: 'rabbit', emoji: '🐰',
    title: { en: 'The Rabbit and the Carrot', hi: 'खरगोश और गाजर' },
    lines: [
      { en: 'There was a little rabbit.', hi: 'एक छोटा खरगोश था।', hiSay: 'Ek chhota khargosh tha.' },
      { en: 'The rabbit was very hungry.', hi: 'खरगोश को बहुत भूख लगी।', hiSay: 'Khargosh ko bahut bhookh lagi.' },
      { en: 'He found a big orange carrot.', hi: 'उसे एक बड़ी गाजर मिली।', hiSay: 'Use ek badi gajar mili.' },
      { en: 'He ate it — crunch crunch!', hi: 'उसने गाजर खाई — कुरकुर!', hiSay: 'Usne gajar khai — kurkur!' },
      { en: 'Now the rabbit is happy!', hi: 'अब खरगोश खुश है!', hiSay: 'Ab khargosh khush hai!' }
    ],
    q: {
      prompt: { en: 'What did the rabbit eat?', hi: 'खरगोश ने क्या खाया?', hiSay: 'Khargosh ne kya khaya?' },
      choices: [
        { emoji: '🥕', en: 'Carrot', hi: 'गाजर', hiSay: 'Gajar' },
        { emoji: '🍎', en: 'Apple', hi: 'सेब', hiSay: 'Seb' },
        { emoji: '⚽', en: 'Ball', hi: 'गेंद', hiSay: 'Gend' }
      ],
      answer: 'Carrot'
    }
  },
  {
    id: 'dog', emoji: '🐶',
    title: { en: 'The Dog and the Ball', hi: 'कुत्ता और गेंद' },
    lines: [
      { en: 'Moti is a small dog.', hi: 'मोती एक छोटा कुत्ता है।', hiSay: 'Moti ek chhota kutta hai.' },
      { en: 'Moti found a red ball.', hi: 'मोती को लाल गेंद मिली।', hiSay: 'Moti ko laal gend mili.' },
      { en: 'He played all day — woof woof!', hi: 'वह दिन भर खेला — भौं भौं!', hiSay: 'Woh din bhar khela — bhau bhau!' },
      { en: 'Then Moti was tired.', hi: 'फिर मोती थक गया।', hiSay: 'Phir Moti thak gaya.' },
      { en: 'He slept with his ball!', hi: 'वह गेंद के साथ सो गया!', hiSay: 'Woh gend ke saath so gaya!' }
    ],
    q: {
      prompt: { en: 'What did Moti play with?', hi: 'मोती किससे खेला?', hiSay: 'Moti kisse khela?' },
      choices: [
        { emoji: '⚽', en: 'Ball', hi: 'गेंद', hiSay: 'Gend' },
        { emoji: '🪁', en: 'Kite', hi: 'पतंग', hiSay: 'Patang' },
        { emoji: '🥕', en: 'Carrot', hi: 'गाजर', hiSay: 'Gajar' }
      ],
      answer: 'Ball'
    }
  },
  {
    id: 'elephant', emoji: '🐘',
    title: { en: 'The Hot Elephant', hi: 'गरमी और हाथी' },
    lines: [
      { en: 'It was a very hot day.', hi: 'बहुत गरमी का दिन था।', hiSay: 'Bahut garmi ka din tha.' },
      { en: 'The elephant went to the river.', hi: 'हाथी नदी पर गया।', hiSay: 'Haathi nadi par gaya.' },
      { en: 'Splash splash — water everywhere!', hi: 'छपाक छपाक — पानी ही पानी!', hiSay: 'Chhapak chhapak — paani hi paani!' },
      { en: 'Now the elephant is cool.', hi: 'अब हाथी को ठंडक मिली।', hiSay: 'Ab haathi ko thandak mili.' },
      { en: 'Thank you, river!', hi: 'धन्यवाद, नदी!', hiSay: 'Dhanyavaad, nadi!' }
    ],
    q: {
      prompt: { en: 'Where did the elephant go?', hi: 'हाथी कहाँ गया?', hiSay: 'Haathi kahan gaya?' },
      choices: [
        { emoji: '🏞️', en: 'River', hi: 'नदी', hiSay: 'Nadi' },
        { emoji: '🏠', en: 'House', hi: 'घर', hiSay: 'Ghar' },
        { emoji: '🛕', en: 'Mandir', hi: 'मंदिर', hiSay: 'Mandir' }
      ],
      answer: 'River'
    }
  },
  {
    id: 'bird', emoji: '🐦',
    title: { en: 'The Little Nest', hi: 'छोटा घोंसला' },
    lines: [
      { en: 'A bird made a nest on the tree.', hi: 'चिड़िया ने पेड़ पर घोंसला बनाया।', hiSay: 'Chidiya ne ped par ghosla banaya.' },
      { en: 'She laid a little egg.', hi: 'उसने एक छोटा अंडा दिया।', hiSay: 'Usne ek chhota anda diya.' },
      { en: 'She kept it warm every day.', hi: 'वह रोज़ उसे गरम रखती।', hiSay: 'Woh roz use garam rakhti.' },
      { en: 'One day — crack crack!', hi: 'एक दिन — टक टक!', hiSay: 'Ek din — tak tak!' },
      { en: 'A baby chick came out!', hi: 'नन्हा चूज़ा बाहर आया!', hiSay: 'Nanha chooza bahar aaya!' }
    ],
    q: {
      prompt: { en: 'What came out of the egg?', hi: 'अंडे से क्या निकला?', hiSay: 'Ande se kya nikla?' },
      choices: [
        { emoji: '🐣', en: 'Chick', hi: 'चूज़ा', hiSay: 'Chooza' },
        { emoji: '🐟', en: 'Fish', hi: 'मछली', hiSay: 'Machhli' },
        { emoji: '🦋', en: 'Butterfly', hi: 'तितली', hiSay: 'Titli' }
      ],
      answer: 'Chick'
    }
  }
];
GAME_TITLES.stories = { en: 'Kahaniyan', hi: 'कहानियाँ', hiSay: 'Kahaniyan' };

const storiesGame = (() => {
  buildScreen('stories',
    '<div id="stories-list" class="rhymes-grid"></div>' +
    '<div id="story-view" data-open="" data-answered="0" hidden>' +
    '<div id="story-emoji" class="intro-emoji"></div>' +
    '<div id="story-lines"></div>' +
    '<button id="story-play" class="big-btn" data-t="playAllBtn"></button>' +
    '<button id="story-qbtn" class="big-btn alt" data-t="storyQBtn" hidden></button>' +
    '<div id="story-q" hidden><p id="story-q-text" class="hint"></p>' +
    '<div id="story-choices" data-answer=""></div></div></div>');

  const state = { open: null, timer: null, playing: false };

  function speakLine(s, i) {
    document.querySelectorAll('#story-lines .rline').forEach((el, k) => el.classList.toggle('active', k === i));
    sayPhrase(s.lines[i]);
  }

  function stopPlay() {
    state.playing = false;
    clearTimeout(state.timer);
    if ($('story-play')) $('story-play').textContent = T.playAllBtn[store.getLang()];
  }

  function playFrom(i) {
    const s = state.open;
    if (!s) return;
    if (i >= s.lines.length) {
      stopPlay();
      return;
    }
    speakLine(s, i);
    state.timer = later(() => playFrom(i + 1), s.lines[i][store.getLang()].length * 95 + 1100);
  }

  function showQuestion() {
    const s = state.open;
    $('story-qbtn').hidden = true;
    $('story-q').hidden = false;
    $('story-q-text').textContent = s.q.prompt[store.getLang()];
    const box = $('story-choices');
    box.dataset.answer = s.q.answer;
    box.innerHTML = '';
    shuffle(s.q.choices.slice()).forEach((c) => {
      const b = document.createElement('button');
      b.className = 'quiz-tile ms-choice';
      b.dataset.k = c.en;
      b.innerHTML = '<span>' + c.emoji + '</span>';
      b.addEventListener('click', () => {
        if (c.en === s.q.answer) {
          $('story-view').dataset.answered = '1';
          sfx.correct();
          store.addStars(2);
          starFly(b);
          confetti(14);
          sayPhrase(joinPhrase(rand(PRAISE), wordPhrase(c)));
          later(() => closeStory(), 2000);
        } else {
          nope(b);
        }
      });
      box.appendChild(b);
    });
    sayPhrase(s.q.prompt);
  }

  function openStory(s) {
    state.open = s;
    $('stories-list').hidden = true;
    const view = $('story-view');
    view.hidden = false;
    view.dataset.open = s.id;
    view.dataset.answered = '0';
    $('story-emoji').textContent = s.emoji;
    $('story-qbtn').hidden = false;
    $('story-q').hidden = true;
    const box = $('story-lines');
    box.innerHTML = '';
    const lang = store.getLang();
    s.lines.forEach((ln, i) => {
      const d = document.createElement('button');
      d.className = 'rline';
      d.textContent = ln[lang];
      d.addEventListener('click', () => { stopPlay(); speakLine(s, i); });
      box.appendChild(d);
    });
    sayPhrase({ en: s.title.en, hi: s.title.hi, hiSay: s.title.en });
  }

  function closeStory() {
    stopPlay();
    state.open = null;
    $('story-view').hidden = true;
    $('story-view').dataset.open = '';
    $('stories-list').hidden = false;
  }

  function render() {
    const lang = store.getLang();
    const list = $('stories-list');
    list.innerHTML = '';
    STORIES.forEach((s) => {
      const b = document.createElement('button');
      b.className = 'game-card rhyme-card';
      b.style.background = 'var(--mint)';
      b.dataset.story = s.id;
      b.innerHTML = '<span class="g-emoji">' + s.emoji + '</span><span class="g-title">' + s.title[lang] + '</span>';
      b.addEventListener('click', () => { sfx.pop(); openStory(s); });
      list.appendChild(b);
    });
  }

  $('story-play').addEventListener('click', () => {
    if (state.playing) { stopPlay(); speech.stop(); return; }
    state.playing = true;
    $('story-play').textContent = T.stopBtn[store.getLang()];
    playFrom(0);
  });
  $('story-qbtn').addEventListener('click', () => { sfx.pop(); showQuestion(); });

  return {
    enter() { closeStory(); render(); },
    onLang() { render(); if (state.open) { const s = state.open; closeStory(); openStory(s); } },
    onBack() { if (state.open) { closeStory(); return true; } return false; },
    onLeave: stopPlay
  };
})();

GAMES.stories = {
  emoji: '📖', color: 'var(--tangerine)', screen: 'screen-stories',
  enter() { storiesGame.enter(); },
  onLang() { storiesGame.onLang(); },
  onBack() { return storiesGame.onBack(); },
  onLeave() { storiesGame.onLeave(); }
};
