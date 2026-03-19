import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ sessions, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, embedded }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

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

  const today = new Date().toDateString();
  const todaySessions  = sessions.filter(s => new Date(s.updatedAt).toDateString() === today);
  const olderSessions  = sessions.filter(s => new Date(s.updatedAt).toDateString() !== today);

  return (
    <div className="sidebar-zone" style={{
      height: '100%', flexShrink: 0,
      background: embedded ? 'transparent' : 'rgba(3, 7, 20, 0.98)',
      borderRight: embedded ? 'none' : '0.5px solid rgba(124,92,191,0.2)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', zIndex: 10,
      overflow: 'hidden'
    }}>

      {/* Logo — only show when not embedded */}
      {!embedded && (
      <div style={{ padding: '20px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--arc), #6d28d9)',
            boxShadow: '0 0 16px rgba(124,92,191,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' }}>D</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '0.08em' }}>DIALOGIX</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.1em' }}>SYNAPSE CORE v1.0</div>
          </div>
        </div>
      </div>
      )}

      {/* New chat button */}
      <div style={{ padding: '12px' }}>
        <button onClick={onNewChat} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 14px', borderRadius: '8px', cursor: 'pointer',
          background: 'rgba(124,92,191,0.08)',
          border: '0.5px solid rgba(124,92,191,0.25)',
          color: 'var(--text-2)', fontSize: '12px',
          fontFamily: 'var(--font-mono)', transition: 'all 0.2s', letterSpacing: '0.05em'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,92,191,0.15)'; e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(124,92,191,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,92,191,0.08)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          NEW TRANSMISSION
        </button>
      </div>

      {/* Sessions */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>

        {todaySessions.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--text-3)', padding: '10px 8px 6px', letterSpacing: '0.2em' }}>TODAY</div>
            {todaySessions.map(s => (
              <SessionItem key={s._id} session={s} isActive={s._id === activeChatId}
                isRenaming={renamingId === s._id} renameValue={renameValue}
                setRenameValue={setRenameValue} onSelect={() => onSelectChat(s._id)}
                onRename={() => startRename(s)} onRenameSubmit={() => submitRename(s._id)}
                onDelete={() => onDeleteChat(s._id)}
                isHovered={hoveredId === s._id}
                onHover={setHoveredId}
              />
            ))}
          </>
        )}

        {olderSessions.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--text-3)', padding: '10px 8px 6px', letterSpacing: '0.2em' }}>PREVIOUS</div>
            {olderSessions.map(s => (
              <SessionItem key={s._id} session={s} isActive={s._id === activeChatId}
                isRenaming={renamingId === s._id} renameValue={renameValue}
                setRenameValue={setRenameValue} onSelect={() => onSelectChat(s._id)}
                onRename={() => startRename(s)} onRenameSubmit={() => submitRename(s._id)}
                onDelete={() => onDeleteChat(s._id)}
                isHovered={hoveredId === s._id}
                onHover={setHoveredId}
              />
            ))}
          </>
        )}

        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            NO TRANSMISSIONS<br/>
            <span style={{ fontSize: '10px', opacity: 0.5 }}>Start a new session</span>
          </div>
        )}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px', borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          transition: 'all 0.2s', cursor: 'default'
        }}
          className="group"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#3b82f6,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 600, color: 'white',
            boxShadow: '0 0 10px rgba(168,85,247,0.4)'
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: '#e6eef8', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
            <div style={{ fontSize: '10px', color: '#22c55e', fontFamily: 'var(--font-mono)' }}>● ONLINE</div>
          </div>
          <button onClick={handleLogout} title="Disconnect" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-dim)', padding: '4px', borderRadius: '6px',
            transition: 'color 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionItem({ session, isActive, isRenaming, renameValue, setRenameValue, onSelect, onRename, onRenameSubmit, onDelete, onHover }) {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHover(session._id)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '9px 10px', borderRadius: '10px', cursor: 'pointer',
        marginBottom: '2px', transition: 'all 0.15s',
        background: isActive ? 'rgba(168,85,247,0.12)' : 'transparent',
        border: isActive ? '0.5px solid rgba(168,85,247,0.25)' : '0.5px solid transparent',
        boxShadow: isActive ? '0 0 10px rgba(168,85,247,0.1)' : 'none',
      }}
      onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Active indicator dot */}
      <div style={{
        width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
        background: isActive ? '#a855f7' : 'rgba(255,255,255,0.15)',
        boxShadow: isActive ? '0 0 6px #a855f7' : 'none',
        transition: 'all 0.2s'
      }}/>

      {isRenaming ? (
        <input autoFocus value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={onRenameSubmit}
          onKeyDown={e => e.key === 'Enter' && onRenameSubmit()}
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, background: 'rgba(168,85,247,0.1)',
            border: '0.5px solid rgba(168,85,247,0.5)',
            borderRadius: '6px', padding: '2px 8px',
            color: '#e6eef8', fontSize: '13px',
            fontFamily: 'var(--font-inter)', outline: 'none'
          }}
        />
      ) : (
        <span style={{
          flex: 1, fontSize: '13px', color: isActive ? '#e6eef8' : 'var(--text-muted)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontFamily: 'var(--font-inter)'
        }}>
          {session.title}
        </span>
      )}

      {!isRenaming && (
        <div style={{ display: 'flex', gap: '2px', opacity: 0, transition: 'opacity 0.15s' }}
          className="session-actions">
          {[
            { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', action: onRename, color: 'var(--text-dim)', hoverColor: '#e6eef8' },
            { icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: onDelete, color: 'var(--text-dim)', hoverColor: '#f87171' }
          ].map((btn, i) => (
            <button key={i}
              onClick={e => { e.stopPropagation(); btn.action(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: btn.color, padding: '2px', borderRadius: '4px', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = btn.hoverColor}
              onMouseLeave={e => e.currentTarget.style.color = btn.color}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.icon}/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}