# 🎈 Khel Khel Mein Seekho — खेल खेल में सीखो

A learning game for little kids (around age 5) that teaches through play — in **Hindi and English together**.
छोटे बच्चों (लगभग 5 साल) के लिए एक गेम जो खेल-खेल में सिखाता है — **हिंदी और English दोनों में**।

No installs, no internet needed after loading — just open `index.html` in any browser (phone, tablet, or computer). **24 games** in one app.

## 🎮 The games / गेम्स

### 📚 ABC & Words / ABC और शब्द
| Game | What the child learns |
|---|---|
| 🔤 **ABC & Ginti** | Letters A–Z with words ("A for Apple / A से सेब") and counting 1–10, with find-it quizzes |
| ✏️ **Learn Writing / लिखना सीखो** | Trace letters, numbers and shapes by painting over them with a finger |
| 🔡 **Word Banao / शब्द बनाओ** | Spell CAT, DOG, SUN… by tapping letter tiles in order |
| 🗣️ **Phonics** | "Which one starts with B?" — first-letter sounds |
| 🔠 **Big & Small Aa / बड़ा-छोटा** | Match capital letters with small letters (A ↔ a) |

### 🔢 Numbers & Math / गिनती और मैथ
| Game | What the child learns |
|---|---|
| ➕ **Jod-Ghatao / जोड़-घटाव** | Picture addition and subtraction up to 10 (🍎🍎 + 🍎 = ?) |
| 💯 **Ginti 1–100** | Tap any number on the 100-board and hear it (एक… सौ), plus find-the-number rounds |
| 🕐 **Clock / घड़ी** | Read full hours on an analog clock ("3 बजे हैं / It's 3 o'clock") |
| 🏗️ **Tower** | Stack falling blocks — every floor is counted aloud |

### 🌍 Know the World / दुनिया जानो
| Game | What the child learns |
|---|---|
| 🔺 **Shapes & Colors / आकार और रंग** | 8 shapes + 8 colors, with "find the red circle!" quizzes |
| 🦁 **Animals & Sounds / जानवर** | 12 animals, their names and sounds ("कुत्ता! भौं भौं!") |
| 🍎 **Fruits & Veggies / फल-सब्ज़ी** | 12 fruits + 12 vegetables with names in both languages |
| 🙋 **Body Parts / शरीर के अंग** | आँख, कान, नाक… learn and find |
| 🏠 **Everyday Things / रोज़ की चीज़ें** | कुर्सी, चम्मच, किताब… household words |
| 🌸 **Flowers / फूल** | गुलाब, सूरजमुखी, कमल… |
| 🚦 **Traffic** | Red light = stop, green light = go! Drive the car safely |

### 🎨 Play & Fun / खेल और मस्ती
| Game | What the child learns |
|---|---|
| 🧠 **Memory Match** | Flip cards, find pairs — every match speaks its word |
| 🧩 **Puzzle** | Swap the 9 pieces to complete the picture |
| 🌀 **Maze / भूलभुलैया** | Guide the bunny 🐰 to the carrot 🥕 through 5 mazes |
| 🔍 **Shadow Match / परछाई मिलाओ** | Match each picture with its shadow |
| 🎈 **Sky Pop** | Bubbles float up — pop only the number/letter that was called |
| 🖍️ **Drawing** | Free drawing with crayons, plus a magical neon **Glow mode** |
| 🌧️ **Gardener / माली** | Press and hold to make rain and grow flowers |
| 🎵 **Rhymes / कविताएँ** | Twinkle Twinkle, Baa Baa Black Sheep, मछली जल की रानी, चंदा मामा |

Everything is spoken aloud, so the child does not need to read. Right answers earn ⭐ stars (saved on the device) with confetti; wrong answers just get a gentle wiggle and "फिर से कोशिश करो!" — no timers, no losing.

## ▶️ How to play / कैसे खेलें

1. Open `index.html` in a browser (double-click works — no server needed), **or** host it with GitHub Pages (below).
2. **Tap once anywhere first** — browsers only allow sound after a touch.
3. Use the **EN | हि** button (top right) to switch language any time. ⬅️ goes back, ⭐ shows the stars earned.

### 🔊 Getting the Hindi voice / हिंदी आवाज़

The game uses the voices installed on your device. If no Hindi voice is found, it automatically speaks Hindi words in a friendly romanized way ("Seb", "Haathi") with an English voice and shows a small note.

To install a real Hindi voice:
- **Android**: Settings → System → Languages → Text-to-speech → Google TTS → install **Hindi**
- **iPhone/iPad**: Settings → Accessibility → Spoken Content → Voices → add **Hindi**
- **Windows**: Settings → Time & Language → Speech → Add voices → **Hindi**

## 🌐 Put it online with GitHub Pages (free for public repos)

Make the repo **public** (Settings → Danger Zone → Change visibility), then:
Repo → **Settings → Pages → Deploy from a branch** → choose this branch, folder `/ (root)` → Save.
A minute later the game is live at `https://<your-username>.github.io/mind-game/` — open that link on any phone and add it to the home screen.

## 🛠️ Tech notes

- Zero-build vanilla HTML/CSS/JS — no frameworks, no assets: emoji for pictures, SVG/canvas for shapes and puzzles, Web Speech API for voices, Web Audio API for jingles.
- Files: `index.html`, `style.css`, `app.js` (core engine + first 4 games), `data2.js` (word packs, rhymes, 1–100), `games-vocab.js`, `games-skill.js`, `games-arcade.js`.
- Works fully offline from `file://`; degrades gracefully when speech/audio/localStorage are unavailable.
- Smoke tests (drive every game headlessly and screenshot each screen):
  ```
  node tests/verify.js    # core: first 4 games, quiz engine, Hindi toggle, persistence
  node tests/verify2.js   # all 20 newer games
  ```
  Requires Node with [Playwright](https://playwright.dev) available (`npm i -g playwright` + browsers).

## 💡 Future ideas

- Devanagari varnamala (अ, आ, इ…) as a third tab in ABC & Ginti
- More puzzle pictures and memory-match difficulty levels
- A PWA manifest + service worker so it installs like an app from the browser
