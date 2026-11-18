class HextechSoundEngine {
  private ctx: AudioContext | null = null;
  private masterVolume = 0.8;
  private muted = false;
  private activeVoiceAudio: HTMLAudioElement | null = null;
  private activeSfxAudio: HTMLAudioElement | null = null;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopVoice();
    }
  }

  public setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.activeVoiceAudio) {
      this.activeVoiceAudio.volume = this.masterVolume;
    }
    if (this.activeSfxAudio) {
      this.activeSfxAudio.volume = this.masterVolume * 0.7;
    }
  }

  public stopVoice() {
    if (this.activeVoiceAudio) {
      this.activeVoiceAudio.pause();
      this.activeVoiceAudio.currentTime = 0;
      this.activeVoiceAudio = null;
    }
    if (this.activeSfxAudio) {
      this.activeSfxAudio.pause();
      this.activeSfxAudio.currentTime = 0;
      this.activeSfxAudio = null;
    }
  }

  /**
   * Mechanical + Hextech crystal ratchet tick synced to each card crossing the center indicator.
   * @param progress 0 (fast start) -> 1 (slow finish)
   */
  public playTick(progress = 0.5) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gainValue = (0.14 + progress * 0.14) * this.masterVolume;

    // Sharp metallic body
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = 1480 - progress * 520;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.032);

    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);

    // Subtle high click snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(2800 - progress * 700, now);
    snapOsc.frequency.exponentialRampToValueAtTime(900, now + 0.015);
    snapGain.gain.setValueAtTime(gainValue * 0.55, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.02);
  }

  /**
   * Arcane Hextech charge-up whoosh when starting a spin.
   */
  public playSpinStart() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.34);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.34);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.44);
  }

  /**
   * Deep cinematic Hextech lock-in boom + crystalline harmonic chord on champion reveal.
   */
  public playLockIn() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Sub-bass impact drop
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(135, now);
    subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.48);

    subGain.gain.setValueAtTime(0.42 * this.masterVolume, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.58);

    // 2. Hextech golden chord shimmer (D5, F#5, A5, C#6)
    const freqs = [587.33, 739.99, 880.0, 1174.66];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      const delay = idx * 0.025;
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.08 * this.masterVolume, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  }

  public playUiClick() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);

    gain.gain.setValueAtTime(0.09 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playRoleTick() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.025);

    gain.gain.setValueAtTime(0.08 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playRoleLock() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [659.25, 987.77].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = now + i * 0.05;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.14 * this.masterVolume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.28);
    });
  }

  public playVictoryWin() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Triumphant major arpeggio: G4 - B4 - D5 - G5
    [392.0, 493.88, 587.33, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 3 ? 'triangle' : 'sine';
      const start = now + i * 0.065;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.16 * this.masterVolume, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  }

  public playSfxUrl(url: string) {
    if (this.muted) return;
    if (this.activeSfxAudio) {
      this.activeSfxAudio.pause();
    }
    const audio = new Audio(url);
    audio.volume = Math.min(1, this.masterVolume * 0.65);
    this.activeSfxAudio = audio;
    audio.play().catch(() => {});
  }

  public playVoiceLine(
    url: string,
    options?: {
      fallbackUrl?: string;
      fallbackSpeechText?: string;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) {
    if (this.muted) {
      options?.onEnd?.();
      return;
    }

    if (this.activeVoiceAudio) {
      this.activeVoiceAudio.pause();
      this.activeVoiceAudio.currentTime = 0;
      this.activeVoiceAudio = null;
    }

    const tryPlay = (targetUrl: string, allowFallback: boolean) => {
      const audio = new Audio(targetUrl);
      audio.volume = Math.min(1, this.masterVolume * 0.95);
      this.activeVoiceAudio = audio;

      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        if (this.activeVoiceAudio === audio) {
          this.activeVoiceAudio = null;
        }
        options?.onEnd?.();
      };

      audio.addEventListener('playing', () => {
        options?.onStart?.();
      });
      audio.addEventListener('ended', done);
      audio.addEventListener('error', () => {
        if (allowFallback && options?.fallbackUrl) {
          tryPlay(options.fallbackUrl, false);
        } else if (options?.fallbackSpeechText && 'speechSynthesis' in window) {
          this.speakTextFallback(options.fallbackSpeechText, options.onStart, done);
        } else {
          done();
        }
      });

      audio.play().catch(() => {
        if (allowFallback && options?.fallbackUrl) {
          tryPlay(options.fallbackUrl, false);
        } else {
          done();
        }
      });
    };

    tryPlay(url, true);
  }

  private speakTextFallback(text: string, onStart?: () => void, onEnd?: () => void) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'tr-TR';
      utter.rate = 0.95;
      utter.pitch = 0.9;
      utter.onstart = () => onStart?.();
      utter.onend = () => onEnd?.();
      utter.onerror = () => onEnd?.();
      window.speechSynthesis.speak(utter);
    } catch {
      onEnd?.();
    }
  }
}

export const soundEngine = new HextechSoundEngine();
