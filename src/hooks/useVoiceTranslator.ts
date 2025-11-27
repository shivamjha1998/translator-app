import { useState } from 'react';
import { TranslationDirection } from '../services/openai.service';
import {
  VoiceTranslationResult,
  voiceTranslatorService,
  VoiceTranslatorStatus,
} from '../services/voice-translator.service';

type ExtendedStatus = VoiceTranslatorStatus | 'error';

export function useVoiceTranslator() {
  const [status, setStatus] = useState<ExtendedStatus>('idle');
  const [lastResult, setLastResult] = useState<VoiceTranslationResult | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Direction state: 'auto' | 'en-ja' | 'ja-en'
  const [direction, setDirection] = useState<TranslationDirection>('auto');

  const isRecording = status === 'recording';
  const isBusy = ['transcribing', 'translating', 'speaking'].includes(
    status as VoiceTranslatorStatus,
  );

  async function toggleRecording() {
    try {
      setErrorMessage(null);

      if (status === 'recording') {
        // Stop & process
        setStatus('transcribing');
        const result = await voiceTranslatorService.stopAndTranslate(direction);
        setLastResult(result);
        setStatus('idle');
      } else if (!isBusy) {
        // Start recording
        setLastResult(null);
        await voiceTranslatorService.startRecording();
        setStatus('recording');
      }
    } catch (err: any) {
      console.error('useVoiceTranslator error', err);
      setStatus('error');
      setErrorMessage(err?.message ?? 'Something went wrong');
    }
  }

  return {
    status,
    isRecording,
    isBusy,
    lastResult,
    errorMessage,
    toggleRecording,
    direction,
    setDirection,
  };
}
