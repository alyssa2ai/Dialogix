export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '0 20px' }}>
      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#a855f7,#6366f1)',
        boxShadow: '0 0 12px rgba(168,85,247,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-orbitron)', color: 'white'
      }}>S</div>

      {/* Bubble */}
      <div style={{
        padding: '14px 18px',
        borderRadius: '18px 18px 18px 4px',
        background: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(99,102,241,0.12))',
        border: '0.5px solid rgba(168,85,247,0.25)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 16px rgba(168,85,247,0.15)',
        display: 'flex', gap: '5px', alignItems: 'center'
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#a855f7',
            boxShadow: '0 0 6px rgba(168,85,247,0.8)',
            animation: `typing-dot 1.1s ease-in-out infinite`,
            animationDelay: `${i * 0.18}s`
          }}/>
        ))}
      </div>

      {/* Status text */}
      <span style={{
        fontSize: '10px', color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
        alignSelf: 'center'
      }}>
        DECODING...
      </span>
    </div>
  );
}