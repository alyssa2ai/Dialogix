import { useState, useEffect, useRef } from 'react';
import { usePersona } from '../context/PersonaContext';

const STAGE_SETS = {
  synapse: [
    { label: 'PARSING REQUEST', duration: 800 },
    { label: 'QUERYING NEURAL MATRIX', duration: 1200 },
    { label: 'CROSS-REFERENCING DATA', duration: 900 },
    { label: 'COMPOSING RESPONSE', duration: 999999 },
  ],
  teacher: [
    { label: 'ANALYSING QUESTION', duration: 700 },
    { label: 'BUILDING EXPLANATION', duration: 1100 },
    { label: 'SIMPLIFYING CONCEPTS', duration: 900 },
    { label: 'COMPOSING LESSON', duration: 999999 },
  ],
  coderev: [
    { label: 'SCANNING CODEBASE', duration: 600 },
    { label: 'DETECTING PATTERNS', duration: 1000 },
    { label: 'RUNNING DIAGNOSTICS', duration: 1100 },
    { label: 'COMPILING REVIEW', duration: 999999 },
  ],
  concise: [
    { label: 'PARSING INPUT', duration: 500 },
    { label: 'EXTRACTING ESSENCE', duration: 900 },
    { label: 'COMPRESSING OUTPUT', duration: 999999 },
  ],
};

export default function ThinkingStages() {
  const { persona, config } = usePersona();
  const [stageIndex, setStageIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const dotRef = useRef(null);
  const startTime = useRef(Date.now());

  const stages = STAGE_SETS[persona] || STAGE_SETS.synapse;

  useEffect(() => {
    setStageIndex(0);
    startTime.current = Date.now();

    const advance = (idx) => {
      const stage = stages[idx];
      if (!stage || stage.duration === 999999) return;
      timerRef.current = setTimeout(() => {
        setStageIndex(idx + 1);
        advance(idx + 1);
      }, stage.duration);
    };

    advance(0);
    return () => clearTimeout(timerRef.current);
  }, [persona, stages]);

  useEffect(() => {
    dotRef.current = setInterval(() => {
      setDotCount((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(dotRef.current);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 100) / 10);
    }, 100);
    return () => clearInterval(id);
  }, []);

  const currentStage = stages[Math.min(stageIndex, stages.length - 1)];
  const dots = '.'.repeat(dotCount);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0 20px' }}>
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          flexShrink: 0,
          background: `linear-gradient(135deg, ${config.color}, #6366f1)`,
          boxShadow: `0 0 12px ${config.color}80`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'var(--font-orbitron)',
          color: 'white',
        }}
      >
        S
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(99,102,241,0.08))',
          border: `0.5px solid ${config.color}40`,
          borderRadius: '18px 18px 18px 4px',
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 16px ${config.color}15`,
          padding: '12px 16px',
          minWidth: '260px',
        }}
      >
        {stages.slice(0, stageIndex).map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
              opacity: 0.45,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke={config.color} strokeWidth="1" />
              <path
                d="M2.5 5l2 2 3-3"
                stroke={config.color}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textDecoration: 'line-through',
              }}
            >
              {s.label}
            </span>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', flexShrink: 0, position: 'relative' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ animation: 'spin-slow 1s linear infinite' }}>
              <circle
                cx="5"
                cy="5"
                r="4"
                fill="none"
                stroke={config.color}
                strokeWidth="1.5"
                strokeDasharray="8 16"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: config.color,
              letterSpacing: '0.1em',
              textShadow: `0 0 8px ${config.color}80`,
            }}
          >
            {currentStage?.label}
            {dots}
          </span>
        </div>

        <div
          style={{
            marginTop: '10px',
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '1px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min((stageIndex / (stages.length - 1)) * 100, 85)}%`,
              background: `linear-gradient(90deg, ${config.color}, #06b6d4)`,
              borderRadius: '1px',
              transition: 'width 0.8s ease',
              boxShadow: `0 0 6px ${config.color}`,
            }}
          />
        </div>

        <div
          style={{
            marginTop: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
            }}
          >
            PROCESSING
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-dim)',
              letterSpacing: '0.06em',
            }}
          >
            {elapsed.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}
