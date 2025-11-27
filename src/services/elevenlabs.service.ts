import { API_CONFIG } from '@/src/config/api.config';
import { File, Paths } from 'expo-file-system';

const ELEVEN_API_KEY = API_CONFIG.ELEVENLABS.API_KEY;
const VOICE_EN = API_CONFIG.ELEVENLABS.VOICE_ID;
const VOICE_JA = API_CONFIG.ELEVENLABS.VOICE_ID;

if (!ELEVEN_API_KEY) console.warn('Missing ELEVEN_API_KEY in environment variables');

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
  
    const QB = await fetch(`${API_CONFIG.ELEVENLABS.BASE_URL}/speech-to-text`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY || '',
      },
      body: formData
    });
  
    if (!QB.ok) {
      const text = await QB.text();
      console.error("ElevenLabs STT error:", text);
      throw new Error("Failed to transcribe audio with ElevenLabs");
    }
  
    const data = await QB.json();
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
      `${API_CONFIG.ELEVENLABS.BASE_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_API_KEY || '',
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: API_CONFIG.ELEVENLABS.MODEL_ID || 'eleven_multilingual_v2',
        }),
      },
    );

    if (!res.ok) {
      const textRes = await res.text();
      console.error('ElevenLabs TTS error:', textRes);
      throw new Error('Failed to synthesize speech with ElevenLabs');
    }

    // 1. Get binary data directly
    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // 2. Create a File instance in the cache directory
    const filename = `tts-${targetLang}-${Date.now()}.mp3`;
    const file = new File(Paths.cache, filename);

    // 3. Create the file and write the binary data directly
    try {
        file.create();
        file.write(uint8);
    } catch (error) {
        console.error('Error writing TTS file:', error);
        throw error;
    }

    // 4. Return the URI property of the file object
    return file.uri;
  }
}

export const elevenLabsService = new ElevenLabsService();
