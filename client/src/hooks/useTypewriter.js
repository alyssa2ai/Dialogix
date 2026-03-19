import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text, speed = 10, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone]       = useState(false);
  const indexRef  = useRef(0);
  const timerRef  = useRef(null);

  useEffect(() => {
    // Reset when text changes
    indexRef.current = 0;
    setDisplayed('');
    setIsDone(false);

    if (!text || !enabled) {
      setDisplayed(text || '');
      setIsDone(true);
      return;
    }

    const tick = () => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        setIsDone(true);
        return;
      }

      // Variable speed — faster for spaces, slightly slower after punctuation
      const nextChar = text[indexRef.current];
      const delay = /[.!?]/.test(nextChar)
        ? speed * 3   // pause after sentence end
        : /[,;:]/.test(nextChar)
        ? speed * 1.5 // pause after comma
        : nextChar === ' '
        ? speed * 0.35 // fast through spaces
        : speed;

      timerRef.current = setTimeout(tick, delay);
    };

    timerRef.current = setTimeout(tick, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, enabled]);

  return { displayed, isDone };
}