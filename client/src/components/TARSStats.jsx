import { usePersona } from '../context/PersonaContext';
import { useEffect, useState } from 'react';

function StatBar({ label, value, color, delay }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    setDisplayed(0);
    const timer = setTimeout(() => {
      setDisplayed(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div style={{ marginBottom: '6px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '3px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '8px',
            color: 'var(--text-3)',
            letterSpacing: '0.12em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            color,
            letterSpacing: '0.06em',
          }}
        >
          {value}%
        </span>
      </div>
      <div
        style={{
          height: '2px',
          borderRadius: '1px',
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${displayed}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            borderRadius: '1px',
            boxShadow: `0 0 6px ${color}`,
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

export default function TARSStats() {
  const { config } = usePersona();

  return (
    <div
      style={{
        padding: '10px 12px',
        borderTop: '0.5px solid rgba(124,92,191,0.1)',
        background: 'rgba(3,6,16,0.6)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: config.color,
            boxShadow: `0 0 4px ${config.color}`,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '8px',
            color: 'var(--text-3)',
            letterSpacing: '0.15em',
          }}
        >
          TARS PARAMETERS
        </span>
      </div>

      <StatBar label="HONESTY" value={config.honesty || 90} color={config.color} delay={200} />
      <StatBar label="HUMOR" value={config.humor || 75} color="#f59e0b" delay={400} />
      <StatBar label="CURIOSITY" value={config.curiosity || 85} color="#06b6d4" delay={600} />
    </div>
  );
}
