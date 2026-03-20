import { useRef, useCallback } from 'react';

export function useTARSVoice() {
  const utteranceRef = useRef(null);

  const speak = useCallback((text, enabled = true) => {
    if (!enabled) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const clean = String(text || '').replace(/\{name\}/g, '').trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();

    const robot =
      voices.find((v) => v.name.includes('Google UK English Male')) ||
      voices.find((v) => v.name.includes('Microsoft David')) ||
      voices.find((v) => v.name.includes('Alex')) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices[0];

    if (robot) utterance.voice = robot;

    utterance.rate = 0.82;
    utterance.pitch = 0.6;
    utterance.volume = 0.75;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, stop };
}
