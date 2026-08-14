# 🚀 Noobie - AI Interview Copilot (AI_APP_INT)

An ultra-fast, real-time AI Interview Copilot and Assistant built with **React Native**, **TypeScript**, and **Groq Cloud API**, featuring a **Luxury Minimalist Black & White Theme**. Designed for clean legibility, low latency, and distraction-free operation during live technical interviews and coding challenges.

---

## 🌟 Key Features

* **⚡ Ultra-Fast LLM Streaming:** Real-time token streaming powered by Groq's high-speed inference engine for near-instant responses.
* **🎙️ Voice & Audio Transcription:** Transcribe live interview questions using Groq's Whisper API (`whisper-large-v3-turbo`).
* **📸 Screen Vision Analysis:** Upload/capture screenshots of coding challenges or system architecture diagrams using Groq Vision (`Llama 4 Scout 17B`, `Llama 3.2 11B Vision`).
* **🎯 Specialized Candidate Roles:** Switch presets tailored for specific technical roles (*Python Dev*, *React Native Dev*, *System Design*, *Fullstack Engineer*, *General Tech*).
* **🖤 Luxury Minimalist B&W Aesthetic:** High-contrast monochrome layout with clean borders, obsidian black backgrounds (`#000000`), crisp white accents (`#ffffff`), and dark zinc cards (`#18181b`).
* **🔒 API Key & Log Privacy Sanitization:** Automatic redaction of sensitive credentials (`gsk_...`) in developer logs and error outputs.
* **💾 Local Data Persistence:** Automatic saving of settings, custom system prompts, and interview session history via Async Storage.

---

## 🛠️ Tech Stack

* **Framework:** [React Native](https://reactnative.dev/) v0.87 + [React 19](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/) v6.0
* **AI & LLM Provider:** [Groq Cloud API](https://groq.com/)
  * *Text Models:* `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `gemma2-9b-it`
  * *Vision Models:* `meta-llama/llama-4-scout-17b-16e-instruct`, `llama-3.2-11b-vision-preview`
  * *Audio Model:* `whisper-large-v3-turbo`
* **Storage:** `@react-native-async-storage/async-storage`
* **Safe Layouts:** `react-native-safe-area-context`

---

## 📁 Project Architecture

```
Noobie/
├── android/                 # Android Native Project Files
├── ios/                     # iOS Native Project Files
├── src/
│   ├── components/          # Reusable UI Components
│   │   ├── ActionToolbar.tsx        # Query input, transcribe, vision & clear controls
│   │   ├── ControlFooter.tsx        # Model picker, role selector & HUD opacity slider
│   │   ├── InterviewHeader.tsx      # Recording status badge, timer & collapsible header
│   │   ├── SettingsModal.tsx       # Groq API key manager & custom system prompt editor
│   │   └── StreamingAnswerView.tsx  # Live token response view & chat history
│   ├── services/            # Core Business Logic & API Services
│   │   ├── audioService.ts          # Audio recording state manager & duration timer
│   │   ├── groqService.ts           # Groq Chat Streaming, Whisper & Vision API integrations
│   │   └── storageService.ts        # Async Storage manager for settings & history
│   ├── types/               # TypeScript Definitions
│   │   └── chat.ts                  # Chat messages, role options, models & app settings
│   └── utils/               # Utility Functions
│       └── sanitizer.ts             # Log sanitizer for redacting sensitive API keys
├── App.tsx                  # Application Entry Point & Main State Orchestrator
├── index.js                 # React Native Registry Entry
├── package.json             # Dependencies & NPM Scripts
└── README.md                # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your developer machine:

1. **Node.js:** `>= 22.11.0`
2. **Package Manager:** `npm` or `yarn`
3. **Android Studio / Xcode:** For running on Android Emulator or iOS Simulator.
4. **Groq API Key:** Obtain a free API key from [Groq Console](https://console.groq.com/).

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshath143/AI_APP_INT.git
   cd AI_APP_INT
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install CocoaPods (for iOS):**
   ```bash
   cd ios && pod install && cd ..
   ```

---

### Running the Application

* **Start Metro Bundler:**
  ```bash
  npm start
  ```

* **Run on Android:**
  ```bash
  npm run android
  ```

* **Run on iOS:**
  ```bash
  npm run ios
  ```

---

## ⚙️ Configuration & Setup

1. Launch the app on your device or simulator.
2. Tap the **Settings (⚙)** icon in the top header.
3. Enter your **Groq API Key** (`gsk_...`) and click **Save Settings**.
4. Select your preferred text model (e.g. `llama-3.1-8b-instant` or `llama-3.3-70b-versatile`) and candidate role.
5. (Optional) Provide a custom System Prompt to fine-tune responses for your target interview domain.

---

## 📖 Usage Guide

1. **Text Questions:** Type a technical question or coding prompt into the text bar and hit **Send**.
2. **Audio Mode:** Press the record button in the header during a question, then tap **🔍 Transcribe & Answer** to convert speech to text and generate an immediate answer.
3. **Screen Vision Mode:** Click **📸 Screen Vision** to send code snippets or screenshots to the Vision model for solution analysis.
4. **HUD Mode:** Use the opacity slider in the footer or tap the collapse button in the header to minimize the app footprint.

---

## 🔒 Security & Privacy Notice

* Your Groq API key is stored locally on your device via encrypted `AsyncStorage` and is never sent to third-party tracking servers.
* The app includes automated console log sanitization (`sanitizer.ts`) to prevent API keys from leaking into log outputs or crash tracebacks.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).