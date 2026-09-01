'use strict';
/* ================================================================
   parent.js — 👪 Parent Corner: what the child has been playing,
   how long, and a gentle screen-time limit. No PIN, no lock — this
   is a window for the grown-ups, not a gate.
   ================================================================ */

Object.assign(T, {
  parentTitle: { en: '👪 Parent Corner', hi: '👪 माता-पिता कोना' },
  pcTime: { en: 'Play time this week', hi: 'इस हफ़्ते कितना खेला' },
  pcProgress: { en: 'Progress', hi: 'प्रगति' },
  pcTop: { en: 'Played the most', hi: 'सबसे ज़्यादा खेले' },
  pcNew: { en: 'Not tried yet', hi: 'अभी तक नहीं खेला' },
  pcLimit: { en: 'Daily play limit', hi: 'रोज़ का समय' },
  pcLimitOff: { en: 'Off', hi: 'बंद' },
  pcReset: { en: '♻️ Reset stars', hi: '♻️ स्टार रीसेट करो' },
  pcResetSure: { en: '♻️ Tap again to reset', hi: '♻️ पक्का? फिर से दबाओ' },
  pcResetDone: { en: 'Stars reset. Fresh start!', hi: 'स्टार रीसेट हो गए। नई शुरुआत!' },
  pcNothingYet: { en: 'Nothing yet — go and play!', hi: 'अभी कुछ नहीं — जाओ खेलो!' },
  pcAllPlayed: { en: 'Every single game has been tried. Wah!', hi: 'सारे खेल खेल लिए। वाह!' }
});

const parentScreen = (() => {
  buildScreen('parent',
    '<h2 class="set-title" data-t="parentTitle"></h2>' +
    '<div class="set-block"><h3 data-t="pcTime"></h3>' +
    '<div id="pc-week" class="pc-week" data-today="0"></div></div>' +
    '<div class="set-block"><h3 data-t="pcProgress"></h3>' +
    '<div id="pc-stats" class="pc-stats" data-stars="0"></div></div>' +
    '<div class="set-block"><h3 data-t="pcTop"></h3>' +
    '<div id="pc-top" class="pc-list"></div></div>' +
    '<div class="set-block"><h3 data-t="pcNew"></h3>' +
    '<div id="pc-new" class="pc-list"></div></div>' +
    '<div class="set-block"><h3 data-t="pcLimit"></h3>' +
    '<div id="pc-limit" class="speed-chips" data-min="0">' +
    '<button class="speed-chip" data-min="0" data-t="pcLimitOff"></button>' +
    '<button class="speed-chip" data-min="15">15 min</button>' +
    '<button class="speed-chip" data-min="30">30 min</button>' +
    '<button class="speed-chip" data-min="45">45 min</button>' +
    '</div></div>' +
    '<div class="set-block pc-actions">' +
    '<button id="btn-settings" class="big-btn alt" data-t="settingsBtn"></button>' +
    '<button id="pc-reset" class="big-btn alt" data-t="pcReset"></button>' +
    '</div>');

  const DAY_SHORT = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
  };

  let resetArmed = false;

  const mins = (sec) => Math.round(sec / 60);

  function allGameIds() {
    return HOME_SECTIONS.reduce((a, s) => a.concat(s.games.filter((id) => GAMES[id])), []);
  }

  function gameRow(id, note) {
    const row = document.createElement('div');
    row.className = 'pc-row';
    row.dataset.game = id;
    row.innerHTML = '<span class="pc-emoji">' + GAMES[id].emoji + '</span>' +
      '<span class="pc-name"></span><span class="pc-note"></span>';
    row.querySelector('.pc-name').textContent = GAME_TITLES[id][store.getLang()];
    row.querySelector('.pc-note').textContent = note || '';
    return row;
  }

  function emptyNote(key) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = T[key][store.getLang()];
    return p;
  }

  function renderWeek() {
    const lang = store.getLang();
    const times = store.times();
    const box = $('pc-week');
    box.innerHTML = '';
    box.dataset.today = String(mins(store.todaySeconds()));
    let most = 1;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const sec = times[dayKey(d)] || 0;
      most = Math.max(most, sec);
      days.push({ d, sec });
    }
    days.forEach((x, i) => {
      const col = document.createElement('div');
      col.className = 'pc-day' + (i === 6 ? ' today' : '');
      const bar = document.createElement('div');
      bar.className = 'pc-bar';
      bar.style.height = Math.max(4, Math.round((x.sec / most) * 80)) + 'px';
      const val = document.createElement('span');
      val.className = 'pc-min';
      val.textContent = x.sec ? mins(x.sec) : '';
      const lab = document.createElement('span');
      lab.className = 'pc-dayname';
      lab.textContent = DAY_SHORT[lang][x.d.getDay()];
      col.appendChild(val);
      col.appendChild(bar);
      col.appendChild(lab);
      box.appendChild(col);
    });
  }

  function renderStats() {
    const lang = store.getLang();
    const stars = store.getStars();
    const plays = store.plays();
    const played = Object.keys(plays).filter((id) => GAMES[id]).length;
    const total = allGameIds().length;
    const stickers = (typeof STICKERS !== 'undefined')
      ? Math.min(Math.floor(stars / STICKER_STEP), STICKERS.length) : 0;
    const box = $('pc-stats');
    box.dataset.stars = String(stars);
    box.dataset.played = String(played);
    box.innerHTML = '';
    [
      ['⭐', stars, lang === 'hi' ? 'स्टार' : 'stars'],
      ['🏆', stickers, lang === 'hi' ? 'स्टिकर' : 'stickers'],
      ['🔥', store.streak().n, lang === 'hi' ? 'दिन लगातार' : 'day streak'],
      ['🎮', played + '/' + total, lang === 'hi' ? 'खेल खेले' : 'games tried']
    ].forEach((s) => {
      const c = document.createElement('div');
      c.className = 'pc-stat';
      c.innerHTML = '<span class="pc-stat-big"></span><span class="pc-stat-lab"></span>';
      c.querySelector('.pc-stat-big').textContent = s[0] + ' ' + s[1];
      c.querySelector('.pc-stat-lab').textContent = s[2];
      box.appendChild(c);
    });
  }

  function renderLists() {
    const lang = store.getLang();
    const plays = store.plays();
    const ids = allGameIds();

    const top = $('pc-top');
    top.innerHTML = '';
    const ranked = ids.filter((id) => plays[id]).sort((a, b) => plays[b].n - plays[a].n).slice(0, 5);
    if (!ranked.length) top.appendChild(emptyNote('pcNothingYet'));
    ranked.forEach((id) => {
      top.appendChild(gameRow(id, plays[id].n + '×'));
    });

    const fresh = $('pc-new');
    fresh.innerHTML = '';
    const never = ids.filter((id) => !plays[id]);
    if (!never.length) fresh.appendChild(emptyNote('pcAllPlayed'));
    // A rotating handful, so the same five are not suggested forever.
    sample(never, Math.min(5, never.length)).forEach((id) => fresh.appendChild(gameRow(id, '')));
    fresh.dataset.left = String(never.length);
    void lang;
  }

  function renderLimit() {
    const cur = store.getLimit();
    $('pc-limit').dataset.min = String(cur);
    document.querySelectorAll('#pc-limit .speed-chip').forEach((c) => {
      c.classList.toggle('selected', Number(c.dataset.min) === cur);
    });
  }

  function render() {
    document.querySelectorAll('#screen-parent [data-t]').forEach((el) => {
      const s = T[el.dataset.t];
      if (s && s[store.getLang()]) el.textContent = s[store.getLang()];
    });
    resetArmed = false;
    renderWeek();
    renderStats();
    renderLists();
    renderLimit();
  }

  document.querySelectorAll('#pc-limit .speed-chip').forEach((c) => {
    c.addEventListener('click', () => {
      sfx.pop();
      store.setLimit(Number(c.dataset.min));
      renderLimit();
    });
  });

  // Two taps to reset, so a stray tap never wipes a month of stars.
  $('pc-reset').addEventListener('click', () => {
    const btn = $('pc-reset');
    const lang = store.getLang();
    if (!resetArmed) {
      resetArmed = true;
      sfx.pop();
      btn.textContent = T.pcResetSure[lang];
      btn.classList.add('armed');
      setTimeout(() => {
        if (!resetArmed) return;
        resetArmed = false;
        btn.textContent = T.pcReset[lang];
        btn.classList.remove('armed');
      }, 5000);
      return;
    }
    resetArmed = false;
    store.resetStars();
    sfx.flip();
    btn.textContent = T.pcReset[lang];
    btn.classList.remove('armed');
    toast(T.pcResetDone[lang]);
    render();
  });

  $('btn-parent').addEventListener('click', () => {
    sfx.pop();
    render();
    showScreen('screen-parent');
    navPush('screen-parent');
  });

  screenRefreshers['screen-parent'] = render;

  return { render };
})();
