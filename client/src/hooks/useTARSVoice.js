import { useRef, useCallback, useEffect, useState } from 'react';

export function useTARSVoice() {
  const [ready, setReady] = useState(false);
  const voiceRef = useRef(null);
  const timerRef = useRef(null);

  // Load voices
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length === 0) return;

      // Pick best voice
      const preferred = [
        'Google UK English Male',
        'Microsoft David',
        'Microsoft Mark',
        'Daniel',
        'Alex',
      ];

      let picked = null;
      for (const name of preferred) {
        picked = v.find((x) => x.name.includes(name));
        if (picked) break;
      }
      if (!picked) {
        picked = v.find((x) => x.lang.startsWith('en')) || v[0];
      }

      voiceRef.current = picked;
      setReady(true);
    };

    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    setTimeout(load, 300);
    setTimeout(load, 1000);

    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  const speak = useCallback(
    (text, enabled = true) => {
      if (!enabled || !window.speechSynthesis) return;

      // Clear any pending speak timers
      clearTimeout(timerRef.current);

      // Clean text
      let clean = String(text || '')
        .replace(/\{name\}/g, '')
        .replace(/[·•◦▓\[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // HARD LIMIT - never more than 100 chars
      // Split at last space before limit
      if (clean.length > 100) {
        const splitPoint = clean.lastIndexOf(' ', 100);
        clean = splitPoint > 0 ? clean.substring(0, splitPoint) : clean.substring(0, 100);
      }

      if (!clean) return;

      // Cancel current speech
      window.speechSynthesis.cancel();

      // Delay to let cancel() settle - this is critical
      timerRef.current = setTimeout(() => {
        if (!window.speechSynthesis) return;

        const u = new SpeechSynthesisUtterance(clean);
        u.voice = voiceRef.current;
        u.rate = 0.85;
        u.pitch = 0.6;
        u.volume = 0.85;

        u.onerror = (e) => {
          if (e.error !== 'interrupted') console.warn('TTS:', e.error);
        };

        window.speechSynthesis.speak(u);
      }, 200);
    },
    [ready]
  );

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  return { speak, stop, ready };
}
