import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersona } from '../context/PersonaContext';
import { PERSONA_CONFIGS } from '../data/tarsQuotes';
import { useSound } from '../hooks/useSound';

const COMMANDS = [
  { id: 'new-chat', group: 'MISSION', icon: '+', label: 'New Transmission', shortcut: 'N', action: 'new-chat' },
  { id: 'clear-chat', group: 'MISSION', icon: 'x', label: 'Clear Current Session', shortcut: 'X', action: 'clear-chat' },
  { id: 'export-md', group: 'MISSION', icon: '>', label: 'Export as Markdown', shortcut: 'E', action: 'export-md' },

  { id: 'p-synapse', group: 'PERSONA', icon: 'o', label: 'Synapse Core', shortcut: '1', action: 'persona-synapse' },
  { id: 'p-teacher', group: 'PERSONA', icon: 'o', label: 'Teacher Mode', shortcut: '2', action: 'persona-teacher' },
  { id: 'p-coderev', group: 'PERSONA', icon: 'o', label: 'Code Review Mode', shortcut: '3', action: 'persona-coderev' },
  { id: 'p-concise', group: 'PERSONA', icon: 'o', label: 'Concise Mode', shortcut: '4', action: 'persona-concise' },

  { id: 'q-summarize', group: 'QUICK FIRE', icon: '^', label: 'Summarize this chat', shortcut: null, action: 'prompt-summarize' },
  { id: 'q-debug', group: 'QUICK FIRE', icon: '^', label: 'Debug my last message', shortcut: null, action: 'prompt-debug' },
  { id: 'q-explain', group: 'QUICK FIRE', icon: '^', label: 'Explain in simple terms', shortcut: null, action: 'prompt-explain' },
  { id: 'q-refactor', group: 'QUICK FIRE', icon: '^', label: 'Refactor this code', shortcut: null, action: 'prompt-refactor' },

  { id: 'logout', group: 'SYSTEM', icon: 'P', label: 'Disconnect', shortcut: null, action: 'logout' },
];

export default function CommandPalette({ onNewChat, onClearChat, onSendPrompt }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setPersona, config } = usePersona();
  const { playSend, playNewChat } = useSound();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = viewportWidth <= 900;

  const filtered = useMemo(() => {
    return COMMANDS.filter(
      (c) =>
        !query ||
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, cmd) => {
      if (!acc[cmd.group]) acc[cmd.group] = [];
      acc[cmd.group].push(cmd);
      return acc;
    }, {});
  }, [filtered]);

  const flat = useMemo(() => Object.values(grouped).flat(), [grouped]);

  const exportMarkdown = useCallback(() => {
    const messages = window.__DIALOGIX_MESSAGES__ || [];
    if (!messages.length) return;

    const md = messages
      .map(
        (m) =>
          `**${m.sender === 'user' ? 'ASTRONAUT' : 'SYNAPSE CORE'}** - ${new Date(
            m.timestamp
          ).toLocaleTimeString()}\n\n${m.text}`
      )
      .join('\n\n---\n\n');

    const blob = new Blob([`# DIALOGIX MISSION LOG\n\n${md}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dialogix-mission-log.md';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const executeCommand = useCallback(
    (cmd) => {
      setOpen(false);
      playSend();

      switch (cmd.action) {
        case 'new-chat':
          onNewChat?.();
          playNewChat();
          break;
        case 'clear-chat':
          onClearChat?.();
          break;
        case 'export-md':
          exportMarkdown();
          break;
        case 'persona-synapse':
          setPersona('synapse');
          break;
        case 'persona-teacher':
          setPersona('teacher');
          break;
        case 'persona-coderev':
          setPersona('coderev');
          break;
        case 'persona-concise':
          setPersona('concise');
          break;
        case 'prompt-summarize':
          onSendPrompt?.('Summarize our conversation so far as a mission briefing.');
          break;
        case 'prompt-debug':
          onSendPrompt?.('Debug the issue in my last message and explain the fix step by step.');
          break;
        case 'prompt-explain':
          onSendPrompt?.('Explain your last response in the simplest possible terms.');
          break;
        case 'prompt-refactor':
          onSendPrompt?.('Refactor the code in my last message with best practices.');
          break;
        case 'logout':
          logout();
          navigate('/login');
          break;
        default:
          break;
      }
    },
    [onNewChat, onClearChat, onSendPrompt, setPersona, logout, navigate, playSend, playNewChat, exportMarkdown]
  );

  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, flat.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (flat[selected]) executeCommand(flat[selected]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selected, flat, executeCommand]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!open) {
    return (
      <div
        style={{
          position: 'fixed',
          top: isMobile ? 'unset' : '224px',
          right: isMobile ? 'unset' : '20px',
          bottom: isMobile ? '16px' : 'unset',
          left: isMobile ? '50%' : 'unset',
          transform: isMobile ? 'translateX(-50%)' : 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-dim)',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 70,
        }}
      >
        <button
          onClick={() => setOpen(true)}
          aria-label="Open mission control"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '8px 10px' : '8px 12px',
            borderRadius: '10px',
            border: `0.5px solid ${config.color}40`,
            background: 'rgba(7,16,42,0.92)',
            color: '#e6eef8',
            cursor: 'pointer',
            boxShadow: `0 0 16px ${config.color}25`,
          }}
        >
          <span
            style={{
              width: '18px',
              height: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              border: `0.5px solid ${config.color}40`,
              color: config.color,
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            C
          </span>
          {!isMobile && (
            <span style={{ fontSize: '10px', letterSpacing: '0.1em' }}>MISSION CONTROL</span>
          )}
          <kbd
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              fontSize: '10px',
              color: 'var(--text-dim)',
            }}
          >
            Ctrl+K
          </kbd>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(2,6,23,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: isMobile ? '8vh' : '15vh',
        animation: 'signal-in 0.18s ease forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100vw' : '560px',
          background: 'rgba(7,16,42,0.98)',
          border: `0.5px solid ${config.color}40`,
          borderRadius: isMobile ? '12px' : '16px',
          boxShadow: `0 0 60px ${config.color}20, 0 40px 80px rgba(0,0,0,0.6)`,
          overflow: 'hidden',
          margin: isMobile ? '0 10px' : '0 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isMobile ? '12px 14px' : '16px 20px',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke={config.color} strokeWidth="1.5" />
              <path d="M16.5 16.5L21 21" stroke={config.color} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Search mission controls..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e6eef8',
              fontSize: '15px',
              fontFamily: 'var(--font-inter)',
              caretColor: config.color,
            }}
          />

          <kbd
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-dim)',
            }}
          >
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          style={{
            maxHeight: isMobile ? '52vh' : '380px',
            overflowY: 'auto',
            padding: isMobile ? '6px' : '8px',
          }}
        >
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group}>
              <div
                style={{
                  padding: '8px 12px 4px',
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '9px',
                  color: 'var(--text-dim)',
                  letterSpacing: '0.2em',
                }}
              >
                {group}
              </div>

              {cmds.map((cmd) => {
                const globalIdx = flat.findIndex((f) => f.id === cmd.id);
                const isActive = globalIdx === selected;
                const isPersona = cmd.action?.startsWith('persona-');
                const personaKey = cmd.action?.replace('persona-', '');
                const pConfig = isPersona ? PERSONA_CONFIGS[personaKey] : null;

                return (
                  <div
                    key={cmd.id}
                    data-index={globalIdx}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelected(globalIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      marginBottom: '2px',
                      background: isActive ? `${config.color}15` : 'transparent',
                      border: isActive ? `0.5px solid ${config.color}30` : '0.5px solid transparent',
                      transition: 'all 0.1s',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isActive ? `${config.color}20` : 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '14px',
                        color: isActive ? config.color : 'var(--text-muted)',
                        transition: 'all 0.15s',
                        border: `0.5px solid ${isActive ? config.color + '40' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {isPersona ? (
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: pConfig?.color,
                            boxShadow: `0 0 6px ${pConfig?.color}`,
                          }}
                        />
                      ) : (
                        cmd.icon
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontFamily: 'var(--font-inter)',
                          color: isActive ? '#e6eef8' : 'var(--text-muted)',
                          fontWeight: isActive ? 500 : 400,
                          transition: 'color 0.1s',
                        }}
                      >
                        {cmd.label}
                      </div>
                      {isPersona && (
                        <div
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: pConfig?.color,
                            opacity: 0.7,
                            letterSpacing: '0.06em',
                            marginTop: '1px',
                          }}
                        >
                          {PERSONA_CONFIGS[personaKey]?.label}
                        </div>
                      )}
                    </div>

                    {cmd.shortcut && (
                      <kbd
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: `0.5px solid ${isActive ? config.color + '50' : 'rgba(255,255,255,0.1)'}`,
                          background: isActive ? `${config.color}10` : 'rgba(255,255,255,0.03)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: isActive ? config.color : 'var(--text-dim)',
                          transition: 'all 0.1s',
                        }}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-dim)',
                letterSpacing: '0.08em',
              }}
            >
              NO SIGNALS MATCHING "{query.toUpperCase()}"
            </div>
          )}
        </div>

        <div
          style={{
            padding: isMobile ? '8px 10px' : '10px 20px',
            borderTop: '0.5px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            overflowX: 'auto',
          }}
        >
          {[
            { keys: ['UP', 'DOWN'], label: 'navigate' },
            { keys: ['ENTER'], label: 'execute' },
            { keys: ['ESC'], label: 'close' },
          ].map(({ keys, label }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {keys.map((k) => (
                <kbd
                  key={k}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                  }}
                >
                  {k}
                </kbd>
              ))}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  marginLeft: '2px',
                }}
              >
                {label}
              </span>
            </div>
          ))}

          <div style={{ flex: 1 }} />
          {!isMobile && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: config.color,
                letterSpacing: '0.12em',
                opacity: 0.7,
              }}
            >
              MISSION CONTROL
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
