import { AudioModule, AudioPlayer, createAudioPlayer } from 'expo-audio';

class AudioService {
  private player: AudioPlayer | null = null;

  constructor() {
    AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      shouldPlayInBackground: false,
    }).catch(console.error);
  }

  async playSound(uri: string) {
    // Cleanup previous recording if it exists
    if (this.player) {
      this.player.pause();
      this.player.remove();
      this.player = null;
    }

    // Create a new player with the URI
    this.player = createAudioPlayer({ uri });

    // Play the audio
    this.player.play();
  }

  // Helper to stop playback if needed
  stopPlayback() {
    if (this.player) {
      this.player.pause();
      this.player.seekTo(0);
    }
  }
}

export const audioService = new AudioService();
