import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', form);

      // Play boot sound while still in the login click gesture path.
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          await ctx.resume();

          const tone = (freq, start, dur, vol, type = 'sawtooth') => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            filt.type = 'lowpass';
            filt.frequency.value = 700;
            osc.connect(filt);
            filt.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
            gain.gain.setValueAtTime(0, ctx.currentTime + start);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur + 0.1);
          };

          tone(50, 0.0, 1.0, 0.04);
          tone(80, 0.3, 0.9, 0.035);
          tone(120, 0.7, 0.7, 0.03);
          tone(180, 1.1, 0.6, 0.03);
          tone(260, 1.5, 0.5, 0.025, 'sine');
          tone(380, 1.9, 0.4, 0.025, 'sine');
          tone(520, 2.2, 0.3, 0.02, 'sine');
          tone(720, 2.4, 0.25, 0.02, 'sine');
        }
      } catch (soundErr) {
        console.warn('Sound error:', soundErr);
      }

      login(res.data.user, res.data.token);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
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