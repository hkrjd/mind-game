'use strict';
/* ================================================================
   Khel Khel Mein Seekho — a bilingual (Hindi + English) learning
   game for little kids. Plain script, no build step, works offline.
   ================================================================ */

/* ---------------- DATA ---------------- */

// Every item carries: en (English word), hi (Devanagari, shown + spoken
// with a hi-IN voice) and hiSay (romanized fallback spoken with an
// English voice when the device has no Hindi voice installed).

const LETTERS = [
  { ch: 'A', emoji: '🍎', en: 'Apple', hi: 'सेब', hiSay: 'Seb' },
  { ch: 'B', emoji: '⚽', en: 'Ball', hi: 'गेंद', hiSay: 'Gend' },
  { ch: 'C', emoji: '🐱', en: 'Cat', hi: 'बिल्ली', hiSay: 'Billi' },
  { ch: 'D', emoji: '🐶', en: 'Dog', hi: 'कुत्ता', hiSay: 'Kutta' },
  { ch: 'E', emoji: '🐘', en: 'Elephant', hi: 'हाथी', hiSay: 'Haathi' },
  { ch: 'F', emoji: '🐟', en: 'Fish', hi: 'मछली', hiSay: 'Machhli' },
  { ch: 'G', emoji: '🍇', en: 'Grapes', hi: 'अंगूर', hiSay: 'Angoor' },
  { ch: 'H', emoji: '🏠', en: 'House', hi: 'घर', hiSay: 'Ghar' },
  { ch: 'I', emoji: '🍦', en: 'Ice cream', hi: 'आइसक्रीम', hiSay: 'Icecream' },
  { ch: 'J', emoji: '🧃', en: 'Juice', hi: 'जूस', hiSay: 'Juice' },
  { ch: 'K', emoji: '🪁', en: 'Kite', hi: 'पतंग', hiSay: 'Patang' },
  { ch: 'L', emoji: '🦁', en: 'Lion', hi: 'शेर', hiSay: 'Sher' },
  { ch: 'M', emoji: '🥭', en: 'Mango', hi: 'आम', hiSay: 'Aam' },
  { ch: 'N', emoji: '👃', en: 'Nose', hi: 'नाक', hiSay: 'Naak' },
  { ch: 'O', emoji: '🍊', en: 'Orange', hi: 'संतरा', hiSay: 'Santra' },
  { ch: 'P', emoji: '🦜', en: 'Parrot', hi: 'तोता', hiSay: 'Tota' },
  { ch: 'Q', emoji: '👸', en: 'Queen', hi: 'रानी', hiSay: 'Rani' },
  { ch: 'R', emoji: '🌈', en: 'Rainbow', hi: 'इंद्रधनुष', hiSay: 'Indradhanush' },
  { ch: 'S', emoji: '☀️', en: 'Sun', hi: 'सूरज', hiSay: 'Sooraj' },
  { ch: 'T', emoji: '🌳', en: 'Tree', hi: 'पेड़', hiSay: 'Ped' },
  { ch: 'U', emoji: '☂️', en: 'Umbrella', hi: 'छाता', hiSay: 'Chhata' },
  { ch: 'V', emoji: '🚐', en: 'Van', hi: 'वैन', hiSay: 'Van' },
  { ch: 'W', emoji: '🍉', en: 'Watermelon', hi: 'तरबूज', hiSay: 'Tarbooj' },
  { ch: 'X', emoji: '🩻', en: 'X-ray', hi: 'एक्स-रे', hiSay: 'X-ray' },
  { ch: 'Y', emoji: '🪀', en: 'Yo-yo', hi: 'यो-यो', hiSay: 'Yo-yo' },
  { ch: 'Z', emoji: '🦓', en: 'Zebra', hi: 'ज़ेब्रा', hiSay: 'Zebra' }
];

const NUMBERS = [
  { n: 1, en: 'One', hi: 'एक', hiSay: 'Ek' },
  { n: 2, en: 'Two', hi: 'दो', hiSay: 'Do' },
  { n: 3, en: 'Three', hi: 'तीन', hiSay: 'Teen' },
  { n: 4, en: 'Four', hi: 'चार', hiSay: 'Chaar' },
  { n: 5, en: 'Five', hi: 'पाँच', hiSay: 'Paanch' },
  { n: 6, en: 'Six', hi: 'छह', hiSay: 'Chhah' },
  { n: 7, en: 'Seven', hi: 'सात', hiSay: 'Saat' },
  { n: 8, en: 'Eight', hi: 'आठ', hiSay: 'Aath' },
  { n: 9, en: 'Nine', hi: 'नौ', hiSay: 'Nau' },
  { n: 10, en: 'Ten', hi: 'दस', hiSay: 'Das' }
];

const SHAPES = [
  { key: 'circle', en: 'Circle', hi: 'गोला', hiSay: 'Gola' },
  { key: 'square', en: 'Square', hi: 'चौकोर', hiSay: 'Chaukor' },
  { key: 'triangle', en: 'Triangle', hi: 'त्रिकोण', hiSay: 'Trikon' },
  { key: 'star', en: 'Star', hi: 'सितारा', hiSay: 'Sitara' },
  { key: 'heart', en: 'Heart', hi: 'दिल', hiSay: 'Dil' },
  { key: 'rectangle', en: 'Rectangle', hi: 'आयत', hiSay: 'Aayat' },
  { key: 'oval', en: 'Oval', hi: 'अंडाकार', hiSay: 'Andakaar' },
  { key: 'diamond', en: 'Diamond', hi: 'हीरा', hiSay: 'Heera' }
];

const COLORS = [
  { key: 'red', hex: '#E53935', en: 'Red', hi: 'लाल', hiSay: 'Laal' },
  { key: 'blue', hex: '#1E88E5', en: 'Blue', hi: 'नीला', hiSay: 'Neela' },
  { key: 'green', hex: '#43A047', en: 'Green', hi: 'हरा', hiSay: 'Hara' },
  { key: 'yellow', hex: '#FDD835', en: 'Yellow', hi: 'पीला', hiSay: 'Peela' },
  { key: 'orange', hex: '#FB8C00', en: 'Orange', hi: 'नारंगी', hiSay: 'Narangi' },
  { key: 'purple', hex: '#8E24AA', en: 'Purple', hi: 'बैंगनी', hiSay: 'Baingani' },
  { key: 'pink', hex: '#EC407A', en: 'Pink', hi: 'गुलाबी', hiSay: 'Gulabi' },
  { key: 'brown', hex: '#795548', en: 'Brown', hi: 'भूरा', hiSay: 'Bhoora' }
];

const ANIMALS = [
  { emoji: '🐶', en: 'Dog', hi: 'कुत्ता', hiSay: 'Kutta', soundEn: 'Woof woof!', soundHi: 'भौं भौं!', soundHiSay: 'Bhau bhau!' },
  { emoji: '🐱', en: 'Cat', hi: 'बिल्ली', hiSay: 'Billi', soundEn: 'Meow meow!', soundHi: 'म्याऊँ म्याऊँ!', soundHiSay: 'Myaun myaun!' },
  { emoji: '🐄', en: 'Cow', hi: 'गाय', hiSay: 'Gaay', soundEn: 'Moo moo!', soundHi: 'मूँ मूँ!', soundHiSay: 'Moo moo!' },
  { emoji: '🦁', en: 'Lion', hi: 'शेर', hiSay: 'Sher', soundEn: 'Roarrr!', soundHi: 'गुर्र्र!', soundHiSay: 'Grrr!' },
  { emoji: '🐘', en: 'Elephant', hi: 'हाथी', hiSay: 'Haathi', soundEn: 'Toot toot!', soundHi: 'पौं पौं!', soundHiSay: 'Pon pon!' },
  { emoji: '🐵', en: 'Monkey', hi: 'बंदर', hiSay: 'Bandar', soundEn: 'Oo oo aa aa!', soundHi: 'ऊ ऊ आ आ!', soundHiSay: 'Oo oo aa aa!' },
  { emoji: '🐴', en: 'Horse', hi: 'घोड़ा', hiSay: 'Ghoda', soundEn: 'Neigh neigh!', soundHi: 'हिन हिन!', soundHiSay: 'Hin hin!' },
  { emoji: '🦆', en: 'Duck', hi: 'बत्तख', hiSay: 'Batakh', g: 'f', soundEn: 'Quack quack!', soundHi: 'क्वैक क्वैक!', soundHiSay: 'Quack quack!' },
  { emoji: '🐑', en: 'Sheep', hi: 'भेड़', hiSay: 'Bhed', soundEn: 'Baa baa!', soundHi: 'मैं मैं!', soundHiSay: 'Main main!' },
  { emoji: '🐸', en: 'Frog', hi: 'मेंढक', hiSay: 'Mendhak', soundEn: 'Ribbit ribbit!', soundHi: 'टर्र टर्र!', soundHiSay: 'Tarr tarr!' },
  { emoji: '🐦', en: 'Bird', hi: 'चिड़िया', hiSay: 'Chidiya', soundEn: 'Tweet tweet!', soundHi: 'चूँ चूँ!', soundHiSay: 'Choon choon!' },
  { emoji: '🐍', en: 'Snake', hi: 'साँप', hiSay: 'Saanp', soundEn: 'Hisss!', soundHi: 'सस्स्स!', soundHiSay: 'Hisss!' }
];

const MEMORY_POOL = [
  { emoji: '🐶', en: 'Dog', hi: 'कुत्ता', hiSay: 'Kutta' },
  { emoji: '🐱', en: 'Cat', hi: 'बिल्ली', hiSay: 'Billi' },
  { emoji: '🦁', en: 'Lion', hi: 'शेर', hiSay: 'Sher' },
  { emoji: '🐘', en: 'Elephant', hi: 'हाथी', hiSay: 'Haathi' },
  { emoji: '🍎', en: 'Apple', hi: 'सेब', hiSay: 'Seb' },
  { emoji: '🍌', en: 'Banana', hi: 'केला', hiSay: 'Kela' },
  { emoji: '⭐', en: 'Star', hi: 'तारा', hiSay: 'Tara' },
  { emoji: '🚗', en: 'Car', hi: 'गाड़ी', hiSay: 'Gaadi' },
  { emoji: '⚽', en: 'Ball', hi: 'गेंद', hiSay: 'Gend' },
  { emoji: '🌈', en: 'Rainbow', hi: 'इंद्रधनुष', hiSay: 'Indradhanush' },
  { emoji: '🦋', en: 'Butterfly', hi: 'तितली', hiSay: 'Titli' },
  { emoji: '🐸', en: 'Frog', hi: 'मेंढक', hiSay: 'Mendhak' }
];

const COUNT_EMOJIS = ['🍎', '⭐', '🎈', '🐟', '🌸'];

const PRAISE = [
  { en: 'Great job!', hi: 'शाबाश!', hiSay: 'Shabash!' },
  { en: 'Yay! Well done!', hi: 'वाह! बहुत बढ़िया!', hiSay: 'Wah! Bahut badhiya!' },
  { en: 'Superb!', hi: 'कमाल कर दिया!', hiSay: 'Kamaal kar diya!' },
  { en: 'You did it!', hi: 'बिल्कुल सही!', hiSay: 'Bilkul sahi!' }
];

const ENCOURAGE = [
  { en: 'Almost! Try again!', hi: 'फिर से कोशिश करो!', hiSay: 'Phir se koshish karo!' },
  { en: 'Oops! One more try!', hi: 'अरे! एक बार और!', hiSay: 'Are! Ek baar aur!' }
];

const T = {
  title: { en: 'Khel Khel Mein Seekho!', hi: 'खेल खेल में सीखो!' },
  subtitle: { en: 'Tap a game and learn! 🎈', hi: 'गेम छुओ और सीखो! 🎈' },
  quizBtn: { en: '🎯 Quiz Time!', hi: '🎯 क्विज़ टाइम!' },
  again: { en: '🔁 Play Again', hi: '🔁 फिर से खेलो' },
  homeBtn: { en: '🏠 Home', hi: '🏠 घर' },
  memoryHint: { en: 'Find the pairs!', hi: 'जोड़ी ढूँढो!' },
  celebrate: { en: 'Amazing! You did it!', hi: 'कमाल! तुमने कर दिखाया!', hiSay: 'Kamaal! Tumne kar dikhaya!' },
  langName: { en: 'English!', hi: 'हिंदी!', hiSay: 'Hindi!' },
  todayGame: { en: "🎯 Today's game", hi: '🎯 आज का खेल' },
  recentGames: { en: '⏮️ Just played', hi: '⏮️ अभी खेला' },
  allGames: { en: '🗂️ All the games', hi: '🗂️ सारे खेल' },
  parentBtn: { en: '👪 Parent Corner', hi: '👪 माता-पिता कोना' },
  installBtn: { en: '📲 Install the app', hi: '📲 ऐप इंस्टॉल करो' },
  installIos: 'Safari: Share ➜ Add to Home Screen',
  langPick: { en: 'Choose a language', hi: 'भाषा चुनो' },
  breakTitle: { en: 'Time for a break!', hi: 'अब थोड़ा आराम!', hiSay: 'Ab thoda aaram!' },
  breakBody: { en: 'You have played a lot today. Rest your eyes and play again later!', hi: 'आज बहुत खेल लिया। आँखों को आराम दो, बाद में फिर खेलना!', hiSay: 'Aaj bahut khel liya. Aankhon ko aaram do, baad mein phir khelna!' },
  noHindiVoice: 'Hindi voice not found on this device — using English voice. इस डिवाइस पर हिंदी आवाज़ नहीं मिली।'
};

const GAME_TITLES = {
  abc: { en: 'ABC & Counting', hi: 'ABC और गिनती', hiSay: 'ABC aur ginti' },
  shapes: { en: 'Shapes & Colors', hi: 'आकार और रंग', hiSay: 'Aakaar aur rang' },
  memory: { en: 'Memory Match', hi: 'मेमोरी मैच', hiSay: 'Memory match' },
  animals: { en: 'Animals & Sounds', hi: 'जानवर और आवाज़ें', hiSay: 'Jaanwar aur aawazein' }
};

/* ---------------- Small utilities ---------------- */

const $ = (id) => document.getElementById(id);

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
const sample = (arr, n) => shuffle(arr).slice(0, n);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const phrase = (en, hi, hiSay) => ({ en, hi, hiSay: hiSay || en });
const joinPhrase = (a, b) => ({
  en: a.en + ' ' + b.en,
  hi: a.hi + ' ' + b.hi,
  hiSay: (a.hiSay || a.en) + ' ' + (b.hiSay || b.en)
});
const wordPhrase = (item) => phrase(item.en + '!', item.hi + '!', item.hiSay + '!');

/* Hindi verbs and possessives agree with the noun, so data items carry
   g: 'f' (feminine), 'p' (plural) or nothing (masculine). Sentences are
   built through these instead of hard-coding one gender. */
const hiG = (item) => (item && item.g) || 'm';
// "रहता है" / "रहती है"
const hiVerb = (item, masc, fem) => (hiG(item) === 'f' ? fem : masc);
// "अपना हाथ" / "अपनी नाक" / "अपने दाँत"
const hiApna = (item) => (hiG(item) === 'f' ? 'अपनी' : hiG(item) === 'p' ? 'अपने' : 'अपना');

let REDUCED = false;
try {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  REDUCED = mq.matches;
  // An installed app is rarely restarted, so follow the setting live.
  const onChange = (e) => { REDUCED = e.matches; };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
} catch (e) { /* ignore */ }

/* ---------------- Persistence (never crashes) ---------------- */

// Three difficulty levels, set by a grown-up in the Parent Corner. Games ask
// for their own numbers through lvl(): easy / normal / hard.
const LEVELS = ['easy', 'normal', 'hard'];

function lvl(easy, normal, hard) {
  const i = LEVELS.indexOf(store.getLevel());
  return [easy, normal, hard][i < 0 ? 1 : i];
}

// 'YYYY-MM-DD' in the device's own timezone — used for streaks and daily time.
function dayKey(d) {
  const x = d || new Date();
  const p2 = (n) => (n < 10 ? '0' : '') + n;
  return x.getFullYear() + '-' + p2(x.getMonth() + 1) + '-' + p2(x.getDate());
}

const store = (() => {
  const mem = {};
  function get(k, d) {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) return v;
    } catch (e) { /* private mode / blocked */ }
    return (k in mem) ? mem[k] : d;
  }
  function set(k, v) {
    mem[k] = v;
    try { localStorage.setItem(k, v); } catch (e) { /* ignore */ }
  }
  return {
    getStars() { return parseInt(get('mg-stars', '0'), 10) || 0; },
    addStars(n) {
      const before = this.getStars();
      set('mg-stars', String(before + n));
      updateStarCount();
      // Sticker book: a new sticker unlocks every STICKER_STEP stars.
      try {
        if (typeof STICKER_STEP !== 'undefined' &&
          Math.floor((before + n) / STICKER_STEP) > Math.floor(before / STICKER_STEP)) {
          onStickerUnlock(Math.floor((before + n) / STICKER_STEP));
        }
      } catch (e) { /* ignore */ }
    },
    getLang() { return get('mg-lang', 'en') === 'hi' ? 'hi' : 'en'; },
    setLang(l) { set('mg-lang', l); },
    getMute() { return get('mg-mute', '0') === '1'; },
    setMute(m) { set('mg-mute', m ? '1' : '0'); },
    getRate() {
      const r = parseFloat(get('mg-rate', '0.85'));
      return (r >= 0.5 && r <= 1.4) ? r : 0.85;
    },
    setRate(r) { set('mg-rate', String(r)); },
    pref(k) { return get(k, ''); },
    setPref(k, v) { set(k, v); },

    // ---- What has been played, when, and for how long (for the parent) ----
    langChosen() { return get('mg-lang', '') !== ''; },
    resetStars() { set('mg-stars', '0'); updateStarCount(); },
    json(k) {
      try { return JSON.parse(get(k, '{}')) || {}; } catch (e) { return {}; }
    },
    plays() { return this.json('mg-plays'); },
    notePlay(id) {
      const p = this.plays();
      const e = p[id] || { n: 0, t: 0 };
      e.n++;
      e.t = Date.now();
      p[id] = e;
      set('mg-plays', JSON.stringify(p));
    },
    recent(k) {
      const p = this.plays();
      return Object.keys(p).sort((a, b) => (p[b].t || 0) - (p[a].t || 0)).slice(0, k || 6);
    },
    times() { return this.json('mg-time'); },
    addSeconds(s) {
      if (!(s > 0)) return;
      const t = this.times();
      const d = dayKey();
      t[d] = (t[d] || 0) + s;
      const keep = {};
      Object.keys(t).sort().slice(-7).forEach((k) => { keep[k] = t[k]; }); // a week is plenty
      set('mg-time', JSON.stringify(keep));
    },
    todaySeconds() { return this.times()[dayKey()] || 0; },
    getLevel() {
      const l = get('mg-level', 'normal');
      return LEVELS.indexOf(l) >= 0 ? l : 'normal';
    },
    setLevel(l) { set('mg-level', l); },
    getLimit() { return parseInt(get('mg-limit', '0'), 10) || 0; },
    setLimit(m) { set('mg-limit', String(m)); },
    streak() {
      const s = this.json('mg-streak');
      return { n: s.n || 0, last: s.last || '' };
    },
    touchStreak() {
      const s = this.streak();
      const today = dayKey();
      if (s.last === today) return s.n;
      const yesterday = dayKey(new Date(Date.now() - 86400000));
      s.n = (s.last === yesterday) ? s.n + 1 : 1;
      s.last = today;
      set('mg-streak', JSON.stringify(s));
      return s.n;
    }
  };
})();

function onStickerUnlock(count) {
  try {
    confetti(20);
    sfx.fanfare();
    const s = (typeof STICKERS !== 'undefined') && STICKERS[Math.min(count, STICKERS.length) - 1];
    if (s) toast(T.newSticker[store.getLang()] + ' ' + s.emoji);
  } catch (e) { /* ignore */ }
}

/* ---------------- Speech (Web Speech API) ---------------- */

const speech = (() => {
  const ok = typeof window !== 'undefined' && 'speechSynthesis' in window;
  let hiVoice = null;
  let enVoice = null;
  let warned = false;
  let primed = false;

  function allVoices() {
    try { return window.speechSynthesis.getVoices() || []; } catch (e) { return []; }
  }

  // Higher score = better for an Indian child's ear. For English text an
  // Indian-English voice wins; a Hindi voice (Indian-accent English) beats
  // a US/UK one; name hints pick the natural-sounding engines over basic ones.
  function score(v, kind) {
    const lang = String(v.lang || '').toLowerCase().replace('_', '-');
    let s = -1;
    if (kind === 'hi') {
      if (lang.indexOf('hi') === 0) s = 10;
    } else {
      if (lang.indexOf('en-in') === 0) s = 30;
      else if (lang.indexOf('hi') === 0) s = 20;
      else if (lang.indexOf('en-gb') === 0) s = 12;
      else if (lang.indexOf('en-us') === 0) s = 8;
      else if (lang.indexOf('en') === 0) s = 4;
    }
    if (s < 0) return s;
    const n = String(v.name || '');
    if (/natural|neural/i.test(n)) s += 6;
    if (/online/i.test(n)) s += 5;
    if (/google/i.test(n)) s += 4;
    if (/microsoft/i.test(n)) s += 3;
    if (v.localService === false) s += 2;
    return s;
  }

  function list(kind) {
    return allVoices()
      .map((v) => ({ v, s: score(v, kind) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.v);
  }

  function pickVoices() {
    try {
      const vs = allVoices();
      const pref = (kind) => {
        const uri = store.pref('mg-voice-' + kind);
        return uri ? (vs.find((v) => v.voiceURI === uri) || null) : null;
      };
      hiVoice = pref('hi') || list('hi')[0] || null;
      enVoice = pref('en') || list('en')[0] || null;
    } catch (e) { /* ignore */ }
  }

  function init() {
    if (!ok) return;
    try {
      pickVoices(); // may be empty on Chrome/Android — voices load async
      window.speechSynthesis.onvoiceschanged = pickVoices;
    } catch (e) { /* ignore */ }
  }

  function utter(text, lang, voice, rate, pitch) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; // set lang AND voice (Android needs both)
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    return u;
  }

  /* ---- One line at a time ----
     The app used to cancel whatever was being said every time it started the
     next line, so a long "Yay! The elephant lives in the forest!" was cut in
     half by the following question. Now anything the app starts on a timer
     waits its turn. A fresh tap is the one thing that jumps the queue, and
     only the first line of that tap does: the child's tap is answered at
     once, while two lines from the same tap still arrive in order. */
  const GESTURE_MS = 800;  // how long a tap still counts as "the child asked"
  const BREATH_MS = 120;   // the pause between two queued lines
  const MAX_PENDING = 2;   // rapid taps replace each other, they never pile up

  const queue = [];
  const afters = [];
  let speaking = false;
  let turn = 0;            // callbacks from an utterance we left behind
  let watchdog = 0;
  let lastGesture = -1e9;
  let gestureClaimed = true;
  let afterSeq = 0;

  function busy() { return speaking || queue.length > 0; }

  // Some Android engines never fire onend; without this the queue would wedge.
  function watchdogMs(text, rate) {
    return Math.min(20000, 1500 + (text.length * 110) / (rate || 0.85));
  }

  function hush() {
    turn++;
    speaking = false;
    clearTimeout(watchdog);
    watchdog = 0;
    try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }

  function finished(token) {
    if (token !== turn) return;
    clearTimeout(watchdog);
    watchdog = 0;
    speaking = false;
    setTimeout(() => { if (!speaking) pump(); }, BREATH_MS);
  }

  function pump() {
    if (!ok || speaking || !queue.length) {
      if (!busy()) armAfters();
      return;
    }
    const item = queue.shift();
    speaking = true;
    const token = ++turn;
    // Android quirk: speak() immediately after cancel() gets swallowed.
    setTimeout(() => {
      if (token !== turn) return;
      try {
        const base = item.rate || store.getRate();
        const rate = item.lang === 'hi' ? Math.max(0.6, base - 0.05) : base;
        const u = utter(item.text, item.lang, item.lang === 'hi' ? hiVoice : enVoice, rate, item.pitch || 1.1);
        u.onend = () => finished(token);
        u.onerror = () => finished(token);
        watchdog = setTimeout(() => finished(token), watchdogMs(item.text, rate));
        window.speechSynthesis.speak(u);
      } catch (e) {
        finished(token);
      }
    }, 30);
  }

  // lang: 'en' | 'hi'. Never throws; silent no-op without support (or muted).
  // opts.now forces the interruption even without a tap.
  function speak(text, lang, opts) {
    if (!ok || !text || store.getMute()) return;
    const o = opts || {};
    const fresh = !gestureClaimed && (Date.now() - lastGesture) < GESTURE_MS;
    if (fresh || o.now) {
      gestureClaimed = true;
      queue.length = 0;
      hush();
    }
    queue.push({ text: String(text), lang: lang, rate: o.rate, pitch: o.pitch });
    while (queue.length > MAX_PENDING) queue.shift();
    // Anything waiting for silence has to keep waiting now.
    afters.forEach((rec) => { clearTimeout(rec.timer); rec.timer = 0; });
    pump();
  }

  /* Run fn once the talking has actually stopped — what a fixed setTimeout
     could only guess at, and guessed wrong at every speech speed but one.
     min keeps the moment from passing too fast, max guarantees the game moves
     on even where speech is muted, missing or broken. */
  function after(fn, opts) {
    const o = opts || {};
    const rec = { id: ++afterSeq, fn: fn, min: o.min || 0, gap: o.gap || 0, at: Date.now(), timer: 0, hard: 0 };
    afters.push(rec);
    rec.hard = setTimeout(() => fire(rec), o.max || 8000);
    armAfters();
    return rec.id;
  }

  function armAfters() {
    if (busy()) return;
    afters.forEach((rec) => {
      if (rec.timer) return;
      rec.timer = setTimeout(() => fire(rec), Math.max(rec.gap, rec.min - (Date.now() - rec.at)));
    });
  }

  function drop(rec) {
    const i = afters.indexOf(rec);
    if (i < 0) return false;
    afters.splice(i, 1);
    clearTimeout(rec.timer);
    clearTimeout(rec.hard);
    return true;
  }

  function fire(rec) {
    if (!drop(rec)) return;
    try { rec.fn(); } catch (e) { /* ignore */ }
  }

  function cancelAfter(id) {
    const rec = afters.find((r) => r.id === id);
    if (rec) drop(rec);
  }

  // A tap earns one interruption: the child asked for this, so answer it now.
  function noteGesture() {
    lastGesture = Date.now();
    gestureClaimed = false;
  }

  // Settings-screen preview: plays even while muted (the parent asked for it).
  function testVoice(kind, text) {
    if (!ok) return;
    queue.length = 0;
    hush();
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utter(text, kind, kind === 'hi' ? hiVoice : enVoice, store.getRate(), 1.1));
      } catch (e) { /* ignore */ }
    }, 30);
  }

  // Some Android engines swallow the very first word after boot; a silent
  // utterance on the first tap warms the engine up.
  function prime() {
    if (primed || !ok) return;
    primed = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  // Stop talking, but keep whatever was waiting on the silence: muting must
  // not strand a quiz that is waiting to move to the next question.
  function silence() {
    if (!ok) return;
    queue.length = 0;
    hush();
    armAfters();
  }

  // Leaving a screen drops the pending continuations too.
  function stop() {
    afters.slice().forEach((rec) => drop(rec));
    silence();
  }

  function setPreferred(kind, voiceURI) {
    store.setPref('mg-voice-' + kind, voiceURI);
    pickVoices();
  }

  function current() {
    const info = (v) => (v ? { name: v.name, lang: v.lang, voiceURI: v.voiceURI } : null);
    return { en: info(enVoice), hi: info(hiVoice) };
  }

  return {
    init,
    speak,
    stop,
    prime,
    list,
    current,
    setPreferred,
    testVoice,
    silence,
    after,
    cancelAfter,
    noteGesture,
    hasHindi() { return !!hiVoice; },
    supported() { return ok; },
    warnNoHindiOnce() {
      if (warned) return;
      warned = true;
      toast(T.noHindiVoice);
    }
  };
})();

// Speaks a {en, hi, hiSay} phrase in the current language, falling back to
// the romanized form on an English voice when no Hindi voice exists.
function sayPhrase(ph) {
  if (!ph || store.getMute()) return;
  if (store.getLang() === 'hi') {
    if (speech.hasHindi()) {
      speech.speak(ph.hi, 'hi');
    } else {
      if (speech.supported()) speech.warnNoHindiOnce();
      speech.speak(ph.hiSay || ph.en, 'en');
    }
  } else {
    speech.speak(ph.en, 'en');
  }
}

/* ---------------- Sound effects (Web Audio) ---------------- */

const sfx = (() => {
  let ctx = null;

  function ensure() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) { /* ignore */ }
  }

  function tone(freq, start, dur, type, vol) {
    if (!ctx || store.getMute()) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      const t = ctx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol || 0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    } catch (e) { /* ignore */ }
  }

  return {
    ensure,
    // A single musical note, for the instrument games.
    note(freq, dur, type) { ensure(); tone(freq, 0, dur || 0.45, type || 'triangle', 0.2); },
    pop() { ensure(); tone(660, 0, 0.09, 'triangle', 0.12); },
    flip() { ensure(); tone(440, 0, 0.08, 'sine', 0.1); tone(590, 0.06, 0.08, 'sine', 0.1); },
    correct() { ensure(); tone(523.25, 0, 0.15, 'triangle'); tone(659.25, 0.12, 0.15, 'triangle'); tone(783.99, 0.24, 0.28, 'triangle'); },
    wrong() { ensure(); tone(220, 0, 0.18, 'sine', 0.08); tone(180, 0.14, 0.22, 'sine', 0.06); },
    fanfare() {
      ensure();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.15, 0.22, 'triangle'));
      tone(1318.5, 0.62, 0.5, 'triangle', 0.14);
    }
  };
})();

/* ---------------- Visual effects ---------------- */

function confetti(n) {
  if (REDUCED) return;
  try {
    const layer = $('confetti-layer');
    const pieces = ['🎉', '⭐', '✨', '🎈', '💛', '💙'];
    for (let i = 0; i < (n || 28); i++) {
      const p = document.createElement('div');
      p.className = 'confetti';
      if (Math.random() < 0.5) {
        p.textContent = rand(pieces);
        p.style.fontSize = (1 + Math.random() * 1.4) + 'rem';
      } else {
        p.classList.add('confetti-square');
        p.style.background = rand(COLORS).hex;
      }
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.addEventListener('animationend', () => p.remove());
      layer.appendChild(p);
    }
  } catch (e) { /* ignore */ }
}

function starFly(fromEl) {
  const pill = $('star-pill');
  if (REDUCED || !fromEl || !pill) return;
  try {
    const a = fromEl.getBoundingClientRect();
    const b = pill.getBoundingClientRect();
    const s = document.createElement('div');
    s.className = 'fly-star';
    s.textContent = '⭐';
    s.style.left = (a.left + a.width / 2 - 16) + 'px';
    s.style.top = (a.top + a.height / 2 - 16) + 'px';
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      s.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.4)';
      s.style.opacity = '0.3';
    });
    setTimeout(() => {
      s.remove();
      pill.classList.remove('pulse');
      void pill.offsetWidth;
      pill.classList.add('pulse');
    }, 720);
  } catch (e) { /* ignore */ }
}

// Mirrors what the app says out loud into a live region, for screen readers.
function announce(msg) {
  const el = $('quiz-verdict');
  if (el) el.textContent = msg || '';
}

let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 4500);
}

// Every round-based game draws the same little row of progress pips.
function renderDots(elId, total, filled) {
  const d = $(elId);
  if (!d) return;
  d.innerHTML = '';
  for (let k = 0; k < total; k++) {
    const s = document.createElement('span');
    s.className = 'dot' + (k < filled ? ' filled' : '');
    d.appendChild(s);
  }
}

// The one "not quite" reaction: a soft sound, a shake, a nudge to try again.
function nope(el, dim) {
  sfx.wrong();
  if (el) {
    if (dim) el.classList.add('dim');
    el.classList.add('wiggle');
    el.addEventListener('animationend', () => el.classList.remove('wiggle'), { once: true });
  }
  sayPhrase(rand(ENCOURAGE));
}

function updateStarCount() {
  $('star-count').textContent = String(store.getStars());
}

/* ---------------- SVG shapes ---------------- */

const SHAPE_PATHS = {
  circle: '<circle cx="50" cy="50" r="44"/>',
  square: '<rect x="8" y="8" width="84" height="84" rx="8"/>',
  rectangle: '<rect x="3" y="24" width="94" height="52" rx="8"/>',
  oval: '<ellipse cx="50" cy="50" rx="47" ry="32"/>',
  triangle: '<polygon points="50,7 94,89 6,89"/>',
  star: '<polygon points="50,4 61,35 95,35 67,56 78,91 50,71 22,91 33,56 5,35 39,35"/>',
  heart: '<path d="M50 88 C22 66 6 46 10 27 C13 12 31 7 42 17 C46 21 49 25 50 29 C51 25 54 21 58 17 C69 7 87 12 90 27 C94 46 78 66 50 88 Z"/>',
  diamond: '<polygon points="50,5 91,50 50,95 9,50"/>'
};

function shapeSVG(shapeKey, hex) {
  return '<svg class="shape" viewBox="0 0 100 100" aria-hidden="true">' +
    '<g fill="' + hex + '" stroke="rgba(0,0,0,.12)" stroke-width="2">' +
    SHAPE_PATHS[shapeKey] + '</g></svg>';
}

/* ---------------- Navigation ---------------- */

let currentScreen = 'screen-home';

function activeGameId() {
  return Object.keys(GAMES).find((id) => GAMES[id].screen === currentScreen) || null;
}

// Only the two browsing screens remember where they were; a game or a quiz
// always opens at the top, so nothing shifts under the child's finger.
const scrollMem = {};
const SCROLL_KEEP = { 'screen-home': 1, 'screen-cat': 1 };

function showScreen(id) {
  if (id !== currentScreen) {
    const prev = activeGameId();
    if (prev && GAMES[prev].onLeave) {
      try { GAMES[prev].onLeave(); } catch (e) { /* ignore */ }
    }
    if (currentScreen === 'screen-quiz') quiz.stop();
    clearGameTimers();
    if (SCROLL_KEEP[currentScreen]) scrollMem[currentScreen] = window.scrollY;
  }
  speech.stop();
  currentScreen = id;
  // Home is rebuilt on arrival so "just played" and the streak stay honest.
  if (id === 'screen-home') renderHome();
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  $('btn-back').classList.toggle('invisible', id === 'screen-home');
  // Coming back to a shelf should land where the child left it.
  const y = SCROLL_KEEP[id] ? (scrollMem[id] || 0) : 0;
  try { requestAnimationFrame(() => window.scrollTo(0, y)); } catch (e) { /* ignore */ }
}

// Each forward navigation pushes a history entry so the phone's back
// button walks back through the app instead of leaving it.
function navPush(id) {
  try { history.pushState({ s: id }, ''); } catch (e) { /* ignore */ }
}

function performBack() {
  const cel = $('celebrate');
  if (cel && cel.classList.contains('show')) {
    hideCelebrate();
    showScreen('screen-home');
    return;
  }
  if (currentScreen === 'screen-quiz' && quiz.cfg) {
    showScreen(quiz.cfg.backTo);
    return;
  }
  const gid = activeGameId();
  // A game can intercept back (e.g. an inner view returns to its own list first).
  if (gid && GAMES[gid].onBack && GAMES[gid].onBack()) return;
  if (gid && gameBackTo !== 'screen-home') { showScreen(gameBackTo); return; }
  if (currentScreen !== 'screen-home') showScreen('screen-home');
}

function goBack() {
  sfx.pop();
  // Prefer real history so the hardware back button and ⬅️ stay in sync.
  if (history.state && history.state.s) {
    try { history.back(); return; } catch (e) { /* ignore */ }
  }
  performBack();
}

window.addEventListener('popstate', performBack);

// Games schedule their "next round" / celebration with this instead of a
// raw setTimeout: everything pending is dropped the moment the child leaves,
// so nothing ever fires onto a screen that is no longer there.
const gameTimers = [];

function later(fn, ms) {
  const id = setTimeout(fn, ms);
  gameTimers.push(id);
  return id;
}

function clearGameTimers() {
  gameTimers.forEach(clearTimeout);
  gameTimers.length = 0;
}

// Non-game screens (Parent Corner) register here so a language switch
// re-renders their generated content, the way GAMES[id].onLang does.
const screenRefreshers = {};

// Later game scripts create their own <section class="screen"> with this.
function buildScreen(id, html) {
  const s = document.createElement('section');
  s.id = 'screen-' + id;
  s.className = 'screen';
  s.innerHTML = html;
  $('main').appendChild(s);
  return s;
}

/* ---------------- Celebration overlay ---------------- */

let celebrateAgain = null;

function celebrate(opts) {
  // Some games schedule this on a timer; if the child has already gone home
  // in the meantime, the party belongs to a screen that is no longer there.
  if (currentScreen === 'screen-home') return;
  celebrateAgain = opts && opts.again;
  const box = $('celebrate');
  const stars = $('celebrate-stars');
  stars.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('span');
    s.textContent = '⭐';
    s.style.animationDelay = (i * 0.12) + 's';
    stars.appendChild(s);
  }
  $('celebrate-title').textContent = T.celebrate[store.getLang()];
  box.classList.add('show');
  box.setAttribute('aria-hidden', 'false');
  store.addStars(2); // round bonus
  confetti(42);
  sfx.fanfare();
  setTimeout(() => sayPhrase(T.celebrate), 350);
}

function hideCelebrate() {
  const box = $('celebrate');
  box.classList.remove('show');
  box.setAttribute('aria-hidden', 'true');
}

/* ---------------- Shared quiz engine ----------------
   cfg = { make(index) -> question, backTo: screenId, total }
   question = {
     key: string   (no immediate repeats),
     prompt: {en, hi, hiSay},
     extra: html string ('' if none),
     choices: [{ key, html }],   // always 3, visuals only — no reading needed
     answer: key of the correct choice,
     answerPhrase: {en, hi, hiSay}
   }
----------------------------------------------------- */

const quiz = {
  cfg: null,
  count: 0,
  lastKey: null,
  current: null,
  locked: false,
  timer: 0,

  // Leaving mid-round must not let the pending "next question" (or the
  // celebration) land on whatever screen the child moved to.
  stop() {
    speech.cancelAfter(this.timer);
    this.timer = 0;
    this.locked = true;
  },

  start(cfg) {
    this.cfg = cfg;
    this.cfg.total = cfg.total || lvl(4, 5, 6);
    this.count = 0;
    this.lastKey = null;
    showScreen('screen-quiz');
    // "Play again" restarts must not pile up history entries.
    if (!(history.state && history.state.s === 'screen-quiz')) navPush('screen-quiz');
    this.next();
  },

  next() {
    let q = this.cfg.make(this.count);
    for (let i = 0; i < 25 && q.key === this.lastKey; i++) q = this.cfg.make(this.count);
    this.lastKey = q.key;
    this.current = q;
    this.locked = false;
    this.render();
    sayPhrase(q.prompt);
  },

  render() {
    const q = this.current;
    this.renderDots();
    $('quiz-text').textContent = q.prompt[store.getLang()];
    $('quiz-extra').innerHTML = q.extra || '';
    const box = $('quiz-choices');
    box.dataset.answer = q.answer;
    box.dataset.qnum = String(this.count + 1);
    box.innerHTML = '';
    // Fewer choices make every quiz in the app easier, in one place — but a
    // question can insist on a floor (two things cannot show an "odd one out").
    let choices = q.choices;
    const want = Math.max(lvl(2, 3, 4), q.min || 2);
    if (choices.length > want) {
      const right = choices.filter((c) => c.key === q.answer);
      const wrong = shuffle(choices.filter((c) => c.key !== q.answer)).slice(0, Math.max(1, want - right.length));
      choices = shuffle(right.concat(wrong));
    }
    box.dataset.count = String(choices.length);
    choices.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'quiz-tile';
      b.dataset.key = c.key;
      // Shape and colour tiles are pure SVG, so without this they announce nothing.
      b.setAttribute('aria-label', c.label || String(c.key));
      b.innerHTML = c.html;
      b.addEventListener('click', () => this.pick(b));
      box.appendChild(b);
    });
  },

  renderDots() {
    renderDots('quiz-dots', this.cfg.total, this.count);
  },

  pick(btn) {
    if (this.locked || !this.current) return;
    const q = this.current;
    if (btn.dataset.key === q.answer) {
      this.locked = true;
      btn.classList.add('pop');
      document.querySelectorAll('#quiz-choices .quiz-tile').forEach((t) => {
        if (t !== btn) t.classList.add('faded');
      });
      sfx.correct();
      store.addStars(1);
      starFly(btn);
      this.count++;
      this.renderDots();
      announce(q.answerPhrase[store.getLang()]);
      sayPhrase(joinPhrase(rand(PRAISE), q.answerPhrase));
      // The praise has to be heard in full before the next question starts
      // talking over it — but the star still gets its moment first.
      this.timer = speech.after(() => {
        if (this.count >= this.cfg.total) {
          celebrate({
            again: () => { hideCelebrate(); quiz.start(quiz.cfg); }
          });
        } else {
          this.next();
        }
      }, { min: 1200, gap: 450 });
    } else {
      sfx.wrong();
      btn.classList.add('dim', 'wiggle');
      btn.addEventListener('animationend', () => btn.classList.remove('wiggle'), { once: true });
      const nope = rand(ENCOURAGE);
      announce(nope[store.getLang()]);
      sayPhrase(nope);
    }
  },

  replay() {
    if (this.current) sayPhrase(this.current.prompt);
  },

  relabel() {
    if (!this.current) return;
    $('quiz-text').textContent = this.current.prompt[store.getLang()];
  }
};

/* ---------------- Game: ABC & Ginti ---------------- */

const abcGame = {
  tab: 'letters',

  render() {
    document.querySelectorAll('#screen-abc .tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === this.tab);
    });
    const grid = $('abc-grid');
    grid.innerHTML = '';
    if (this.tab === 'letters') {
      LETTERS.forEach((l) => {
        const b = document.createElement('button');
        b.className = 'tile';
        b.innerHTML = '<span class="t-big">' + l.ch + '</span><span class="t-small">' + l.emoji + '</span>';
        b.addEventListener('click', () => {
          sfx.pop();
          popIt(b);
          sayPhrase(phrase(
            l.ch + '! ' + l.ch + ' for ' + l.en + '!',
            l.ch + '! ' + l.ch + ' से ' + l.hi + '!',
            l.ch + '! ' + l.ch + ' se ' + l.hiSay + '!'
          ));
        });
        grid.appendChild(b);
      });
    } else if (this.tab === 'numbers') {
      NUMBERS.forEach((num) => {
        const b = document.createElement('button');
        b.className = 'tile';
        b.innerHTML = '<span class="t-big">' + num.n + '</span><span class="t-word">' + num[store.getLang()] + '</span>';
        b.addEventListener('click', () => {
          sfx.pop();
          popIt(b);
          sayPhrase(countPhrase(num.n));
        });
        grid.appendChild(b);
      });
    } else {
      VARNAMALA.forEach((v) => {
        const b = document.createElement('button');
        b.className = 'tile varna-tile';
        b.innerHTML = '<span class="t-big">' + v.ch + '</span>' +
          (v.emoji ? '<span class="t-small">' + v.emoji + '</span>' : '');
        b.addEventListener('click', () => {
          sfx.pop();
          popIt(b);
          sayPhrase(varnaPhrase(v));
        });
        grid.appendChild(b);
      });
    }
  },

  make(index) {
    if (this.tab === 'letters') return this.letterQuestion();
    if (this.tab === 'numbers') return this.numberQuestion();
    return this.varnaQuestion();
  },

  varnaQuestion() {
    // Several letters share a romanization (ट and त are both "Ta"), so the
    // English prompt "Find Ta!" would have two right answers. Keep the
    // spellings natural and just never show two of them together.
    let three = sample(VARNAMALA, 3);
    for (let i = 0; i < 20 && new Set(three.map((v) => v.roman)).size < 3; i++) {
      three = sample(VARNAMALA, 3);
    }
    const ans = three[0];
    return {
      key: 'V' + ans.ch,
      prompt: phrase('Find ' + ans.roman + '!', ans.ch + ' ढूँढो!', ans.roman + ' dhoondho!'),
      extra: '',
      choices: shuffle(three).map((v) => ({ key: v.ch, html: '<span>' + v.ch + '</span>' })),
      answer: ans.ch,
      answerPhrase: varnaPhrase(ans)
    };
  },

  letterQuestion() {
    const three = sample(LETTERS, 3);
    const ans = three[0];
    return {
      key: 'L' + ans.ch,
      prompt: phrase('Find ' + ans.ch + '!', ans.ch + ' ढूँढो!', ans.ch + ' dhoondho!'),
      extra: '',
      choices: shuffle(three).map((l) => ({ key: l.ch, html: '<span>' + l.ch + '</span>' })),
      answer: ans.ch,
      answerPhrase: phrase(
        ans.ch + '! ' + ans.ch + ' for ' + ans.en + '!',
        ans.ch + '! ' + ans.ch + ' से ' + ans.hi + '!',
        ans.ch + '! ' + ans.ch + ' se ' + ans.hiSay + '!'
      )
    };
  },

  numberQuestion() {
    if (Math.random() < 0.5) {
      // Find the digit
      const three = sample(NUMBERS, 3);
      const ans = three[0];
      return {
        key: 'N' + ans.n,
        prompt: phrase('Find ' + ans.n + '!', ans.n + ' ढूँढो!', ans.n + ' dhoondho!'),
        extra: '',
        choices: shuffle(three).map((x) => ({ key: String(x.n), html: '<span>' + x.n + '</span>' })),
        answer: String(ans.n),
        answerPhrase: phrase(ans.n + '! ' + ans.en + '!', ans.n + '! ' + ans.hi + '!', ans.n + '! ' + ans.hiSay + '!')
      };
    }
    // Count the emojis (1..6 so they are easy to count in the bubble)
    const n = 1 + Math.floor(Math.random() * 6);
    const ans = NUMBERS[n - 1];
    const em = rand(COUNT_EMOJIS);
    const others = sample(NUMBERS.filter((x) => x.n !== n), 2);
    const choices = shuffle([ans].concat(others)).map((x) => ({ key: String(x.n), html: '<span>' + x.n + '</span>' }));
    return {
      key: 'C' + n,
      prompt: phrase('How many? Count them!', 'कितने हैं? गिनो!', 'Kitne hain? Gino!'),
      extra: '<span class="count-emojis">' + Array(n).fill(em).join(' ') + '</span>',
      choices,
      answer: String(n),
      answerPhrase: countPhrase(n)
    };
  }
};

function countPhrase(n) {
  const upTo = NUMBERS.slice(0, n);
  return phrase(
    NUMBERS[n - 1].en + '! ' + upTo.map((x) => x.en).join(', ') + '!',
    NUMBERS[n - 1].hi + '! ' + upTo.map((x) => x.hi).join(', ') + '!',
    NUMBERS[n - 1].hiSay + '! ' + upTo.map((x) => x.hiSay).join(', ') + '!'
  );
}

function popIt(el) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

/* ---------------- Game: Shapes & Colors ---------------- */

const shapesGame = {
  render() {
    const grid = $('shapes-grid');
    grid.innerHTML = '';
    SHAPES.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'tile';
      b.innerHTML = shapeSVG(s.key, COLORS[i % COLORS.length].hex);
      b.setAttribute('aria-label', s.en + ' / ' + s.hi);
      b.addEventListener('click', () => {
        sfx.pop();
        popIt(b);
        sayPhrase(wordPhrase(s));
      });
      grid.appendChild(b);
    });
    const row = $('colors-row');
    row.innerHTML = '';
    COLORS.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'blob-tile';
      b.innerHTML = '<span class="blob" style="background:' + c.hex + '"></span>';
      b.setAttribute('aria-label', c.en + ' / ' + c.hi);
      b.addEventListener('click', () => {
        sfx.pop();
        popIt(b);
        sayPhrase(wordPhrase(c));
      });
      row.appendChild(b);
    });
  },

  // Ramp: Q1 shape-only → Q2 color-only → Q3+ color+shape combined
  make(index) {
    if (index === 0) return this.shapeQuestion();
    if (index === 1) return this.colorQuestion();
    return this.comboQuestion();
  },

  shapeQuestion() {
    const three = sample(SHAPES, 3);
    const ans = three[0];
    const hex = rand(COLORS).hex; // same color everywhere: shape is the clue
    return {
      key: 'S' + ans.key,
      prompt: phrase('Find the ' + ans.en.toLowerCase() + '!', ans.hi + ' ढूँढो!', ans.hiSay + ' dhoondho!'),
      extra: '',
      choices: shuffle(three).map((s) => ({ key: s.key, html: shapeSVG(s.key, hex) })),
      answer: ans.key,
      answerPhrase: wordPhrase(ans)
    };
  },

  colorQuestion() {
    const three = sample(COLORS, 3);
    const ans = three[0];
    return {
      key: 'K' + ans.key,
      prompt: phrase('Find ' + ans.en.toLowerCase() + '!', ans.hi + ' रंग ढूँढो!', ans.hiSay + ' rang dhoondho!'),
      extra: '',
      choices: shuffle(three).map((c) => ({
        key: c.key,
        html: '<span class="blob" style="background:' + c.hex + '"></span>'
      })),
      answer: ans.key,
      answerPhrase: wordPhrase(ans)
    };
  },

  comboQuestion() {
    const shapes = sample(SHAPES, 2);
    const colors = sample(COLORS, 2);
    const tShape = shapes[0], tColor = colors[0];
    const options = shuffle([
      { shape: tShape, color: tColor },        // correct
      { shape: tShape, color: colors[1] },     // same shape, wrong color
      { shape: shapes[1], color: tColor }      // wrong shape, same color
    ]);
    const keyOf = (o) => o.color.key + '-' + o.shape.key;
    return {
      key: 'SC' + keyOf(options.find((o) => o.shape === tShape && o.color === tColor)),
      prompt: phrase(
        'Find the ' + tColor.en.toLowerCase() + ' ' + tShape.en.toLowerCase() + '!',
        tColor.hi + ' ' + tShape.hi + ' ढूँढो!',
        tColor.hiSay + ' ' + tShape.hiSay + ' dhoondho!'
      ),
      extra: '',
      choices: options.map((o) => ({ key: keyOf(o), html: shapeSVG(o.shape.key, o.color.hex) })),
      answer: tColor.key + '-' + tShape.key,
      answerPhrase: phrase(
        tColor.en + ' ' + tShape.en.toLowerCase() + '!',
        tColor.hi + ' ' + tShape.hi + '!',
        tColor.hiSay + ' ' + tShape.hiSay + '!'
      )
    };
  }
};

/* ---------------- Game: Memory Match ---------------- */

const memoryGame = {
  first: null,
  lock: false,
  matched: 0,
  total: 6, // replaced per level in newGame()

  newGame() {
    this.first = null;
    this.lock = false;
    this.matched = 0;
    this.total = lvl(4, 6, 8);
    $('memory-hint').textContent = T.memoryHint[store.getLang()];
    const grid = $('memory-grid');
    grid.innerHTML = '';
    const picks = sample(MEMORY_POOL, this.total);
    shuffle(picks.concat(picks)).forEach((item) => {
      const b = document.createElement('button');
      b.className = 'mem-card';
      b.dataset.emoji = item.emoji;
      b.setAttribute('aria-label', 'Face-down card / बंद कार्ड');
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<div class="mem-inner">' +
        '<div class="mem-face mem-back">❓</div>' +
        '<div class="mem-face mem-front">' + item.emoji + '</div></div>';
      b._item = item;
      b.addEventListener('click', () => this.flip(b));
      grid.appendChild(b);
    });
  },

  flip(card) {
    if (this.lock || card.classList.contains('flipped')) return;
    sfx.flip();
    card.classList.add('flipped');
    card.setAttribute('aria-pressed', 'true');
    card.setAttribute('aria-label', card.dataset.emoji);
    if (!this.first) {
      this.first = card;
      return;
    }
    const a = this.first;
    const b = card;
    this.first = null;
    this.lock = true;
    if (a.dataset.emoji === b.dataset.emoji) {
      setTimeout(() => {
        a.classList.add('matched');
        b.classList.add('matched');
        [a, b].forEach((c) => c.setAttribute('aria-label', c.dataset.emoji + ' — matched / मिल गया'));
        sfx.correct();
        sayPhrase(wordPhrase(b._item));
        store.addStars(1);
        starFly(b);
        this.matched++;
        this.lock = false;
        if (this.matched >= this.total) {
          setTimeout(() => {
            celebrate({ again: () => { hideCelebrate(); memoryGame.newGame(); } });
          }, 750);
        }
      }, 380);
    } else {
      setTimeout(() => {
        sfx.wrong();
        [a, b].forEach((c) => {
          c.classList.remove('flipped');
          c.setAttribute('aria-pressed', 'false');
          c.setAttribute('aria-label', 'Face-down card / बंद कार्ड');
        });
        this.lock = false;
      }, 900);
    }
  }
};

/* ---------------- Game: Animals & Sounds ---------------- */

const animalsGame = {
  render() {
    const grid = $('animals-grid');
    grid.innerHTML = '';
    ANIMALS.forEach((a) => {
      const b = document.createElement('button');
      b.className = 'tile animal-tile';
      b.innerHTML = '<span class="t-big">' + a.emoji + '</span><span class="t-word">' + a[store.getLang()] + '</span>';
      b.addEventListener('click', () => {
        sfx.pop();
        popIt(b);
        sayPhrase(phrase(
          a.en + '! ' + a.soundEn,
          a.hi + '! ' + a.soundHi,
          a.hiSay + '! ' + a.soundHiSay
        ));
      });
      grid.appendChild(b);
    });
  },

  make(index) {
    const three = sample(ANIMALS, 3);
    const ans = three[0];
    const bySound = Math.random() < 0.5;
    const prompt = bySound
      ? phrase('Who says: ' + ans.soundEn, 'कौन बोलता है: ' + ans.soundHi, 'Kaun bolta hai: ' + ans.soundHiSay)
      : phrase('Where is the ' + ans.en.toLowerCase() + '?', ans.hi + ' कहाँ है?', ans.hiSay + ' kahan hai?');
    return {
      key: (bySound ? 'AS' : 'A') + ans.en,
      prompt,
      extra: '',
      choices: shuffle(three).map((a) => ({ key: a.en, html: '<span>' + a.emoji + '</span>' })),
      answer: ans.en,
      answerPhrase: phrase(
        ans.en + '! ' + ans.soundEn,
        ans.hi + '! ' + ans.soundHi,
        ans.hiSay + '! ' + ans.soundHiSay
      )
    };
  }
};

/* ---------------- Home & language ---------------- */

const GAMES = {
  abc: { emoji: '🔤', color: 'var(--sky)', screen: 'screen-abc', enter() { abcGame.render(); }, onLang() { abcGame.render(); } },
  shapes: { emoji: '🔺', color: 'var(--coral)', screen: 'screen-shapes', enter() { shapesGame.render(); }, onLang() { shapesGame.render(); } },
  memory: { emoji: '🧠', color: 'var(--lilac)', screen: 'screen-memory', enter() { memoryGame.newGame(); } },
  animals: { emoji: '🦁', color: 'var(--mint)', screen: 'screen-animals', enter() { animalsGame.render(); }, onLang() { animalsGame.render(); } }
};

// Home layout: sections rendered in this order; ids missing from GAMES are skipped,
// so this list can name games that a later script registers.
const HOME_SECTIONS = [
  { title: { en: '📚 ABC & Words', hi: '📚 ABC और शब्द' }, games: ['abc', 'tracing', 'spelling', 'phonics', 'capsmall', 'matra', 'hindiword', 'readword', 'rhymewords', 'opposites', 'listen', 'leftright', 'stories'] },
  { title: { en: '🔢 Numbers & Math', hi: '🔢 गिनती और मैथ' }, games: ['math', 'countit', 'numline', 'after20', 'before20', 'tables', 'board100', 'clock', 'compare', 'share', 'measure', 'coins', 'shop', 'week', 'tower'] },
  { title: { en: '🧠 Brain Games', hi: '🧠 दिमाग के खेल' }, games: ['memory', 'pattern', 'missing', 'oddone', 'ispy', 'cups', 'puzzle', 'maze', 'shadow', 'train', 'sizes', 'order'] },
  { title: { en: '🌍 Know the World', hi: '🌍 दुनिया जानो' }, games: ['shapes', 'animals', 'fruits', 'body', 'objects', 'flowers', 'bharat', 'festivals', 'family', 'helpers', 'feed', 'feelings', 'safety', 'vehicles', 'whereride', 'traffic'] },
  { title: { en: '🔬 Science & Nature', hi: '🔬 विज्ञान और कुदरत' }, games: ['floatsink', 'homes', 'babies', 'mixcolors', 'weather', 'gardener'] },
  { title: { en: '🎨 Play & Fun', hi: '🎨 खेल और मस्ती' }, games: ['farm', 'skypop', 'drawing', 'rangoli', 'facemaker', 'dress', 'tidy', 'yoga', 'piano', 'tune', 'drum', 'rhymes', 'stickers'] }
];

// Where ⬅️ should land when leaving a game: the shelf it was opened from.
let gameBackTo = 'screen-home';
let catIndex = 0;

function openGameScreen(id, backTo) {
  const g = GAMES[id];
  sfx.pop();
  gameBackTo = backTo || 'screen-home';
  store.notePlay(id);
  // Show first, then start: the screen must already be visible so a game can
  // measure its canvas, and so its fresh timers survive the screen change.
  showScreen(g.screen);
  // Name the game before starting it: the hint a game speaks in enter() then
  // queues behind the title instead of arriving ahead of it.
  sayPhrase(GAME_TITLES[id]);
  g.enter();
  navPush(g.screen);
}

function gameCard(id, backTo) {
  const g = GAMES[id];
  const b = document.createElement('button');
  b.className = 'game-card';
  b.dataset.game = id;
  b.style.background = g.color;
  b.innerHTML = '<span class="g-emoji">' + g.emoji + '</span>' +
    '<span class="g-title">' + GAME_TITLES[id][store.getLang()] + '</span>';
  b.addEventListener('click', () => openGameScreen(id, backTo));
  return b;
}

function heading(text) {
  const h = document.createElement('h2');
  h.className = 'home-cat';
  h.textContent = text;
  return h;
}

// The game of the day: stable for the whole day, but drawn from the games
// this child has played least — so the ones buried down the list get a turn.
function todaysGameId() {
  const ids = HOME_SECTIONS.reduce((a, s) => a.concat(s.games.filter((id) => GAMES[id])), []);
  if (!ids.length) return null;
  const plays = store.plays();
  const fewest = ids.reduce((m, id) => Math.min(m, (plays[id] && plays[id].n) || 0), Infinity);
  const fresh = ids.filter((id) => ((plays[id] && plays[id].n) || 0) === fewest);
  const d = dayKey();
  let seed = 0;
  for (let i = 0; i < d.length; i++) seed = (seed * 31 + d.charCodeAt(i)) % 100000;
  return fresh[seed % fresh.length];
}

function renderHome() {
  const lang = store.getLang();
  $('home-title').textContent = T.title[lang];
  $('home-sub').textContent = T.subtitle[lang];
  const grid = $('home-grid');
  grid.innerHTML = '';

  const st = store.streak();
  if (st.n >= 2) {
    const pill = document.createElement('div');
    pill.id = 'home-streak';
    pill.className = 'streak-pill';
    pill.dataset.days = String(st.n);
    pill.textContent = '🔥 ' + st.n + (lang === 'hi' ? ' दिन' : ' days');
    grid.appendChild(pill);
  }

  const today = todaysGameId();
  if (today) {
    grid.appendChild(heading(T.todayGame[lang]));
    const card = gameCard(today, 'screen-home');
    card.classList.add('today-card');
    card.id = 'today-card';
    grid.appendChild(card);
  }

  const recent = store.recent(6).filter((id) => GAMES[id]);
  if (recent.length) {
    grid.appendChild(heading(T.recentGames[lang]));
    const row = document.createElement('div');
    row.id = 'recent-row';
    row.className = 'recent-row';
    recent.forEach((id) => {
      const b = gameCard(id, 'screen-home');
      b.classList.add('recent-card');
      row.appendChild(b);
    });
    grid.appendChild(row);
  }

  grid.appendChild(heading(T.allGames[lang]));
  const tiles = document.createElement('div');
  tiles.id = 'cat-tiles';
  tiles.className = 'cat-tiles';
  HOME_SECTIONS.forEach((sec, i) => {
    const ids = sec.games.filter((id) => GAMES[id]);
    if (!ids.length) return;
    const b = document.createElement('button');
    b.className = 'cat-tile';
    b.dataset.cat = String(i);
    b.dataset.count = String(ids.length);
    b.innerHTML = '<span class="ct-title">' + sec.title[lang] + '</span>' +
      '<span class="ct-count">' + ids.length + (lang === 'hi' ? ' खेल' : ' games') + '</span>';
    b.addEventListener('click', () => openCategory(i));
    tiles.appendChild(b);
  });
  grid.appendChild(tiles);
}

// One reusable shelf screen, filled with whichever category was tapped.
function openCategory(i) {
  sfx.pop();
  catIndex = i;
  renderCategory();
  showScreen('screen-cat');
  navPush('screen-cat');
}

function renderCategory() {
  const sec = HOME_SECTIONS[catIndex];
  if (!sec) return;
  const lang = store.getLang();
  $('cat-title').textContent = sec.title[lang];
  const grid = $('cat-grid');
  grid.dataset.cat = String(catIndex);
  grid.innerHTML = '';
  sec.games.filter((id) => GAMES[id]).forEach((id) => grid.appendChild(gameCard(id, 'screen-cat')));
}

function applyLang() {
  const lang = store.getLang();
  try { document.documentElement.lang = lang; } catch (e) { /* ignore */ }
  document.querySelectorAll('#lang-toggle .seg').forEach((s) => {
    s.classList.toggle('active', s.dataset.lang === lang);
  });
  // Every element tagged data-t="key" takes its label from the T dictionary.
  document.querySelectorAll('[data-t]').forEach((el) => {
    const s = T[el.dataset.t];
    if (s && s[lang]) el.textContent = s[lang];
  });
  renderHome();
  if (currentScreen === 'screen-cat') renderCategory();
  if (screenRefreshers[currentScreen]) screenRefreshers[currentScreen]();
  // Refresh whatever screen is open (stateful boards keep their state).
  const gid = activeGameId();
  if (gid && GAMES[gid].onLang) GAMES[gid].onLang();
  else if (currentScreen === 'screen-quiz') quiz.relabel();
}

function toggleLang() {
  const next = store.getLang() === 'en' ? 'hi' : 'en';
  store.setLang(next);
  sfx.pop();
  applyLang();
  sayPhrase(T.langName); // speaks the freshly selected language's name
}

/* ---------------- Boot ---------------- */

function updateMuteBtn() {
  $('btn-mute').textContent = store.getMute() ? '🔇' : '🔊';
}

/* ---- First run: ask which language, instead of silently picking English ---- */

function askLanguage() {
  const box = $('lang-pick');
  box.classList.add('show');
  box.setAttribute('aria-hidden', 'false');
  const choose = (lang) => {
    store.setLang(lang);
    box.classList.remove('show');
    box.setAttribute('aria-hidden', 'true');
    sfx.pop();
    applyLang();
    sayPhrase(T.langName);
  };
  $('lp-en').addEventListener('click', () => choose('en'), { once: true });
  $('lp-hi').addEventListener('click', () => choose('hi'), { once: true });
}

/* ---- Screen time: counted while a game is open, shown in Parent Corner ---- */

let breakShownFor = '';

function checkScreenTime() {
  const limit = store.getLimit();
  if (!limit) return;
  const today = dayKey();
  if (breakShownFor === today) return;
  if (store.todaySeconds() < limit * 60) return;
  breakShownFor = today;
  const box = $('break-time');
  box.classList.add('show');
  box.setAttribute('aria-hidden', 'false');
  sayPhrase(T.breakBody);
}

function startTimeTicker() {
  setInterval(() => {
    if (!activeGameId() && currentScreen !== 'screen-quiz') return;
    store.addSeconds(30);
    checkScreenTime();
  }, 30000);
}

/* ---- Install: the browser only offers this once the PWA qualifies ---- */

let installPrompt = null;

function setupInstall() {
  const btn = $('btn-install');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    btn.hidden = false;
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; btn.hidden = true; });
  btn.addEventListener('click', () => {
    sfx.pop();
    if (!installPrompt) { toast(T.installIos); return; }
    installPrompt.prompt();
    installPrompt = null;
    btn.hidden = true;
  });
}

function registerSW() {
  try {
    if (!('serviceWorker' in navigator)) return;
    // file:// (double-click use) must keep working — register only where allowed.
    const secure = location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    if (!secure) return;
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            toast(T.newVersion[store.getLang()]);
          }
        });
      });
    }).catch(() => { /* offline first load etc. */ });
  } catch (e) { /* ignore */ }
}

function boot() {
  speech.init();
  updateStarCount();
  updateMuteBtn();
  registerSW();

  $('btn-back').addEventListener('click', goBack);
  $('lang-toggle').addEventListener('click', toggleLang);
  $('btn-mute').addEventListener('click', () => {
    const m = !store.getMute();
    store.setMute(m);
    updateMuteBtn();
    if (m) speech.silence(); else sfx.pop();
  });
  $('star-pill').addEventListener('click', () => {
    if (!GAMES.stickers) return;
    openGameScreen('stickers', 'screen-home');
  });
  $('quiz-replay').addEventListener('click', () => { sfx.pop(); quiz.replay(); });
  $('btn-again').addEventListener('click', () => {
    sfx.pop();
    if (celebrateAgain) celebrateAgain();
  });
  $('btn-cele-home').addEventListener('click', () => {
    sfx.pop();
    hideCelebrate();
    showScreen('screen-home');
  });
  document.querySelectorAll('#screen-abc .tab').forEach((t) => {
    t.addEventListener('click', () => {
      sfx.pop();
      abcGame.tab = t.dataset.tab;
      abcGame.render();
      document.querySelectorAll('#screen-abc .tab').forEach((x) => {
        x.setAttribute('aria-selected', x.dataset.tab === abcGame.tab ? 'true' : 'false');
      });
    });
  });
  document.querySelectorAll('.tabs .tab').forEach((x) => {
    x.setAttribute('aria-selected', x.classList.contains('active') ? 'true' : 'false');
  });
  $('abc-quiz').addEventListener('click', () => {
    quiz.start({ make: (i) => abcGame.make(i), backTo: 'screen-abc' });
  });
  $('shapes-quiz').addEventListener('click', () => {
    quiz.start({ make: (i) => shapesGame.make(i), backTo: 'screen-shapes' });
  });
  $('animals-quiz').addEventListener('click', () => {
    quiz.start({ make: (i) => animalsGame.make(i), backTo: 'screen-animals' });
  });

  $('break-ok').addEventListener('click', () => {
    sfx.pop();
    const box = $('break-time');
    box.classList.remove('show');
    box.setAttribute('aria-hidden', 'true');
    hideCelebrate();
    showScreen('screen-home');
  });

  // First touch unlocks/resumes the AudioContext (mobile autoplay policy)
  // and warms up the speech engine so the first word isn't swallowed.
  const gesture = () => { sfx.ensure(); speech.prime(); speech.noteGesture(); };
  document.addEventListener('pointerdown', gesture, { passive: true, capture: true });
  document.addEventListener('keydown', gesture, { passive: true, capture: true });

  const firstRun = !store.langChosen();
  store.touchStreak();
  setupInstall();
  startTimeTicker();
  applyLang();
  if (firstRun) askLanguage();
}

document.addEventListener('DOMContentLoaded', boot);
