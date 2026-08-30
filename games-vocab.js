'use strict';
/* ================================================================
   games-vocab.js — vocabulary pack games (learn grid + find-quiz),
   built on the shared quiz engine from app.js.
   ================================================================ */

function makeVocabPack(id, cfg) {
  const hasTabs = cfg.groups.length > 1;
  buildScreen(id,
    (hasTabs
      ? '<div class="tabs" id="' + id + '-tabs">' + cfg.groups.map((g, i) =>
        '<button class="tab' + (i === 0 ? ' active' : '') + '" data-tab="' + g.key + '"></button>').join('') + '</div>'
      : '') +
    '<div id="' + id + '-grid" class="tile-grid"></div>' +
    '<button id="' + id + '-quiz" class="big-btn quiz-btn" data-t="quizBtn"></button>');

  const state = { tab: cfg.groups[0].key };
  const items = () => cfg.groups.find((g) => g.key === state.tab).items;

  function render() {
    const lang = store.getLang();
    if (hasTabs) {
      document.querySelectorAll('#' + id + '-tabs .tab').forEach((t) => {
        const g = cfg.groups.find((x) => x.key === t.dataset.tab);
        t.textContent = g.tab[lang];
        t.classList.toggle('active', t.dataset.tab === state.tab);
      });
    }
    const grid = $(id + '-grid');
    grid.innerHTML = '';
    items().forEach((it) => {
      const b = document.createElement('button');
      b.className = 'tile vocab-tile';
      b.innerHTML = '<span class="t-big">' + it.emoji + '</span><span class="t-word">' + it[lang] + '</span>';
      b.addEventListener('click', () => { sfx.pop(); popIt(b); sayPhrase(wordPhrase(it)); });
      grid.appendChild(b);
    });
    $(id + '-quiz').textContent = T.quizBtn[lang];
  }

  function make() {
    const three = sample(items(), 3);
    const ans = three[0];
    return {
      key: id + ans.en,
      prompt: phrase('Find the ' + ans.en.toLowerCase() + '!', ans.hi + ' ढूँढो!', (ans.hiSay || ans.en) + ' dhoondho!'),
      extra: '',
      choices: shuffle(three).map((it) => ({ key: it.en, html: '<span>' + it.emoji + '</span>' })),
      answer: ans.en,
      answerPhrase: wordPhrase(ans)
    };
  }

  if (hasTabs) {
    document.querySelectorAll('#' + id + '-tabs .tab').forEach((t) => {
      t.addEventListener('click', () => { sfx.pop(); state.tab = t.dataset.tab; render(); });
    });
  }
  $(id + '-quiz').addEventListener('click', () => {
    quiz.start({ make, backTo: 'screen-' + id });
  });

  GAMES[id] = { emoji: cfg.emoji, color: cfg.color, screen: 'screen-' + id, enter: render, onLang: render };
}

makeVocabPack('fruits', {
  emoji: '🍎', color: 'var(--coral)',
  groups: [
    { key: 'phal', tab: T.tabPhal, items: PACK_FRUITS },
    { key: 'sabzi', tab: T.tabSabzi, items: PACK_VEGGIES }
  ]
});
makeVocabPack('body', { emoji: '🙋', color: 'var(--tangerine)', groups: [{ key: 'all', items: PACK_BODY }] });
makeVocabPack('objects', { emoji: '🏠', color: 'var(--sky)', groups: [{ key: 'all', items: PACK_OBJECTS }] });
makeVocabPack('flowers', { emoji: '🌸', color: 'var(--lilac)', groups: [{ key: 'all', items: PACK_FLOWERS }] });
