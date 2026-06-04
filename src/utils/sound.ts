class SoundGenerator {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private isSirenPlaying = false;
  private sfxInterval: NodeJS.Timeout | null = null;

  constructor() {
    // AudioContext will be initialized on user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playBiosBeep(frequency = 880, duration = 0.1) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public startGlitchFitter() {
    this.initContext();
    if (!this.ctx) return;
    this.isSirenPlaying = true;

    // Start a repeating sound routine representing computer spasming
    const playNextBeep = () => {
      if (!this.isSirenPlaying) return;

      const mode = Math.random();
      if (mode < 0.3) {
        // High panic blips
        this.playBiosBeep(400 + Math.random() * 1500, 0.05 + Math.random() * 0.1);
      } else if (mode < 0.6) {
        // Low grinding click
        this.playBiosBeep(80 + Math.random() * 120, 0.03);
      } else if (mode < 0.8) {
        // Error alarm
        this.playEmergencySiren();
      } else {
        // High static noise bursts
        this.playStaticBurst(0.2);
      }

      const nextTime = 40 + Math.random() * 300;
      this.sfxInterval = setTimeout(playNextBeep, nextTime);
    };

    playNextBeep();
  }

  public stopGlitchAudio() {
    this.isSirenPlaying = false;
    if (this.sfxInterval) {
      clearTimeout(this.sfxInterval);
      this.sfxInterval = null;
    }
    this.activeNodes.forEach(node => {
      try {
        (node as any).stop?.();
        node.disconnect();
      } catch (err) {}
    });
    this.activeNodes = [];
  }

  private playStaticBurst(duration = 0.2) {
    try {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate random white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start();
      this.activeNodes.push(noiseNode);
    } catch (e) {
      console.warn(e);
    }
  }

  private playEmergencySiren() {
    try {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      this.activeNodes.push(osc);
    } catch (e) {
      console.warn(e);
    }
  }

  public playPowerShutdownClick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const soundManager = new SoundGenerator();
