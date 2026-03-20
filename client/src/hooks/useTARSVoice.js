import { useRef, useCallback, useEffect, useState } from 'react';

export function useTARSVoice() {
  const [voices, setVoices] = useState([]);
  const [ready, setReady] = useState(false);
  const isSpeaking = useRef(false);

  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) {
        setVoices(v);
        setReady(true);
      }
    };

    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    const t1 = setTimeout(load, 500);
    const t2 = setTimeout(load, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.speechSynthesis?.removeEventListener('voiceschanged', load);
    };
  }, []);

  const pickVoice = useCallback((voiceList) => {
    const preferred = [
      'Google UK English Male',
      'Microsoft David Desktop',
      'Microsoft Mark',
      'Alex',
      'Daniel',
      'Google US English',
    ];

    for (const name of preferred) {
      const match = voiceList.find((v) => v.name.includes(name));
      if (match) return match;
    }

    return (
      voiceList.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
      voiceList.find((v) => v.lang.startsWith('en')) ||
      voiceList[0]
    );
  }, []);

  const doSpeak = useCallback(
    (text) => {
      if (!window.speechSynthesis) return;

      const clean = String(text || '')
        .replace(/\{name\}/g, '')
        .replace(/[\u00B7\u2022\u25E6]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const voiceList = window.speechSynthesis.getVoices();
      const voice = pickVoice(voiceList);
      const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean];

      if (sentences.length <= 1) {
        const utterance = new SpeechSynthesisUtterance(clean);
        if (voice) utterance.voice = voice;
        utterance.rate = 0.78;
        utterance.pitch = 0.55;
        utterance.volume = 0.8;
        utterance.onstart = () => {
          isSpeaking.current = true;
        };
        utterance.onend = () => {
          isSpeaking.current = false;
        };
        utterance.onerror = () => {
          isSpeaking.current = false;
        };
        window.speechSynthesis.speak(utterance);
        return;
      }

      sentences.forEach((sentence, i) => {
        const u = new SpeechSynthesisUtterance(sentence.trim());
        if (voice) u.voice = voice;
        u.rate = 0.78;
        u.pitch = 0.55;
        u.volume = 0.8;
        if (i === 0) {
          u.onstart = () => {
            isSpeaking.current = true;
          };
        }
        if (i === sentences.length - 1) {
          u.onend = () => {
            isSpeaking.current = false;
          };
          u.onerror = () => {
            isSpeaking.current = false;
          };
        }
        window.speechSynthesis.speak(u);
      });
    },
    [pickVoice]
  );

  const speak = useCallback(
    (text, enabled = true) => {
      if (!enabled || !ready || !window.speechSynthesis) return;

      if (isSpeaking.current) {
        window.speechSynthesis.cancel();
        setTimeout(() => doSpeak(text), 150);
        return;
      }

      doSpeak(text);
    },
    [ready, voices, doSpeak]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    isSpeaking.current = false;
  }, []);

  return { speak, stop, ready };
}
