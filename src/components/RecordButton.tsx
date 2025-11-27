import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  isRecording: boolean;
  isBusy: boolean;
  onPress: () => void;
}

export const RecordButton: React.FC<Props> = ({ isRecording, isBusy, onPress }) => {
  const label = isRecording ? 'Tap to stop' : 'Tap to speak';

  return (
    <View style={styles.container}>
      <Pressable
        disabled={isBusy}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isRecording && styles.buttonRecording,
          pressed && styles.buttonPressed,
          isBusy && styles.buttonDisabled,
        ]}
      >
        {isBusy ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#312e81',
  },
  buttonRecording: {
    backgroundColor: '#b91c1c',
    borderColor: '#fecaca',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '600',
  },
});
