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
        padding: '0',
        flexDirection: isUser ? 'row-reverse' : 'row',
        paddingLeft: isUser ? '20px' : '0px',
        paddingRight: isUser ? '0px' : '20px',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-display)',
        background: isUser
          ? 'linear-gradient(135deg, rgba(37,99,235,0.85), rgba(8,145,178,0.85))'
          : 'linear-gradient(135deg, var(--arc), var(--arc-bright))',
        boxShadow: isUser
          ? '0 0 12px rgba(56,189,248,0.5)'
          : '0 0 12px rgba(124,92,191,0.5)',
        color: 'white'
      }}>
        {isUser ? (username?.[0]?.toUpperCase() || 'U') : 'S'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: isUser ? '52%' : '56%', minWidth: '60px' }}>
        <div
          className={isUser ? 'bubble-user' : 'bubble-bot'}
          style={{
            padding: isUser ? '12px 16px' : '14px 18px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
            fontSize: '14px', lineHeight: '1.65',
            fontFamily: 'var(--font-mono)',
            wordBreak: 'break-word',
            ...(isUser ? {
              background: 'linear-gradient(135deg, #1d4ed8, #0891b2)',
              border: '0.5px solid rgba(56,189,248,0.5)',
              color: 'white',
              boxShadow: `
                0 0 0 0.5px rgba(56,189,248,0.25),
                0 0 24px rgba(56,189,248,0.25),
                0 8px 24px rgba(0,0,0,0.4)
              `,
            } : {
              background: 'rgba(4,6,18,0.92)',
              border: '0.5px solid rgba(124,92,191,0.7)',
              color: '#dde3f0',
              backdropFilter: 'blur(20px)',
              boxShadow: `
                0 0 0 0.5px rgba(124,92,191,0.3),
                0 0 30px rgba(124,92,191,0.15),
                0 8px 32px rgba(0,0,0,0.6),
                inset 0 1px 0 rgba(255,255,255,0.08)
              `,
            }),
          }}>
          {isUser ? (
            <span>{message.text}</span>
          ) : (
            <>
              <ReactMarkdown
                components={{
                  p:      ({children}) => <p style={{ margin: '0 0 10px', color: '#c8d3e8', lineHeight: 1.75 }}>{children}</p>,
                  strong: ({children}) => <strong style={{ fontWeight: 600, color: 'var(--arc-bright)' }}>{children}</strong>,
                  ol:     ({children}) => <ol style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>{children}</ol>,
                  ul:     ({children}) => <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>{children}</ul>,
                  li:     ({children}) => <li style={{ color: 'var(--text-1)' }}>{children}</li>,
                  code:   ({inline, children}) => inline
                    ? <code style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--pulse)', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{children}</code>
                    : <pre style={{ background: 'rgba(0,0,0,0.5)', border: '0.5px solid rgba(124,92,191,0.2)', borderRadius: '8px', padding: '12px', overflowX: 'auto', margin: '8px 0' }}>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--pulse)' }}>{children}</code>
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
                  background: 'var(--arc)',
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