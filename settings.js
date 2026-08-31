'use strict';
/* ================================================================
   settings.js — ⚙️ Voice & Sound settings (for parents): pick the
   English/Hindi voice, test it, and set the speaking speed.
   ================================================================ */

const settingsScreen = (() => {
  buildScreen('settings',
    '<h2 class="set-title" data-t="settingsTitle"></h2>' +
    '<div class="set-block"><h3 data-t="enVoiceLabel"></h3>' +
    '<div id="set-en-list" class="voice-list"></div>' +
    '<button id="set-en-test" class="big-btn alt set-test">🔊 <span data-t="testBtn"></span></button></div>' +
    '<div class="set-block"><h3 data-t="hiVoiceLabel"></h3>' +
    '<div id="set-hi-list" class="voice-list"></div>' +
    '<div id="set-hi-missing" class="set-missing" hidden>' +
    '<b data-t="hiMissingTitle"></b><p data-t="hiMissingBody"></p></div>' +
    '<button id="set-hi-test" class="big-btn alt set-test">🔊 <span data-t="testBtn"></span></button></div>' +
    '<div class="set-block"><h3 data-t="speedLabel"></h3>' +
    '<div id="set-speed" class="speed-chips">' +
    '<button class="speed-chip" data-rate="0.7" data-t="slowChip"></button>' +
    '<button class="speed-chip" data-rate="0.85" data-t="normalChip"></button>' +
    '<button class="speed-chip" data-rate="1" data-t="fastChip"></button></div></div>');

  function voiceRow(kind, v, currentURI) {
    const b = document.createElement('button');
    b.className = 'voice-opt' + (v.voiceURI === currentURI ? ' selected' : '');
    b.innerHTML = '<span class="vo-name"></span><span class="vo-lang"></span>';
    b.querySelector('.vo-name').textContent = v.name;
    b.querySelector('.vo-lang').textContent = v.lang;
    b.addEventListener('click', () => {
      sfx.pop();
      speech.setPreferred(kind, v.voiceURI);
      render();
    });
    return b;
  }

  function fillList(kind, el) {
    el.innerHTML = '';
    const voices = speech.list(kind);
    const cur = speech.current()[kind];
    const curURI = cur ? cur.voiceURI : '';
    if (!voices.length) {
      const p = document.createElement('p');
      p.className = 'hint';
      p.textContent = T.noVoices[store.getLang()];
      el.appendChild(p);
      return 0;
    }
    voices.slice(0, 8).forEach((v) => el.appendChild(voiceRow(kind, v, curURI)));
    return voices.length;
  }

  function render() {
    const lang = store.getLang();
    document.querySelectorAll('#screen-settings [data-t]').forEach((el) => {
      const s = T[el.dataset.t];
      if (s && s[lang]) el.textContent = s[lang];
    });
    fillList('en', $('set-en-list'));
    const hiCount = fillList('hi', $('set-hi-list'));
    $('set-hi-missing').hidden = hiCount > 0;
    document.querySelectorAll('#set-speed .speed-chip').forEach((c) => {
      c.classList.toggle('selected', Math.abs(parseFloat(c.dataset.rate) - store.getRate()) < 0.01);
    });
  }

  $('set-en-test').addEventListener('click', () => {
    speech.testVoice('en', 'Hello! A for Apple! One, two, three!');
  });
  $('set-hi-test').addEventListener('click', () => {
    speech.testVoice('hi', 'नमस्ते! क से कमल! एक, दो, तीन!');
  });
  document.querySelectorAll('#set-speed .speed-chip').forEach((c) => {
    c.addEventListener('click', () => {
      sfx.pop();
      store.setRate(parseFloat(c.dataset.rate));
      render();
      const hi = store.getLang() === 'hi';
      speech.testVoice(hi ? 'hi' : 'en', hi ? 'एक, दो, तीन, चार, पाँच!' : 'One, two, three, four, five!');
    });
  });
  try {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      if (currentScreen === 'screen-settings') render();
    });
  } catch (e) { /* no speech support */ }

  $('btn-settings').addEventListener('click', () => {
    sfx.pop();
    render();
    showScreen('screen-settings');
    navPush('screen-settings');
  });

  return { render };
})();
