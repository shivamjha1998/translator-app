import { audioService } from '@/src/services/audio.service';
import { TranslationDirection } from '@/src/services/openai.service';
import {
  VoiceTranslationResult,
  voiceTranslatorService,
  VoiceTranslatorStatus,
} from '@/src/services/voice-translator.service';
import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { File } from 'expo-file-system';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

type ExtendedStatus = VoiceTranslatorStatus | 'error';

// Hard cap for a single session
const MAX_SESSION_USAGE = 10;

export function useVoiceTranslator() {
  const [status, setStatus] = useState<ExtendedStatus>('idle');
  const [lastResult, setLastResult] = useState<VoiceTranslationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState<TranslationDirection>('auto');
  const [usageCount, setUsageCount] = useState(0);

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

  const isRecording = audioRecorder.isRecording;

  useEffect(() => {
    if (isRecording) {
      setStatus('recording');
    }
  }, [isRecording]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        setLastResult(null);
        setStatus('idle');
      }
    });
    return () => subscription.remove();
  }, []);

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
        if (!uri) throw new Error("Recording failed: No audio URI found");

        // Check usage limit
        if (usageCount >= MAX_SESSION_USAGE) {
            setStatus('idle');
            setErrorMessage("Session limit reached (10 translations). Restart app to reset.");
            return;
        }

        setStatus('transcribing');

        // Pass the URI to the service
        const result = await voiceTranslatorService.translateAudio(uri, direction);

        setUsageCount(prev => prev + 1);
        setLastResult(result);
        setStatus('idle');

        // Cleanup
        try {
            const file = new File(uri);
            if (file.exists) file.delete();
        } catch (cleanupErr) {
            console.warn("Failed to cleanup recording file", cleanupErr);
        }

      } else if (!isBusy) {
        // START RECORDING
        if (usageCount >= MAX_SESSION_USAGE) {
            setErrorMessage("Session limit reached. Restart app.");
            return;
        }

        setLastResult(null);
        await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
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

  const replayAudio = async () => {
      if (lastResult?.ttsUri) {
          try {
              await audioService.playSound(lastResult.ttsUri);
          } catch (e) {
              console.error("Replay failed", e);
              setErrorMessage("Failed to replay audio");
          }
      }
  };

  return {
    status,
    isRecording,
    isBusy,
    lastResult,
    errorMessage,
    toggleRecording,
    direction,
    setDirection,
    replayAudio,
    usageCount,
  };
}
