import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import RobotHead from '../components/RobotHead';
import TARSStats from '../components/TARSStats';
import CommandPalette from '../components/CommandPalette';
import TARSSwagger from '../components/TARSSwagger';
import { useSound } from '../hooks/useSound';

export default function Chat() {
  const [sessions, setSessions]               = useState([]);
  const [activeChatId, setActiveChatId]       = useState(null);
  const [isThinking, setIsThinking]           = useState(false);
  const [isTransmitting, setIsTransmitting]   = useState(false);
  const [showSwagger, setShowSwagger]         = useState(false);
  const [tarsVoice, setTarsVoice]             = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { playNewChat } = useSound();

  useEffect(() => {
    const handler = () => setShowSwagger(true);
    window.addEventListener('tars:swagger', handler);
    return () => {
      window.removeEventListener('tars:swagger', handler);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/chat/sessions');
        setSessions(res.data);
        if (res.data.length > 0) setActiveChatId(res.data[0]._id);
      } catch (err) {
        console.warn('[Chat] Failed to load sessions. Backend may be offline.', err?.message || err);
        setSessions([]);
        setActiveChatId(null);
      }
    };
    load();
  }, []);

  const handleNewChat = async () => {
    const res = await api.post('/chat/sessions');
    setSessions(prev => [res.data, ...prev]);
    setActiveChatId(res.data._id);
    window.TARS?.onGreeting?.();
    playNewChat();
  };

  const handleDeleteChat = async (id) => {
    await api.delete(`/chat/sessions/${id}`);
    const updated = sessions.filter(s => s._id !== id);
    setSessions(updated);
    setActiveChatId(updated.length > 0 ? updated[0]._id : null);
  };

  const handleRenameChat  = (id, t) => setSessions(p => p.map(s => s._id === id ? {...s, title: t} : s));
  const handleTitleUpdate = (id, t) => setSessions(p => p.map(s => s._id === id ? {...s, title: t} : s));
  const handleSendPrompt  = (text) => window.__DIALOGIX_SEND_PROMPT__?.(text);
  const handleClearChat   = () => setActiveChatId(null);

  return (
    <div className="scanline" style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      position: 'relative', zIndex: 1, background: 'transparent'
    }}>
      {/* ── LEFT PANEL — TARS + Sessions ── */}
      <div style={{
        width: sidebarCollapsed ? '56px' : '280px',
        minWidth: sidebarCollapsed ? '56px' : '280px',
        height: '100vh',
        minHeight: 0,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative', zIndex: 10,
        background: 'rgba(2,4,14,0.88)',
        borderRight: '0.5px solid rgba(124,92,191,0.2)',
        flexShrink: 0,
        overflow: 'hidden'
      }}>

        {/* Logo header — always visible */}
        <div style={{
          padding: sidebarCollapsed ? '16px 0' : '16px 20px',
          borderBottom: '0.5px solid rgba(124,92,191,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          background: 'rgba(3,6,16,0.8)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #7c5cbf, #2563eb)',
            boxShadow: '0 0 16px rgba(124,92,191,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: sidebarCollapsed ? '0 auto' : '0'
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '14px',
              color: 'white'
            }}>D</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-1)',
                letterSpacing: '0.06em'
              }}>DIALOGIX</div>
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '8px',
                color: 'var(--text-3)',
                letterSpacing: '0.15em',
                marginTop: '1px'
              }}>SYNAPSE CORE v1.0</div>
            </div>
          )}
        </div>

        {/* TARS viewport — top section */}
        <div style={{
          height: sidebarCollapsed ? '0' : '280px',
          flexShrink: 0,
          position: 'relative',
          borderBottom: '0.5px solid rgba(124,92,191,0.2)',
          overflow: 'hidden',
          background: 'rgba(4,8,20,0.8)',
          transition: 'height 0.35s ease'
        }}>
          {/* Radial glow behind TARS */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 100% 100% at 50% 60%, rgba(124,92,191,0.18) 0%, rgba(56,189,248,0.05) 50%, transparent 75%)',
          }}/>

          {[
            { top: 8, left: 8, borderWidth: '1px 0 0 1px' },
            { top: 8, right: 8, borderWidth: '1px 1px 0 0' },
            { bottom: 8, left: 8, borderWidth: '0 0 1px 1px' },
            { bottom: 8, right: 8, borderWidth: '0 1px 1px 0' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                borderStyle: 'solid',
                borderColor: 'rgba(124,92,191,0.4)',
                pointerEvents: 'none',
                zIndex: 2,
                ...s,
              }}
            />
          ))}

          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 2,
            pointerEvents: 'none'
          }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              color: 'rgba(124,92,191,0.5)',
              letterSpacing: '0.25em'
            }}>
              T · A · R · S
            </span>
          </div>

          {!sidebarCollapsed && (
            /* Expanded — full TARS canvas */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <RobotHead
                isThinking={isThinking}
                isTransmitting={isTransmitting}
                embedded={true}
                voiceOverride={tarsVoice}
              />
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '0.5px solid rgba(124,92,191,0.1)',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setShowSwagger(true)}
              style={{
                flex: 1,
                padding: '7px 0',
                background: 'rgba(124,92,191,0.15)',
                border: '0.5px solid rgba(124,92,191,0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '9px',
                color: '#a78bfa',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(124,92,191,0.3)';
                e.currentTarget.style.boxShadow = '0 0 14px rgba(124,92,191,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(124,92,191,0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ⬡ SWAGGER
            </button>

            <button
              onClick={() => setTarsVoice((v) => !v)}
              style={{
                flex: 1,
                padding: '7px 0',
                background: tarsVoice ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                border: `0.5px solid ${tarsVoice ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '9px',
                color: tarsVoice ? '#34d399' : '#4a5568',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = tarsVoice ? '0 0 14px rgba(16,185,129,0.3)' : 'none';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {tarsVoice ? '◉ VOICE' : '◎ MUTED'}
            </button>

            <button
              onClick={() => {}}
              style={{
                flex: 1,
                padding: '6px 0',
                background: 'rgba(56,189,248,0.1)',
                border: '0.5px solid rgba(56,189,248,0.4)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '9px',
                color: '#67e8f9',
                letterSpacing: '0.12em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.25)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(56,189,248,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ◈ WALK
            </button>
          </div>
        )}

        {!sidebarCollapsed && <TARSStats />}

        {/* Sessions — below TARS */}
        {!sidebarCollapsed && (
          <Sidebar
            sessions={sessions}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
            embedded={true}
          />
        )}

        {/* Collapse button — bottom of panel */}
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          style={{
            position: 'absolute', bottom: '20px',
            left: sidebarCollapsed ? '14px' : '20px',
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(124,92,191,0.1)',
            border: '0.5px solid rgba(124,92,191,0.3)',
            cursor: 'pointer', color: 'var(--arc-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', transition: 'all 0.2s', zIndex: 5
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,92,191,0.2)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(124,92,191,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,92,191,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Glowing divider */}
      <div style={{
        width: '1px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(124,92,191,0.6) 20%, rgba(56,189,248,0.4) 60%, transparent 100%)',
        boxShadow: '0 0 8px rgba(124,92,191,0.4)',
        zIndex: 5,
      }} />

      {/* ── RIGHT — Full bleed chat over cosmos ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, minHeight: 0,
        position: 'relative', zIndex: 1,
        background: 'transparent'
      }}>
        <ChatWindow
          chatId={activeChatId}
          onTitleUpdate={handleTitleUpdate}
          onThinkingChange={setIsThinking}
          onTransmittingChange={setIsTransmitting}
        />
      </div>

      {/* ── Command palette ── */}
      <CommandPalette
        onNewChat={handleNewChat}
        onClearChat={handleClearChat}
        onSendPrompt={handleSendPrompt}
      />

      {showSwagger && <TARSSwagger onComplete={() => setShowSwagger(false)} />}
    </div>
  );
}