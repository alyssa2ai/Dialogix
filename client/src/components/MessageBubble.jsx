import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTypewriter } from '../hooks/useTypewriter';

export default function MessageBubble({ message, username, isLatest }) {
  const isUser = message.sender === 'user';
  const ref = useRef(null);

  // Only stream the latest bot message.
  const { displayed, isDone } = useTypewriter(
    isUser ? message.text : message.text,
    8,
    !isUser && isLatest
  );

  const textToShow = (!isUser && isLatest) ? displayed : message.text;
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div
      ref={ref}
      className="signal-in"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        padding: '0 20px',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-orbitron)',
        background: isUser
          ? 'linear-gradient(135deg,#3b82f6,#06b6d4)'
          : 'linear-gradient(135deg,#a855f7,#6366f1)',
        boxShadow: isUser
          ? '0 0 12px rgba(59,130,246,0.5)'
          : '0 0 12px rgba(168,85,247,0.5)',
        color: 'white'
      }}>
        {isUser ? (username?.[0]?.toUpperCase() || 'U') : 'S'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '68%', minWidth: '80px' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          fontSize: '14px', lineHeight: '1.65',
          fontFamily: 'var(--font-inter)',
          wordBreak: 'break-word',
          ...(isUser ? {
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            color: 'white',
            boxShadow: '0 0 20px rgba(59,130,246,0.35), 0 4px 12px rgba(0,0,0,0.3)'
          } : {
            background: 'linear-gradient(135deg,rgba(168,85,247,0.18),rgba(99,102,241,0.18))',
            border: '0.5px solid rgba(168,85,247,0.35)',
            color: '#e6eef8',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 16px rgba(168,85,247,0.1)'
          })
        }}>
          {isUser ? (
            <span>{message.text}</span>
          ) : (
            <>
              <ReactMarkdown
                components={{
                  p:      ({children}) => <p style={{ margin: '0 0 8px' }}>{children}</p>,
                  strong: ({children}) => <strong style={{ fontWeight: 600, color: '#c4b5fd' }}>{children}</strong>,
                  ol:     ({children}) => <ol style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>{children}</ol>,
                  ul:     ({children}) => <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>{children}</ul>,
                  li:     ({children}) => <li style={{ color: '#d4d4e8' }}>{children}</li>,
                  code:   ({inline, children}) => inline
                    ? <code style={{ background: 'rgba(0,0,0,0.4)', color: '#06b6d4', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{children}</code>
                    : <pre style={{ background: 'rgba(0,0,0,0.5)', border: '0.5px solid rgba(168,85,247,0.2)', borderRadius: '8px', padding: '12px', overflowX: 'auto', margin: '8px 0' }}>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#a5f3fc' }}>{children}</code>
                      </pre>
                }}
              >
                {textToShow}
              </ReactMarkdown>

              {/* Blinking cursor while typing */}
              {!isDone && (
                <span style={{
                  display: 'inline-block',
                  width: '2px', height: '14px',
                  background: '#a855f7',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                  animation: 'cursor-blink 0.7s ease-in-out infinite'
                }} />
              )}
            </>
          )}
        </div>

        {/* Timestamp — only show when done typing */}
        {(isUser || isDone) && (
          <div style={{
            fontSize: '10px', marginTop: '4px', padding: '0 4px',
            color: 'var(--text-dim)', fontFamily: 'var(--font-mono)',
            textAlign: isUser ? 'right' : 'left'
          }}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}