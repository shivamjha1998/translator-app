// src/services/audio.service.ts
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  async startRecording() {
    // Ask for mic permission
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission not granted');
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });

    // Start recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    this.recording = recording;
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      return uri ?? null;
    } catch (err) {
      console.error('stopRecording error', err);
      this.recording = null;
      return null;
    }
  }

  async playSound(uri: string) {
    // stop old sound
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    this.sound = sound;

    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.unloadAsync();
        this.sound = null;
      }
    });
  }
}

export const audioService = new AudioService();
