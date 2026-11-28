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
    const duration = 1.35;
    const samples = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const channel = samples.getChannelData(0);
    // Unevenly spaced, overlapping handclaps sound like a small group cheering.
    const times = [0, .09, .16, .27, .33, .41, .52, .59, .67, .76, .83, .92, 1.01, 1.1, 1.19];
    for (const time of times) {
      const start = Math.floor(time * context.sampleRate);
      const length = Math.floor(.09 * context.sampleRate);
      for (let i = 0; i < length && start + i < channel.length; i++) {
        const seconds = i / context.sampleRate;
        const envelope = Math.exp(-seconds * 42) * (1 + .35 * Math.exp(-Math.max(0, seconds - .017) * 90));
        channel[start + i] += (Math.random() * 2 - 1) * envelope;
      }
    }
    const source = context.createBufferSource();
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = samples;
    highpass.type = 'highpass'; highpass.frequency.value = 550;
    lowpass.type = 'lowpass'; lowpass.frequency.value = 4200;
    const now = context.currentTime;
    gain.gain.setValueAtTime(.14, now);
    gain.gain.linearRampToValueAtTime(.19, now + .35);
    gain.gain.linearRampToValueAtTime(.01, now + duration);
    source.connect(highpass).connect(lowpass).connect(gain).connect(context.destination);
    this.track(source, [highpass, lowpass, gain]);
    source.start();
    source.stop(now + duration);
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
