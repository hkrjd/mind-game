'use strict';
/* ================================================================
   data2.js — data for the expanded game set.
   Loaded after app.js; shares its global helpers (T, phrase, ...).
   ================================================================ */

/* ---------------- Vocabulary packs ---------------- */

const PACK_FRUITS = [
  { emoji: '🍎', en: 'Apple', hi: 'सेब', hiSay: 'Seb' },
  { emoji: '🍌', en: 'Banana', hi: 'केला', hiSay: 'Kela' },
  { emoji: '🥭', en: 'Mango', hi: 'आम', hiSay: 'Aam' },
  { emoji: '🍇', en: 'Grapes', hi: 'अंगूर', hiSay: 'Angoor' },
  { emoji: '🍊', en: 'Orange', hi: 'संतरा', hiSay: 'Santra' },
  { emoji: '🍉', en: 'Watermelon', hi: 'तरबूज', hiSay: 'Tarbooj' },
  { emoji: '🍓', en: 'Strawberry', hi: 'स्ट्रॉबेरी', hiSay: 'Strawberry' },
  { emoji: '🍍', en: 'Pineapple', hi: 'अनानास', hiSay: 'Ananas' },
  { emoji: '🍑', en: 'Peach', hi: 'आड़ू', hiSay: 'Aadu' },
  { emoji: '🍐', en: 'Pear', hi: 'नाशपाती', hiSay: 'Nashpati' },
  { emoji: '🥝', en: 'Kiwi', hi: 'कीवी', hiSay: 'Kiwi' },
  { emoji: '🍒', en: 'Cherry', hi: 'चेरी', hiSay: 'Cherry' }
];

const PACK_VEGGIES = [
  { emoji: '🥕', en: 'Carrot', hi: 'गाजर', hiSay: 'Gaajar' },
  { emoji: '🥔', en: 'Potato', hi: 'आलू', hiSay: 'Aaloo' },
  { emoji: '🍅', en: 'Tomato', hi: 'टमाटर', hiSay: 'Tamatar' },
  { emoji: '🧅', en: 'Onion', hi: 'प्याज', hiSay: 'Pyaaz' },
  { emoji: '🍆', en: 'Brinjal', hi: 'बैंगन', hiSay: 'Baingan' },
  { emoji: '🌽', en: 'Corn', hi: 'मक्का', hiSay: 'Makka' },
  { emoji: '🥦', en: 'Broccoli', hi: 'ब्रोकली', hiSay: 'Broccoli' },
  { emoji: '🥒', en: 'Cucumber', hi: 'खीरा', hiSay: 'Kheera' },
  { emoji: '🎃', en: 'Pumpkin', hi: 'कद्दू', hiSay: 'Kaddu' },
  { emoji: '🫑', en: 'Capsicum', hi: 'शिमला मिर्च', hiSay: 'Shimla mirch' },
  { emoji: '🍄', en: 'Mushroom', hi: 'मशरूम', hiSay: 'Mushroom' },
  { emoji: '🥬', en: 'Cabbage', hi: 'पत्ता गोभी', hiSay: 'Patta gobhi' }
];

const PACK_BODY = [
  { emoji: '👁️', en: 'Eye', hi: 'आँख', hiSay: 'Aankh' },
  { emoji: '👂', en: 'Ear', hi: 'कान', hiSay: 'Kaan' },
  { emoji: '👃', en: 'Nose', hi: 'नाक', hiSay: 'Naak' },
  { emoji: '👄', en: 'Mouth', hi: 'मुँह', hiSay: 'Munh' },
  { emoji: '🦷', en: 'Teeth', hi: 'दाँत', hiSay: 'Daant' },
  { emoji: '👅', en: 'Tongue', hi: 'जीभ', hiSay: 'Jeebh' },
  { emoji: '✋', en: 'Hand', hi: 'हाथ', hiSay: 'Haath' },
  { emoji: '🦶', en: 'Foot', hi: 'पैर', hiSay: 'Pair' },
  { emoji: '🦵', en: 'Leg', hi: 'टाँग', hiSay: 'Taang' },
  { emoji: '💪', en: 'Arm', hi: 'बाजू', hiSay: 'Baaju' },
  { emoji: '❤️', en: 'Heart', hi: 'दिल', hiSay: 'Dil' },
  { emoji: '🧠', en: 'Brain', hi: 'दिमाग', hiSay: 'Dimaag' }
];

const PACK_OBJECTS = [
  { emoji: '🪑', en: 'Chair', hi: 'कुर्सी', hiSay: 'Kursi' },
  { emoji: '🛏️', en: 'Bed', hi: 'बिस्तर', hiSay: 'Bistar' },
  { emoji: '🚪', en: 'Door', hi: 'दरवाज़ा', hiSay: 'Darwaza' },
  { emoji: '🪟', en: 'Window', hi: 'खिड़की', hiSay: 'Khidki' },
  { emoji: '🥄', en: 'Spoon', hi: 'चम्मच', hiSay: 'Chammach' },
  { emoji: '🍽️', en: 'Plate', hi: 'थाली', hiSay: 'Thaali' },
  { emoji: '🥛', en: 'Glass', hi: 'गिलास', hiSay: 'Gilaas' },
  { emoji: '🪥', en: 'Toothbrush', hi: 'ब्रश', hiSay: 'Brush' },
  { emoji: '🧼', en: 'Soap', hi: 'साबुन', hiSay: 'Saabun' },
  { emoji: '⏰', en: 'Clock', hi: 'घड़ी', hiSay: 'Ghadi' },
  { emoji: '📖', en: 'Book', hi: 'किताब', hiSay: 'Kitaab' },
  { emoji: '✏️', en: 'Pencil', hi: 'पेंसिल', hiSay: 'Pencil' }
];

const PACK_FLOWERS = [
  { emoji: '🌹', en: 'Rose', hi: 'गुलाब', hiSay: 'Gulaab' },
  { emoji: '🌻', en: 'Sunflower', hi: 'सूरजमुखी', hiSay: 'Surajmukhi' },
  { emoji: '🌷', en: 'Tulip', hi: 'ट्यूलिप', hiSay: 'Tulip' },
  { emoji: '🪷', en: 'Lotus', hi: 'कमल', hiSay: 'Kamal' },
  { emoji: '🌺', en: 'Hibiscus', hi: 'गुड़हल', hiSay: 'Gudhal' },
  { emoji: '🌼', en: 'Daisy', hi: 'डेज़ी', hiSay: 'Daisy' },
  { emoji: '🏵️', en: 'Marigold', hi: 'गेंदा', hiSay: 'Genda' },
  { emoji: '🌸', en: 'Blossom', hi: 'फूल', hiSay: 'Phool' }
];

/* ---------------- Spelling words (Word Banao) ---------------- */

const SPELL_WORDS = [
  { word: 'CAT', emoji: '🐱', hi: 'बिल्ली', hiSay: 'Billi' },
  { word: 'DOG', emoji: '🐶', hi: 'कुत्ता', hiSay: 'Kutta' },
  { word: 'SUN', emoji: '☀️', hi: 'सूरज', hiSay: 'Sooraj' },
  { word: 'BUS', emoji: '🚌', hi: 'बस', hiSay: 'Bus' },
  { word: 'HAT', emoji: '🎩', hi: 'टोपी', hiSay: 'Topi' },
  { word: 'PEN', emoji: '🖊️', hi: 'कलम', hiSay: 'Kalam' },
  { word: 'BED', emoji: '🛏️', hi: 'बिस्तर', hiSay: 'Bistar' },
  { word: 'CAR', emoji: '🚗', hi: 'गाड़ी', hiSay: 'Gaadi' },
  { word: 'EGG', emoji: '🥚', hi: 'अंडा', hiSay: 'Anda' },
  { word: 'BAG', emoji: '🎒', hi: 'बस्ता', hiSay: 'Basta' },
  { word: 'HEN', emoji: '🐔', hi: 'मुर्गी', hiSay: 'Murgi' },
  { word: 'COW', emoji: '🐄', hi: 'गाय', hiSay: 'Gaay' },
  { word: 'PIG', emoji: '🐷', hi: 'सूअर', hiSay: 'Suar' },
  { word: 'BEE', emoji: '🐝', hi: 'मधुमक्खी', hiSay: 'Madhumakkhi' },
  { word: 'ANT', emoji: '🐜', hi: 'चींटी', hiSay: 'Cheenti' },
  { word: 'BALL', emoji: '⚽', hi: 'गेंद', hiSay: 'Gend' },
  { word: 'FISH', emoji: '🐟', hi: 'मछली', hiSay: 'Machhli' },
  { word: 'STAR', emoji: '⭐', hi: 'तारा', hiSay: 'Tara' },
  { word: 'TREE', emoji: '🌳', hi: 'पेड़', hiSay: 'Ped' },
  { word: 'KITE', emoji: '🪁', hi: 'पतंग', hiSay: 'Patang' },
  { word: 'MOON', emoji: '🌙', hi: 'चाँद', hiSay: 'Chaand' },
  { word: 'MILK', emoji: '🥛', hi: 'दूध', hiSay: 'Doodh' },
  { word: 'CAKE', emoji: '🍰', hi: 'केक', hiSay: 'Cake' }
];

/* ---------------- Rhymes (traditional, public domain) ---------------- */

const RHYMES = [
  {
    id: 'twinkle', lang: 'en', emoji: '⭐',
    title: { en: 'Twinkle Twinkle', hi: 'ट्विंकल ट्विंकल' },
    lines: [
      'Twinkle, twinkle, little star,',
      'How I wonder what you are!',
      'Up above the world so high,',
      'Like a diamond in the sky.',
      'Twinkle, twinkle, little star,',
      'How I wonder what you are!'
    ]
  },
  {
    id: 'baabaa', lang: 'en', emoji: '🐑',
    title: { en: 'Baa Baa Black Sheep', hi: 'बा बा ब्लैक शीप' },
    lines: [
      'Baa, baa, black sheep,',
      'Have you any wool?',
      'Yes sir, yes sir,',
      'Three bags full.',
      'One for the master,',
      'And one for the dame,',
      'And one for the little boy',
      'Who lives down the lane.'
    ]
  },
  {
    id: 'machhli', lang: 'hi', emoji: '🐟',
    title: { en: 'Machhli Jal Ki Rani', hi: 'मछली जल की रानी' },
    lines: [
      { hi: 'मछली जल की रानी है,', hiSay: 'Machhli jal ki rani hai,' },
      { hi: 'जीवन उसका पानी है।', hiSay: 'Jeevan uska paani hai.' },
      { hi: 'हाथ लगाओ डर जाएगी,', hiSay: 'Haath lagao dar jaayegi,' },
      { hi: 'बाहर निकालो मर जाएगी।', hiSay: 'Bahar nikaalo mar jaayegi.' }
    ]
  },
  {
    id: 'chanda', lang: 'hi', emoji: '🌙',
    title: { en: 'Chanda Mama', hi: 'चंदा मामा' },
    lines: [
      { hi: 'चंदा मामा दूर के,', hiSay: 'Chanda mama door ke,' },
      { hi: 'पुए पकाएँ बूर के।', hiSay: 'Pue pakayen boor ke.' },
      { hi: 'आप खाएँ थाली में,', hiSay: 'Aap khayen thaali mein,' },
      { hi: 'मुन्ने को दें प्याली में।', hiSay: 'Munne ko den pyaali mein.' }
    ]
  }
];

/* ---------------- Numbers 1–100 ---------------- */

const HINDI_100 = ['एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
  'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
  'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस', 'तीस',
  'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस', 'चालीस',
  'इकतालीस', 'बयालीस', 'तैंतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास', 'पचास',
  'इक्यावन', 'बावन', 'तिरपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ', 'साठ',
  'इकसठ', 'बासठ', 'तिरसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सड़सठ', 'अड़सठ', 'उनहत्तर', 'सत्तर',
  'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उन्यासी', 'अस्सी',
  'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी', 'नब्बे',
  'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पंचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे', 'सौ'];

const HINDI_100_SAY = ['Ek', 'Do', 'Teen', 'Chaar', 'Paanch', 'Chhah', 'Saat', 'Aath', 'Nau', 'Das',
  'Gyarah', 'Barah', 'Terah', 'Chaudah', 'Pandrah', 'Solah', 'Satrah', 'Atharah', 'Unnees', 'Bees',
  'Ikkees', 'Baees', 'Teis', 'Chaubees', 'Pachchees', 'Chhabbees', 'Sattaees', 'Atthaees', 'Untees', 'Tees',
  'Iktees', 'Battees', 'Taintees', 'Chauntees', 'Paintees', 'Chhattees', 'Saintees', 'Adtees', 'Untaalees', 'Chaalees',
  'Iktaalees', 'Bayaalees', 'Taintaalees', 'Chavaalees', 'Paintaalees', 'Chhiyaalees', 'Saintaalees', 'Adtaalees', 'Unchaas', 'Pachaas',
  'Ikyaavan', 'Baavan', 'Tirpan', 'Chauvan', 'Pachpan', 'Chhappan', 'Sattaavan', 'Atthaavan', 'Unsath', 'Saath',
  'Iksath', 'Baasath', 'Tirsath', 'Chaunsath', 'Painsath', 'Chhiyaasath', 'Sadsath', 'Adsath', 'Unhattar', 'Sattar',
  'Ikhattar', 'Bahattar', 'Tihattar', 'Chauhattar', 'Pachhattar', 'Chhihattar', 'Sathattar', 'Athhattar', 'Unyaasi', 'Assi',
  'Ikyaasi', 'Bayaasi', 'Tiraasi', 'Chauraasi', 'Pachaasi', 'Chhiyaasi', 'Sattaasi', 'Atthaasi', 'Navaasi', 'Nabbe',
  'Ikyaanve', 'Baanve', 'Tiraanve', 'Chauraanve', 'Panchaanve', 'Chhiyaanve', 'Sattaanve', 'Atthaanve', 'Ninyaanve', 'Sau'];

function enNumberName(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (n === 100) return 'One hundred';
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? ' ' + ones[o].toLowerCase() : '');
}

function numPhrase100(n) {
  return phrase(n + '! ' + enNumberName(n) + '!', n + '! ' + HINDI_100[n - 1] + '!', n + '! ' + HINDI_100_SAY[n - 1] + '!');
}

/* ---------------- Puzzle pictures ---------------- */

const PUZZLE_PICS = [
  { emoji: '🦁', en: 'Lion', hi: 'शेर', hiSay: 'Sher' },
  { emoji: '🏠', en: 'House', hi: 'घर', hiSay: 'Ghar' },
  { emoji: '🚗', en: 'Car', hi: 'गाड़ी', hiSay: 'Gaadi' },
  { emoji: '🦋', en: 'Butterfly', hi: 'तितली', hiSay: 'Titli' },
  { emoji: '🌈', en: 'Rainbow', hi: 'इंद्रधनुष', hiSay: 'Indradhanush' },
  { emoji: '🐘', en: 'Elephant', hi: 'हाथी', hiSay: 'Haathi' },
  { emoji: '🌻', en: 'Sunflower', hi: 'सूरजमुखी', hiSay: 'Surajmukhi' },
  { emoji: '🚂', en: 'Train', hi: 'रेलगाड़ी', hiSay: 'Railgaadi' }
];

/* ---------------- Traffic vehicles ---------------- */

const TRAFFIC_CARS = ['🚗', '🚌', '🚚', '🛺', '🚑'];

/* ---------------- Gardener flowers ---------------- */

const GARDEN_BLOOMS = ['🌷', '🌻', '🌹', '🌼', '🌺'];

/* ---------------- New UI strings ---------------- */

Object.assign(T, {
  startBtn: { en: '▶️ Start!', hi: '▶️ शुरू करो!' },
  tabPhal: { en: 'Fruits', hi: 'फल' },
  tabSabzi: { en: 'Veggies', hi: 'सब्ज़ी' },
  findBtn: { en: '🔎 Find it!', hi: '🔎 ढूँढो!' },
  clearBtn: { en: '🧽 Clear', hi: '🧽 साफ़ करो' },
  traceHint: { en: 'Paint over the letter with your finger!', hi: 'ऊँगली से अक्षर के ऊपर रंग भरो!' },
  spellHint: { en: 'Tap the letters in order!', hi: 'अक्षरों को क्रम से दबाओ!' },
  capsmallHint: { en: 'Match BIG with small!', hi: 'बड़े को छोटे से मिलाओ!' },
  shadowHint: { en: 'Match each one with its shadow!', hi: 'हर एक को उसकी परछाई से मिलाओ!' },
  boardHint: { en: 'Tap a number and listen!', hi: 'नंबर दबाओ और सुनो!' },
  clockHint: { en: 'Tap an hour and watch the clock!', hi: 'घंटा दबाओ और घड़ी देखो!' },
  mazeHint: { en: 'Take the bunny to the carrot!', hi: 'खरगोश को गाजर तक ले जाओ!' },
  towerHint: { en: 'Tap to drop the block!', hi: 'ब्लॉक गिराने के लिए दबाओ!' },
  towerMiss: { en: 'Oops! Off the tower! Try again!', hi: 'अरे! गिर गया! फिर से!', hiSay: 'Are! Gir gaya! Phir se!' },
  puzzleHint: { en: 'Tap two pieces to swap them!', hi: 'दो टुकड़े दबाओ, वो बदल जाएँगे!' },
  gardenHint: { en: 'Press and hold to make rain!', hi: 'बारिश के लिए दबाए रखो!' },
  trafficHint: { en: 'GO on green, stop on red!', hi: 'हरी पर चलो, लाल पर रुको!' },
  goBtn: { en: '🚗 GO!', hi: '🚗 चलो!' },
  greenGo: { en: 'Green light! Go go go!', hi: 'हरी बत्ती! चलो चलो!', hiSay: 'Hari batti! Chalo chalo!' },
  redStop: { en: 'Red light! Stop!', hi: 'लाल बत्ती! रुको!', hiSay: 'Laal batti! Ruko!' },
  drawHint: { en: 'Draw with your finger!', hi: 'ऊँगली से बनाओ!' },
  glowBtn: { en: '🌙 Glow', hi: '🌙 चमक' },
  dayBtn: { en: '☀️ Day', hi: '☀️ दिन' },
  popTarget: { en: 'Pop', hi: 'फोड़ो', hiSay: 'phodo' },
  plusBtn: { en: '➕ Addition', hi: '➕ जोड़' },
  minusBtn: { en: '➖ Subtraction', hi: '➖ घटाव' },
  whatTime: { en: 'What time is it?', hi: 'कितने बजे हैं?', hiSay: 'Kitne baje hain?' },
  nextBtn: { en: '⏭️ Next', hi: '⏭️ अगला' },
  playAllBtn: { en: '▶️ Play', hi: '▶️ सुनाओ' },
  stopBtn: { en: '⏸️ Stop', hi: '⏸️ रोको' }
});

const GAME_TITLES2 = {
  tracing: { en: 'Learn Writing', hi: 'लिखना सीखो', hiSay: 'Likhna seekho' },
  spelling: { en: 'Word Banao', hi: 'शब्द बनाओ', hiSay: 'Shabd banao' },
  phonics: { en: 'Phonics', hi: 'फोनिक्स', hiSay: 'Phonics' },
  capsmall: { en: 'Big & Small Aa', hi: 'बड़ा-छोटा Aa', hiSay: 'Bada chhota A' },
  math: { en: 'Jod-Ghatao', hi: 'जोड़-घटाव', hiSay: 'Jod ghatav' },
  board100: { en: 'Ginti 1-100', hi: 'गिनती 1-100', hiSay: 'Ginti ek se sau' },
  clock: { en: 'Clock', hi: 'घड़ी', hiSay: 'Ghadi' },
  tower: { en: 'Tower', hi: 'टावर', hiSay: 'Tower' },
  fruits: { en: 'Fruits & Veggies', hi: 'फल-सब्ज़ी', hiSay: 'Phal sabzi' },
  body: { en: 'Body Parts', hi: 'शरीर के अंग', hiSay: 'Shareer ke ang' },
  objects: { en: 'Everyday Things', hi: 'रोज़ की चीज़ें', hiSay: 'Roz ki cheezein' },
  flowers: { en: 'Flowers', hi: 'फूल', hiSay: 'Phool' },
  traffic: { en: 'Traffic', hi: 'ट्रैफिक', hiSay: 'Traffic' },
  puzzle: { en: 'Puzzle', hi: 'पज़ल', hiSay: 'Puzzle' },
  maze: { en: 'Maze', hi: 'भूलभुलैया', hiSay: 'Bhool bhulaiya' },
  shadow: { en: 'Shadow Match', hi: 'परछाई मिलाओ', hiSay: 'Parchhai milao' },
  skypop: { en: 'Sky Pop', hi: 'स्काई पॉप', hiSay: 'Sky pop' },
  drawing: { en: 'Drawing', hi: 'ड्राइंग', hiSay: 'Drawing' },
  gardener: { en: 'Gardener', hi: 'माली', hiSay: 'Maali' },
  rhymes: { en: 'Rhymes', hi: 'कविताएँ', hiSay: 'Kavitayen' }
};
Object.assign(GAME_TITLES, GAME_TITLES2);

/* ---------------- Devanagari varnamala ---------------- */
// word/emoji empty => the tile shows the letter alone (nasals & rare letters).
// Spoken via sayPhrase: Devanagari with a hi-IN voice, romanized fallback otherwise.

const VARNAMALA = [
  { ch: 'अ', roman: 'A', word: 'अनानास', wordSay: 'Ananas', emoji: '🍍' },
  { ch: 'आ', roman: 'Aa', word: 'आम', wordSay: 'Aam', emoji: '🥭' },
  { ch: 'इ', roman: 'I', word: 'इमारत', wordSay: 'Imarat', emoji: '🏢' },
  { ch: 'ई', roman: 'Ee', word: 'ईंट', wordSay: 'Eent', emoji: '🧱' },
  { ch: 'उ', roman: 'U', word: 'उल्लू', wordSay: 'Ullu', emoji: '🦉' },
  { ch: 'ऊ', roman: 'Oo', word: 'ऊन', wordSay: 'Oon', emoji: '🧶' },
  { ch: 'ऋ', roman: 'Ri', word: 'ऋषि', wordSay: 'Rishi', emoji: '🧘' },
  { ch: 'ए', roman: 'E', word: 'एड़ी', wordSay: 'Edi', emoji: '🦶' },
  { ch: 'ऐ', roman: 'Ai', word: 'ऐनक', wordSay: 'Ainak', emoji: '👓' },
  { ch: 'ओ', roman: 'O', word: 'ओस', wordSay: 'Os', emoji: '💧' },
  { ch: 'औ', roman: 'Au', word: 'औरत', wordSay: 'Aurat', emoji: '👩' },
  { ch: 'अं', roman: 'An', word: 'अंडा', wordSay: 'Anda', emoji: '🥚' },
  { ch: 'क', roman: 'Ka', word: 'कमल', wordSay: 'Kamal', emoji: '🪷' },
  { ch: 'ख', roman: 'Kha', word: 'खरगोश', wordSay: 'Khargosh', emoji: '🐰' },
  { ch: 'ग', roman: 'Ga', word: 'गमला', wordSay: 'Gamla', emoji: '🪴' },
  { ch: 'घ', roman: 'Gha', word: 'घर', wordSay: 'Ghar', emoji: '🏠' },
  { ch: 'ङ', roman: 'Nga', word: '', wordSay: '', emoji: '' },
  { ch: 'च', roman: 'Cha', word: 'चम्मच', wordSay: 'Chammach', emoji: '🥄' },
  { ch: 'छ', roman: 'Chha', word: 'छाता', wordSay: 'Chhata', emoji: '☂️' },
  { ch: 'ज', roman: 'Ja', word: 'जहाज', wordSay: 'Jahaaj', emoji: '✈️' },
  { ch: 'झ', roman: 'Jha', word: 'झंडा', wordSay: 'Jhanda', emoji: '🚩' },
  { ch: 'ञ', roman: 'Nya', word: '', wordSay: '', emoji: '' },
  { ch: 'ट', roman: 'Ta', word: 'टमाटर', wordSay: 'Tamatar', emoji: '🍅' },
  { ch: 'ठ', roman: 'Tha', word: 'ठेला', wordSay: 'Thela', emoji: '🛒' },
  { ch: 'ड', roman: 'Da', word: 'डमरू', wordSay: 'Damru', emoji: '🥁' },
  { ch: 'ढ', roman: 'Dha', word: 'ढोल', wordSay: 'Dhol', emoji: '🪘' },
  { ch: 'ण', roman: 'Na', word: '', wordSay: '', emoji: '' },
  { ch: 'त', roman: 'Ta', word: 'तरबूज', wordSay: 'Tarbooj', emoji: '🍉' },
  { ch: 'थ', roman: 'Tha', word: 'थैला', wordSay: 'Thaila', emoji: '👜' },
  { ch: 'द', roman: 'Da', word: 'दरवाज़ा', wordSay: 'Darwaza', emoji: '🚪' },
  { ch: 'ध', roman: 'Dha', word: 'धनुष', wordSay: 'Dhanush', emoji: '🏹' },
  { ch: 'न', roman: 'Na', word: 'नल', wordSay: 'Nal', emoji: '🚰' },
  { ch: 'प', roman: 'Pa', word: 'पतंग', wordSay: 'Patang', emoji: '🪁' },
  { ch: 'फ', roman: 'Pha', word: 'फल', wordSay: 'Phal', emoji: '🍎' },
  { ch: 'ब', roman: 'Ba', word: 'बतख', wordSay: 'Batakh', emoji: '🦆' },
  { ch: 'भ', roman: 'Bha', word: 'भालू', wordSay: 'Bhaalu', emoji: '🐻' },
  { ch: 'म', roman: 'Ma', word: 'मछली', wordSay: 'Machhli', emoji: '🐟' },
  { ch: 'य', roman: 'Ya', word: 'यान', wordSay: 'Yaan', emoji: '🚀' },
  { ch: 'र', roman: 'Ra', word: 'राजा', wordSay: 'Raja', emoji: '🤴' },
  { ch: 'ल', roman: 'La', word: 'लोमड़ी', wordSay: 'Lomdi', emoji: '🦊' },
  { ch: 'व', roman: 'Va', word: 'वन', wordSay: 'Van', emoji: '🌲' },
  { ch: 'श', roman: 'Sha', word: 'शेर', wordSay: 'Sher', emoji: '🦁' },
  { ch: 'ष', roman: 'Sha', word: '', wordSay: '', emoji: '' },
  { ch: 'स', roman: 'Sa', word: 'सूरज', wordSay: 'Sooraj', emoji: '☀️' },
  { ch: 'ह', roman: 'Ha', word: 'हाथी', wordSay: 'Haathi', emoji: '🐘' },
  { ch: 'क्ष', roman: 'Ksha', word: 'क्षत्रिय', wordSay: 'Kshatriya', emoji: '⚔️' },
  { ch: 'त्र', roman: 'Tra', word: 'त्रिशूल', wordSay: 'Trishul', emoji: '🔱' },
  { ch: 'ज्ञ', roman: 'Gya', word: 'ज्ञान', wordSay: 'Gyaan', emoji: '📖' }
];

function varnaPhrase(v) {
  if (!v.word) return phrase(v.roman + '!', v.ch + '!', v.roman + '!');
  return phrase(
    v.roman + '! ' + v.roman + ' se ' + v.wordSay + '!',
    v.ch + '! ' + v.ch + ' से ' + v.word + '!',
    v.roman + '! ' + v.roman + ' se ' + v.wordSay + '!'
  );
}

/* ---------------- Sticker book ---------------- */
// Sticker i unlocks at (i+1)*25 stars — derived from the star count, nothing extra stored.

const STICKER_STEP = 25;
const STICKERS = [
  { emoji: '⚽', en: 'Ball', hi: 'गेंद', hiSay: 'Gend' },
  { emoji: '🌟', en: 'Star', hi: 'सितारा', hiSay: 'Sitara' },
  { emoji: '🪁', en: 'Kite', hi: 'पतंग', hiSay: 'Patang' },
  { emoji: '🎂', en: 'Cake', hi: 'केक', hiSay: 'Cake' },
  { emoji: '🦜', en: 'Parrot', hi: 'तोता', hiSay: 'Tota' },
  { emoji: '⛵', en: 'Boat', hi: 'नाव', hiSay: 'Naav' },
  { emoji: '🌈', en: 'Rainbow', hi: 'इंद्रधनुष', hiSay: 'Indradhanush' },
  { emoji: '🧸', en: 'Teddy', hi: 'टेडी', hiSay: 'Teddy' },
  { emoji: '🍭', en: 'Lollipop', hi: 'लॉलीपॉप', hiSay: 'Lollipop' },
  { emoji: '🐬', en: 'Dolphin', hi: 'डॉल्फिन', hiSay: 'Dolphin' },
  { emoji: '🎠', en: 'Carousel', hi: 'झूला', hiSay: 'Jhoola' },
  { emoji: '🦚', en: 'Peacock', hi: 'मोर', hiSay: 'Mor' },
  { emoji: '🛸', en: 'UFO', hi: 'यूएफओ', hiSay: 'UFO' },
  { emoji: '🎪', en: 'Circus', hi: 'सर्कस', hiSay: 'Circus' },
  { emoji: '🪄', en: 'Magic wand', hi: 'जादू की छड़ी', hiSay: 'Jaadu ki chhadi' },
  { emoji: '👑', en: 'Crown', hi: 'मुकुट', hiSay: 'Mukut' },
  { emoji: '🚀', en: 'Rocket', hi: 'रॉकेट', hiSay: 'Rocket' },
  { emoji: '🦖', en: 'Dino', hi: 'डायनासोर', hiSay: 'Dinosaur' },
  { emoji: '🦄', en: 'Unicorn', hi: 'यूनिकॉर्न', hiSay: 'Unicorn' },
  { emoji: '🏆', en: 'Trophy', hi: 'ट्रॉफी', hiSay: 'Trophy' }
];

Object.assign(T, {
  newVersion: { en: 'New version ready — reopen the game to update!', hi: 'नया वर्ज़न आ गया — गेम दोबारा खोलें!' },
  newSticker: { en: 'New sticker unlocked!', hi: 'नया स्टिकर मिला!' },
  stickerHint: { en: 'Earn 25 stars for each new sticker!', hi: 'हर नए स्टिकर के लिए 25 स्टार कमाओ!' }
});

GAME_TITLES.stickers = { en: 'Sticker Book', hi: 'स्टिकर बुक', hiSay: 'Sticker book' };
