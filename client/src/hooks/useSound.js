import { useRef } from 'react';

export function useSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (window.__AUDIO_CTX__ && window.__AUDIO_CTX__.state !== 'closed') {
      ctxRef.current = window.__AUDIO_CTX__;
    }

    if (!ctxRef.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        ctxRef.current = new Ctx();
      } catch (e) {
        return null;
      }
    }

    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume();
    }

    return ctxRef.current;
  };

  // Kept for compatibility with existing call sites.
  const unlockAudio = () => {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  };

  const playTone = (ctx, freq, startTime, duration, volume = 0.04, type = 'sine') => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration + 0.1);
    } catch (e) {
      // Ignore isolated oscillator failures.
    }
  };

  const playSend = () => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 520, 0, 0.08, 0.06);
    playTone(ctx, 820, 0.08, 0.12, 0.04);
  };

  const playReceive = () => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 440, 0, 0.2, 0.05);
    playTone(ctx, 660, 0.18, 0.25, 0.04);
  };

  const playNewChat = () => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 300, 0, 0.15, 0.05);
    playTone(ctx, 600, 0.1, 0.2, 0.04);
    playTone(ctx, 900, 0.22, 0.15, 0.03);
  };

  const playError = () => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 220, 0, 0.15, 0.05, 'square');
    playTone(ctx, 180, 0.1, 0.15, 0.04, 'square');
  };

  const playBoot = () => {
    const ctx = getCtx();
    if (!ctx) return;

    playTone(ctx, 55, 0.0, 0.8, 0.03, 'sawtooth');
    playTone(ctx, 80, 0.4, 0.8, 0.03, 'sawtooth');
    playTone(ctx, 110, 0.8, 0.6, 0.03, 'sawtooth');
    playTone(ctx, 160, 1.2, 0.5, 0.03, 'sawtooth');
    playTone(ctx, 220, 1.6, 0.4, 0.025, 'sawtooth');
    playTone(ctx, 320, 1.9, 0.3, 0.02, 'sine');
    playTone(ctx, 440, 2.1, 0.25, 0.025, 'sine');
    playTone(ctx, 660, 2.3, 0.2, 0.02, 'sine');
  };

  return { playSend, playReceive, playNewChat, playError, playBoot, unlockAudio };
}
