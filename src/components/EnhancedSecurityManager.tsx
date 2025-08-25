import React, { useEffect, useCallback } from 'react';
import { useEnhancedRoleAccess } from '@/hooks/useEnhancedRoleAccess';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useSecurityEnhancements } from '@/hooks/useSecurityEnhancements';
import { useSecurityBruteForce } from '@/hooks/useSecurityBruteForce';
import { useToast } from '@/hooks/use-toast';
import { secureStorage } from '@/lib/SecureStorage';
import { SecurityAlert } from './SecurityAlert';
import { SessionSecurityManager } from './SessionSecurityManager';
import { EnhancedSessionManager } from './EnhancedSessionManager';
import { EnhancedInputValidation } from './EnhancedInputValidation';
import { commonValidationRules } from '@/lib/validation';

interface EnhancedSecurityManagerProps {
  children: React.ReactNode;
}

export function EnhancedSecurityManager({ children }: EnhancedSecurityManagerProps) {
  const { user, isAuthenticated } = useSecureAuth();
  const { userRole, canAccessFinancials, loading: roleLoading } = useEnhancedRoleAccess();
  const { securityStatus } = useSecurityEnhancements();
  const { isBlocked, checkBruteForce } = useSecurityBruteForce();
  const { toast } = useToast();

  // Migrate legacy localStorage data to secure storage
  const migrateLegacyStorage = useCallback(async () => {
    try {
      const legacyKeys = [
        'user_preferences',
        'dashboard_settings',
        'form_drafts',
        'ui_state'
      ];

      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          try {
            const parsedData = JSON.parse(legacyData);
            await secureStorage.setItem(key, parsedData, { 
              encrypt: true, 
              serverSide: true 
            });
            localStorage.removeItem(key);
          } catch (parseError) {
            console.warn(`Failed to migrate ${key}:`, parseError);
          }
        }
      }
    } catch (error) {
      console.error('Storage migration failed:', error);
    }
  }, []);

  // Log security events
  const logSecurityEvent = useCallback(
    async (eventType: string, details: any) => {
      try {
        await secureStorage.setItem(`security_event_${Date.now()}`, {
          event_type: eventType,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
          details
        }, { encrypt: true, serverSide: true });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    },
    [user]
  );

  // Enhanced security validation on component mount  
  useEffect(() => {
    const performSecurityChecks = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // Check for brute force attempts
        await checkBruteForce(user.id);
        
        if (isBlocked) {
          toast({
            title: "Security Alert",
            description: "Account temporarily blocked due to suspicious activity",
            variant: "destructive",
          });
          return;
        }

        // Migrate legacy localStorage data to secure storage
        await migrateLegacyStorage();

        // Validate financial access permissions
        if (canAccessFinancials && !roleLoading) {
          await logSecurityEvent('FINANCIAL_ACCESS_GRANTED', {
            user_role: userRole,
            session_valid: securityStatus.sessionValid
          });
        }

      } catch (error) {
        console.error('Security check failed:', error);
        toast({
          title: "Security Warning",
          description: "Unable to complete security validation",
          variant: "destructive",
        });
      }
    };

    performSecurityChecks();
  }, [
    isAuthenticated,
    user,
    canAccessFinancials,
    userRole,
    roleLoading,
    checkBruteForce,
    logSecurityEvent,
    securityStatus.sessionValid,
    toast
  ]);

  // Handle validation errors
  const handleValidationError = (field: string, error: string) => {
    toast({
      title: "Input Validation Failed",
      description: `${field}: ${error}`,
      variant: "destructive",
    });
  };

  if (isBlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 border border-destructive rounded-lg bg-destructive/10">
          <h2 className="text-2xl font-bold text-destructive mb-4">Account Temporarily Blocked</h2>
          <p className="text-muted-foreground">
            Your account has been temporarily blocked due to suspicious activity. 
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SecurityAlert />
      <EnhancedSessionManager 
        enableLocationChecks={true}
        enableEnhancedRateLimit={true}
        sessionTimeoutMinutes={480}
      />
      <SessionSecurityManager>
        <div />
      </SessionSecurityManager>
      <EnhancedInputValidation 
        rules={commonValidationRules}
        onValidationError={handleValidationError}
      >
        {children}
      </EnhancedInputValidation>
    </>
  );
}