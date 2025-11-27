import { audioService } from '@/src/services/audio.service';
import { elevenLabsService } from '@/src/services/elevenlabs.service';
import { openAIService } from '@/src/services/openai.service';
import { voiceTranslatorService } from '@/src/services/voice-translator.service';

// Mock dependencies
jest.mock('@/src/services/elevenlabs.service');
jest.mock('@/src/services/openai.service');
jest.mock('@/src/services/audio.service');

// Mock Audio Expo.
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

describe('VoiceTranslatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should coordinate translation flow correctly', async () => {
    // 1. Setup Mocks
    (elevenLabsService.transcribeAudio as jest.Mock).mockResolvedValue('Hello');
    (openAIService.translateText as jest.Mock).mockResolvedValue({
      inputLang: 'en',
      translated: 'Konnichiwa',
      romanized: 'Konnichiwa',
    });
    (elevenLabsService.tts as jest.Mock).mockResolvedValue('file://tts.mp3');
    (audioService.playSound as jest.Mock).mockResolvedValue(undefined);

    // 2. Execute
    const result = await voiceTranslatorService.translateAudio('file://audio.m4a', 'en-ja');

    // 3. Verify steps
    expect(elevenLabsService.transcribeAudio).toHaveBeenCalledWith('file://audio.m4a');
    expect(openAIService.translateText).toHaveBeenCalledWith('Hello', 'en-ja');
    // Check if correct target language 'ja' was inferred for TTS
    expect(elevenLabsService.tts).toHaveBeenCalledWith('Konnichiwa', 'ja');
    expect(audioService.playSound).toHaveBeenCalledWith('file://tts.mp3');

    // 4. Verify Result
    expect(result).toEqual({
      original: 'Hello',
      translated: 'Konnichiwa',
      romanized: 'Konnichiwa',
      inputLang: 'en',
      targetLang: 'ja',
      ttsUri: 'file://tts.mp3',
    });
  });
});
