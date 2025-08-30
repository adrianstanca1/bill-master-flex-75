import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureStorage } from '@/lib/SecureStorage';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface SecureAuthResult<T> {
  data: T | null;
  error: AuthError | null;
}

export function useSecureAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!active) return;
        
        if (!error && session) {
          setSession(session);
          setUser(session.user);
          
          // Store session info securely
          await secureStorage.setItem('session_start', new Date().toISOString());
          
          // Log successful session validation
          try {
            await supabase.from('security_audit_log').insert({
              action: 'SESSION_VALIDATED',
              resource_type: 'auth',
              details: {
                user_id: session.user.id,
                session_start: new Date().toISOString(),
                user_agent: navigator.userAgent
              }
            });
          } catch (logError) {
            console.warn('Security logging failed (non-blocking):', logError);
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
        // Log security event for session failure
        try {
          await supabase.from('security_audit_log').insert({
            action: 'SESSION_VALIDATION_FAILED',
            resource_type: 'auth',
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.warn('Security logging failed (non-blocking):', logError);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      // Enhanced security logging for auth state changes
      try {
        if (event === 'SIGNED_IN' && session) {
          await secureStorage.setItem('session_start', new Date().toISOString());
          await supabase.from('security_audit_log').insert({
            action: 'USER_SIGNED_IN',
            resource_type: 'auth',
            details: {
              user_id: session.user.id,
              login_time: new Date().toISOString(),
              user_agent: navigator.userAgent,
              ip_address: 'client-side' // Will be enhanced server-side
            }
          });
        } else if (event === 'SIGNED_OUT') {
          await secureStorage.clear();
          await supabase.from('security_audit_log').insert({
            action: 'USER_SIGNED_OUT',
            resource_type: 'auth',
            details: {
              logout_time: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          });
        }
      } catch (logError) {
        console.warn('Security logging failed (non-blocking):', logError);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const secureSignIn = async (email: string, password: string): Promise<SecureAuthResult<User>> => {
    try {
      // Log sign-in attempt for security monitoring
      try {
        await supabase.from('security_audit_log').insert({
          action: 'SIGNIN_ATTEMPT',
          resource_type: 'auth',
          details: {
            email: email,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
      } catch (logError) {
        console.warn('Security logging failed (non-blocking):', logError);
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error && data.session) {
        setSession(data.session);
        setUser(data.user);
        
        // Store secure session data
        await secureStorage.setItem('session_start', new Date().toISOString());
        await secureStorage.setItem('user_email', email);
        
        // Log successful sign-in
        try {
          await supabase.from('security_audit_log').insert({
            action: 'SIGNIN_SUCCESS',
            resource_type: 'auth',
            details: {
              user_id: data.user.id,
              email: email,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.warn('Security logging failed (non-blocking):', logError);
        }
      } else if (error) {
        // Log failed sign-in for security monitoring
        try {
          await supabase.from('security_audit_log').insert({
            action: 'SIGNIN_FAILED',
            resource_type: 'auth',
            details: {
              email: email,
              error: error.message,
              timestamp: new Date().toISOString(),
              severity: 'warning'
            }
          });
        } catch (logError) {
          console.warn('Security logging failed (non-blocking):', logError);
        }
      }
      
      return { data: data?.user ?? null, error };
    } catch (err) {
      const error = err as AuthError;
      return { data: null, error };
    }
  };

  const secureSignUp = async (
    email: string,
    password: string,
    userData?: Record<string, any>
  ): Promise<SecureAuthResult<User>> => {
    try {
      // Log sign-up attempt
      try {
        await supabase.from('security_audit_log').insert({
          action: 'SIGNUP_ATTEMPT',
          resource_type: 'auth',
          details: {
            email: email,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
      } catch (logError) {
        console.warn('Security logging failed (non-blocking):', logError);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          ...(userData ? { data: userData } : {})
        },
      });
      
      if (!error) {
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          await secureStorage.setItem('session_start', new Date().toISOString());
        }
        
        // Log successful sign-up
        try {
          await supabase.from('security_audit_log').insert({
            action: 'SIGNUP_SUCCESS',
            resource_type: 'auth',
            details: {
              user_id: data.user?.id,
              email: email,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.warn('Security logging failed (non-blocking):', logError);
        }
      } else {
        // Log failed sign-up
        try {
          await supabase.from('security_audit_log').insert({
            action: 'SIGNUP_FAILED',
            resource_type: 'auth',
            details: {
              email: email,
              error: error.message,
              timestamp: new Date().toISOString(),
              severity: 'warning'
            }
          });
        } catch (logError) {
          console.warn('Security logging failed (non-blocking):', logError);
        }
      }
      
      return { data: data?.user ?? null, error };
    } catch (err) {
      const error = err as AuthError;
      return { data: null, error };
    }
  };

  const secureSignOut = async (): Promise<SecureAuthResult<null>> => {
    try {
      // Log sign-out attempt with current user info
      const currentUser = user;
      if (currentUser) {
        try {
          await supabase.from('security_audit_log').insert({
            action: 'SIGNOUT_INITIATED',
            resource_type: 'auth',
            details: {
              user_id: currentUser.id,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.warn('Security logging failed (non-blocking):', logError);
        }
      }

      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setSession(null);
        setUser(null);
        await secureStorage.clear();
      }
      
      return { data: null, error };
    } catch (err) {
      const error = err as AuthError;
      return { data: null, error };
    }
  };

  const resetPassword = async (email: string): Promise<SecureAuthResult<null>> => {
    try {
      // Log password reset attempt
      try {
        await supabase.from('security_audit_log').insert({
          action: 'PASSWORD_RESET_REQUESTED',
          resource_type: 'auth',
          details: {
            email: email,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
      } catch (logError) {
        console.warn('Security logging failed (non-blocking):', logError);
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { data: null, error };
    } catch (err) {
      const error = err as AuthError;
      return { data: null, error };
    }
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    signIn: secureSignIn,
    signUp: secureSignUp,
    signOut: secureSignOut,
    resetPassword,
  };
}