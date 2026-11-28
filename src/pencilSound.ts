// Soft brush-on-paper noise, synthesized locally without an audio download.
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
        const length = context.sampleRate * 2;
        this.buffer = context.createBuffer(1, length, context.sampleRate);
        const samples = this.buffer.getChannelData(0);
        const noise = new Array<number>(length);
        for (let i = 0; i < length; i++) noise[i] = Math.random() * 2 - 1;
        // Circular smoothing keeps the loop seam quiet and removes the rapid
        // volume pulses that sounded like repeated impacts.
        let sum = 0;
        for (let i = length - 8; i < length; i++) sum += noise[i];
        for (let i = 0; i < length; i++) {
          sum += noise[i] - noise[(i - 8 + length) % length];
          samples[i] = sum / 8;
        }
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      this.source = source; this.filter = filter; this.gain = gain;
      source.buffer = this.buffer;
      source.loop = true;
      filter.type = 'lowpass'; filter.frequency.value = 950; filter.Q.value = .7;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(.18, context.currentTime + .06);
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
    gain.gain.linearRampToValueAtTime(0, now + .08);
    try { source.stop(now + .09); } catch { source.disconnect(); }
  }

  dispose() {
    this.stop();
    void this.context?.close().catch(() => {});
    this.context = undefined; this.buffer = undefined;
  }
}
