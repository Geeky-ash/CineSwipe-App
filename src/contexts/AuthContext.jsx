import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }

    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN') {
        navigate('/profile');
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = () => {
    if (!supabase) return Promise.reject(new Error('Supabase not configured'));
    
    // Dynamically use the correct Vercel URL in production, or localhost for local dev
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const siteUrl = isLocalhost ? window.location.origin : 'https://cine-swipe-app.vercel.app';

    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: siteUrl }
    });
  };

  const signInWithEmail = (email, password) => {
    if (!supabase) return Promise.reject(new Error('Supabase not configured'));
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithEmail = (email, password) => {
    if (!supabase) return Promise.reject(new Error('Supabase not configured'));
    return supabase.auth.signUp({ email, password });
  };

  const signOut = () => {
    if (!supabase) return Promise.resolve();
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
