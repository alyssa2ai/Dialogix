import { useState, useEffect, useRef } from 'react';
import { useSound } from '../hooks/useSound';

const BOOT_LINES = [
  { text: 'DIALOGIX DEEP SPACE OPERATING SYSTEM v4.2.1', delay: 0, color: '#e6eef8', speed: 18 },
  { text: 'COPYRIGHT 2157 LAZARUS MISSION CONTROL', delay: 320, color: '#4a5568', speed: 14 },
  { text: '', delay: 600, color: '', speed: 0 },
  { text: 'INITIALIZING HARDWARE SUBSYSTEMS...', delay: 700, color: '#9aa7bf', speed: 20 },
  { text: '  [OK] NEURAL MATRIX CORE...........', delay: 1100, color: '#22c55e', speed: 16 },
  { text: '  [OK] QUANTUM MEMORY BANKS.........', delay: 1500, color: '#22c55e', speed: 16 },
  { text: '  [OK] GRAVITATIONAL SENSORS........', delay: 1850, color: '#22c55e', speed: 16 },
  { text: '  [OK] INTERSTELLAR COMM ARRAY......', delay: 2150, color: '#22c55e', speed: 16 },
  { text: '  [OK] TARS COMPANION MODULE........', delay: 2420, color: '#22c55e', speed: 16 },
  { text: '', delay: 2700, color: '', speed: 0 },
  { text: 'ESTABLISHING UPLINK TO SYNAPSE CORE...', delay: 2800, color: '#9aa7bf', speed: 22 },
  { text: '  SIGNAL LOCK.................. 100%', delay: 3300, color: '#3b82f6', speed: 16 },
  { text: '  ENCRYPTION HANDSHAKE......... DONE', delay: 3700, color: '#3b82f6', speed: 16 },
  { text: '  QUANTUM TUNNEL............... OPEN', delay: 4050, color: '#3b82f6', speed: 16 },
  { text: '', delay: 4350, color: '', speed: 0 },
  { text: 'LOADING LANGUAGE MODELS...', delay: 4450, color: '#9aa7bf', speed: 20 },
  { text: '  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] LLAMA-3.3-70B READY', delay: 4800, color: '#a855f7', speed: 12 },
  { text: '', delay: 5200, color: '', speed: 0 },
  { text: 'ALL SYSTEMS NOMINAL.', delay: 5300, color: '#22c55e', speed: 22 },
  { text: 'WELCOME ABOARD, ASTRONAUT.', delay: 5800, color: '#e6eef8', speed: 20 },
  { text: '', delay: 6200, color: '', speed: 0 },
  { text: '> LAUNCHING DIALOGIX...', delay: 6300, color: '#a855f7', speed: 22 },
];

function TypedLine({ text, color, speed, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!text) {
      onDone?.();
      return;
    }

    const tick = () => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        onDone?.();
        return;
      }
      setTimeout(tick, speed);
    };
    setTimeout(tick, speed);
  }, []);

  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
      lineHeight: '1.8',
      color: color || 'transparent',
      whiteSpace: 'pre',
      letterSpacing: '0.04em'
    }}>
      {displayed}
      {displayed.length > 0 && displayed.length < text.length && (
        <span style={{
          display: 'inline-block',
          width: '7px',
          height: '13px',
          background: color,
          marginLeft: '1px',
          verticalAlign: 'middle',
          opacity: 0.9
        }} />
      )}
    </div>
  );
}

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const timeoutsRef = useRef([]);
  const { playBoot, unlockAudio } = useSound();

  useEffect(() => {
    // Reset state for strict mode double-effect safety.
    setVisibleLines([]);
    setCurrentLine(0);
    setFadeOut(false);
    setProgress(0);

    const unlock = async () => {
      try {
        unlockAudio();
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        await ctx.resume();
        setTimeout(() => playBoot(), 400);
      } catch (e) {
        console.warn('[BootSequence] Audio unlock blocked', e);
      }
    };

    void unlock();

    BOOT_LINES.forEach((line, i) => {
      const lineTimer = setTimeout(() => {
        setVisibleLines((prev) => (prev.includes(i) ? prev : [...prev, i]));
        setCurrentLine(i);
        setProgress(Math.round((i / (BOOT_LINES.length - 1)) * 100));
      }, line.delay);
      timeoutsRef.current.push(lineTimer);
    });

    const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay;
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      const doneTimer = setTimeout(onComplete, 900);
      timeoutsRef.current.push(doneTimer);
    }, lastDelay + 1200);
    timeoutsRef.current.push(fadeTimer);

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#010208',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.9s ease',
      opacity: fadeOut ? 0 : 1,
      pointerEvents: fadeOut ? 'none' : 'all'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)'
      }} />

      {[
        { top: 32, left: 32, borderWidth: '2px 0 0 2px' },
        { top: 32, right: 32, borderWidth: '2px 2px 0 0' },
        { bottom: 32, left: 32, borderWidth: '0 0 2px 2px' },
        { bottom: 32, right: 32, borderWidth: '0 2px 2px 0' },
      ].map((style, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: '24px',
          height: '24px',
          borderStyle: 'solid',
          borderColor: 'rgba(168,85,247,0.4)',
          ...style
        }} />
      ))}

      <div style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg,#3b82f6,#a855f7)',
          boxShadow: '0 0 30px rgba(168,85,247,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            color: 'white',
            fontFamily: 'var(--font-orbitron)',
            fontWeight: 700,
            fontSize: '16px'
          }}>D</span>
        </div>
        <span style={{
          fontFamily: 'var(--font-orbitron)',
          fontSize: '22px',
          fontWeight: 600,
          color: '#e6eef8',
          letterSpacing: '0.1em',
          textShadow: '0 0 30px rgba(168,85,247,0.6)'
        }}>DIALOGIX</span>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '640px',
        background: 'rgba(255,255,255,0.02)',
        border: '0.5px solid rgba(168,85,247,0.2)',
        borderRadius: '12px',
        padding: '24px 28px',
        backdropFilter: 'blur(12px)',
        margin: '0 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)'
        }}>
          {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
            <div key={i} style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: c,
              opacity: 0.7
            }} />
          ))}
          <span style={{
            marginLeft: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            letterSpacing: '0.08em'
          }}>
            SYNAPSE CORE - BOOT TERMINAL
          </span>
        </div>

        <div
          ref={containerRef}
          style={{ height: '260px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '0px' }}
        >
          {visibleLines.map((i) => (
            <TypedLine
              key={i}
              text={BOOT_LINES[i].text}
              color={BOOT_LINES[i].color}
              speed={BOOT_LINES[i].speed}
            />
          ))}
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '640px',
        margin: '16px 24px 0',
        height: '2px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '1px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg,#3b82f6,#a855f7)',
          borderRadius: '1px',
          transition: 'width 0.4s ease',
          boxShadow: '0 0 8px rgba(168,85,247,0.6)'
        }} />
      </div>

      <div style={{
        marginTop: '10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-dim)',
        letterSpacing: '0.1em'
      }}>
        SYSTEM BOOT {progress}%
      </div>
    </div>
  );
}
