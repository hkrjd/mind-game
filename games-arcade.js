'use strict';
/* ================================================================
   games-arcade.js — playful games: Sky Pop, Maze, Tower, Puzzle,
   Gardener, Traffic, Drawing.
   ================================================================ */

/* ================= Sky Pop ================= */

const skypopGame = (() => {
  buildScreen('skypop',
    '<div class="tabs" id="skypop-tabs">' +
    '<button class="tab active" data-tab="numbers">123</button>' +
    '<button class="tab" data-tab="letters">ABC</button></div>' +
    '<div id="skypop-prompt"><button id="skypop-say" aria-label="Repeat">🔊</button>' +
    '<span id="skypop-target-text"></span></div>' +
    '<div id="skypop-area" data-target="" data-popped="0"></div>');

  const state = { tab: 'numbers', target: '', popped: 0, running: false, raf: 0, bubbles: [], lastSpawn: 0, lastWrong: 0, prevTs: 0, hue: 0 };

  const pool = () => state.tab === 'numbers'
    ? NUMBERS.map((n) => String(n.n))
    : LETTERS.map((l) => l.ch);

  function pickTarget(speakIt) {
    let t = rand(pool());
    if (t === state.target) t = rand(pool());
    state.target = t;
    $('skypop-area').dataset.target = t;
    $('skypop-target-text').textContent = store.getLang() === 'hi' ? t + ' फोड़ो!' : 'Pop ' + t + '!';
    if (speakIt !== false) speakTarget();
  }

  function speakTarget() {
    sayPhrase(phrase('Pop ' + state.target + '!', state.target + ' फोड़ो!', state.target + ' phodo!'));
  }

  function spawn() {
    const area = $('skypop-area');
    const hasTarget = state.bubbles.some((b) => b.label === state.target);
    const label = (!hasTarget && Math.random() < 0.55) ? state.target : rand(pool());
    const el = document.createElement('button');
    el.className = 'bubble bubble-c' + (state.hue++ % 5);
    el.textContent = label;
    el.style.left = (4 + Math.random() * 78) + '%';
    area.appendChild(el);
    const b = { el, label, y: -90, speed: 42 + Math.random() * 40 };
    el.addEventListener('click', () => tap(b));
    state.bubbles.push(b);
  }

  function tap(b) {
    if (!state.running || b.gone) return;
    if (b.label === state.target) {
      b.gone = true;
      b.el.classList.add('popped');
      b.el.style.transition = 'transform .25s ease, opacity .25s ease';
      b.el.style.transform = 'translateY(' + (-b.y) + 'px) scale(1.6)';
      b.el.style.opacity = '0';
      sfx.correct();
      store.addStars(1);
      starFly(b.el);
      setTimeout(() => removeBubble(b), 260);
      state.popped++;
      $('skypop-area').dataset.popped = String(state.popped);
      if (state.popped >= 5) {
        stop();
        setTimeout(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 500);
      } else {
        setTimeout(() => pickTarget(), 700);
      }
    } else {
      sfx.wrong();
      b.el.classList.add('wiggle');
      b.el.addEventListener('animationend', () => b.el.classList.remove('wiggle'), { once: true });
      const now = Date.now();
      if (now - state.lastWrong > 2000) {
        state.lastWrong = now;
        sayPhrase(rand(ENCOURAGE));
      }
    }
  }

  function removeBubble(b) {
    b.el.remove();
    state.bubbles = state.bubbles.filter((x) => x !== b);
  }

  function loop(ts) {
    if (!state.running) return;
    const dt = state.prevTs ? Math.min((ts - state.prevTs) / 1000, 0.06) : 0.016;
    state.prevTs = ts;
    const areaH = $('skypop-area').clientHeight;
    if (state.bubbles.length < 6 && ts - state.lastSpawn > 650) {
      state.lastSpawn = ts;
      spawn();
    }
    state.bubbles.slice().forEach((b) => {
      if (b.gone) return;
      b.y += b.speed * dt * (REDUCED ? 0.5 : 1);
      b.el.style.transform = 'translateY(' + (-b.y) + 'px)';
      if (b.y > areaH + 140) removeBubble(b);
    });
    state.raf = requestAnimationFrame(loop);
  }

  function start() {
    stop();
    state.popped = 0;
    state.prevTs = 0;
    state.lastSpawn = 0;
    $('skypop-area').dataset.popped = '0';
    pickTarget(false);
    speakTarget();
    state.running = true;
    // Warm start: the sky should never look empty — three bubbles already rising,
    // with the target guaranteed among them.
    for (let i = 0; i < 3; i++) {
      spawn();
      const b = state.bubbles[state.bubbles.length - 1];
      b.y = 70 + i * 120;
      b.el.style.transform = 'translateY(' + (-b.y) + 'px)';
    }
    if (!state.bubbles.some((b) => b.label === state.target)) {
      const b = state.bubbles[0];
      b.label = state.target;
      b.el.textContent = state.target;
    }
    state.raf = requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    state.bubbles.forEach((b) => b.el.remove());
    state.bubbles = [];
  }

  document.querySelectorAll('#skypop-tabs .tab').forEach((t) => {
    t.addEventListener('click', () => {
      sfx.pop();
      state.tab = t.dataset.tab;
      document.querySelectorAll('#skypop-tabs .tab').forEach((x) => x.classList.toggle('active', x === t));
      start();
    });
  });
  $('skypop-say').addEventListener('click', () => { sfx.pop(); speakTarget(); });

  return {
    enter: start,
    onLeave: stop,
    onLang() { pickTarget(false); }
  };
})();

GAMES.skypop = {
  emoji: '🎈', color: 'var(--sky)', screen: 'screen-skypop',
  enter() { skypopGame.enter(); }, onLeave() { skypopGame.onLeave(); }, onLang() { skypopGame.onLang(); }
};

/* ================= Maze ================= */

const mazeGame = (() => {
  buildScreen('maze',
    '<p class="hint" data-t="mazeHint"></p>' +
    '<div id="maze-dots"></div>' +
    '<div id="maze-grid" data-level="1" data-pos="0,0" data-size="5" data-solved="0"></div>' +
    '<div id="maze-arrows">' +
    '<button class="maze-arrow" data-d="up" aria-label="Up">⬆️</button>' +
    '<div class="maze-arrow-row">' +
    '<button class="maze-arrow" data-d="left" aria-label="Left">⬅️</button>' +
    '<button class="maze-arrow" data-d="down" aria-label="Down">⬇️</button>' +
    '<button class="maze-arrow" data-d="right" aria-label="Right">➡️</button></div></div>');

  const SIZES = [5, 6, 7, 8, 8];
  const state = { level: 0, n: 5, cells: [], pos: 0, busy: false };

  function genMaze(n) {
    const cells = Array.from({ length: n * n }, () => ({ N: 1, E: 1, S: 1, W: 1 }));
    const seen = new Array(n * n).fill(false);
    const stack = [0];
    seen[0] = true;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const r = Math.floor(cur / n);
      const c = cur % n;
      const nbrs = [];
      if (r > 0 && !seen[(r - 1) * n + c]) nbrs.push(['N', (r - 1) * n + c, 'S']);
      if (c < n - 1 && !seen[r * n + c + 1]) nbrs.push(['E', r * n + c + 1, 'W']);
      if (r < n - 1 && !seen[(r + 1) * n + c]) nbrs.push(['S', (r + 1) * n + c, 'N']);
      if (c > 0 && !seen[r * n + c - 1]) nbrs.push(['W', r * n + c - 1, 'E']);
      if (!nbrs.length) { stack.pop(); continue; }
      const pick = rand(nbrs);
      cells[cur][pick[0]] = 0;
      cells[pick[1]][pick[2]] = 0;
      seen[pick[1]] = true;
      stack.push(pick[1]);
    }
    return cells;
  }

  function dots() {
    const d = $('maze-dots');
    d.innerHTML = '';
    for (let k = 0; k < SIZES.length; k++) {
      const s = document.createElement('span');
      s.className = 'dot' + (k < state.level ? ' filled' : '');
      d.appendChild(s);
    }
  }

  function drawIcons() {
    const grid = $('maze-grid');
    const goal = state.n * state.n - 1;
    Array.from(grid.children).forEach((cell, i) => {
      cell.textContent = i === state.pos ? '🐰' : (i === goal ? '🥕' : '');
    });
    grid.dataset.pos = Math.floor(state.pos / state.n) + ',' + (state.pos % state.n);
  }

  function build() {
    state.n = SIZES[state.level];
    state.cells = genMaze(state.n);
    state.pos = 0;
    state.busy = false;
    dots();
    const grid = $('maze-grid');
    grid.dataset.level = String(state.level + 1);
    grid.dataset.size = String(state.n);
    grid.dataset.solved = '0';
    grid.style.gridTemplateColumns = 'repeat(' + state.n + ', 1fr)';
    grid.innerHTML = '';
    state.cells.forEach((cell) => {
      const d = document.createElement('div');
      d.className = 'maze-cell' +
        (cell.N ? ' wN' : '') + (cell.E ? ' wE' : '') +
        (cell.S ? ' wS' : '') + (cell.W ? ' wW' : '');
      d.dataset.walls = (cell.N ? 'N' : '') + (cell.E ? 'E' : '') + (cell.S ? 'S' : '') + (cell.W ? 'W' : '');
      grid.appendChild(d);
    });
    drawIcons();
  }

  function move(dir) {
    if (state.busy) return;
    const n = state.n;
    const cell = state.cells[state.pos];
    const r = Math.floor(state.pos / n);
    const c = state.pos % n;
    let next = -1;
    if (dir === 'up' && r > 0 && !cell.N) next = state.pos - n;
    if (dir === 'down' && r < n - 1 && !cell.S) next = state.pos + n;
    if (dir === 'left' && c > 0 && !cell.W) next = state.pos - 1;
    if (dir === 'right' && c < n - 1 && !cell.E) next = state.pos + 1;
    if (next < 0) {
      sfx.wrong();
      return;
    }
    sfx.flip();
    state.pos = next;
    drawIcons();
    if (state.pos === n * n - 1) {
      state.busy = true;
      $('maze-grid').dataset.solved = '1';
      sfx.correct();
      store.addStars(1);
      starFly($('maze-grid'));
      confetti(14);
      sayPhrase(rand(PRAISE));
      state.level++;
      dots();
      setTimeout(() => {
        if (state.level >= SIZES.length) {
          celebrate({ again: () => { hideCelebrate(); start(); } });
        } else {
          build();
        }
      }, 1400);
    }
  }

  function start() {
    state.level = 0;
    build();
  }

  document.querySelectorAll('#maze-arrows .maze-arrow').forEach((b) => {
    b.addEventListener('click', () => move(b.dataset.d));
  });
  document.addEventListener('keydown', (e) => {
    if (currentScreen !== 'screen-maze') return;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key]) {
      e.preventDefault();
      move(map[e.key]);
    }
  });

  return { start };
})();

GAMES.maze = { emoji: '🌀', color: 'var(--mint)', screen: 'screen-maze', enter() { mazeGame.start(); } };

/* ================= Tower ================= */

const towerGame = (() => {
  buildScreen('tower',
    '<p class="hint" data-t="towerHint"></p>' +
    '<div id="tower-area" data-floors="0">' +
    '<div id="tower-mover"></div>' +
    '<div id="tower-stage"></div></div>');

  const BLOCK_W = 110;
  const BLOCK_H = 32;
  const GOAL = 10;
  const state = { floors: 0, lastX: null, x: 0, dir: 1, speed: 170, raf: 0, running: false, dropping: false, prevTs: 0 };

  function areaW() { return $('tower-area').clientWidth; }

  function loop(ts) {
    if (!state.running) return;
    const dt = state.prevTs ? Math.min((ts - state.prevTs) / 1000, 0.05) : 0.016;
    state.prevTs = ts;
    if (!state.dropping) {
      state.x += state.dir * state.speed * dt;
      const max = areaW() - BLOCK_W;
      if (state.x <= 0) { state.x = 0; state.dir = 1; }
      if (state.x >= max) { state.x = max; state.dir = -1; }
      $('tower-mover').style.transform = 'translateX(' + state.x + 'px)';
    }
    state.raf = requestAnimationFrame(loop);
  }

  function drop() {
    if (state.dropping || !state.running || state.floors >= GOAL) return;
    state.dropping = true;
    const mover = $('tower-mover');
    const targetBottom = state.floors * BLOCK_H;
    const areaH = $('tower-area').clientHeight;
    const fallTo = areaH - targetBottom - BLOCK_H - 8;
    mover.style.transition = 'top .32s cubic-bezier(.4,0,1,1)';
    mover.style.top = fallTo + 'px';
    setTimeout(() => {
      const ok = state.lastX === null ||
        Math.min(state.x + BLOCK_W, state.lastX + BLOCK_W) - Math.max(state.x, state.lastX) >= BLOCK_W * 0.25;
      if (ok) {
        const b = document.createElement('div');
        b.className = 'tower-block';
        b.style.left = state.x + 'px';
        b.style.bottom = (targetBottom + 8) + 'px';
        b.style.background = COLORS[state.floors % COLORS.length].hex;
        $('tower-stage').appendChild(b);
        state.lastX = state.x;
        state.floors++;
        $('tower-area').dataset.floors = String(state.floors);
        $('tower-mover').style.background = COLORS[state.floors % COLORS.length].hex;
        sfx.correct();
        store.addStars(1);
        starFly(b);
        sayPhrase(phrase(state.floors + '!', HINDI_100[state.floors - 1] + '!', HINDI_100_SAY[state.floors - 1] + '!'));
        if (state.floors >= GOAL) {
          state.running = false;
          cancelAnimationFrame(state.raf);
          setTimeout(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 700);
          return;
        }
      } else {
        sfx.wrong();
        sayPhrase(T.towerMiss);
      }
      mover.style.transition = 'none';
      mover.style.top = '12px';
      state.speed = 150 + state.floors * 14 + Math.random() * 30;
      state.dropping = false;
    }, 340);
  }

  function start() {
    $('tower-stage').innerHTML = '';
    state.floors = 0;
    state.lastX = null;
    state.x = 0;
    state.dir = 1;
    state.speed = 170;
    state.prevTs = 0;
    state.dropping = false;
    $('tower-area').dataset.floors = '0';
    const mover = $('tower-mover');
    mover.style.transition = 'none';
    mover.style.top = '12px';
    mover.style.background = COLORS[0].hex;
    state.running = true;
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    cancelAnimationFrame(state.raf);
  }

  $('tower-area').addEventListener('pointerdown', drop);

  return { start, stop };
})();

GAMES.tower = { emoji: '🏗️', color: 'var(--tangerine)', screen: 'screen-tower', enter() { towerGame.start(); }, onLeave() { towerGame.stop(); } };

/* ================= Puzzle ================= */

const puzzleGame = (() => {
  buildScreen('puzzle',
    '<p class="hint" data-t="puzzleHint"></p>' +
    '<div id="puzzle-dots"></div>' +
    '<img id="puzzle-preview" alt="">' +
    '<div id="puzzle-board" data-pic="0" data-solved="0"></div>');

  const N = 3;
  const TILE = 110;
  const state = { picIdx: 0, order: [], pieces: [], selected: null, busy: false };

  function makePieces(pic) {
    const size = N * TILE;
    const src = document.createElement('canvas');
    src.width = size;
    src.height = size;
    const c = src.getContext('2d');
    const grad = c.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#FFF9EC');
    grad.addColorStop(1, '#FFE3B3');
    c.fillStyle = grad;
    c.fillRect(0, 0, size, size);
    c.font = '270px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(pic.emoji, size / 2, size / 2 + 16);
    state.pieces = [];
    for (let k = 0; k < N * N; k++) {
      const t = document.createElement('canvas');
      t.width = TILE;
      t.height = TILE;
      t.getContext('2d').drawImage(src, (k % N) * TILE, Math.floor(k / N) * TILE, TILE, TILE, 0, 0, TILE, TILE);
      state.pieces.push(t.toDataURL());
    }
    $('puzzle-preview').src = src.toDataURL();
  }

  function dots() {
    const d = $('puzzle-dots');
    d.innerHTML = '';
    for (let k = 0; k < PUZZLE_PICS.length; k++) {
      const s = document.createElement('span');
      s.className = 'dot' + (k < state.picIdx ? ' filled' : '');
      d.appendChild(s);
    }
  }

  function isSolved() {
    return state.order.every((v, i) => v === i);
  }

  function renderBoard() {
    const board = $('puzzle-board');
    board.innerHTML = '';
    state.order.forEach((piece, i) => {
      const b = document.createElement('button');
      b.className = 'puz-tile';
      b.dataset.pos = String(piece);
      b.dataset.i = String(i);
      b.innerHTML = '<img src="' + state.pieces[piece] + '" alt="">';
      b.addEventListener('click', () => tap(b, i));
      board.appendChild(b);
    });
  }

  function tap(b, i) {
    if (state.busy) return;
    sfx.pop();
    if (state.selected === null) {
      state.selected = i;
      b.classList.add('selected');
      return;
    }
    if (state.selected === i) {
      b.classList.remove('selected');
      state.selected = null;
      return;
    }
    const a = state.selected;
    state.selected = null;
    const tmp = state.order[a];
    state.order[a] = state.order[i];
    state.order[i] = tmp;
    sfx.flip();
    renderBoard();
    if (isSolved()) {
      state.busy = true;
      const pic = PUZZLE_PICS[state.picIdx];
      $('puzzle-board').dataset.solved = '1';
      sfx.correct();
      confetti(18);
      store.addStars(1);
      starFly($('puzzle-board'));
      sayPhrase(joinPhrase(rand(PRAISE), wordPhrase(pic)));
      state.picIdx++;
      dots();
      setTimeout(() => {
        if (state.picIdx >= PUZZLE_PICS.length) {
          celebrate({ again: () => { hideCelebrate(); start(); } });
        } else {
          newPic();
        }
      }, 1800);
    }
  }

  function newPic() {
    state.busy = false;
    state.selected = null;
    const pic = PUZZLE_PICS[state.picIdx];
    $('puzzle-board').dataset.pic = String(state.picIdx);
    $('puzzle-board').dataset.solved = '0';
    makePieces(pic);
    do {
      state.order = shuffle(state.pieces.map((_, i) => i));
    } while (isSolved());
    dots();
    renderBoard();
  }

  function start() {
    state.picIdx = 0;
    newPic();
  }

  return { start };
})();

GAMES.puzzle = { emoji: '🧩', color: 'var(--lilac)', screen: 'screen-puzzle', enter() { puzzleGame.start(); } };

/* ================= Gardener ================= */

const gardenerGame = (() => {
  buildScreen('gardener',
    '<p class="hint" data-t="gardenHint"></p>' +
    '<div id="garden-scene" data-stages="0,0,0,0,0">' +
    '<div id="garden-clouds">☁️&nbsp;&nbsp;&nbsp;⛅&nbsp;&nbsp;&nbsp;☁️</div>' +
    '<div id="garden-pots"></div>' +
    '<div id="garden-ground"></div></div>');

  const state = { stages: [], blooms: [], holding: false, x: 0, rainT: 0, growT: 0, done: false };

  function plantEmoji(i) {
    const st = state.stages[i];
    return st === 0 ? '' : st === 1 ? '🌱' : st === 2 ? '🌿' : state.blooms[i];
  }

  function renderPots() {
    Array.from($('garden-pots').children).forEach((pot, i) => {
      pot.querySelector('.plant').textContent = plantEmoji(i);
    });
    $('garden-scene').dataset.stages = state.stages.join(',');
  }

  function bloomWord(emoji) {
    return PACK_FLOWERS.find((f) => f.emoji === emoji) || { en: 'Flower', hi: 'फूल', hiSay: 'Phool' };
  }

  function grow() {
    if (state.done) return;
    const pots = Array.from($('garden-pots').children);
    const rect = $('garden-scene').getBoundingClientRect();
    let best = 0;
    let bestDist = Infinity;
    pots.forEach((pot, i) => {
      const r = pot.getBoundingClientRect();
      const cx = r.left + r.width / 2 - rect.left;
      const d = Math.abs(cx - state.x);
      if (state.stages[i] < 3 && d < bestDist) { bestDist = d; best = i; }
    });
    if (state.stages[best] >= 3) return;
    state.stages[best]++;
    renderPots();
    if (state.stages[best] === 3) {
      sfx.correct();
      store.addStars(1);
      starFly($('garden-pots').children[best]);
      sayPhrase(wordPhrase(bloomWord(state.blooms[best])));
      if (state.stages.every((s) => s >= 3)) {
        state.done = true;
        stopRain();
        setTimeout(() => {
          sayPhrase(countPhrase(5));
          confetti(24);
          setTimeout(() => celebrate({ again: () => { hideCelebrate(); start(); } }), 1600);
        }, 900);
      }
    } else {
      sfx.pop();
    }
  }

  function raindrop() {
    const scene = $('garden-scene');
    const d = document.createElement('span');
    d.className = 'raindrop';
    d.textContent = '💧';
    d.style.left = Math.max(6, Math.min(scene.clientWidth - 20, state.x - 24 + Math.random() * 48)) + 'px';
    d.addEventListener('animationend', () => d.remove());
    scene.appendChild(d);
  }

  function startRain() {
    if (state.holding) return;
    state.holding = true;
    state.rainT = setInterval(raindrop, 110);
    state.growT = setInterval(grow, 620);
  }

  function stopRain() {
    state.holding = false;
    clearInterval(state.rainT);
    clearInterval(state.growT);
  }

  function start() {
    state.stages = [0, 0, 0, 0, 0];
    state.blooms = shuffle(GARDEN_BLOOMS.slice()).slice(0, 5);
    state.done = false;
    const pots = $('garden-pots');
    pots.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const p = document.createElement('div');
      p.className = 'pot';
      p.innerHTML = '<span class="plant"></span><span class="pot-base">🪴</span>';
      pots.appendChild(p);
    }
    renderPots();
  }

  const scene = $('garden-scene');
  scene.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const rect = scene.getBoundingClientRect();
    state.x = e.clientX - rect.left;
    startRain();
  });
  scene.addEventListener('pointermove', (e) => {
    const rect = scene.getBoundingClientRect();
    state.x = e.clientX - rect.left;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => scene.addEventListener(ev, stopRain));

  return { start, stop: stopRain };
})();

GAMES.gardener = { emoji: '🌧️', color: 'var(--mint)', screen: 'screen-gardener', enter() { gardenerGame.start(); }, onLeave() { gardenerGame.stop(); } };

/* ================= Traffic ================= */

const trafficGame = (() => {
  buildScreen('traffic',
    '<p class="hint" data-t="trafficHint"></p>' +
    '<div id="traffic-scene" data-light="red" data-cross="0">' +
    '<div id="traffic-light">' +
    '<span class="tl tl-red"></span><span class="tl tl-yellow"></span><span class="tl tl-green"></span></div>' +
    '<div id="traffic-road"><span id="traffic-car">🚗</span></div></div>' +
    '<button id="traffic-go" class="big-btn" data-t="goBtn"></button>');

  const state = { light: 'red', timer: 0, driving: false, cross: 0, carIdx: 0 };

  function setLight(color) {
    state.light = color;
    const scene = $('traffic-scene');
    scene.dataset.light = color;
    document.querySelectorAll('#traffic-light .tl').forEach((el) => {
      el.classList.toggle('on', el.classList.contains('tl-' + color));
    });
    if (color === 'green') sfx.pop();
  }

  function cycle() {
    clearTimeout(state.timer);
    if (state.light === 'red') {
      setLight('green');
      state.timer = setTimeout(cycle, 2300 + Math.random() * 1500);
    } else if (state.light === 'green') {
      setLight('yellow');
      state.timer = setTimeout(cycle, 900);
    } else {
      setLight('red');
      state.timer = setTimeout(cycle, 2200 + Math.random() * 1600);
    }
  }

  function go() {
    if (state.driving) return;
    if (state.light === 'green') {
      state.driving = true;
      const car = $('traffic-car');
      const road = $('traffic-road');
      sfx.correct();
      sayPhrase(T.greenGo);
      store.addStars(1);
      starFly(car);
      car.style.transition = 'transform 1.4s ease-in-out';
      car.style.transform = 'translateX(' + (road.clientWidth - 10) + 'px)';
      state.cross++;
      $('traffic-scene').dataset.cross = String(state.cross);
      setTimeout(() => {
        car.style.transition = 'none';
        car.style.transform = 'translateX(0)';
        state.carIdx = (state.carIdx + 1) % TRAFFIC_CARS.length;
        car.textContent = TRAFFIC_CARS[state.carIdx];
        state.driving = false;
        if (state.cross >= 5) {
          clearTimeout(state.timer);
          celebrate({ again: () => { hideCelebrate(); start(); } });
        }
      }, 1600);
    } else {
      sfx.wrong();
      sayPhrase(T.redStop);
      const light = $('traffic-light');
      light.classList.add('wiggle');
      light.addEventListener('animationend', () => light.classList.remove('wiggle'), { once: true });
    }
  }

  function start() {
    clearTimeout(state.timer);
    state.cross = 0;
    state.driving = false;
    state.carIdx = 0;
    $('traffic-scene').dataset.cross = '0';
    $('traffic-car').textContent = TRAFFIC_CARS[0];
    $('traffic-car').style.transition = 'none';
    $('traffic-car').style.transform = 'translateX(0)';
    setLight('red');
    state.timer = setTimeout(cycle, 1500);
  }

  function stop() {
    clearTimeout(state.timer);
  }

  $('traffic-go').addEventListener('click', go);

  return { start, stop };
})();

GAMES.traffic = { emoji: '🚦', color: 'var(--coral)', screen: 'screen-traffic', enter() { trafficGame.start(); }, onLeave() { trafficGame.stop(); } };

/* ================= Drawing ================= */

const drawingGame = (() => {
  buildScreen('drawing',
    '<div id="draw-tools">' +
    '<div id="draw-colors"></div>' +
    '<div id="draw-actions">' +
    '<button id="draw-size" data-size="1" aria-label="Brush size">⚫</button>' +
    '<button id="draw-eraser" aria-label="Eraser">🧽</button>' +
    '<button id="draw-clear" aria-label="Clear">🗑️</button>' +
    '<button id="draw-glow" data-t="glowBtn"></button></div></div>' +
    '<div id="draw-frame"><canvas id="draw-canvas" data-mode="day"></canvas></div>');

  const SIZES = [10, 20, 34];
  const state = { color: '#E53935', size: 1, eraser: false, mode: 'day', drawing: false, last: null, sized: false };
  let canvas, ctx;

  function resize() {
    const frame = $('draw-frame');
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    if (w > 0 && (!state.sized || canvas.width !== w)) {
      canvas.width = w;
      canvas.height = h;
      state.sized = true;
    }
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function strokeTo(p, begin) {
    if (state.eraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = SIZES[state.size] * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = state.color;
      ctx.lineWidth = SIZES[state.size];
      if (state.mode === 'glow') {
        ctx.shadowBlur = 16;
        ctx.shadowColor = state.color;
      } else {
        ctx.shadowBlur = 0;
      }
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(begin ? p[0] : state.last[0], begin ? p[1] : state.last[1]);
    ctx.lineTo(p[0], p[1] + (begin ? 0.01 : 0));
    ctx.stroke();
    state.last = p;
  }

  function renderColors() {
    const row = $('draw-colors');
    row.innerHTML = '';
    COLORS.concat([{ key: 'white', hex: '#FFFFFF' }, { key: 'black', hex: '#333333' }]).forEach((c) => {
      const b = document.createElement('button');
      b.className = 'draw-dot' + (c.hex === state.color ? ' selected' : '');
      b.style.background = c.hex;
      b.dataset.c = c.hex;
      b.addEventListener('click', () => {
        sfx.pop();
        state.color = c.hex;
        state.eraser = false;
        $('draw-eraser').classList.remove('selected');
        renderColors();
      });
      row.appendChild(b);
    });
  }

  function setMode(m) {
    state.mode = m;
    canvas.dataset.mode = m;
    $('draw-glow').textContent = (m === 'day' ? T.glowBtn : T.dayBtn)[store.getLang()];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function enter() {
    resize();
    renderColors();
    $('draw-glow').textContent = (state.mode === 'day' ? T.glowBtn : T.dayBtn)[store.getLang()];
  }

  function init() {
    canvas = $('draw-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      state.drawing = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      strokeTo(pos(e), true);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (state.drawing) strokeTo(pos(e), false);
    });
    ['pointerup', 'pointercancel'].forEach((ev) => canvas.addEventListener(ev, () => { state.drawing = false; }));
    $('draw-size').addEventListener('click', () => {
      sfx.pop();
      state.size = (state.size + 1) % SIZES.length;
      $('draw-size').dataset.size = String(state.size);
      $('draw-size').textContent = state.size === 0 ? '•' : state.size === 1 ? '⚫' : '⬤';
    });
    $('draw-eraser').addEventListener('click', () => {
      sfx.pop();
      state.eraser = !state.eraser;
      $('draw-eraser').classList.toggle('selected', state.eraser);
    });
    $('draw-clear').addEventListener('click', () => {
      sfx.pop();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    $('draw-glow').addEventListener('click', () => {
      sfx.pop();
      setMode(state.mode === 'day' ? 'glow' : 'day');
    });
  }

  init();
  return {
    enter,
    onLang() { $('draw-glow').textContent = (state.mode === 'day' ? T.glowBtn : T.dayBtn)[store.getLang()]; }
  };
})();

GAMES.drawing = { emoji: '🖍️', color: 'var(--sunny)', screen: 'screen-drawing', enter() { drawingGame.enter(); }, onLang() { drawingGame.onLang(); } };

/* ================= Murgi Farm (Hen Farm) ================= */

Object.assign(T, {
  farmCatchHint: { en: 'Move the basket and catch the eggs!', hi: 'टोकरी सरकाओ और अंडे पकड़ो!' },
  farmHatchHint: { en: 'Tap an egg for a surprise!', hi: 'अंडा दबाओ, सरप्राइज़ निकलेगा!' },
  farmCycleHint: { en: 'Put the story in order!', hi: 'कहानी को क्रम में लगाओ!' },
  farmFoxHint: { en: 'Tap the fox — but not the chick!', hi: 'लोमड़ी को दबाओ — चूज़े को नहीं!' },
  farmTabCatch: { en: '🥚 Catch', hi: '🥚 पकड़ो' },
  farmTabHatch: { en: '🐣 Open', hi: '🐣 फोड़ो' },
  farmTabCycle: { en: '🔄 Story', hi: '🔄 कहानी' },
  farmTabFox: { en: '🦊 Fox', hi: '🦊 लोमड़ी' },
  foxChick: { en: "Oh! That's the little chick!", hi: 'अरे! यह तो चूज़ा है!', hiSay: 'Are! Yeh to chooza hai!' },
  goldEgg: { en: 'Golden egg! Two stars!', hi: 'सुनहरा अंडा! दो स्टार!', hiSay: 'Sunehra anda! Do star!' },
  chickWord: { en: 'Chick! Cheep cheep!', hi: 'चूज़ा! चीं चीं!', hiSay: 'Chooza! Cheen cheen!' }
});
GAME_TITLES.farm = { en: 'Hen Farm', hi: 'मुर्गी फार्म', hiSay: 'Murgi farm' };

const FARM_CYCLES = [
  {
    name: { en: 'Egg to Hen', hi: 'अंडे से मुर्गी' },
    stages: [
      { emoji: '🥚', en: 'Egg', hi: 'अंडा', hiSay: 'Anda' },
      { emoji: '🐣', en: 'Hatching', hi: 'अंडा फूटा', hiSay: 'Anda phoota' },
      { emoji: '🐤', en: 'Chick', hi: 'चूज़ा', hiSay: 'Chooza' },
      { emoji: '🐔', en: 'Hen', hi: 'मुर्गी', hiSay: 'Murgi' }
    ]
  },
  {
    name: { en: 'Seed to Tree', hi: 'बीज से पेड़' },
    stages: [
      { emoji: '🌰', en: 'Seed', hi: 'बीज', hiSay: 'Beej' },
      { emoji: '🌱', en: 'Sprout', hi: 'अंकुर', hiSay: 'Ankur' },
      { emoji: '🌿', en: 'Plant', hi: 'पौधा', hiSay: 'Paudha' },
      { emoji: '🌳', en: 'Tree', hi: 'पेड़', hiSay: 'Ped' }
    ]
  },
  {
    name: { en: 'Baby to Grandpa', hi: 'बच्चे से दादा' },
    stages: [
      { emoji: '👶', en: 'Baby', hi: 'बच्चा', hiSay: 'Bachcha' },
      { emoji: '🧒', en: 'Kid', hi: 'लड़का', hiSay: 'Ladka' },
      { emoji: '🧑', en: 'Grown-up', hi: 'आदमी', hiSay: 'Aadmi' },
      { emoji: '🧓', en: 'Grandpa', hi: 'दादा', hiSay: 'Dada' }
    ]
  }
];

const farmGame = (() => {
  buildScreen('farm',
    '<div class="tabs farm-tabs" id="farm-tabs">' +
    '<button class="tab active" data-mode="catch" data-t="farmTabCatch"></button>' +
    '<button class="tab" data-mode="hatch" data-t="farmTabHatch"></button>' +
    '<button class="tab" data-mode="cycle" data-t="farmTabCycle"></button>' +
    '<button class="tab" data-mode="fox" data-t="farmTabFox"></button></div>' +
    '<p class="hint" id="farm-hint"></p>' +
    '<div id="farm-area" data-mode="catch"></div>');

  const HINTS = { catch: 'farmCatchHint', hatch: 'farmHatchHint', cycle: 'farmCycleHint', fox: 'farmFoxHint' };
  const state = { mode: 'catch', raf: 0, timeouts: [], intervals: [], running: false };

  function tmo(fn, ms) { const id = setTimeout(fn, ms); state.timeouts.push(id); return id; }
  function itv(fn, ms) { const id = setInterval(fn, ms); state.intervals.push(id); return id; }

  function stopAll() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    state.timeouts.forEach(clearTimeout);
    state.intervals.forEach(clearInterval);
    state.timeouts = [];
    state.intervals = [];
  }

  function hint() {
    $('farm-hint').textContent = T[HINTS[state.mode]][store.getLang()];
  }

  /* ---- Mode 1: Anda Pakdo (egg catch) ---- */
  const catchMode = { henX: 0, henDir: 1, basketX: 0, eggs: [], caught: 0, dropped: 0, prevTs: 0 };

  function catchEnter() {
    const area = $('farm-area');
    area.innerHTML = '<div class="farm-scene" id="fc-scene">' +
      '<span id="fc-hen">🐔</span><div id="fc-eggs"></div><span id="fc-basket">🧺</span></div>';
    catchMode.eggs = [];
    catchMode.caught = 0;
    catchMode.dropped = 0;
    catchMode.henX = 40;
    catchMode.henDir = 1;
    catchMode.prevTs = 0;
    area.dataset.caught = '0';
    const scene = $('fc-scene');
    catchMode.basketX = scene.clientWidth / 2;
    positionBasket();
    scene.addEventListener('pointermove', (e) => {
      const r = scene.getBoundingClientRect();
      catchMode.basketX = Math.max(30, Math.min(r.width - 30, e.clientX - r.left));
      positionBasket();
    });
    scene.addEventListener('pointerdown', (e) => {
      const r = scene.getBoundingClientRect();
      catchMode.basketX = Math.max(30, Math.min(r.width - 30, e.clientX - r.left));
      positionBasket();
    });
    state.running = true;
    scheduleDrop();
    state.raf = requestAnimationFrame(catchLoop);
  }

  function positionBasket() {
    const b = $('fc-basket');
    if (b) b.style.left = (catchMode.basketX - 26) + 'px';
  }

  function scheduleDrop() {
    if (!state.running || state.mode !== 'catch') return;
    tmo(() => {
      if (!state.running || state.mode !== 'catch') return;
      const box = $('fc-eggs');
      if (box) {
        catchMode.dropped++;
        const el = document.createElement('span');
        const gold = catchMode.dropped % 4 === 0;
        el.className = 'fc-egg' + (gold ? ' gold' : '');
        el.textContent = '🥚';
        el.style.left = (catchMode.henX - 12) + 'px';
        box.appendChild(el);
        catchMode.eggs.push({ el, x: catchMode.henX, y: 54, vy: 120 + Math.random() * 50 + catchMode.caught * 6, gold });
      }
      scheduleDrop();
    }, 1000 + Math.random() * 600);
  }

  function catchLoop(ts) {
    if (!state.running || state.mode !== 'catch') return;
    const dt = catchMode.prevTs ? Math.min((ts - catchMode.prevTs) / 1000, 0.06) : 0.016;
    catchMode.prevTs = ts;
    const scene = $('fc-scene');
    if (!scene) return;
    const w = scene.clientWidth;
    const h = scene.clientHeight;
    // hen waddles left-right
    catchMode.henX += catchMode.henDir * 90 * dt;
    if (catchMode.henX < 34) { catchMode.henX = 34; catchMode.henDir = 1; }
    if (catchMode.henX > w - 34) { catchMode.henX = w - 34; catchMode.henDir = -1; }
    $('fc-hen').style.left = (catchMode.henX - 22) + 'px';
    // eggs fall
    catchMode.eggs.slice().forEach((egg) => {
      egg.y += egg.vy * dt;
      egg.el.style.top = egg.y + 'px';
      if (egg.y >= h - 76 && Math.abs(egg.x - catchMode.basketX) < 48) {
        // caught!
        catchMode.eggs = catchMode.eggs.filter((x) => x !== egg);
        egg.el.remove();
        catchMode.caught++;
        $('farm-area').dataset.caught = String(catchMode.caught);
        sfx.correct();
        store.addStars(egg.gold ? 2 : 1);
        starFly($('fc-basket'));
        if (egg.gold) {
          sayPhrase(T.goldEgg);
          confetti(10);
        } else {
          const n = catchMode.caught;
          sayPhrase(phrase(n + '!', HINDI_100[n - 1] + '!', HINDI_100_SAY[n - 1] + '!'));
        }
        if (catchMode.caught >= 10) {
          stopAll();
          tmo(() => celebrate({ again: () => { hideCelebrate(); setMode('catch'); } }), 600);
        }
      } else if (egg.y > h - 30) {
        // splat — no penalty, just a fried egg for a moment
        catchMode.eggs = catchMode.eggs.filter((x) => x !== egg);
        egg.el.textContent = '🍳';
        egg.el.classList.add('fc-splat');
        const el = egg.el;
        tmo(() => el.remove(), 700);
      }
    });
    state.raf = requestAnimationFrame(catchLoop);
  }

  /* ---- Mode 2: Surprise Ande (hatch) ---- */
  const hatchMode = { opened: 0, surprises: [] };

  function hatchSurprises() {
    const list = [];
    list.push({ type: 'chick' });
    sample(LETTERS, 3).forEach((l) => list.push({ type: 'letter', item: l }));
    sample(NUMBERS.slice(0, 9), 2).forEach((n) => list.push({ type: 'number', item: n }));
    sample(ANIMALS, 2).forEach((a) => list.push({ type: 'animal', item: a }));
    return shuffle(list);
  }

  function surpriseEmoji(s) {
    if (s.type === 'chick') return '🐣';
    if (s.type === 'letter') return s.item.emoji;
    if (s.type === 'number') return String(s.item.n);
    return s.item.emoji;
  }

  function speakSurprise(s) {
    if (s.type === 'chick') sayPhrase(T.chickWord);
    else if (s.type === 'letter') {
      const l = s.item;
      sayPhrase(phrase(l.ch + '! ' + l.ch + ' for ' + l.en + '!', l.ch + '! ' + l.ch + ' से ' + l.hi + '!', l.ch + '! ' + l.ch + ' se ' + l.hiSay + '!'));
    } else if (s.type === 'number') sayPhrase(countPhrase(s.item.n));
    else {
      const a = s.item;
      sayPhrase(phrase(a.en + '! ' + a.soundEn, a.hi + '! ' + a.soundHi, a.hiSay + '! ' + a.soundHiSay));
    }
  }

  function hatchEnter() {
    hatchMode.opened = 0;
    hatchMode.surprises = hatchSurprises();
    const area = $('farm-area');
    area.dataset.opened = '0';
    area.innerHTML = '<div id="fh-grid"></div>';
    const grid = $('fh-grid');
    hatchMode.surprises.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'fh-egg';
      b.textContent = '🥚';
      b.dataset.i = String(i);
      b.addEventListener('click', () => {
        if (b.classList.contains('hatched') || b.classList.contains('cracking')) return;
        sfx.flip();
        b.classList.add('cracking');
        tmo(() => {
          b.classList.remove('cracking');
          b.classList.add('hatched', 'pop');
          b.textContent = surpriseEmoji(s);
          sfx.correct();
          store.addStars(1);
          starFly(b);
          speakSurprise(s);
          hatchMode.opened++;
          $('farm-area').dataset.opened = String(hatchMode.opened);
          if (hatchMode.opened >= hatchMode.surprises.length) {
            tmo(() => celebrate({ again: () => { hideCelebrate(); setMode('hatch'); } }), 1200);
          }
        }, 450);
      });
      grid.appendChild(b);
    });
  }

  /* ---- Mode 3: Anda se Murgi (story order) ---- */
  const cycleMode = { round: 0, filled: 0 };

  function cycleEnter() {
    cycleMode.round = 0;
    cycleRound();
  }

  function cycleRound() {
    const cyc = FARM_CYCLES[cycleMode.round];
    cycleMode.filled = 0;
    const lang = store.getLang();
    const area = $('farm-area');
    area.dataset.filled = '0';
    area.dataset.cycleRound = String(cycleMode.round + 1);
    let slots = '';
    for (let i = 0; i < 4; i++) slots += '<div class="cyc-slot"><span class="cyc-num">' + (i + 1) + '</span><span class="cyc-fill"></span></div>';
    area.innerHTML = '<h3 class="cyc-title">' + cyc.name[lang] + '</h3>' +
      '<div class="cyc-row" id="fy-slots">' + slots + '</div>' +
      '<div class="cyc-row" id="fy-cards"></div>';
    let order = shuffle([0, 1, 2, 3]);
    if (order.every((v, i) => v === i)) order = [3, 2, 1, 0];
    const cards = $('fy-cards');
    order.forEach((stageIdx) => {
      const st = cyc.stages[stageIdx];
      const b = document.createElement('button');
      b.className = 'cyc-card';
      b.dataset.stage = String(stageIdx);
      b.innerHTML = '<span class="t-big">' + st.emoji + '</span><span class="t-word">' + st[lang] + '</span>';
      b.addEventListener('click', () => {
        if (b.classList.contains('used')) return;
        if (Number(b.dataset.stage) === cycleMode.filled) {
          b.classList.add('used');
          const slot = $('fy-slots').children[cycleMode.filled];
          slot.querySelector('.cyc-fill').textContent = st.emoji;
          slot.classList.add('filled', 'pop');
          sfx.pop();
          sayPhrase(wordPhrase(st));
          cycleMode.filled++;
          $('farm-area').dataset.filled = String(cycleMode.filled);
          if (cycleMode.filled >= 4) {
            sfx.correct();
            store.addStars(2);
            starFly(slot);
            confetti(14);
            const names = cyc.stages;
            sayPhrase(phrase(
              'First ' + names[0].en + ', then ' + names[1].en + ', then ' + names[2].en + ', then ' + names[3].en + '!',
              'पहले ' + names[0].hi + ', फिर ' + names[1].hi + ', फिर ' + names[2].hi + ', फिर ' + names[3].hi + '!',
              'Pehle ' + names[0].hiSay + ', phir ' + names[1].hiSay + ', phir ' + names[2].hiSay + ', phir ' + names[3].hiSay + '!'
            ));
            cycleMode.round++;
            tmo(() => {
              if (cycleMode.round >= FARM_CYCLES.length) {
                celebrate({ again: () => { hideCelebrate(); setMode('cycle'); } });
              } else {
                cycleRound();
              }
            }, 2600);
          }
        } else {
          sfx.wrong();
          b.classList.add('wiggle');
          b.addEventListener('animationend', () => b.classList.remove('wiggle'), { once: true });
          sayPhrase(rand(ENCOURAGE));
        }
      });
      cards.appendChild(b);
    });
  }

  /* ---- Mode 4: Murgi Bachao (fox bonk) ---- */
  const foxMode = { score: 0, lastWrong: 0 };

  function foxEnter() {
    foxMode.score = 0;
    const area = $('farm-area');
    area.dataset.bonked = '0';
    let bushes = '';
    for (let i = 0; i < 6; i++) {
      bushes += '<button class="bush" data-i="' + i + '"><span class="bush-top">🌿</span><span class="pop-actor" hidden></span></button>';
    }
    area.innerHTML = '<div class="fox-status">🐔 <span id="fx-count">0</span> / 10</div>' +
      '<div id="fx-grid">' + bushes + '</div>';
    document.querySelectorAll('#fx-grid .bush').forEach((b) => {
      b.addEventListener('click', () => {
        const actor = b.querySelector('.pop-actor');
        if (actor.hidden) return;
        if (actor.textContent === '🦊') {
          actor.textContent = '💫';
          sfx.correct();
          store.addStars(1);
          starFly(b);
          foxMode.score++;
          $('fx-count').textContent = String(foxMode.score);
          $('farm-area').dataset.bonked = String(foxMode.score);
          tmo(() => { actor.hidden = true; }, 350);
          if (foxMode.score >= 10) {
            stopAll();
            tmo(() => celebrate({ again: () => { hideCelebrate(); setMode('fox'); } }), 600);
          }
        } else {
          sfx.wrong();
          const now = Date.now();
          if (now - foxMode.lastWrong > 2000) {
            foxMode.lastWrong = now;
            sayPhrase(T.foxChick);
          }
        }
      });
    });
    state.running = true;
    foxSpawn();
  }

  function foxSpawn() {
    if (!state.running || state.mode !== 'fox') return;
    tmo(() => {
      if (!state.running || state.mode !== 'fox') return;
      const bushes = Array.from(document.querySelectorAll('#fx-grid .bush .pop-actor')).filter((a) => a.hidden);
      if (bushes.length) {
        const actor = rand(bushes);
        actor.textContent = Math.random() < 0.75 ? '🦊' : '🐤';
        actor.hidden = false;
        actor.classList.remove('pop');
        void actor.offsetWidth;
        actor.classList.add('pop');
        tmo(() => { actor.hidden = true; }, 950 + Math.random() * 450 - foxMode.score * 20);
      }
      foxSpawn();
    }, Math.max(500, 1100 - foxMode.score * 40 + Math.random() * 400));
  }

  /* ---- Mode plumbing ---- */
  const MODES = { catch: catchEnter, hatch: hatchEnter, cycle: cycleEnter, fox: foxEnter };

  function setMode(m) {
    stopAll();
    state.mode = m;
    $('farm-area').dataset.mode = m;
    document.querySelectorAll('#farm-tabs .tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.mode === m);
    });
    hint();
    MODES[m]();
  }

  document.querySelectorAll('#farm-tabs .tab').forEach((t) => {
    t.addEventListener('click', () => {
      sfx.pop();
      setMode(t.dataset.mode);
    });
  });

  return {
    enter() { setMode(state.mode); },
    onLeave: stopAll,
    onLang() { hint(); if (state.mode === 'cycle') { stopAll(); cycleRound(); } }
  };
})();

GAMES.farm = {
  emoji: '🐔', color: 'var(--tangerine)', screen: 'screen-farm',
  enter() { farmGame.enter(); }, onLeave() { farmGame.onLeave(); }, onLang() { farmGame.onLang(); }
};
