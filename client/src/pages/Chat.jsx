import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import RobotHead from '../components/RobotHead';
import CommandPalette from '../components/CommandPalette';
import Starfield from '../components/Starfield';

export default function Chat() {
  const [sessions, setSessions]               = useState([]);
  const [activeChatId, setActiveChatId]       = useState(null);
  const [isThinking, setIsThinking]           = useState(false);
  const [isTransmitting, setIsTransmitting]   = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      position: 'relative', background: 'var(--void)'
    }}>
      {/* Layers */}
      <Starfield/>
      <div className="nebula-bg"/>
      <div className="horizon"/>

      {/* ── LEFT PANEL — TARS + Sessions ── */}
      <div style={{
        width: sidebarCollapsed ? '56px' : '280px',
        minWidth: sidebarCollapsed ? '56px' : '280px',
        height: '100vh',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative', zIndex: 10,
        background: 'rgba(3,6,16,0.92)',
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
          height: sidebarCollapsed ? '0' : '260px',
          flexShrink: 0,
          position: 'relative',
          borderBottom: '0.5px solid rgba(124,92,191,0.15)',
          overflow: 'hidden',
          background: 'rgba(4,8,20,0.7)',
          transition: 'height 0.35s ease'
        }}>
          {/* Radial glow behind TARS */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(124,92,191,0.1), transparent)',
            pointerEvents: 'none'
          }}/>

          {!sidebarCollapsed && (
            /* Expanded — full TARS canvas */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <RobotHead
                isThinking={isThinking}
                isTransmitting={isTransmitting}
                embedded={true}
              />
            </div>
          )}
        </div>

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

      {/* ── RIGHT — Full bleed chat over cosmos ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, minHeight: 0, position: 'relative', zIndex: 1
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
    </div>
  );
}