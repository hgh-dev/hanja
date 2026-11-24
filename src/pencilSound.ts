// Locally synthesized graphite-like friction; no downloads or network required.
export class PencilSound {
  private context?: AudioContext;
  private buffer?: AudioBuffer;
  private source?: AudioBufferSourceNode;
  private filter?: BiquadFilterNode;
  private gain?: GainNode;

  unlock() {
    try {
      const Audio = window.AudioContext || (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
      if (!Audio) return;
      this.context ??= new Audio();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
    } catch { /* Animation still works when audio is unavailable. */ }
  }

  start() {
    this.stop();
    const context = this.context;
    if (!context || context.state !== 'running') return;
    try {
      if (!this.buffer) {
        this.buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
        const samples = this.buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) {
          const t = i / context.sampleRate;
          samples[i] = (Math.random() * 2 - 1) * (.55 + .25 * Math.sin(t * 97) + .2 * Math.sin(t * 211));
        }
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      this.source = source; this.filter = filter; this.gain = gain;
      source.buffer = this.buffer;
      source.loop = true;
      filter.type = 'bandpass'; filter.frequency.value = 1800; filter.Q.value = .65;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(.16, context.currentTime + .025);
      source.connect(filter).connect(gain).connect(context.destination);
      source.start();
    } catch { this.stop(); }
  }

  stop() {
    const source = this.source, filter = this.filter, gain = this.gain;
    this.source = undefined; this.filter = undefined; this.gain = undefined;
    if (!source || !gain || !this.context) return;
    source.onended = () => { source.disconnect(); filter?.disconnect(); gain.disconnect(); };
    const now = this.context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + .015);
    try { source.stop(now + .02); } catch { source.disconnect(); }
  }

  dispose() {
    this.stop();
    void this.context?.close().catch(() => {});
    this.context = undefined; this.buffer = undefined;
  }
}
