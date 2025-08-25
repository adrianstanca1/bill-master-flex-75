import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthError, OAuthResponse } from '@supabase/supabase-js';

export interface AuthResult<T> {
  data: T | null;
  error: AuthError | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!active) return;
        if (!error) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult<User>> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setSession(data.session);
      setUser(data.user);
    }
    return { data: data?.user ?? null, error };
  };

  const signUp = async (
    email: string,
    password: string,
    userData?: Record<string, any>
  ): Promise<AuthResult<User>> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        ...(userData ? { data: userData } : {})
      },
    });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return { data: data?.user ?? null, error };
  };

  const signOut = async (): Promise<AuthResult<null>> => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setUser(null);
    }
    return { data: null, error };
  };

  const resetPassword = async (email: string): Promise<AuthResult<null>> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { data: null, error };
  };

  const signInWithOAuth = async (
    provider: 'google' | 'github' | 'apple',
    redirectTo: string = window.location.origin
  ): Promise<AuthResult<any>> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithOAuth,
  };
}

