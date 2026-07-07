// Browser text-to-speech for Arabic. Quality depends on the arabic voice
// installed on the user's OS; on systems without one, playback is silent
// rather than wrong. A production build would swap in recorded audio.

export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ar = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ar'));
    if (ar) utter.voice = ar;
    utter.lang = 'ar-SA';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  } catch {
    /* speech synthesis unavailable — no-op */
  }
}
