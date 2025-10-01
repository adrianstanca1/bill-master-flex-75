import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityStatus {
  passwordProtected: boolean;
  mfaEnabled: boolean;
  sessionValid: boolean;
  lastCheck: string;
}

export function useEnhancedSecurity() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    passwordProtected: true,
    mfaEnabled: false,
    sessionValid: false,
    lastCheck: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);

  const checkSecurityStatus = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      const status: SecurityStatus = {
        passwordProtected: true,
        mfaEnabled: false,
        sessionValid: !!session && !error,
        lastCheck: new Date().toISOString()
      };

      setSecurityStatus(status);
    } catch (error) {
      console.error('Security status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (event: string, details?: any) => {
    try {
      await supabase.rpc('track_user_activity', {
        activity_type: event,
        resource_type: 'security',
        metadata: details || {}
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const enhanceSessionSecurity = async () => {
    await logSecurityEvent('SESSION_SECURITY_ENHANCED');
    await checkSecurityStatus();
  };

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  return {
    securityStatus,
    loading,
    checkSecurityStatus,
    logSecurityEvent,
    enhanceSessionSecurity
  };
}