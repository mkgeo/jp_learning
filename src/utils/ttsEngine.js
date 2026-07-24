/**
 * Text-To-Speech (TTS) Engine for Japanese
 * Uses Web Speech API (speechSynthesis)
 */

class TTSEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.onStateChangeCallbacks = [];

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    const allVoices = this.synth.getVoices();
    // Filter Japanese voices or fallback to any Asian/universal voice
    this.voices = allVoices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));

    if (this.voices.length > 0 && !this.selectedVoice) {
      // Prefer Google or Natural Japanese voice if present
      const preferred = this.voices.find(v => 
        v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Kyoko') || v.name.includes('Otoya')
      );
      this.selectedVoice = preferred || this.voices[0];
    } else if (allVoices.length > 0 && !this.selectedVoice) {
      // Fallback
      this.selectedVoice = allVoices.find(v => v.lang.startsWith('ja')) || allVoices[0];
    }
    return this.voices;
  }

  getVoices() {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  setVoice(voiceName) {
    const allVoices = this.synth ? this.synth.getVoices() : [];
    const found = allVoices.find(v => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
    }
  }

  setRate(newRate) {
    this.rate = Math.max(0.5, Math.min(2.0, parseFloat(newRate)));
  }

  subscribeStateChange(callback) {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  notifyState() {
    const state = {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      rate: this.rate
    };
    this.onStateChangeCallbacks.forEach(cb => cb(state));
  }

  /**
   * Speak out text with callbacks for word boundaries and finish
   */
  speak(text, onBoundary = null, onEnd = null) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser environment.');
      return;
    }

    // Cancel ongoing speech
    this.stop();

    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'ja-JP';
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    };

    utterance.onboundary = (event) => {
      if (onBoundary) {
        onBoundary(event.charIndex, event.charLength || 1);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyState();
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.warn('SpeechSynthesis error:', event);
      this.isSpeaking = false;
      this.isPaused = false;
      this.notifyState();
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyState();
    }
  }
}

export const tts = new TTSEngine();
