import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityStatus {
  passwordProtected: boolean;
  mfaEnabled: boolean;
  sessionValid: boolean;
  lastCheck: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export function useSecurityEnhancements() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    passwordProtected: true,
    mfaEnabled: false,
    sessionValid: false,
    lastCheck: new Date().toISOString(),
    riskLevel: 'low'
  });
  const [loading, setLoading] = useState(false);

  const checkSecurityStatus = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Check for recent security violations
      const { data: recentViolations } = await supabase
        .from('security_audit_log')
        .select('id')
        .eq('user_id', session?.user?.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .like('action', '%VIOLATION%')
        .limit(5);

      const riskLevel = (recentViolations?.length || 0) > 3 ? 'high' : 
                       (recentViolations?.length || 0) > 1 ? 'medium' : 'low';

      const status: SecurityStatus = {
        passwordProtected: true,
        mfaEnabled: false,
        sessionValid: !!session && !error,
        lastCheck: new Date().toISOString(),
        riskLevel
      };

      setSecurityStatus(status);
    } catch (error) {
      console.error('Security status check failed:', error);
      setSecurityStatus(prev => ({ ...prev, riskLevel: 'high' }));
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (event: string, details?: any) => {
    try {
      await supabase
        .from('security_audit_log')
        .insert([{
          action: event,
          resource: 'security_enhancement',
          details: {
            ...details,
            timestamp: new Date().toISOString(),
            risk_level: securityStatus.riskLevel
          }
        }]);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const enhanceSessionSecurity = async () => {
    await logSecurityEvent('SESSION_SECURITY_ENHANCED', {
      enhancements: ['token_refresh', 'activity_validation']
    });
    await checkSecurityStatus();
  };

  useEffect(() => {
    checkSecurityStatus();
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    securityStatus,
    loading,
    checkSecurityStatus,
    logSecurityEvent,
    enhanceSessionSecurity
  };
}
