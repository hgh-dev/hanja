// The reveal cue is synthesized; supplied clips play for quiz judgments.
export class QuizSound {
  private context?: AudioContext;
  private active = new Set<AudioScheduledSourceNode>();
  private correctAudio?: HTMLAudioElement;
  private reviewAudio?: HTMLAudioElement;

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

  preloadCorrect() {
    if (this.correctAudio) return;
    try {
      const audio = new Audio(`${import.meta.env.BASE_URL}sounds/seola-laugh.m4a`);
      audio.preload = 'auto';
      audio.volume = .7;
      this.correctAudio = audio;
    } catch { /* Quiz still works when media playback is unavailable. */ }
  }

  preloadReview() {
    if (this.reviewAudio) return;
    try {
      const audio = new Audio(`${import.meta.env.BASE_URL}sounds/learn-again.mp3`);
      audio.preload = 'auto';
      audio.volume = .7;
      this.reviewAudio = audio;
    } catch { /* Quiz still works when media playback is unavailable. */ }
  }

  correct() {
    this.preloadCorrect();
    this.reviewAudio?.pause();
    const audio = this.correctAudio;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    } catch { /* Quiz still works when media playback is unavailable. */ }
  }

  review() {
    this.preloadReview();
    this.correctAudio?.pause();
    const audio = this.reviewAudio;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    } catch { /* Quiz still works when media playback is unavailable. */ }
  }

  stop() {
    this.correctAudio?.pause();
    this.reviewAudio?.pause();
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
