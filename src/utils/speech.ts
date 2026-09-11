// Browser-native speech synthesis service conforming to RoastCam Voice UX rules

class SpeechService {
  private muted: boolean = false;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private cooldownMs: number = 3800; // Minimum 3.8s between voice roasts to prevent audio spam
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural English voices (e.g. Google UK English, Samantha, Daniel, or default en-US)
        this.selectedVoice =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0] ||
          null;
      };
      updateVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoice;
      }
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (m && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  speak(text: string, force: boolean = false): boolean {
    if (this.muted) return false;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

    const now = Date.now();
    // Prevent repeated roasts or audio spam within cooldown
    if (!force) {
      if (text === this.lastSpokenText && now - this.lastSpokenTime < 10000) {
        return false;
      }
      if (now - this.lastSpokenTime < this.cooldownMs) {
        return false;
      }
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.05; // slightly brisk and energetic
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      this.lastSpokenText = text;
      this.lastSpokenTime = now;

      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  cancel(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
