import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Play boot sound RIGHT NOW inside the gesture
    try {
      const A = window.AudioContext || window.webkitAudioContext;
      const ctx = new A();
      await ctx.resume();
      ctx.onstatechange = () => {
        if (ctx.state === 'suspended') ctx.resume();
      };
      const tones = [
        [55, 0], [80, 0.25], [110, 0.5], [160, 0.75],
        [220, 1.0], [320, 1.25], [440, 1.5], [660, 1.75]
      ];
      tones.forEach(([freq, start]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime + start);
        g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + start + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.35);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + 0.4);
      });
      // Store context so audio keeps playing after navigation
      window.__BOOT_CTX__ = ctx;
    } catch (_) {}

    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      setTimeout(() => navigate('/chat'), 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative', zIndex: 1, background: 'transparent' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#7c5cbf,#2563eb)', boxShadow: '0 0 24px rgba(124,92,191,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'white' }}>D</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '0.06em' }}>DIALOGIX</span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.12em' }}>ESTABLISH CONNECTION</p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: '16px', padding: '32px', border: '0.5px solid rgba(124,92,191,0.25)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {['email', 'password'].map(field => (
              <div key={field}>
                <label style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.18em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  {field}
                </label>
                <input
                  type={field}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  required
                  placeholder={field === 'email' ? 'you@cosmos.io' : '••••••••'}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(124,92,191,0.2)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-1)', fontSize: '14px', fontFamily: 'var(--font-mono)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(124,92,191,0.7)';
                    e.target.style.boxShadow = '0 0 0 1px rgba(124,92,191,0.2)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(124,92,191,0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? 'rgba(124,92,191,0.2)' : 'linear-gradient(135deg,#7c5cbf,#2563eb)', border: 'none', borderRadius: '10px', padding: '13px', color: 'white', fontSize: '11px', fontFamily: 'var(--font-ui)', letterSpacing: '0.15em', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 0 20px rgba(124,92,191,0.4)', transition: 'all 0.2s', marginTop: '4px' }}
            >
              {loading ? 'CONNECTING...' : 'CONNECT'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '12px', marginTop: '24px', fontFamily: 'var(--font-mono)' }}>
            No signal?{' '}
            <Link to="/signup" style={{ color: 'var(--arc-bright)' }}>Initialize account</Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.15em' }}>
          SYNAPSE CORE v1.0 · SIGNAL SECURE · GROQ ENGINE
        </div>
      </div>
    </div>
  );
}