import * as Tone from 'tone';

// Sound effect types for the arcade
export type SoundType = 
  | 'menu-hover'
  | 'menu-click'
  | 'game-start'
  | 'game-over'
  | 'score-up'
  | 'power-up'
  | 'collision'
  | 'coin'
  | 'jump'
  | 'move'
  | 'win'
  | 'lose'
  | 'card-flip'
  | 'chip-drop'
  | 'bounce'
  | 'retro-start'
  | 'retro-coin'
  | 'retro-die'
  | 'retro-eat';

// Audio manager singleton for the entire arcade
class AudioManager {
  private static instance: AudioManager;
  private initialized = false;
  private volume = 0.7;
  private muted = false;

  // Synths for different sound categories
  private menuSynth: Tone.PolySynth | null = null;
  private gameSynth: Tone.PolySynth | null = null;
  private retroSynth: Tone.Synth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;
  private membraneSynth: Tone.MembraneSynth | null = null;
  private metalSynth: Tone.MetalSynth | null = null;

  // Effects
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private filter: Tone.Filter | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Tone.js
      await Tone.start();

      // Create master effects chain
      this.reverb = new Tone.Reverb({
        decay: 2.5,
        preDelay: 0.1,
        wet: 0.3
      }).toDestination();

      this.delay = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.3,
        wet: 0.2
      }).connect(this.reverb);

      this.filter = new Tone.Filter(2000, 'lowpass').connect(this.delay);

      // Menu/UI sounds - clean polyphonic
      this.menuSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0,
          release: 0.1
        }
      }).connect(this.filter);
      this.menuSynth.volume.value = -10;

      // Game sounds - FM synthesis for variety
      this.gameSynth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.1,
          release: 0.5
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0,
          release: 0.1
        }
      }).connect(this.filter);
      this.gameSynth.volume.value = -8;

      // Retro 8-bit sounds - square wave
      this.retroSynth = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.1,
          release: 0.1
        }
      }).connect(this.filter);
      this.retroSynth.volume.value = -12;

      // Impact/collision sounds
      this.noiseSynth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0
        }
      }).connect(this.reverb);
      this.noiseSynth.volume.value = -15;

      // Drum-like sounds
      this.membraneSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4
        }
      }).connect(this.reverb);
      this.membraneSynth.volume.value = -8;

      // Metallic sounds (coins, etc.)
      this.metalSynth = new Tone.MetalSynth({
        frequency: 200,
        envelope: {
          attack: 0.001,
          decay: 0.1,
          release: 0.01
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).connect(this.reverb);
      this.metalSynth.volume.value = -18;

      this.initialized = true;
      console.log('🎵 Audio Manager initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  play(sound: SoundType): void {
    if (!this.initialized || this.muted) return;

    const now = Tone.now();

    switch (sound) {
      // Menu/UI sounds
      case 'menu-hover':
        this.menuSynth?.triggerAttackRelease('C6', '32n', now, 0.3);
        break;
      case 'menu-click':
        this.menuSynth?.triggerAttackRelease(['C5', 'E5'], '16n', now);
        break;

      // Game state sounds
      case 'game-start':
        this.gameSynth?.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '8n', now);
        setTimeout(() => this.gameSynth?.triggerAttackRelease('C5', '4n', now + 0.2), 200);
        break;
      case 'game-over':
        this.gameSynth?.triggerAttackRelease(['C5', 'B4', 'A#4', 'A4'], '8n', now);
        this.membraneSynth?.triggerAttackRelease('C2', '2n', now);
        break;
      case 'win':
        this.gameSynth?.triggerAttackRelease(['C4', 'E4', 'G4', 'C5', 'E5'], '8n', now);
        setTimeout(() => this.metalSynth?.triggerAttackRelease(32, '16n', now + 0.1), 100);
        break;
      case 'lose':
        this.retroSynth?.triggerAttackRelease('C3', '4n', now);
        setTimeout(() => this.retroSynth?.triggerAttackRelease('G2', '2n', now + 0.4), 400);
        break;

      // Action sounds
      case 'score-up':
        this.metalSynth?.triggerAttackRelease(32, '32n', now);
        this.menuSynth?.triggerAttackRelease('G6', '32n', now, 0.5);
        break;
      case 'power-up':
        this.gameSynth?.triggerAttackRelease(['C5', 'F5', 'A5'], '16n', now);
        break;
      case 'collision':
        this.noiseSynth?.triggerAttackRelease('32n', now);
        this.membraneSynth?.triggerAttackRelease('C2', '16n', now);
        break;
      case 'coin':
        this.metalSynth?.triggerAttackRelease(128, '32n', now);
        break;
      case 'jump':
        this.retroSynth?.triggerAttackRelease('A4', '16n', now);
        setTimeout(() => this.retroSynth?.triggerAttackRelease('E5', '32n', now + 0.05), 50);
        break;
      case 'move':
        this.menuSynth?.triggerAttackRelease('C6', '64n', now, 0.2);
        break;

      // Card/Casino sounds
      case 'card-flip':
        this.noiseSynth?.triggerAttackRelease('64n', now);
        break;
      case 'chip-drop':
        this.metalSynth?.triggerAttackRelease(64, '32n', now);
        break;

      // Physics sounds
      case 'bounce':
        this.membraneSynth?.triggerAttackRelease('C3', '32n', now, 0.5);
        break;

      // Retro arcade sounds
      case 'retro-start':
        this.retroSynth?.triggerAttackRelease('C4', '16n', now);
        setTimeout(() => this.retroSynth?.triggerAttackRelease('C5', '16n', now + 0.1), 100);
        setTimeout(() => this.retroSynth?.triggerAttackRelease('G5', '8n', now + 0.2), 200);
        break;
      case 'retro-coin':
        this.retroSynth?.triggerAttackRelease('B5', '32n', now);
        break;
      case 'retro-die':
        this.retroSynth?.triggerAttackRelease('C3', '8n', now);
        setTimeout(() => this.retroSynth?.triggerAttackRelease('G2', '4n', now + 0.15), 150);
        break;
      case 'retro-eat':
        this.retroSynth?.triggerAttackRelease('G5', '64n', now);
        break;
    }
  }

  // Play sequence for background music
  playBackgroundMusic(): void {
    if (!this.initialized || this.muted) return;

    const loop = new Tone.Loop((time) => {
      this.retroSynth?.triggerAttackRelease('C3', '8n', time);
      this.retroSynth?.triggerAttackRelease('E3', '8n', time + 0.25);
      this.retroSynth?.triggerAttackRelease('G3', '8n', time + 0.5);
    }, '1n').start(0);

    Tone.Transport.bpm.value = 120;
    Tone.Transport.start();
  }

  stopBackgroundMusic(): void {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    Tone.Destination.volume.value = Tone.gainToDb(this.volume);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Tone.Destination.mute = this.muted;
    return this.muted;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Generate retro wave sound effect
  playRetroWave(frequency: number, duration: number): void {
    if (!this.initialized || this.muted) return;
    this.retroSynth?.triggerAttackRelease(frequency, duration);
  }

  // Create a sound with frequency sweep (for power-ups, etc.)
  playSweep(startFreq: number, endFreq: number, duration: number): void {
    if (!this.initialized || this.muted) return;
    
    const osc = new Tone.Oscillator(startFreq, 'sawtooth').toDestination();
    osc.start();
    osc.frequency.rampTo(endFreq, duration);
    osc.stop(`+${duration}`);
  }
}

export const audioManager = AudioManager.getInstance();
export default audioManager;
