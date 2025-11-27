import { audioService } from './audio.service';
import { elevenLabsService, ElevenLang } from './elevenlabs.service';
import { openAIService, TranslationDirection } from './openai.service';

export type VoiceTranslatorStatus =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'translating'
  | 'speaking';

export interface VoiceTranslationResult {
  original: string;
  translated: string;
  romanized?: string | null;
  inputLang: 'en' | 'ja';
  targetLang: 'en' | 'ja';
  ttsUri: string;
}

class VoiceTranslatorService {
  async translateAudio(
    audioUri: string,
    direction: TranslationDirection = 'auto',
  ): Promise<VoiceTranslationResult> {

    // 1. Speech → Text (ElevenLabs STT)
    const transcript = await elevenLabsService.transcribeAudio(audioUri);

    // 2. Text → Text (OpenAI translation)
    const translation = await openAIService.translateText(transcript, direction);

    // 3. Decide target language for TTS
    const targetLang: ElevenLang = (() => {
      if (direction === 'en-ja') return 'ja';
      if (direction === 'ja-en') return 'en';
      return translation.inputLang === 'en' ? 'ja' : 'en';
    })();

    // 4. Text → Speech (ElevenLabs TTS)
    const ttsUri = await elevenLabsService.tts(
      translation.translated,
      targetLang,
    );

    // 5. Play result audio
    await audioService.playSound(ttsUri);

    return {
      original: transcript,
      translated: translation.translated,
      romanized: translation.romanized,
      inputLang: translation.inputLang,
      targetLang,
      ttsUri,
    };
  }
}

export const voiceTranslatorService = new VoiceTranslatorService();
