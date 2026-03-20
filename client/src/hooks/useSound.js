import { useEffect, useRef } from 'react';

let sharedCtx = null;

const getSharedCtx = () => {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) {
    sharedCtx = new AC();
  }
  return sharedCtx;
};

export function useSound() {
  // Keep a stable first hook across hot updates to avoid hook-order mismatch in consumers.
  const stableRef = useRef(null);
  const getCtx = () => {
    const ctx = getSharedCtx();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    return ctx;
  };

  const unlockAudio = () => {
    try {
      stableRef.current = true;
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
    } catch (e) {
      console.warn('[Sound] unlock failed', e);
    }
  };

  const runWithCtx = (callback) => {
    try {
      const ctx = getCtx();
      if (!ctx) {
        console.warn('[Sound] Web Audio API not available in this browser context.');
        return;
      }
      const run = () => callback(ctx);
      if (ctx.state === 'suspended') {
        ctx.resume().then(run).catch((e) => {
          console.warn('[Sound] resume failed', e);
        });
      } else {
        run();
      }
    } catch (e) {
      console.warn('[Sound] playback failed', e);
    }
  };

  // Unlock/resume audio context on first user interaction.
  useEffect(() => {
    const unlock = () => unlockAudio();

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Soft sci-fi send beep
  const playSend = () => {
    runWithCtx((ctx) => {
      const now = ctx.currentTime;
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscA.type = 'triangle';
      oscA.frequency.setValueAtTime(360, now);
      oscA.frequency.exponentialRampToValueAtTime(720, now + 0.18);

      oscB.type = 'sine';
      oscB.frequency.setValueAtTime(540, now);
      oscB.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.linearRampToValueAtTime(2600, now + 0.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + 0.3);
      oscB.stop(now + 0.3);
    });
  };

  // Signal received - two tone chime
  const playReceive = () => {
    runWithCtx((ctx) => {
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(392, now);
      osc1.frequency.linearRampToValueAtTime(466, now + 0.22);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.075, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(587, now + 0.16);
      osc2.frequency.linearRampToValueAtTime(740, now + 0.42);
      gain2.gain.setValueAtTime(0, now + 0.16);
      gain2.gain.linearRampToValueAtTime(0.07, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.62);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.64);
    });
  };

  // Boot up power hum
  const playBoot = () => {
    try {
      // Create a fresh context each time for boot.
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const playTone = (freq, startTime, duration, volume = 0.04) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        filter.type = 'lowpass';
        filter.frequency.value = 800;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Boot sequence - rising tones.
      playTone(60, 0.0, 1.5, 0.03);
      playTone(80, 0.5, 1.2, 0.025);
      playTone(120, 1.0, 1.0, 0.02);
      playTone(180, 1.5, 0.8, 0.025);
      playTone(240, 2.0, 0.6, 0.03);
      playTone(320, 2.5, 0.4, 0.02);
    } catch (e) {
      console.warn('Boot sound failed:', e);
    }
  };

  // Error / warning blip
  const playError = () => {
    runWithCtx((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.24);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  };

  // Session create - soft whoosh
  const playNewChat = () => {
    runWithCtx((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);

      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(660, now + 0.06);
      shimmer.frequency.exponentialRampToValueAtTime(1320, now + 0.4);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(740, now);
      filter.Q.setValueAtTime(1.4, now);

      osc.connect(filter);
      shimmer.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.065, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      shimmer.start(now + 0.06);
      osc.stop(now + 0.5);
      shimmer.stop(now + 0.5);
    });
  };

  return { playSend, playReceive, playError, playNewChat, playBoot, unlockAudio };
}
