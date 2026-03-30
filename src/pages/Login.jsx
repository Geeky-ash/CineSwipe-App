import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) throw error;
        setMessage('Account created! Check your email to confirm, or sign in now if email confirmation is disabled.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      if (err.message && err.message.includes('Provider is not established')) {
        setError('Google Provider is not enabled in your Supabase Dashboard. Please configure it under Authentication -> Providers.');
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-surface-container-lowest overflow-hidden relative">
      {/* Cinematic background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container mb-4 neon-glow">
            <span className="material-symbols-outlined text-on-primary text-3xl filled">movie</span>
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface">CineSwipe</h1>
          <p className="text-on-surface-variant text-sm mt-2">Your cinematic discovery platform</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 border border-outline-variant/20">
          {/* Tab toggle */}
          <div className="flex rounded-full bg-surface-container p-1 mb-6">
            <button
              onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${mode === 'signin' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${mode === 'signup' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface font-medium text-sm hover:bg-surface-container-highest transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-outline-variant/20"></div>
            <span className="text-on-surface-variant text-xs">or</span>
            <div className="flex-1 h-px bg-outline-variant/20"></div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-surface-container-high rounded-xl py-3 px-4 text-on-surface placeholder-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-surface-container-high rounded-xl py-3 px-4 text-on-surface placeholder-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
            />

            {error && <p className="text-error text-xs text-center">{error}</p>}
            {message && <p className="text-tertiary text-xs text-center">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold neon-glow transition-transform active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Continue as guest */}
          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-on-surface-variant text-xs mt-4 hover:text-primary transition-colors"
          >
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
}
