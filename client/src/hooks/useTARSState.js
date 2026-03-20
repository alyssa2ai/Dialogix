import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TARS_QUOTES,
  TARS_CELEBRATE_QUOTES,
  TARS_CONFUSED_QUOTES,
  TARS_GREET_QUOTES,
  TARS_SHAKE_QUOTES,
  TARS_SPIN_QUOTES,
  TARS_KONAMI_QUOTES,
  TARS_RARE_QUOTES,
  TARS_TIME_QUOTES,
  TARS_TYPING_QUOTES,
  TARS_KEYWORD_REACTIONS,
} from '../data/tarsQuotes';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const inject = (text, name) => {
  const normalized = String(name || '').trim();
  const display = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'astronaut';
  return String(text || '').replace(/\{name\}/g, display);
};

export function useTARSState(username) {
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
    const update = () => {
      const now = new Date();
      const year = 2157;
      const day = String(Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)).padStart(3, '0');
      const time = now.toTimeString().slice(0, 8);
      setMissionTime(`${year}.${day}.${time}`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const boot = setTimeout(() => {
      const hour = new Date().getHours();
      const timeSet = hour < 12 ? TARS_TIME_QUOTES.morning : hour < 17 ? TARS_TIME_QUOTES.afternoon : TARS_TIME_QUOTES.night;
      showMessage('greeting', inject(pick(timeSet), username), 4500);
    }, 1400);

    return () => clearTimeout(boot);
  }, [showMessage, username]);

  useEffect(() => {
    const onceKey = `tars-name-whispered-${String(username || '').toLowerCase() || 'guest'}`;
    if (!username || sessionStorage.getItem(onceKey)) return;

    const whisper = setTimeout(() => {
      showMessage('greeting', `${inject('{name}', username)}... whisper channel secured. Welcome aboard.`, 3400);
      sessionStorage.setItem(onceKey, '1');
    }, 2900);

    return () => clearTimeout(whisper);
  }, [username, showMessage]);

  useEffect(() => {
    idleTimerRef.current = setInterval(() => {
      if (emotion === 'idle' || emotion === 'greeting') {
        const useRare = Math.random() < 0.25;
        const raw = useRare ? pick(TARS_RARE_QUOTES) : pick(TARS_QUOTES);
        showMessage('idle', inject(raw, username), 4500);
      }
    }, 30000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [emotion, showMessage, username]);

  useEffect(() => {
    const handler = (e) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-8);
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        setSpinCount((c) => c + 3);
        showMessage('konami', inject(pick(TARS_KONAMI_QUOTES), username), 5000);
        konamiRef.current = [];
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showMessage, username]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    const pool = Math.random() < 0.25 ? TARS_GREET_QUOTES : TARS_QUOTES;
    showMessage('idle', inject(pick(pool), username), 4000);
  }, [showMessage, username]);

  const handleDoubleClick = useCallback(() => {
    setSpinCount((c) => c + 1);
    showMessage('spin', inject(pick(TARS_SPIN_QUOTES), username), 3000);
  }, [showMessage, username]);

  const handleHoverStart = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => setShowClock(true), 2500);
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
    if (!showQuote) setEmotion('idle');
  }, [showQuote]);

  const handleEmptySubmit = useCallback(() => {
    showMessage('shake', inject(pick(TARS_SHAKE_QUOTES), username), 2500);
  }, [showMessage, username]);

  const handleMessageReceived = useCallback(
    (messageLength) => {
      if (messageLength > 400) {
        showMessage('celebrate', inject(pick(TARS_CELEBRATE_QUOTES), username), 3500);
      }
    },
    [showMessage, username]
  );

  const handleError = useCallback(() => {
    showMessage('confused', inject(pick(TARS_CONFUSED_QUOTES), username), 3000);
  }, [showMessage, username]);

  const handleKeywordCheck = useCallback(
    (text) => {
      const lower = String(text || '').toLowerCase();
      for (const [keyword, reaction] of Object.entries(TARS_KEYWORD_REACTIONS)) {
        if (lower.includes(keyword)) {
          if (reaction.emotion === 'spin') setSpinCount((c) => c + 1);
          showMessage(reaction.emotion, inject(reaction.quote, username), 4000);
          return;
        }
      }
    },
    [showMessage, username]
  );

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
    handleKeywordCheck,
  };
}
