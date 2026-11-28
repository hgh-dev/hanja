// Short, locally synthesized quiz cues. They work offline and need no audio files.
export class QuizSound {
  private context?: AudioContext;
  private active = new Set<AudioScheduledSourceNode>();

  private async ready(): Promise<AudioContext | null> {
    try {
      const Audio = window.AudioContext || (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
      if (!Audio) return null;
      this.context ??= new Audio();
      if (this.context.state === 'suspended') await this.context.resume();
      return this.context.state === 'running' ? this.context : null;
    } catch { return null; }
  }

  private track(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    this.active.add(source);
    source.onended = () => {
      this.active.delete(source);
      source.disconnect();
      nodes.forEach(node => node.disconnect());
    };
  }

  async reveal() {
    const context = await this.ready();
    if (!context) return;
    const now = context.currentTime;
    for (const [index, frequency] of [523.25, 659.25, 783.99, 1046.5].entries()) {
      const start = now + index * .105;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.001, start);
      gain.gain.exponentialRampToValueAtTime(.075, start + .022);
      gain.gain.exponentialRampToValueAtTime(.001, start + .32);
      oscillator.connect(gain).connect(context.destination);
      this.track(oscillator, [gain]);
      oscillator.start(start);
      oscillator.stop(start + .33);
    }
  }

  async applause() {
    const context = await this.ready();
    if (!context) return;
    const duration = 1.65;
    const samples = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const channel = samples.getChannelData(0);
    // A low, continuous crowd rustle joins longer, irregular handclaps.
    let rustle = 0;
    for (let i = 0; i < channel.length; i++) {
      rustle = .88 * rustle + .12 * (Math.random() * 2 - 1);
      const time = i / context.sampleRate;
      channel[i] = rustle * .18 * Math.sin(Math.PI * time / duration);
    }
    const times = [0, .14, .29, .39, .55, .7, .82, .98, 1.11, 1.27, 1.39];
    for (const [index, time] of times.entries()) {
      const start = Math.floor(time * context.sampleRate);
      const length = Math.floor(.16 * context.sampleRate);
      const strength = .28 + .08 * (index % 3);
      for (let i = 0; i < length && start + i < channel.length; i++) {
        const seconds = i / context.sampleRate;
        const attack = Math.min(1, seconds / .012);
        const envelope = attack * Math.exp(-seconds * 22);
        channel[start + i] += (Math.random() * 2 - 1) * envelope * strength;
      }
    }
    const source = context.createBufferSource();
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = samples;
    highpass.type = 'highpass'; highpass.frequency.value = 250;
    lowpass.type = 'lowpass'; lowpass.frequency.value = 2600;
    const now = context.currentTime;
    gain.gain.setValueAtTime(.1, now);
    gain.gain.linearRampToValueAtTime(.19, now + .45);
    gain.gain.linearRampToValueAtTime(.01, now + duration);
    source.connect(highpass).connect(lowpass).connect(gain).connect(context.destination);
    this.track(source, [highpass, lowpass, gain]);
    source.start();
    source.stop(now + duration);

    // Three slightly offset, vowel-shaped voices add a short “와아” cheer.
    for (const [index, pitch] of [235, 280, 325].entries()) {
      const start = now + .06 + index * .13;
      const voice = context.createOscillator();
      const lowFormant = context.createBiquadFilter();
      const highFormant = context.createBiquadFilter();
      const lowLevel = context.createGain();
      const highLevel = context.createGain();
      const voiceLevel = context.createGain();
      voice.type = 'sawtooth';
      voice.frequency.setValueAtTime(pitch * 1.08, start);
      voice.frequency.linearRampToValueAtTime(pitch, start + .22);
      voice.frequency.linearRampToValueAtTime(pitch * .94, start + .95);
      lowFormant.type = 'bandpass'; lowFormant.Q.value = 1.2;
      lowFormant.frequency.setValueAtTime(520, start);
      lowFormant.frequency.linearRampToValueAtTime(850, start + .18);
      highFormant.type = 'bandpass'; highFormant.Q.value = 1.4;
      highFormant.frequency.setValueAtTime(1050, start);
      highFormant.frequency.linearRampToValueAtTime(1350, start + .18);
      lowLevel.gain.value = .55;
      highLevel.gain.value = .35;
      voiceLevel.gain.setValueAtTime(.001, start);
      voiceLevel.gain.linearRampToValueAtTime(.09, start + .12);
      voiceLevel.gain.setValueAtTime(.09, start + .58);
      voiceLevel.gain.exponentialRampToValueAtTime(.001, start + 1.08);
      voice.connect(lowFormant).connect(lowLevel).connect(voiceLevel);
      voice.connect(highFormant).connect(highLevel).connect(voiceLevel);
      voiceLevel.connect(context.destination);
      this.track(voice, [lowFormant, highFormant, lowLevel, highLevel, voiceLevel]);
      voice.start(start);
      voice.stop(start + 1.09);
    }
  }

  stop() {
    for (const source of this.active) {
      try { source.stop(); } catch { /* Already stopped. */ }
    }
  }

  dispose() {
    this.stop();
    void this.context?.close().catch(() => {});
    this.context = undefined;
  }
}
