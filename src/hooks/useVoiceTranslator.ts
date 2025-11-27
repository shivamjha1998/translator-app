import { TranslationDirection } from '@/src/services/openai.service';
import {
  VoiceTranslationResult,
  voiceTranslatorService,
  VoiceTranslatorStatus,
} from '@/src/services/voice-translator.service';
import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { useEffect, useState } from 'react';

type ExtendedStatus = VoiceTranslatorStatus | 'error';

export function useVoiceTranslator() {
  const [status, setStatus] = useState<ExtendedStatus>('idle');
  const [lastResult, setLastResult] = useState<VoiceTranslationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState<TranslationDirection>('auto');

  // Initialize the recorder with high quality preset
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Request permissions on mount and configure audio mode
  useEffect(() => {
    (async () => {
      const perms = await AudioModule.requestRecordingPermissionsAsync();
      if (perms.status !== 'granted') {
        setErrorMessage('Microphone permission not granted');
      }
    })();
  }, []);

  // Sync recorder state with our status
  const isRecording = audioRecorder.isRecording;

  // Update internal status based on recorder state
  useEffect(() => {
    if (isRecording) {
      setStatus('recording');
    } else if (status === 'recording') {

    }
  }, [isRecording]);

  const isBusy = ['transcribing', 'translating', 'speaking'].includes(
    status as VoiceTranslatorStatus,
  );

  async function toggleRecording() {
    try {
      setErrorMessage(null);

      if (isRecording) {
        // STOP RECORDING
        await audioRecorder.stop();

        const uri = audioRecorder.uri;
        if (!uri) {
            throw new Error("Recording failed: No audio URI found");
        }

        setStatus('transcribing');

        // Pass the URI to the service
        const result = await voiceTranslatorService.translateAudio(uri, direction);

        setLastResult(result);
        setStatus('idle');
      } else if (!isBusy) {
        // START RECORDING
        setLastResult(null);

        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        // Prepare and record
        if (audioRecorder.prepareToRecordAsync) {
             await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
        }
        audioRecorder.record();

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
