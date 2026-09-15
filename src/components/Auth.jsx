import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { GoogleIcon } from './Icons';

export default function Auth() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Supabase redirects back here with ?error=...&error_description=... if the OAuth flow itself failed.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search || window.location.hash.replace('#', '?'));
    const desc = params.get('error_description');
    if (desc) setError(decodeURIComponent(desc.replace(/\+/g, ' ')));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setInfo('Account created. Check your email to confirm, then sign in.');
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success the browser navigates away to Google, then back — no further action needed here.
  }

  return (
    <div className="centered-screen">
      <div className="auth-card">
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Ledger</div>
        <div style={{ fontSize: 15, color: 'var(--label-2)', marginBottom: 20 }}>
          {mode === 'signin' ? 'Sign in to your tracker' : 'Create your account'}
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogle}
          disabled={googleLoading}
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="divider">
          <span />
          <em>or</em>
          <span />
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="text-field"
            style={{ marginTop: 0 }}
            type="email"
            required
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="text-field"
            type="password"
            required
            minLength={6}
            placeholder="Password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="error-text">{error}</div>}
          {info && <div style={{ color: 'var(--green)', fontSize: 13, marginTop: 10 }}>{info}</div>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <button
          className="link-btn"
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError('');
            setInfo('');
          }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
