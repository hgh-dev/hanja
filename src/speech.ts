export function stopReading() {
  try { window.speechSynthesis?.cancel(); } catch { /* Speech is optional on this device. */ }
}

export function readHanja(meaning: string, sound: string) {
  try {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    stopReading();
    const utterance = new SpeechSynthesisUtterance(`${meaning} ${sound}`);
    utterance.lang = 'ko-KR';
    utterance.rate = .9;
    const koreanVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith('ko'));
    if (koreanVoice) utterance.voice = koreanVoice;
    window.speechSynthesis.speak(utterance);
  } catch { /* Learning remains available without speech support. */ }
}
