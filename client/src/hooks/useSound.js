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

  const playBootSequence = (ctx) => {
    // Boost just the boot sequence so startup chime is clearly audible.
    const master = ctx.createGain();
    master.gain.value = 1.35;
    master.connect(ctx.destination);

    const playBootTone = (freq, startTime, duration, volume, type) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(master);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration + 0.08);
      } catch (_) {
        // Ignore isolated oscillator failures.
      }
    };

    // Brighter startup stack so it is audible on laptop and phone speakers.
    playBootTone(220, 0.00, 0.24, 0.08, 'triangle');
    playBootTone(320, 0.10, 0.26, 0.09, 'triangle');
    playBootTone(440, 0.22, 0.28, 0.10, 'triangle');
    playBootTone(620, 0.38, 0.26, 0.09, 'sine');
    playBootTone(880, 0.56, 0.24, 0.085, 'sine');
    playBootTone(1160, 0.72, 0.20, 0.08, 'sine');

    // Final confirmation chirp.
    playBootTone(1460, 0.90, 0.11, 0.11, 'square');
    playBootTone(1840, 1.02, 0.11, 0.10, 'square');

    setTimeout(() => {
      try {
        master.disconnect();
      } catch (_) {
        // Ignore disconnect race conditions.
      }
    }, 1600);
  };

  const playBoot = () => {
    const ctx = getCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playBootSequence(ctx)).catch(() => {
        // If resume fails, still attempt playback.
        playBootSequence(ctx);
      });
      return;
    }

    playBootSequence(ctx);
  };

  return { playSend, playReceive, playNewChat, playError, playBoot, unlockAudio };
}
