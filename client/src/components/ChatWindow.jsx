import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const socket = io('http://localhost:5000');

export default function ChatWindow({ chatId, onTitleUpdate }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Load messages when chat changes
  useEffect(() => {
    if (!chatId) return;
    const loadChat = async () => {
      const res = await api.get(`/chat/sessions/${chatId}`);
      setMessages(res.data.messages);
    };
    loadChat();
    socket.emit('join_chat', chatId);
  }, [chatId]);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    setLoading(true);
    setIsTyping(true);

    // Optimistically add user message to UI immediately
    const tempUserMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      socket.emit('typing', chatId);
      const res = await api.post(`/chat/sessions/${chatId}/message`, { message: text });
      // Replace with real messages from server
      setMessages(prev => [...prev.slice(0, -1), res.data.userMessage, res.data.botMessage]);
      if (onTitleUpdate) onTitleUpdate(chatId, res.data.chatTitle);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);

    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-center p-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4">
          <span className="text-white font-bold text-xl">D</span>
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Welcome to Dialogix</h2>
        <p className="text-gray-500 text-sm">Start a new chat or select one from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 min-w-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-sm mt-16">
            Send a message to start the conversation
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} username={user?.username} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-end gap-3 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message Dialogix..."
            className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-gray-600 leading-relaxed"
            style={{ scrollbarWidth: 'none', overflow: 'hidden' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-center text-gray-700 text-xs mt-2">Powered by Groq · llama-3.3-70b</p>
      </div>
    </div>
  );
}