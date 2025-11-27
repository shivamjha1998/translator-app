import { useVoiceTranslator } from '@/src/hooks/useVoiceTranslator';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  const {
    status,
    isRecording,
    isBusy,
    lastResult,
    errorMessage,
    toggleRecording,
    direction,
    setDirection,
  } = useVoiceTranslator();

  const label =
    status === 'recording'
      ? 'Tap to stop'
      : isBusy
      ? 'Processing...'
      : 'Tap to speak';

  const directionLabel =
    direction === 'auto'
      ? 'Auto (EN ⇄ JA)'
      : direction === 'en-ja'
      ? 'EN → JA'
      : 'JA → EN';

  const cycleDirection = () => {
    if (direction === 'auto') setDirection('en-ja');
    else if (direction === 'en-ja') setDirection('ja-en');
    else setDirection('auto');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>EN ⇄ JA Voice Translator</Text>

        <Pressable style={styles.directionChip} onPress={cycleDirection}>
          <Text style={styles.directionText}>{directionLabel}</Text>
        </Pressable>

        <Text style={styles.status}>Status: {status}</Text>

        <Pressable
          onPress={toggleRecording}
          disabled={isBusy}
          style={({ pressed }) => [
            styles.button,
            isRecording && styles.buttonRecording,
            isBusy && styles.buttonDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          {isBusy ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>{label}</Text>
          )}
        </Pressable>

        <View style={styles.block}>
          <Text style={styles.label}>Original:</Text>
          <Text style={styles.text}>{lastResult?.original ?? '—'}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Translation:</Text>
          <Text style={styles.text}>{lastResult?.translated ?? '—'}</Text>
          {lastResult?.romanized ? (
            <Text style={styles.romanized}>{lastResult.romanized}</Text>
          ) : null}
        </View>

        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 32,
    backgroundColor: '#020617',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 12,
  },
  directionChip: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f46e5',
    marginBottom: 8,
  },
  directionText: {
    color: '#c7d2fe',
    fontWeight: '600',
  },
  status: {
    textAlign: 'center',
    color: '#9ca3af',
    marginBottom: 12,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#4f46e5',
    backgroundColor: '#312e81',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonRecording: {
    backgroundColor: '#b91c1c',
    borderColor: '#fecaca',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '600',
  },
  block: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111827',
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  text: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  romanized: {
    marginTop: 4,
    color: '#a5b4fc',
    fontSize: 14,
  },
  error: {
    marginTop: 12,
    color: '#fecaca',
    textAlign: 'center',
  },
});
