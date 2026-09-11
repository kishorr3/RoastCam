# RoastCam 🎭📷

### **See. Feel. Play. — 100% Local AI. 0% Useful.**

RoastCam is a playful multimodal computer-vision web application that uses your webcam to detect **facial emotions, hand gestures, finger count, and mouth state** in real time—and then proceeds to roast you for it.

Built as a deliberately useless project, RoastCam combines modern **Edge AI, computer vision, web development, and gamification** into an interactive experience designed to make people ask:

> **“Why does this even exist?”**

Exactly.

---

## ✨ Features

* 😀 **7-Class Emotion Detection**

  * Angry
  * Disgust
  * Fear
  * Happy
  * Sad
  * Surprise
  * Neutral

* ✋ **Real-Time Hand Tracking**

  * 21-point hand landmarks
  * Hand skeleton visualization
  * 0–5 finger counting
  * Handedness-aware thumb detection

* 👄 **Mouth Detection**

  * Closed
  * Slightly Open
  * Open
  * Wide Open

* 🔥 **AI Roast Engine**

  * Emotion-based roasts
  * Finger-count roasts
  * Mouth roasts
  * Multimodal combination roasts
  * Randomized responses

* 🔊 **Voice Roasts**

  * Automatically reads roast dialogues aloud
  * Browser-native Text-to-Speech
  * Voice enable/disable
  * Replay roast

* 🎮 **Gamified Experience**

  * Missions
  * XP
  * Combo streaks
  * Session statistics

* 🐙 **Pixel-Art Octopus Mascot**

  * Animated mascot
  * Crawls around the camera interface
  * Reacts to user interactions

* 🎨 **Custom Creative UI**

  * Pastel pink
  * Lavender
  * Cyan
  * Yellow
  * Charcoal
  * Retro/pixel-art inspired visual language

* ⚡ **Edge AI**

  * Runs entirely in the browser
  * No webcam frames sent to a server
  * TensorFlow.js WebGL
  * MediaPipe WASM

---

## 🧠 How It Works

```text
              WEBCAM
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
      FACE      HAND      MOUTH
       │         │         │
       ↓         ↓         ↓
   Emotion     Fingers   Mouth State
       │         │         │
       └─────────┼─────────┘
                 ↓
          ROAST ENGINE
                 ↓
        ┌────────┴────────┐
        ↓                 ↓
     TEXT ROAST       SPOKEN ROAST
        ↓                 ↓
        └────────┬────────┘
                 ↓
          XP / MISSIONS
```

Everything runs locally in the user's browser.

---

## 🛠️ Tech Stack

| Technology             | Purpose                                 |
| ---------------------- | --------------------------------------- |
| React 18               | UI framework                            |
| Vite                   | Development/build tooling               |
| Tailwind CSS           | Styling                                 |
| TensorFlow.js          | Emotion inference                       |
| WebGL                  | Hardware-accelerated TensorFlow backend |
| MediaPipe Tasks Vision | Hand & facial landmark tracking         |
| WebAssembly            | MediaPipe execution                     |
| Web Speech API         | Roast text-to-speech                    |
| Web Camera API         | Webcam access                           |

---

## 📁 Project Structure

```text
RoastCam/
│
├── public/
│   ├── models/
│   │   └── emotion/
│   │       ├── model.json
│   │       └── *.bin
│   │
│   └── assets/
│
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/roastcam.git
cd roastcam
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add the emotion model

Place the trained 7-class emotion recognition model at:

```text
public/models/emotion/
```

Expected structure:

```text
public/models/emotion/
├── model.json
├── group1-shard1ofN.bin
├── group1-shard2ofN.bin
└── ...
```

The model should accept:

```text
[1, 48, 48, 1]
```

and output seven emotion probabilities.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite.

---

## 📷 Camera Requirements

RoastCam requests:

```javascript
{
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  }
}
```

Camera access must be granted by the user.

For production deployments, use **HTTPS**, since browser camera access generally requires a secure context.

---

## 🔒 Privacy

RoastCam is designed around **local processing**.

Your webcam feed is processed within the browser and is not intentionally uploaded to a remote server.

> **100% LOCAL AI**
> Your data stays on your device.

---

## ⚠️ Limitations

RoastCam is a fun experimental project and should not be treated as a reliable psychological, medical, or biometric assessment system.

Detection accuracy can be affected by:

* Lighting
* Camera quality
* Face angle
* Occluded hands
* Multiple people in frame
* Facial expressions
* Model quality
* Device performance

Emotion predictions are probabilistic and should not be interpreted as statements about a person's actual emotional state.

---

## 🎯 Project Philosophy

Most AI projects try to solve important problems.

RoastCam does the opposite.

It uses sophisticated technologies to answer questions such as:

> **“How many fingers am I holding up?”**

> **“Is my mouth open?”**

> **“Am I smiling?”**

Questions that humanity arguably did not need AI to answer.

---

## 🏆 Uselessness Metrics

```text
USEFULNESS       0%
TECHNICAL VALUE  100%
AI INVOLVEMENT   100%
NECESSITY        QUESTIONABLE
```

---

## 🔮 Future Ideas

Potential extensions include:

* More roast combinations
* Additional gesture-based controls
* Two-hand gesture challenges
* More expression heuristics
* Custom voice packs
* Multiplayer roast battles
* Leaderboards
* More interactive octopus animations
* Additional AI-powered “useless” features

---

## 📜 License

Choose a license appropriate for your repository. For example, MIT:

```text
MIT License
```

---

## 👨‍💻 Built For

**Useless Project — RoastCam**

A project demonstrating that advanced technology doesn't necessarily need to solve a serious problem.

Sometimes it just needs to roast you.

### **ROASTCAM**

**See. Feel. Play.**
**100% Local AI. 0% Useful.**
