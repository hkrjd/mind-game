# 🎈 Khel Khel Mein Seekho — खेल खेल में सीखो

A learning game for little kids (around age 5) that teaches through play — in **Hindi and English together**.
छोटे बच्चों (लगभग 5 साल) के लिए एक गेम जो खेल-खेल में सिखाता है — **हिंदी और English दोनों में**।

No installs, no internet needed after loading — just open `index.html` in any browser (phone, tablet, or computer).

## 🎮 The four games / चार गेम

| Game | What the child learns |
|---|---|
| 🔤 **ABC & Ginti** | Letters A–Z with words ("A for Apple / A से सेब") and counting 1–10 (एक, दो, तीन…). Tap any tile to hear it; then play a find-the-letter / counting quiz. |
| 🔺 **Shapes & Colors / आकार और रंग** | 8 shapes (गोला, त्रिकोण, दिल…) and 8 colors (लाल, नीला…). Quiz builds up: find the shape → find the color → "find the **red circle**!" |
| 🧠 **Memory Match / मेमोरी मैच** | Flip cards and find pairs. Every match says the word aloud — sneaky vocabulary practice. |
| 🦁 **Animals & Sounds / जानवर** | 12 animals with their names and sounds ("Dog! Woof woof!" / "कुत्ता! भौं भौं!"), plus "who says Moo?" quizzes. |

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

## 🌐 Put it online with GitHub Pages

Repo → **Settings → Pages → Deploy from a branch** → choose this branch, folder `/ (root)` → Save.
A minute later the game is live at `https://<your-username>.github.io/mind-game/` — open that link on any phone and add it to the home screen.

## 🛠️ Tech notes

- Zero-build vanilla HTML/CSS/JS (`index.html` + `style.css` + `app.js`). No frameworks, no assets — emoji for pictures, SVG for shapes, Web Speech API for voices, Web Audio API for jingles.
- Works fully offline from `file://`; degrades gracefully when speech/audio/localStorage are unavailable.
- Smoke test (drives every game headlessly and screenshots each screen):
  ```
  node tests/verify.js
  ```
  Requires Node with [Playwright](https://playwright.dev) available (`npm i -g playwright` + browsers).

## 💡 Future ideas

- Devanagari varnamala (अ, आ, इ…) as a third tab in ABC & Ginti
- Simple addition (2 + 1) once counting is solid
- More memory-match difficulty levels (4×4 grid)
