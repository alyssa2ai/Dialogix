import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import AICore from '../components/AICore';
import PersonaHUD from '../components/PersonaHUD';
import RobotHead from '../components/RobotHead';
import CommandPalette from '../components/CommandPalette';
import { useSound } from '../hooks/useSound';

export default function Chat() {
  const [sessions, setSessions]       = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isThinking, setIsThinking]   = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
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

  return (
    <div style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      position: 'relative', zIndex: 1
    }}>
      <Sidebar
        sessions={sessions}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      {/* Right side — core + chat stacked */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>

        {/* AI Core panel */}
        <div style={{
          height: '200px',
          flexShrink: 0,
          borderBottom: '0.5px solid rgba(168,85,247,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle radial glow behind core */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(168,85,247,0.06), transparent)',
            pointerEvents: 'none'
          }}/>

          <AICore isThinking={isThinking} isTransmitting={isTransmitting} />
          <PersonaHUD isThinking={isThinking} isTransmitting={isTransmitting} />

          {/* HUD corners */}
          <HUDCorners />

          {/* Active chat title */}
          {activeChatId && sessions.find(s => s._id === activeChatId) && (
            <div style={{
              position: 'absolute', top: '12px', left: '16px',
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-dim)', letterSpacing: '0.1em'
            }}>
              SESSION · {sessions.find(s => s._id === activeChatId)?.title?.toUpperCase().slice(0,30)}
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

// Decorative HUD corner brackets
function HUDCorners() {
  const corner = (style) => (
    <div style={{
      position: 'absolute', width: '16px', height: '16px',
      borderColor: 'rgba(168,85,247,0.3)', borderStyle: 'solid',
      ...style
    }}/>
  );
  return (
    <>
      {corner({ top: 8, left: 8,   borderWidth: '1px 0 0 1px' })}
      {corner({ top: 8, right: 8,  borderWidth: '1px 1px 0 0' })}
      {corner({ bottom: 8, left: 8,  borderWidth: '0 0 1px 1px' })}
      {corner({ bottom: 8, right: 8, borderWidth: '0 1px 1px 0' })}
    </>
  );
}