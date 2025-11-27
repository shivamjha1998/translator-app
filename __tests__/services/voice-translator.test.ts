import { audioService } from '@/src/services/audio.service';
import { elevenLabsService } from '@/src/services/elevenlabs.service';
import { openAIService } from '@/src/services/openai.service';
import { voiceTranslatorService } from '@/src/services/voice-translator.service';

// Mock dependencies
jest.mock('@/src/services/elevenlabs.service');
jest.mock('@/src/services/openai.service');
jest.mock('@/src/services/audio.service');

jest.mock('expo-audio', () => ({
  AudioModule: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
  createAudioPlayer: jest.fn().mockReturnValue({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(),
    addListener: jest.fn(),
  }),
  useAudioRecorder: jest.fn().mockReturnValue({
    isRecording: false,
    record: jest.fn(),
    stop: jest.fn(),
    uri: 'file://mock-recording.m4a',
    prepareToRecordAsync: jest.fn(),
  }),
  RecordingPresets: {
    HIGH_QUALITY: {},
  },
}));

// Mock expo-file-system to prevent native module errors
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((uri: string) => ({
    uri,
    exists: true,
    create: jest.fn(),
    write: jest.fn(),
    delete: jest.fn(),
  })),
  Paths: {
    cache: '/mock/cache/path',
  },
}));

describe('VoiceTranslatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should coordinate EN→JA translation flow correctly', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('Hello');
    (openAIService.translateText as jest.Mock).mockResolvedValue({
      inputLang: 'en',
      translated: 'こんにちは',
      romanized: 'Konnichiwa',
    });
    (elevenLabsService.tts as jest.Mock).mockResolvedValue('file://tts.mp3');
    (audioService.playSound as jest.Mock).mockResolvedValue(undefined);

    // 2. Execute
    const result = await voiceTranslatorService.translateAudio('file://audio.m4a', 'en-ja');

    // 3. Verify steps were called in correct order
    expect(elevenLabsService.transcribeAudio).toHaveBeenCalledWith('file://audio.m4a');
    expect(openAIService.translateText).toHaveBeenCalledWith('Hello', 'en-ja');
    expect(elevenLabsService.tts).toHaveBeenCalledWith('こんにちは', 'ja');
    expect(audioService.playSound).toHaveBeenCalledWith('file://tts.mp3');

    // 4. Verify Result
    expect(result).toEqual({
      original: 'Hello',
      translated: 'こんにちは',
      romanized: 'Konnichiwa',
      inputLang: 'en',
      targetLang: 'ja',
      ttsUri: 'file://tts.mp3',
    });
  });

  it('should coordinate JA→EN translation flow correctly', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('こんにちは');
    (openAIService.translateText as jest.Mock).mockResolvedValue({
      inputLang: 'ja',
      translated: 'Hello',
      romanized: null,
    });
    (elevenLabsService.tts as jest.Mock).mockResolvedValue('file://tts-en.mp3');
    (audioService.playSound as jest.Mock).mockResolvedValue(undefined);

    // 2. Execute
    const result = await voiceTranslatorService.translateAudio('file://audio.m4a', 'ja-en');

    // 3. Verify steps
    expect(elevenLabsService.transcribeAudio).toHaveBeenCalledWith('file://audio.m4a');
    expect(openAIService.translateText).toHaveBeenCalledWith('こんにちは', 'ja-en');
    expect(elevenLabsService.tts).toHaveBeenCalledWith('Hello', 'en');
    expect(audioService.playSound).toHaveBeenCalledWith('file://tts-en.mp3');

    // 4. Verify Result
    expect(result).toEqual({
      original: 'こんにちは',
      translated: 'Hello',
      romanized: null,
      inputLang: 'ja',
      targetLang: 'en',
      ttsUri: 'file://tts-en.mp3',
    });
  });

  it('should handle auto direction correctly when EN is detected', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('Good morning');
    (openAIService.translateText as jest.Mock).mockResolvedValue({
      inputLang: 'en',
      translated: 'おはようございます',
      romanized: 'Ohayou gozaimasu',
    });
    (elevenLabsService.tts as jest.Mock).mockResolvedValue('file://tts-auto.mp3');
    (audioService.playSound as jest.Mock).mockResolvedValue(undefined);

    // 2. Execute with 'auto' direction
    const result = await voiceTranslatorService.translateAudio('file://audio.m4a', 'auto');

    // 3. Verify auto-detection: EN input → JA output
    expect(elevenLabsService.tts).toHaveBeenCalledWith('おはようございます', 'ja');
    expect(result.inputLang).toBe('en');
    expect(result.targetLang).toBe('ja');
    expect(result.ttsUri).toBe('file://tts-auto.mp3');
  });

  it('should handle auto direction correctly when JA is detected', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('ありがとう');
    (openAIService.translateText as jest.Mock).mockResolvedValue({
      inputLang: 'ja',
      translated: 'Thank you',
      romanized: null,
    });
    (elevenLabsService.tts as jest.Mock).mockResolvedValue('file://tts-auto2.mp3');
    (audioService.playSound as jest.Mock).mockResolvedValue(undefined);

    // 2. Execute with 'auto' direction
    const result = await voiceTranslatorService.translateAudio('file://audio.m4a', 'auto');

    // 3. Verify auto-detection: JA input → EN output
    expect(elevenLabsService.tts).toHaveBeenCalledWith('Thank you', 'en');
    expect(result.inputLang).toBe('ja');
    expect(result.targetLang).toBe('en');
    expect(result.ttsUri).toBe('file://tts-auto2.mp3');
  });

  it('should propagate errors from STT service', async () => {
    // 1. Setup Mock to throw error
    (elevenLabsService.transcribeAudio as jest.Mock).mockRejectedValue(
      new Error('STT API error')
    );

    // 2. Verify error is propagated
    await expect(
      voiceTranslatorService.translateAudio('file://audio.m4a', 'auto')
    ).rejects.toThrow('STT API error');

    // 3. Verify subsequent steps were not called
    expect(openAIService.translateText).not.toHaveBeenCalled();
    expect(elevenLabsService.tts).not.toHaveBeenCalled();
    expect(audioService.playSound).not.toHaveBeenCalled();
  });

  it('should propagate errors from translation service', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('Hello');
    (openAIService.translateText as jest.Mock).mockRejectedValue(
      new Error('Translation failed')
    );

    // 2. Verify error is propagated
    await expect(
      voiceTranslatorService.translateAudio('file://audio.m4a', 'en-ja')
    ).rejects.toThrow('Translation failed');

    // 3. Verify subsequent steps were not called
    expect(elevenLabsService.tts).not.toHaveBeenCalled();
    expect(audioService.playSound).not.toHaveBeenCalled();
  });

  it('should propagate errors from TTS service', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('Hello');
    (openAIService.translateText as jest.Mock).mockResolvedValue({
      inputLang: 'en',
      translated: 'こんにちは',
      romanized: 'Konnichiwa',
    });
    (elevenLabsService.tts as jest.Mock).mockRejectedValue(
      new Error('TTS generation failed')
    );

    // 2. Verify error is propagated
    await expect(
      voiceTranslatorService.translateAudio('file://audio.m4a', 'en-ja')
    ).rejects.toThrow('TTS generation failed');

    // 3. Verify playSound was not called
    expect(audioService.playSound).not.toHaveBeenCalled();
  });

  it('should handle playSound errors gracefully', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('Hello');
    (openAIService.translateText as jest.Mock).mockResolvedValue({
      inputLang: 'en',
      translated: 'こんにちは',
      romanized: 'Konnichiwa',
    });
    (elevenLabsService.tts as jest.Mock).mockResolvedValue('file://tts.mp3');
    (audioService.playSound as jest.Mock).mockRejectedValue(
      new Error('Audio playback failed')
    );

    // 2. Verify error is propagated
    await expect(
      voiceTranslatorService.translateAudio('file://audio.m4a', 'en-ja')
    ).rejects.toThrow('Audio playback failed');
  });
});
