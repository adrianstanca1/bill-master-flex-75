import React, { createContext, useContext, ReactNode } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useSecureRoleBasedAccess } from '@/hooks/useSecureRoleBasedAccess';
import { SecurityEnhancedDataValidator } from './SecurityEnhancedDataValidator';
import { SessionSecurityManager } from './SessionSecurityManager';
import { SecurityAlert } from './SecurityAlert';
import type { User, Session } from '@supabase/supabase-js';

interface SecurityEnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: 'admin' | 'manager' | 'member' | null;
  companyId: string | null;
  isAdmin: boolean;
  isManager: boolean;
  canAccessFinancials: boolean;
  canViewSecurity: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const SecurityEnhancedAuthContext = createContext<SecurityEnhancedAuthContextType | undefined>(undefined);

interface SecurityEnhancedAuthProviderProps {
  children: ReactNode;
}

export function SecurityEnhancedAuthProvider({ children }: SecurityEnhancedAuthProviderProps) {
  const auth = useSecureAuth();
  const roleAccess = useSecureRoleBasedAccess();

  const contextValue: SecurityEnhancedAuthContextType = {
    ...auth,
    ...roleAccess,
  };

  return (
    <SecurityEnhancedAuthContext.Provider value={contextValue}>
      <SecurityEnhancedDataValidator>
        <SessionSecurityManager>
          {children}
        </SessionSecurityManager>
      </SecurityEnhancedDataValidator>
    </SecurityEnhancedAuthContext.Provider>
  );
}

export function useSecurityEnhancedAuth() {
  const context = useContext(SecurityEnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useSecurityEnhancedAuth must be used within a SecurityEnhancedAuthProvider');
  }
  return context;
}