import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
}

export function useSecureAuth(): SecureAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (mounted) {
          setHasProfile(!!data);
        }
      } catch (error) {
        console.warn('Profile check failed:', error);
        if (mounted) setHasProfile(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkProfile(session.user.id);
        } else {
          setHasProfile(false);
        }

        setLoading(false);
      }
    );

    // Check initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await checkProfile(session.user.id);
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to get initial session:', err);
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session?.user,
    hasProfile
  };
}