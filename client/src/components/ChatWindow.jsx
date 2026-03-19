import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import MessageBubble from './MessageBubble';
import ThinkingStages from './ThinkingStages';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../hooks/useSound';
import { usePersona } from '../context/PersonaContext';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: false,
});

export default function ChatWindow({ chatId, onTitleUpdate, onThinkingChange, onTransmittingChange }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const { user }   = useAuth();
  const { playSend, playReceive, playError, unlockAudio } = useSound();
  const { config } = usePersona();

  useEffect(() => {
    if (!chatId) return;
    setAutoScroll(true);
    const load = async () => {
      try {
        const res = await api.get(`/chat/sessions/${chatId}`);
        setMessages(res.data.messages);
      } catch (err) {
        console.warn('[ChatWindow] Failed to load messages. Backend may be offline.', err?.message || err);
        setMessages([]);
      }
    };
    load();

    if (!socket.connected) {
      socket.connect();
    }

    if (socket.connected) {
      socket.emit('join_chat', chatId);
    } else {
      const onConnect = () => socket.emit('join_chat', chatId);
      socket.once('connect', onConnect);
      return () => socket.off('connect', onConnect);
    }
  }, [chatId]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    if (!autoScroll) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, autoScroll]);

  const handleMessagesScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 120;
    setAutoScroll(nearBottom);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'; }
    if (e.target.value.length > 0) window.TARS?.onTypingStart?.();
    else window.TARS?.onTypingEnd?.();
  };

  const sendMessageWithText = useCallback(async (text) => {
    if (!chatId || !text.trim() || loading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);
    setIsTyping(true);
    setAutoScroll(true);
    onThinkingChange?.(true);
    onTransmittingChange?.(false);
    unlockAudio();
    playSend();

    setMessages(prev => [...prev, { sender: 'user', text, timestamp: new Date() }]);

    try {
      socket.emit('typing', chatId);
      const res = await api.post(`/chat/sessions/${chatId}/message`, {
        message: text,
        systemPrompt: config.systemPrompt,
      });

      setIsTyping(false);
      await new Promise((r) => setTimeout(r, 24));

      setMessages(prev => [...prev.slice(0,-1), res.data.userMessage, res.data.botMessage]);
      window.TARS?.onMessageReceived?.(res.data.botMessage?.text?.length || 0);
      window.TARS?.onTypingEnd?.();
      if (onTitleUpdate) onTitleUpdate(chatId, res.data.chatTitle);
      onThinkingChange?.(false);
      onTransmittingChange?.(true);
      playReceive();
      setTimeout(() => onTransmittingChange?.(false), 1500);
    } catch (err) {
      console.error(err);
      onThinkingChange?.(false);
      window.TARS?.onError?.();
      window.TARS?.onTypingEnd?.();
      playError();
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  }, [
    chatId,
    loading,
    config.systemPrompt,
    onThinkingChange,
    onTitleUpdate,
    onTransmittingChange,
    unlockAudio,
    playSend,
    playReceive,
    playError,
  ]);

  useEffect(() => {
    window.__DIALOGIX_SEND_PROMPT__ = (text) => {
      const next = String(text || '');
      setInput(next);

      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 128) + 'px';
      }

      setTimeout(() => {
        if (next.trim()) {
          sendMessageWithText(next);
        }
      }, 300);
    };

    return () => {
      delete window.__DIALOGIX_SEND_PROMPT__;
    };
  }, [chatId, sendMessageWithText]);

  useEffect(() => {
    window.__DIALOGIX_MESSAGES__ = messages;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) {
      if (!loading) window.TARS?.onEmptySubmit?.();
      return;
    }

    await sendMessageWithText(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!chatId) return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', zIndex: 1
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '20px', marginBottom: '20px',
        background: 'linear-gradient(135deg,#3b82f6,#a855f7)',
        boxShadow: '0 0 40px rgba(168,85,247,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'float 4s ease-in-out infinite'
      }}>
        <span style={{ fontFamily: 'var(--font-orbitron)', fontWeight: 700, fontSize: '24px', color: 'white' }}>D</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '18px', color: '#e6eef8', marginBottom: '8px', letterSpacing: '0.05em' }}>
        AWAITING TRANSMISSION
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-inter)' }}>
        Start a new chat or select one from the sidebar
      </p>
    </div>
  );

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      minHeight: 0,
      position: 'relative',
      zIndex: 1,
    }}>

      <div style={{
        padding: '12px 20px',
        borderBottom: '0.5px solid rgba(168,85,247,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#22c55e', boxShadow: '0 0 6px #22c55e'
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--text-muted)', letterSpacing: '0.08em'
          }}>
            CHANNEL ACTIVE
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-dim)', letterSpacing: '0.06em'
        }}>
          END-TO-END ENCRYPTED · GROQ ENGINE
        </span>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        onScroll={handleMessagesScroll}
        style={{
          flex: '1 1 0',
          height: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: 0,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '60px', letterSpacing: '0.08em' }}>
            CHANNEL OPEN · AWAITING INPUT
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            username={user?.username}
            isLatest={i === messages.length - 1}
          />
        ))}
        {isTyping && <ThinkingStages />}
      </div>

      {/* Input bar */}
      <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(168,85,247,0.1)' }}>
        <div className="input-space" style={{
          display: 'flex', alignItems: 'flex-end', gap: '12px',
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(168,85,247,0.2)',
          borderRadius: '16px', padding: '12px 16px',
          transition: 'all 0.2s'
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Transmit your message..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e6eef8', fontSize: '14px', resize: 'none', overflow: 'hidden',
              fontFamily: 'var(--font-inter)', lineHeight: '1.5',
              caretColor: '#a855f7'
            }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: (!input.trim() || loading) ? 'rgba(168,85,247,0.2)' : 'linear-gradient(135deg,#3b82f6,#a855f7)',
            border: 'none', cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: (!input.trim() || loading) ? 'none' : '0 0 16px rgba(168,85,247,0.5)',
            transition: 'all 0.2s'
          }}>
            <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px',
          marginTop: '8px', fontSize: '10px',
          color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em'
        }}>
          <span style={{ color: '#22c55e' }}>● CONNECTED</span>
          <span>GROQ · LLAMA-3.3-70B</span>
          <span>ENTER TO SEND · SHIFT+ENTER FOR NEWLINE</span>
        </div>
      </div>
    </div>
  );
}