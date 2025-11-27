# **EN ⇄ JA Voice Translator App**

A simple voice translation application built with **React Native** and **Expo**. This app allows users to translate speech in English or Japanese, translates it using **OpenAI**, and plays back the translation using **ElevenLabs** realistic text-to-speech synthesis.

## **🚀 Features**

* **Voice-to-Voice Translation:** seamless translation between English and Japanese.
* **Auto-Detection:** Automatically detects the input language or allows manual direction selection (EN → JA, JA → EN).
* **High-Quality Audio:** Uses expo-audio for high-fidelity recording and playback.
* **AI-Powered Translation:** Leverages OpenAI's GPT-4o-mini model for natural, conversational translations.
* **Realistic TTS:** Utilizes ElevenLabs for high-quality voice synthesis in the target language.
* **Romanization Support:** Displays Romanized text (Romaji) for Japanese translations to aid pronunciation.
* **Dark/Light Mode:** Fully adaptive UI that respects system theme settings.

## **🛠 Tech Stack**

* **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 54\)
* **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
* **Audio:** [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) for recording and playback
* **File System:** [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) for managing audio files
* **AI Services:**
  * [OpenAI API](https://openai.com/) (Translation)
  * [ElevenLabs API](https://elevenlabs.io/) (Text-to-Speech & Speech-to-Text)
* **UI:** Custom themed components with react-native-reanimated for smooth interactions.

## **📋 Prerequisites**

Before you begin, ensure you have the following:

* **Node.js** (LTS version recommended)
* **Expo Go** app installed on your physical device (Android/iOS) OR an Android Emulator/iOS Simulator.
* **API Keys:**
  * OpenAI API Key
  * ElevenLabs API Key

## **⚙️ Installation & Setup**

1. **Clone the repository:**
   ```
   git clone https://github.com/shivamjha1998/translator-app
   cd translator-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. Configure Environment Variables:
   Create a .env file in the root directory of your project. You can copy the structure from a .env.example if one exists, or simply add the following keys:
   ```
   EXPO\_PUBLIC\_OPENAI\_API=your\_openai\_api\_key\_here
   EXPO\_PUBLIC\_ELEVENLABS\_API=your\_elevenlabs\_api\_key\_here
   ```
   **Note:** This project uses expo-env and process.env.EXPO\_PUBLIC\_... variables, which are embedded into the app at build time. **Do not commit your real API keys to version control.**

## **🏃‍♂️ Running the App**

Start the Expo development server:

   ```
   npx expo start
   ```

* **Run on Android:** Press a in the terminal (requires Emulator or connected device).
* **Run on iOS:** Press i in the terminal (requires Simulator or MacOS).
* **Run on Web:** Press w in the terminal.
* **Run on Physical Device:** Scan the QR code displayed in the terminal using the **Expo Go** app.

## **🛡️ Troubleshooting**

* **Microphone Permissions:** If recording doesn't start, ensure you have granted microphone permissions to the Expo Go app on your device settings.
* **API Errors:** Check your console logs. If you see 401 errors, verify your API keys in the .env file are correct and have valid credits.
* **Audio Issues:** Ensure your volume is up and your device is not in silent mode (depending on system settings, audio might be muted).

## **📄 License**

This project is licensed under the MIT License.
