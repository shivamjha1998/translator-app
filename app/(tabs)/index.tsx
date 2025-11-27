import { IconSymbol } from '@/components/ui/icon-symbol';
import { RecordButton } from '@/src/components/RecordButton';
import { useVoiceTranslator } from '@/src/hooks/useVoiceTranslator';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    replayAudio,
    usageCount,
  } = useVoiceTranslator();

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

        <View style={styles.headerRow}>
            <Pressable style={styles.directionChip} onPress={cycleDirection}>
            <Text style={styles.directionText}>{directionLabel}</Text>
            </Pressable>
            <Text style={styles.usage}>Limit: {usageCount}/10</Text>
        </View>

        <View style={styles.statusContainer}>
            {isBusy && status !== 'speaking' ? (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#a5b4fc" />
                    <Text style={styles.statusText}> {status}...</Text>
                </View>
            ) : (
                <Text style={styles.status}>Status: {status}</Text>
            )}
        </View>

        <RecordButton
            isRecording={isRecording}
            isBusy={isBusy}
            onPress={toggleRecording}
        />

        <View style={styles.block}>
          <Text style={styles.label}>Original:</Text>
          <Text style={styles.text}>{lastResult?.original ?? '—'}</Text>
        </View>

        <View style={styles.block}>
          <View style={styles.translationHeader}>
            <Text style={styles.label}>Translation:</Text>
            {lastResult?.translated && (
                <TouchableOpacity onPress={replayAudio} style={styles.replayBtn}>
                    <IconSymbol name="paperplane.fill" size={16} color="#a5b4fc" />
                    {/* Note: Using paperplane as placeholder for 'play', or use a speaker icon if available in mapping */}
                    <Text style={styles.replayText}>Replay</Text>
                </TouchableOpacity>
            )}
          </View>

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
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
  },
  directionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  directionText: {
    color: '#c7d2fe',
    fontWeight: '600',
  },
  usage: {
      color: '#6b7280',
      fontSize: 12,
  },
  statusContainer: {
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  status: {
    textAlign: 'center',
    color: '#9ca3af',
  },
  loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  statusText: {
      color: '#a5b4fc',
      marginLeft: 8,
  },
  block: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111827',
  },
  translationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
  },
  replayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1e1b4b',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
  },
  replayText: {
      color: '#a5b4fc',
      fontSize: 12,
      fontWeight: '600',
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
