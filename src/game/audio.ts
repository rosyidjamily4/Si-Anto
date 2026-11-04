/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private bgmPlaying: boolean = false;
  private bgmTimeout: number | null = null;

  constructor() {
    // Load persisted mute preference
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('ketapel_kata_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ketapel_kata_muted', String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  /**
   * Sound of pulling the slingshot elastic rubber band
   */
  public playSlingshotPull(tensionRatio = 0.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Pitch rises as rubber band stretches
      const startFreq = 80 + tensionRatio * 160;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(startFreq + 50, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Slingshot release woosh
   */
  public playSlingshotRelease() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio fallback
    }
  }

  /**
   * Impact sound on blocks (wood, stone, or target)
   */
  public playImpact(type: 'wood' | 'stone' | 'pig' = 'wood') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'stone') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.28 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Cheerful celebratory chime when hitting the correct word!
   */
  public playCorrectJingle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Play a quick ascending major triad (C5 - E5 - G5 - C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.22 * this.volume, this.ctx!.currentTime + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.07 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + i * 0.07);
        osc.stop(this.ctx!.currentTime + i * 0.07 + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Comedic wobble boing when hitting the wrong answer
   */
  public playWrongBoing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Star award pop sound (ding)
   */
  public playStarPop(index = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 880 * Math.pow(1.2, index);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.25 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Victory Fanfare jingle on level completion
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const fanfare = [
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.28 },
        { f: 783.99, d: 0.4 }
      ];

      let t = this.ctx.currentTime;
      fanfare.forEach(({ f, d }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.2 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + d);
        t += d * 0.85;
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Game Over Defeat sound
   */
  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [392.00, 349.23, 311.13, 261.63];
      let t = this.ctx.currentTime;
      notes.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.18 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.32);
        t += 0.22;
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Ambient pleasant educational game background music
   */
  public startBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;
    this.bgmPlaying = true;
    this.playBgmLoop();
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimeout) {
      window.clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  private playBgmLoop() {
    if (!this.bgmPlaying || this.isMuted || !this.ctx) return;

    try {
      // Gentle marimba/chime arpeggios in C Major
      const chords = [
        [261.63, 329.63, 392.00, 523.25], // C
        [220.00, 261.63, 329.63, 440.00], // Am
        [174.61, 220.00, 261.63, 349.23], // F
        [196.00, 246.94, 293.66, 392.00]  // G
      ];

      const chord = chords[Math.floor(Math.random() * chords.length)];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.25);

        gain.gain.setValueAtTime(0.03 * this.volume, this.ctx!.currentTime + idx * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.25 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.25);
        osc.stop(this.ctx!.currentTime + idx * 0.25 + 0.5);
      });

      this.bgmTimeout = window.setTimeout(() => {
        this.playBgmLoop();
      }, 1800);
    } catch {
      // Audio fallback
    }
  }
}

export const sounds = new SoundEngine();
