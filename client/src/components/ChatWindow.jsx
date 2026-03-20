import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import MessageBubble from './MessageBubble';
import ThinkingStages from './ThinkingStages';
import ContextChips from './ContextChips';
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
    window.TARS?.onKeywordCheck?.(text);
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes('swagger') ||
      lowerText.includes('tars walk') ||
      lowerText.includes('tars dance')
    ) {
      setTimeout(() => window.dispatchEvent(new CustomEvent('tars:swagger')), 800);
    }

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
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,191,0.15) 0%, transparent 70%)',
        border: '0.5px solid rgba(124,92,191,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px', position: 'relative',
        animation: 'float 6s ease-in-out infinite'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,191,0.4) 0%, rgba(56,189,248,0.1) 60%, transparent)',
          boxShadow: '0 0 40px rgba(124,92,191,0.3)'
        }}/>
        <div style={{
          position: 'absolute', inset: '-20px',
          borderRadius: '50%', border: '0.5px solid rgba(124,92,191,0.25)',
          animation: 'spin-slow 8s linear infinite'
        }}/>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '18px',
        fontWeight: 600, color: 'var(--text-1)',
        letterSpacing: '0.08em', marginBottom: '8px'
      }}>
        AWAITING TRANSMISSION
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '11px',
        color: 'var(--text-3)', letterSpacing: '0.1em'
      }}>
        SELECT A SESSION OR START A NEW ONE
      </div>
      <div style={{
        marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px',
        fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-3)'
      }}>
        <kbd style={{
          padding: '3px 8px', borderRadius: '4px',
          border: '0.5px solid rgba(124,92,191,0.3)',
          background: 'rgba(124,92,191,0.08)',
          color: 'var(--arc-bright)', fontSize: '10px'
        }}>⌘K</kbd>
        <span>MISSION CONTROL</span>
      </div>
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
      background: 'transparent',
    }}>

      <div style={{
        padding: '12px 24px',
        borderBottom: '0.5px solid rgba(124,92,191,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        background: 'rgba(2,4,14,0.35)',
        backdropFilter: 'blur(8px)'
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
        className="chat-zone"
        ref={messagesRef}
        onScroll={handleMessagesScroll}
        style={{
          flex: '1 1 0',
          height: 0,
          background: 'transparent',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          backgroundImage: 'none',
        }}
      >
        <div style={{
          width: '100%',
          padding: '32px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          flex: 1
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '80px',
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              color: 'var(--text-3)',
              letterSpacing: '0.15em',
              lineHeight: '2.5'
            }}>
              ◦ CHANNEL OPEN ◦<br/>
              AWAITING INPUT
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
      </div>

      {/* Input bar */}
      <div style={{
        padding: '16px 8%',
        borderTop: '0.5px solid rgba(124,92,191,0.15)',
        background: 'rgba(2,4,14,0.7)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
        boxShadow: 'inset 0 1px 0 rgba(124,92,191,0.1)'
      }}>
        <ContextChips
          onChipClick={(prompt) => sendMessageWithText(prompt)}
          disabled={loading}
        />

        <div className="input-field" style={{
          display: 'flex', alignItems: 'flex-end', gap: '12px',
          borderRadius: '16px', padding: '12px 16px'
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Transmit your message..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', color: 'var(--text-1)', fontSize: '13px',
              resize: 'none', overflow: 'hidden',
              fontFamily: 'var(--font-mono)', lineHeight: '1.6',
              caretColor: 'var(--arc-bright)',
              letterSpacing: '0.02em'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: (!input.trim() || loading)
                ? 'rgba(124,92,191,0.15)'
                : 'linear-gradient(135deg, var(--arc), #6d28d9)',
              border: 'none', cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: (!input.trim() || loading)
                ? 'none'
                : '0 0 16px rgba(124,92,191,0.5)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px',
          marginTop: '8px', fontFamily: 'var(--font-ui)',
          fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.1em'
        }}>
          <span style={{ color: 'var(--green-ok)' }}>● CONNECTED</span>
          <span>GROQ · LLAMA-3.3-70B</span>
          <span>ENTER TO SEND · SHIFT+ENTER FOR NEWLINE</span>
        </div>
      </div>
    </div>
  );
}