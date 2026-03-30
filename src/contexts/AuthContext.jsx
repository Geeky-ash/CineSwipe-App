import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () => {
    if (!supabase) return Promise.reject(new Error('Supabase not configured'));
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
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
