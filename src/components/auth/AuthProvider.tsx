/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthResult } from '@/hooks/useAuth';
import { User, Session, AuthError, OAuthResponse } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult<User>>;
  signUp: (
    email: string,
    password: string,
    userData?: Record<string, any>,
  ) => Promise<AuthResult<User>>;
  signOut: () => Promise<AuthResult<null>>;
  resetPassword: (email: string) => Promise<AuthResult<null>>;
  signInWithOAuth: (
    provider: 'google' | 'github' | 'apple',
    redirectTo?: string,
  ) => Promise<AuthResult<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
