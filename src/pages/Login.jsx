import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { fetchTrendingMovies } from '../services/tmdb';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    // Fetch a dynamic trending poster for the background
    fetchTrendingMovies().then(movies => {
      if (movies && movies.length > 0) {
        // Pick a random trending movie
        const randomMovie = movies[Math.floor(Math.random() * Math.min(5, movies.length))];
        setBgImage(`${BACKDROP_BASE}${randomMovie.backdrop_path || randomMovie.poster_path}`);
      }
    }).catch(console.error);
  }, []);

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
        setMessage('Account created! Check your email to confirm.');
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
      if (err.message?.includes('Provider is not established')) {
        setError('Google Provider is not enabled in your Supabase Dashboard.');
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    }
  };

  return (
    <div 
      className="min-h-[100dvh] w-full flex items-center justify-center overflow-hidden relative"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Moderate Blur & Darken Overlay for Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.65)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }} 
      />

      <div className="relative w-full max-w-sm mx-auto px-6 pt-[84px] z-10 flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl neon-gradient mb-4 neon-glow shadow-[0_0_30px_rgba(255,138,169,0.3)]">
            <span className="material-symbols-outlined text-on-primary-fixed text-3xl filled">movie</span>
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white shadow-sm">
            Welcome Back
          </h1>
          <p className="text-on-surface-variant text-sm mt-2 font-body tracking-wide drop-shadow-md">
            Your cinematic discovery platform
          </p>
        </div>

        {/* Auth Card */}
        <div 
          className="rounded-[24px] p-8 w-full shadow-2xl"
          style={{
            background: 'rgba(73, 69, 79, 0.2)', // surface_variant 20%
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(202, 196, 208, 0.15)', // outline_variant ghost border
          }}
        >
          {/* Tab toggle */}
          <div className="flex rounded-full bg-surface-container-highest/50 p-1 mb-8 ghost-border relative">
            <button
              onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-label font-medium transition-all ${
                mode === 'signin' ? 'neon-gradient text-on-primary-fixed' : 'text-on-surface-variant'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-label font-medium transition-all ${
                mode === 'signup' ? 'neon-gradient text-on-primary-fixed' : 'text-on-surface-variant'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-surface-container-high text-on-surface font-body font-medium text-sm hover:bg-surface-container-highest transition-colors mb-4 ghost-border"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-outline-variant/15" />
            <span className="text-on-surface-variant text-xs font-label">or</span>
            <div className="flex-1 h-px bg-outline-variant/15" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="stitch-input !rounded-xl !pl-4 !py-3 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="stitch-input !rounded-xl !pl-4 !py-3 text-sm"
            />

            {error && <p className="text-error text-xs text-center font-body">{error}</p>}
            {message && <p className="text-tertiary text-xs text-center font-body">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full neon-btn text-sm disabled:opacity-60 font-bold uppercase tracking-widest mt-2"
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-on-surface-variant text-xs mt-4 hover:text-primary transition-colors font-body"
          >
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
}
