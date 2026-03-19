import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import AICore from '../components/AICore';
import PersonaHUD from '../components/PersonaHUD';
import RobotHead from '../components/RobotHead';
import CommandPalette from '../components/CommandPalette';
import { useSound } from '../hooks/useSound';

function HUDCorners({ color = 'rgba(168,85,247,0.3)' }) {
  const corners = [
    { top: 8, left: 8, borderWidth: '1px 0 0 1px' },
    { top: 8, right: 8, borderWidth: '1px 1px 0 0' },
    { bottom: 8, left: 8, borderWidth: '0 0 1px 1px' },
    { bottom: 8, right: 8, borderWidth: '0 1px 1px 0' },
  ];

  return (
    <>
      {corners.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '14px',
            height: '14px',
            borderStyle: 'solid',
            borderColor: color,
            ...s,
          }}
        />
      ))}
    </>
  );
}

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { playNewChat, unlockAudio } = useSound();

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
    unlockAudio();
    playNewChat();
  };

  const handleDeleteChat = async (id) => {
    await api.delete(`/chat/sessions/${id}`);
    const updated = sessions.filter(s => s._id !== id);
    setSessions(updated);
    setActiveChatId(updated.length > 0 ? updated[0]._id : null);
  };

  const handleRenameChat = (id, newTitle) => {
    setSessions(prev => prev.map(s => s._id === id ? {...s, title: newTitle} : s));
  };

  const handleTitleUpdate = (id, newTitle) => {
    setSessions(prev => prev.map(s => s._id === id ? {...s, title: newTitle} : s));
  };

  const handleSendPrompt = (text) => {
    window.__DIALOGIX_SEND_PROMPT__?.(text);
  };

  const handleClearChat = () => {
    setActiveChatId(null);
  };

  const activeTitle = sessions.find((s) => s._id === activeChatId)?.title || '';

  return (
    <div style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      position: 'relative', zIndex: 1
    }}>

      <div style={{
        width: sidebarCollapsed ? '0px' : '260px',
        minWidth: sidebarCollapsed ? '0px' : '260px',
        overflow: 'hidden',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <Sidebar
          sessions={sessions}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      </div>

      <button
        onClick={() => setSidebarCollapsed((p) => !p)}
        style={{
          position: 'absolute',
          left: sidebarCollapsed ? '8px' : '248px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: '20px',
          height: '48px',
          background: 'rgba(7,16,42,0.95)',
          border: '0.5px solid rgba(168,85,247,0.3)',
          borderRadius: '0 8px 8px 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(168,85,247,0.7)',
          fontSize: '10px',
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), color 0.2s',
          boxShadow: '2px 0 12px rgba(168,85,247,0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#a855f7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(168,85,247,0.7)';
        }}
      >
        {sidebarCollapsed ? '>' : '<'}
      </button>

      {/* Right side */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        background: 'rgba(2,6,23,0.85)',
      }}>

        {/* AI core panel */}
        <div className="core-zone" style={{
          height: '160px',
          flexShrink: 0,
          borderBottom: '0.5px solid rgba(168,85,247,0.15)',
          background: 'rgba(7,12,35,0.7)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Radial glow behind core */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 50% 90% at 50% 50%, rgba(168,85,247,0.07), transparent)',
            pointerEvents: 'none'
          }}/>

          <AICore isThinking={isThinking} isTransmitting={isTransmitting} />
          <PersonaHUD isThinking={isThinking} isTransmitting={isTransmitting} />

          {/* HUD corners */}
          <HUDCorners />

          {/* Active session title */}
          {activeTitle && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#a855f7',
                boxShadow: '0 0 6px #a855f7',
              }}/>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'rgba(168,85,247,0.7)',
                letterSpacing: '0.1em',
              }}>
                {activeTitle.toUpperCase().slice(0, 35)}
              </span>
            </div>
          )}
        </div>

        {/* Chat window */}
        <ChatWindow
          chatId={activeChatId}
          onTitleUpdate={handleTitleUpdate}
          onThinkingChange={setIsThinking}
          onTransmittingChange={setIsTransmitting}
        />
      </div>

      {/* Robot head — fixed position, always visible */}
      <RobotHead isThinking={isThinking} isTransmitting={isTransmitting} />

      <CommandPalette
        onNewChat={handleNewChat}
        onClearChat={handleClearChat}
        onSendPrompt={handleSendPrompt}
      />
    </div>
  );
}