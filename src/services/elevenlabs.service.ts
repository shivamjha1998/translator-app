import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';

const ELEVEN_API_KEY = 'sk_f65511fff5a1fc1929c38c755d801a21531e1d3e9aead95c';
const VOICE_EN = '2EiwWnXFnvU5JabPnv8n';
const VOICE_JA = '2EiwWnXFnvU5JabPnv8n';

if (!ELEVEN_API_KEY) console.warn('Missing ELEVEN_API_KEY');
if (!VOICE_EN) console.warn('Missing VOICE_EN');
if (!VOICE_JA) console.warn('Missing VOICE_JA');

export type ElevenLang = 'en' | 'ja';

function getVoiceIdForLang(lang: ElevenLang) {
  return lang === 'ja' ? VOICE_JA : VOICE_EN;
}

class ElevenLabsService {
   // Speech → Text using ElevenLabs Scribe (STT)
  async transcribeAudio(audioUri: string): Promise<string> {
    const formData = new FormData();
  
    formData.append("model_id", "scribe_v1");
  
    formData.append("file", {
      uri: audioUri,
      name: "audio.m4a",
      type: "audio/m4a",
    } as any);
  
    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY
      },
      body: formData
    });
  
    if (!res.ok) {
      const text = await res.text();
      console.error("ElevenLabs STT error:", text);
      throw new Error("Failed to transcribe audio with ElevenLabs");
    }
  
    const data = await res.json();
    return data.text;
  }
  
  // Text → Speech using ElevenLabs TTS.

  async tts(text: string, targetLang: ElevenLang): Promise<string> {
    if (!text || !text.trim()) {
      console.error('ElevenLabs TTS called with empty text');
      throw new Error('Cannot synthesize empty text');
    }

    const voiceId = getVoiceIdForLang(targetLang);

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
        }),
      },
    );

    if (!res.ok) {
      const textRes = await res.text();
      console.error('ElevenLabs TTS error:', textRes);
      throw new Error('Failed to synthesize speech with ElevenLabs');
    }

    // ArrayBuffer -> base64 -> file
    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const base64Audio = Buffer.from(uint8).toString('base64');

    const fileUri =
      FileSystem.cacheDirectory + `tts-${targetLang}-${Date.now()}.mp3`;

    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: 'base64',
    });

    return fileUri;
  }
}

export const elevenLabsService = new ElevenLabsService();
