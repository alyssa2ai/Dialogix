import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../hooks/useSound';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { unlockAudio } = useSound();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    unlockAudio();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)', boxShadow: '0 0 24px rgba(168,85,247,0.5)' }}>
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>D</span>
            </div>
            <span className="text-3xl font-semibold text-glow-purple" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '0.05em' }}>
              DIALOGIX
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}>
            Establish connection
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8" style={{ border: '0.5px solid rgba(168,85,247,0.2)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {['email','password'].map(field => (
              <div key={field}>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-ui)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  className="block mb-2">
                  {field}
                </label>
                <input
                  type={field}
                  value={form[field]}
                  onChange={e => setForm({...form, [field]: e.target.value})}
                  required
                  placeholder={field === 'email' ? 'you@cosmos.io' : '••••••••'}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '12px 16px',
                    color: 'var(--text-main)', fontSize: '14px',
                    fontFamily: 'var(--font-inter)', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(168,85,247,0.6)';
                    e.target.style.boxShadow = '0 0 0 1px rgba(168,85,247,0.2)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? 'rgba(168,85,247,0.3)' : 'linear-gradient(135deg,#3b82f6,#a855f7)',
              border: 'none', borderRadius: '12px', padding: '13px',
              color: 'white', fontSize: '13px', fontFamily: 'var(--font-display)',
              letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 20px rgba(168,85,247,0.4)',
              transition: 'all 0.2s'
            }}>
              {loading ? 'CONNECTING...' : 'CONNECT'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', marginTop: '24px' }}>
            No signal?{' '}
            <Link to="/signup" style={{ color: '#a855f7' }}>Initialize account</Link>
          </p>
        </div>

        {/* Status bar */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          SYNAPSE CORE v1.0 · SIGNAL SECURE · GROQ ENGINE
        </div>
      </div>
    </div>
  );
}