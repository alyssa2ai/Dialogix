import { useRef, useCallback, useEffect, useState } from 'react';

export function useTARSVoice() {
  const [voices, setVoices] = useState([]);
  const [ready, setReady] = useState(false);
  const isSpeaking = useRef(false);
  const keepAliveRef = useRef(null);

  // Load voices async
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
    setTimeout(load, 500);
    setTimeout(load, 1500);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  // -- Chrome 15s bug fix --
  // Chrome silently kills speech after 15s
  // We pause + resume every 10s to reset its internal timer
  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const startKeepAlive = useCallback(() => {
    stopKeepAlive();
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        stopKeepAlive();
      }
    }, 10000);
  }, [stopKeepAlive]);

  const pickVoice = useCallback((voiceList) => {
    const preferred = [
      'Google UK English Male',
      'Microsoft David Desktop',
      'Microsoft David',
      'Microsoft Mark',
      'Daniel',
      'Alex',
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

  const speak = useCallback(
    (text, enabled = true) => {
      if (!enabled || !window.speechSynthesis) return;

      // Wait for voices if not ready yet
      if (!ready) {
        setTimeout(() => speak(text, enabled), 800);
        return;
      }

      // Cancel anything playing
      window.speechSynthesis.cancel();
      stopKeepAlive();
      isSpeaking.current = false;

      // Clean text
      const clean = String(text || '')
        .replace(/\{name\}/g, '')
        .replace(/[·•◦▓]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const voiceList = window.speechSynthesis.getVoices();
      const voice = pickVoice(voiceList);

      const utterance = new SpeechSynthesisUtterance(clean);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.82;
      utterance.pitch = 0.6;
      utterance.volume = 0.85;

      utterance.onstart = () => {
        isSpeaking.current = true;
        startKeepAlive();
      };

      utterance.onend = () => {
        isSpeaking.current = false;
        stopKeepAlive();
      };

      utterance.onerror = (e) => {
        // Ignore 'interrupted' errors - those are from cancel()
        if (e.error !== 'interrupted') {
          console.warn('TTS error:', e.error);
        }
        isSpeaking.current = false;
        stopKeepAlive();
      };

      // Small delay before speaking - prevents cut-off on rapid triggers
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 120);
    },
    [ready, voices, startKeepAlive, stopKeepAlive, pickVoice]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    stopKeepAlive();
    isSpeaking.current = false;
  }, [stopKeepAlive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      stopKeepAlive();
    };
  }, [stopKeepAlive]);

  return { speak, stop, ready };
}
