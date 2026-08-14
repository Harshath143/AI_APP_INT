/**
 * Audio Recording Helper Service
 * Manages timer, recording states, and audio buffers for Whisper transcription.
 */

export interface AudioRecordingState {
  isRecording: boolean;
  durationSeconds: number;
  audioUri: string | null;
}

type StateListener = (state: AudioRecordingState) => void;

class AudioServiceManager {
  private isRecording = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private durationSeconds = 0;
  private listeners: Set<StateListener> = new Set();

  subscribe(listener: StateListener) {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState: AudioRecordingState = {
      isRecording: this.isRecording,
      durationSeconds: this.durationSeconds,
      audioUri: this.isRecording ? 'mock_interview_audio.wav' : null,
    };
    this.listeners.forEach(fn => {
      try {
        fn(currentState);
      } catch {
        // Prevent listener error from crashing audio service
      }
    });
  }

  startRecording() {
    if (this.isRecording) return;
    this.isRecording = true;
    this.durationSeconds = 0;
    this.notify();

    this.timer = setInterval(() => {
      this.durationSeconds += 1;
      this.notify();
    }, 1000);
  }

  stopRecording(): { durationSeconds: number; audioUri: string } {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const finalDuration = this.durationSeconds;
    this.isRecording = false;
    this.notify();

    return {
      durationSeconds: finalDuration,
      audioUri: 'mock_interview_audio.wav',
    };
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const audioService = new AudioServiceManager();
