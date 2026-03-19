export default function PersonaHUD({ isThinking, isTransmitting }) {
  const status = isThinking
    ? { label: 'DECODING', color: '#e879f9', pulse: true }
    : isTransmitting
    ? { label: 'TRANSMITTING', color: '#06b6d4', pulse: true }
    : { label: 'STANDBY', color: '#4a5568', pulse: false };

  return (
    <div style={{
      position: 'absolute', top: '12px', right: '16px',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 10px', borderRadius: '20px',
        background: 'rgba(0,0,0,0.3)',
        border: `0.5px solid ${status.color}40`,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: status.color,
          boxShadow: `0 0 6px ${status.color}`,
          animation: status.pulse ? 'pulse-ring 1s ease-in-out infinite' : 'none'
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          color: status.color, letterSpacing: '0.12em'
        }}>
          {status.label}
        </span>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '8px',
        color: 'var(--text-dim)', letterSpacing: '0.08em'
      }}>
        GROQ · LLAMA-3.3-70B
      </div>
    </div>
  );
}
