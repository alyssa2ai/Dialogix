import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ sessions, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  const startRename = (session) => {
    setRenamingId(session._id);
    setRenameValue(session.title);
  };

  const submitRename = async (id) => {
    if (!renameValue.trim()) return;
    await api.patch(`/chat/sessions/${id}/rename`, { title: renameValue });
    onRenameChat(id, renameValue);
    setRenamingId(null);
  };

  // Group sessions by date
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => new Date(s.updatedAt).toDateString() === today);
  const olderSessions = sessions.filter(s => new Date(s.updatedAt).toDateString() !== today);

  return (
    <div className="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          <span className="text-white font-semibold">Dialogix</span>
        </div>
      </div>

      {/* New chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">

        {todaySessions.length > 0 && (
          <>
            <p className="text-xs text-gray-600 px-2 py-2 font-medium uppercase tracking-wider">Today</p>
            {todaySessions.map(s => (
              <SessionItem
                key={s._id}
                session={s}
                isActive={s._id === activeChatId}
                isRenaming={renamingId === s._id}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                onSelect={() => onSelectChat(s._id)}
                onRename={() => startRename(s)}
                onRenameSubmit={() => submitRename(s._id)}
                onDelete={() => onDeleteChat(s._id)}
              />
            ))}
          </>
        )}

        {olderSessions.length > 0 && (
          <>
            <p className="text-xs text-gray-600 px-2 py-2 font-medium uppercase tracking-wider">Previous</p>
            {olderSessions.map(s => (
              <SessionItem
                key={s._id}
                session={s}
                isActive={s._id === activeChatId}
                isRenaming={renamingId === s._id}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                onSelect={() => onSelectChat(s._id)}
                onRename={() => startRename(s)}
                onRenameSubmit={() => submitRename(s._id)}
                onDelete={() => onDeleteChat(s._id)}
              />
            ))}
          </>
        )}

        {sessions.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-8 px-4">No chats yet. Start a new one!</p>
        )}
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-800 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-300 text-xs font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-300 text-sm font-medium truncate">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Extracted session item to keep things clean
function SessionItem({ session, isActive, isRenaming, renameValue, setRenameValue, onSelect, onRename, onRenameSubmit, onDelete }) {
  return (
    <div
      className={`group flex items-center gap-1 px-2 py-2 rounded-xl cursor-pointer transition-colors
        ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}
      onClick={onSelect}
    >
      {isRenaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={onRenameSubmit}
          onKeyDown={e => e.key === 'Enter' && onRenameSubmit()}
          onClick={e => e.stopPropagation()}
          className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-2 py-0.5 outline-none border border-indigo-500"
        />
      ) : (
        <span className="flex-1 text-sm text-gray-300 truncate">{session.title}</span>
      )}

      {/* Action buttons — appear on hover */}
      {!isRenaming && (
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onRename(); }}
            className="text-gray-500 hover:text-gray-300 p-0.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-gray-500 hover:text-red-400 p-0.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}