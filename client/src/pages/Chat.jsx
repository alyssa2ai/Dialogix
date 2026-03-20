import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import RobotHead from '../components/RobotHead';
import CommandPalette from '../components/CommandPalette';
import TARSSwagger from '../components/TARSSwagger';
import { useSound } from '../hooks/useSound';
import { useAuth } from '../context/AuthContext';

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function Chat() {
  const [sessions, setSessions]             = useState([]);
  const [activeChatId, setActiveChatId]     = useState(null);
  const [isThinking, setIsThinking]         = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showSwagger, setShowSwagger]       = useState(false);
  const [tarsVoice, setTarsVoice]           = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user }       = useAuth();
  const { playNewChat } = useSound();
  const isMobile       = useIsMobile();

  // Greeting
  useEffect(() => {
    if (!user?.username) return;
    const timer = setTimeout(() => {
      try {
        if (!window.speechSynthesis) return;
        const hour     = new Date().getHours();
        const timeWord = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        const greetings = [
          `Good ${timeWord}, ${user.username}. TARS online. Ready for your mission.`,
          `Welcome back, ${user.username}. All systems nominal.`,
          `${user.username}. Neural uplink established. Ready to explore.`,
          `Good ${timeWord} ${user.username}. Synapse Core ready.`,
        ];
        const text = greetings[Math.floor(Math.random() * greetings.length)];
        const u    = new SpeechSynthesisUtterance(text);
        const speak = () => {
          const voices = window.speechSynthesis.getVoices();
          const voice  = voices.find(v => v.name.includes('Google UK English Male'))
            || voices.find(v => v.name.includes('Microsoft David'))
            || voices.find(v => v.name.includes('Daniel'))
            || voices.find(v => v.lang?.startsWith('en'));
          if (voice) u.voice = voice;
          u.rate = 0.82; u.pitch = 0.58; u.volume = 0.9;
          window.speechSynthesis.speak(u);
        };
        if (window.speechSynthesis.getVoices().length > 0) speak();
        else window.speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
      } catch(_) {}
    }, 2500);
    return () => clearTimeout(timer);
  }, [user?.username]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/chat/sessions');
        setSessions(res.data);
        if (res.data.length > 0) setActiveChatId(res.data[0]._id);
      } catch(err) {
        setSessions([]); setActiveChatId(null);
      }
    };
    load();
  }, []);

  const handleNewChat = async () => {
    const res = await api.post('/chat/sessions');
    setSessions(prev => [res.data, ...prev]);
    setActiveChatId(res.data._id);
    playNewChat();
    if (isMobile) setMobileSidebarOpen(false);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (isMobile) setMobileSidebarOpen(false);
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

  // -- Sidebar content (shared between mobile + desktop) --
  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px 20px', flexShrink: 0,
        borderBottom: '0.5px solid rgba(124,92,191,0.15)',
        background: 'rgba(3,6,16,0.9)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg,#7c5cbf,#2563eb)',
            boxShadow: '0 0 16px rgba(124,92,191,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'white' }}>D</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '0.06em' }}>DIALOGIX</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.15em' }}>SYNAPSE CORE v1.0</div>
          </div>
        </div>
        {/* Close button -- mobile only */}
        {isMobile && (
          <button onClick={() => setMobileSidebarOpen(false)} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            fontSize: '18px', cursor: 'pointer', padding: '4px'
          }}>✕</button>
        )}
      </div>

      {/* TARS viewport -- smaller on mobile */}
      <div style={{
        height: isMobile ? '180px' : '280px',
        flexShrink: 0, position: 'relative',
        borderBottom: '0.5px solid rgba(124,92,191,0.2)',
        overflow: 'hidden', background: 'rgba(4,8,20,0.8)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 100% 100% at 50% 60%, rgba(124,92,191,0.18) 0%, transparent 75%)',
        }}/>
        {[
          { top: 8, left: 8,     borderWidth: '1px 0 0 1px' },
          { top: 8, right: 8,    borderWidth: '1px 1px 0 0' },
          { bottom: 8, left: 8,  borderWidth: '0 0 1px 1px' },
          { bottom: 8, right: 8, borderWidth: '0 1px 1px 0' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: '12px', height: '12px', borderStyle: 'solid', borderColor: 'rgba(124,92,191,0.4)', pointerEvents: 'none', zIndex: 2, ...s }}/>
        ))}
        <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center', zIndex: 2, pointerEvents: 'none' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'rgba(124,92,191,0.5)', letterSpacing: '0.25em' }}>T · A · R · S</span>
        </div>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <RobotHead isThinking={isThinking} isTransmitting={isTransmitting} embedded={true} voiceOverride={tarsVoice}/>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '8px 12px', borderBottom: '0.5px solid rgba(124,92,191,0.1)', display: 'flex', gap: '6px' }}>
        <button onClick={() => setShowSwagger(true)} style={{
          flex: 1, padding: '7px 0', background: 'rgba(124,92,191,0.15)',
          border: '0.5px solid rgba(124,92,191,0.5)', borderRadius: '8px',
          cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '9px',
          color: '#a78bfa', letterSpacing: '0.1em'
        }}>⬡ SWAGGER</button>
        <button onClick={() => setTarsVoice(v => !v)} style={{
          flex: 1, padding: '7px 0',
          background: tarsVoice ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
          border: `0.5px solid ${tarsVoice ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-ui)',
          fontSize: '9px', color: tarsVoice ? '#34d399' : '#4a5568', letterSpacing: '0.1em'
        }}>{tarsVoice ? '◉ VOICE' : '◎ MUTED'}</button>
      </div>

      {/* Sessions */}
      <Sidebar
        sessions={sessions} activeChatId={activeChatId}
        onSelectChat={handleSelectChat} onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat} onRenameChat={handleRenameChat}
        embedded={true}
      />
    </div>
  );

  return (
    <div className="scanline" style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      position: 'relative', zIndex: 1, background: 'transparent'
    }}>

      {/* -- DESKTOP sidebar -- */}
      {!isMobile && (
        <div style={{
          width: sidebarCollapsed ? '56px' : '280px',
          minWidth: sidebarCollapsed ? '56px' : '280px',
          height: '100vh', flexShrink: 0,
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative', zIndex: 10,
          background: 'rgba(2,4,14,0.92)',
          borderRight: '0.5px solid rgba(124,92,191,0.2)',
          overflow: 'hidden'
        }}>
          {!sidebarCollapsed
            ? <SidebarContent/>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c5cbf,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'white' }}>D</span>
                </div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--arc-bright)', boxShadow: '0 0 8px var(--arc-bright)', animation: 'pulse-ring 2s ease-in-out infinite' }}/>
              </div>
            )
          }
          {/* Collapse button */}
          <button onClick={() => setSidebarCollapsed(p => !p)} style={{
            position: 'absolute', bottom: '20px', left: sidebarCollapsed ? '14px' : '20px',
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(124,92,191,0.1)', border: '0.5px solid rgba(124,92,191,0.3)',
            cursor: 'pointer', color: 'var(--arc-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', transition: 'all 0.2s', zIndex: 5
          }}>
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>
      )}

      {/* -- MOBILE sidebar overlay -- */}
      {isMobile && mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setMobileSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
          }}/>
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: '280px', zIndex: 40,
            background: 'rgba(2,4,14,0.98)',
            borderRight: '0.5px solid rgba(124,92,191,0.3)',
            overflow: 'hidden',
            animation: 'signal-in 0.25s ease forwards'
          }}>
            <SidebarContent/>
          </div>
        </>
      )}

      {/* Glowing divider -- desktop only */}
      {!isMobile && (
        <div style={{
          width: '1px', flexShrink: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(124,92,191,0.6) 20%, rgba(56,189,248,0.4) 60%, transparent 100%)',
          boxShadow: '0 0 8px rgba(124,92,191,0.4)', zIndex: 5
        }}/>
      )}

      {/* -- RIGHT - chat -- */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, minHeight: 0, position: 'relative', zIndex: 1,
        background: 'transparent'
      }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            padding: '12px 16px', flexShrink: 0,
            background: 'rgba(3,6,16,0.9)',
            borderBottom: '0.5px solid rgba(124,92,191,0.15)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', zIndex: 5
          }}>
            <button onClick={() => setMobileSidebarOpen(true)} style={{
              background: 'rgba(124,92,191,0.1)',
              border: '0.5px solid rgba(124,92,191,0.3)',
              borderRadius: '8px', padding: '6px 10px',
              cursor: 'pointer', color: 'var(--arc-bright)',
              fontFamily: 'var(--font-ui)', fontSize: '11px',
              letterSpacing: '0.1em'
            }}>☰ TARS</button>

            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '14px',
              fontWeight: 600, color: 'var(--text-1)', letterSpacing: '0.06em'
            }}>DIALOGIX</span>

            <button onClick={() => {
              const e = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
              window.dispatchEvent(e);
            }} style={{
              background: 'rgba(124,92,191,0.1)',
              border: '0.5px solid rgba(124,92,191,0.3)',
              borderRadius: '8px', padding: '6px 10px',
              cursor: 'pointer', color: 'var(--arc-bright)',
              fontFamily: 'var(--font-ui)', fontSize: '10px',
              letterSpacing: '0.08em'
            }}>⌘K</button>
          </div>
        )}

        <ChatWindow
          chatId={activeChatId}
          onTitleUpdate={handleTitleUpdate}
          onThinkingChange={setIsThinking}
          onTransmittingChange={setIsTransmitting}
        />
      </div>

      <CommandPalette
        onNewChat={handleNewChat}
        onClearChat={handleClearChat}
        onSendPrompt={handleSendPrompt}
      />

      {showSwagger && <TARSSwagger onComplete={() => setShowSwagger(false)}/>}
    </div>
  );
}
