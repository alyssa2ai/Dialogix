import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Load all sessions on mount
  useEffect(() => {
    const load = async () => {
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
      if (res.data.length > 0) setActiveChatId(res.data[0]._id);
    };
    load();
  }, []);

  const handleNewChat = async () => {
    const res = await api.post('/chat/sessions');
    setSessions(prev => [res.data, ...prev]);
    setActiveChatId(res.data._id);
  };

  const handleDeleteChat = async (id) => {
    await api.delete(`/chat/sessions/${id}`);
    const updated = sessions.filter(s => s._id !== id);
    setSessions(updated);
    setActiveChatId(updated.length > 0 ? updated[0]._id : null);
  };

  const handleRenameChat = (id, newTitle) => {
    setSessions(prev => prev.map(s => s._id === id ? { ...s, title: newTitle } : s));
  };

  const handleTitleUpdate = (id, newTitle) => {
    setSessions(prev => prev.map(s => s._id === id ? { ...s, title: newTitle } : s));
  };

  return (
    <div className="h-screen flex bg-gray-950 overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />
      <ChatWindow
        chatId={activeChatId}
        onTitleUpdate={handleTitleUpdate}
      />
    </div>
  );
}