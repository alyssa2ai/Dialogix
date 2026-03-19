import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TARS_QUOTES,
  TARS_CELEBRATE_QUOTES,
  TARS_CONFUSED_QUOTES,
  TARS_GREET_QUOTES,
  TARS_SHAKE_QUOTES,
  TARS_SPIN_QUOTES,
  TARS_KONAMI_QUOTES,
  TARS_TYPING_QUOTES,
} from '../data/tarsQuotes';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function useTARSState() {
  const [emotion, setEmotion] = useState('greeting');
  const [quote, setQuote] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [missionTime, setMissionTime] = useState('');
  const [showClock, setShowClock] = useState(false);
  const hoverTimerRef = useRef(null);
  const quoteTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const konamiRef = useRef([]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const year = 2157;
      const day = String(
        Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
      ).padStart(3, '0');
      const time = now.toTimeString().slice(0, 8);
      setMissionTime(`${year}.${day}.${time}`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const showMessage = useCallback((newEmotion, text, duration = 4000) => {
    if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);

    setEmotion(newEmotion);
    setQuote(text);
    setShowQuote(true);

    quoteTimerRef.current = setTimeout(() => {
      setShowQuote(false);
      setTimeout(() => setEmotion('idle'), 500);
    }, duration);
  }, []);

  useEffect(() => {
    const boot = setTimeout(() => {
      showMessage('greeting', pick(TARS_GREET_QUOTES), 3500);
    }, 1200);

    return () => clearTimeout(boot);
  }, [showMessage]);

  useEffect(() => {
    idleTimerRef.current = setInterval(() => {
      if (emotion === 'idle' || emotion === 'greeting') {
        showMessage('idle', pick(TARS_QUOTES), 4000);
      }
    }, 30000);

    return () => clearInterval(idleTimerRef.current);
  }, [emotion, showMessage]);

  useEffect(() => {
    const handler = (e) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-8);
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        setSpinCount((c) => c + 3);
        showMessage('konami', pick(TARS_KONAMI_QUOTES), 5000);
        konamiRef.current = [];
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showMessage]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    showMessage('idle', pick(TARS_QUOTES), 4000);
  }, [showMessage]);

  const handleDoubleClick = useCallback(() => {
    setSpinCount((c) => c + 1);
    showMessage('spin', pick(TARS_SPIN_QUOTES), 3000);
  }, [showMessage]);

  const handleHoverStart = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setShowClock(true);
    }, 2500);
  }, []);

  const handleHoverEnd = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowClock(false);
  }, []);

  const handleTypingStart = useCallback(() => {
    setEmotion('typing');
    setQuote(pick(TARS_TYPING_QUOTES));
  }, []);

  const handleTypingEnd = useCallback(() => {
    if (!showQuote) {
      setEmotion('idle');
    }
  }, [showQuote]);

  const handleEmptySubmit = useCallback(() => {
    showMessage('shake', pick(TARS_SHAKE_QUOTES), 2500);
  }, [showMessage]);

  const handleMessageReceived = useCallback(
    (messageLength) => {
      if (messageLength > 400) {
        showMessage('celebrate', pick(TARS_CELEBRATE_QUOTES), 3500);
        return;
      }

      showMessage('typing', pick(TARS_TYPING_QUOTES), 1400);
    },
    [showMessage]
  );

  const handleError = useCallback(() => {
    showMessage('confused', pick(TARS_CONFUSED_QUOTES), 3000);
  }, [showMessage]);

  return {
    emotion,
    quote,
    showQuote,
    spinCount,
    missionTime,
    showClock,
    handleClick,
    handleDoubleClick,
    handleHoverStart,
    handleHoverEnd,
    handleTypingStart,
    handleTypingEnd,
    handleEmptySubmit,
    handleMessageReceived,
    handleError,
  };
}
