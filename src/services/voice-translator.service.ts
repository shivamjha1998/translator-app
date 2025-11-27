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
}

class VoiceTranslatorService {
  async startRecording() {
    await audioService.startRecording();
  }

  async stopAndTranslate(
    direction: TranslationDirection = 'auto',
  ): Promise<VoiceTranslationResult> {
    // 1. Stop recording & get URI
    const audioUri = await audioService.stopRecording();
    if (!audioUri) throw new Error('No audio recorded');

    // 2. Speech → Text (ElevenLabs STT)
    const transcript = await elevenLabsService.transcribeAudio(audioUri);

    // 3. Text → Text (OpenAI translation, with direction)
    const translation = await openAIService.translateText(transcript, direction);

    // 4. Decide target language for TTS
    const targetLang: ElevenLang = (() => {
      if (direction === 'en-ja') return 'ja';
      if (direction === 'ja-en') return 'en';

      // auto: flip based on input
      return translation.inputLang === 'en' ? 'ja' : 'en';
    })();

    // 5. Text → Speech (ElevenLabs TTS)
    const ttsUri = await elevenLabsService.tts(
      translation.translated,
      targetLang,
    );

    // 6. Play result audio
    await audioService.playSound(ttsUri);

    return {
      original: transcript,
      translated: translation.translated,
      romanized: translation.romanized,
      inputLang: translation.inputLang,
      targetLang,
    };
  }
}

export const voiceTranslatorService = new VoiceTranslatorService();
