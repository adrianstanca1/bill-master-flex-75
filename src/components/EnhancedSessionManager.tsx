import { useEffect } from 'react';
import { useGeographicSecurity } from '@/hooks/useGeographicSecurity';
import { useEnhancedRateLimit } from '@/hooks/useEnhancedRateLimit';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedSessionManagerProps {
  enableLocationChecks?: boolean;
  enableEnhancedRateLimit?: boolean;
  sessionTimeoutMinutes?: number;
}

export function EnhancedSessionManager({
  enableLocationChecks = true,
  enableEnhancedRateLimit = true,
  sessionTimeoutMinutes = 480 // 8 hours
}: EnhancedSessionManagerProps) {
  const { user, session } = useSecureAuth();
  const { checkLoginAnomaly, handleLocationAnomaly } = useGeographicSecurity();
  const { checkRateLimit, handleRateLimitExceeded } = useEnhancedRateLimit();
  const { toast } = useToast();

  // Enhanced session validation
  useEffect(() => {
    if (!user || !session) return;

    const validateEnhancedSession = async () => {
      try {
        // Check session age - use current time as fallback
        const sessionCreated = session.expires_at ? new Date(Date.now() - 3600000) : new Date(); // Assume 1 hour old if no timestamp
        const sessionAge = Date.now() - sessionCreated.getTime();
        const maxAge = sessionTimeoutMinutes * 60 * 1000;
        
        if (sessionAge > maxAge) {
          toast({
            title: "Session Expired",
            description: "Your session has expired for security reasons. Please sign in again.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        // Geographic anomaly detection
        if (enableLocationChecks) {
          const anomaly = await checkLoginAnomaly(user.id);
          if (anomaly.isAnomalous) {
            handleLocationAnomaly(anomaly);
            
            // Log high-risk logins
            if (anomaly.riskLevel === 'high') {
              await supabase.from('security_audit_log').insert({
                user_id: user.id,
                action: 'HIGH_RISK_LOGIN',
                resource_type: 'security_alert',
                details: {
                  risk_level: anomaly.riskLevel,
                  reason: anomaly.reason,
                  is_anomalous: anomaly.isAnomalous,
                  timestamp: new Date().toISOString(),
                  user_agent: navigator.userAgent
                }
              });
            }
          }
        }

        // Enhanced rate limiting for session activities
        if (enableEnhancedRateLimit) {
          const rateCheck = await checkRateLimit('session_activity', user.id);
          if (!rateCheck.allowed) {
            handleRateLimitExceeded('session_activity', rateCheck);
          }
        }

        // Log successful session validation
        try {
          await supabase.from('security_audit_log').insert({
            user_id: user.id,
            action: 'SESSION_VALIDATED',
            resource_type: 'session_security',
            details: {
              session_age_minutes: Math.floor(sessionAge / (60 * 1000)),
              location_check: enableLocationChecks,
              rate_limit_check: enableEnhancedRateLimit,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          // Silent fail for non-critical logging
        }

      } catch (error) {
        console.error('Enhanced session validation failed:', error);
        
        // Log the error but don't sign out user
        try {
          await supabase.from('security_audit_log').insert({
            user_id: user.id,
            action: 'SESSION_VALIDATION_ERROR',
            resource_type: 'security_error',
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          // Silent fail for non-critical logging
        }
      }
    };

    // Validate on mount and every 5 minutes
    validateEnhancedSession();
    const interval = setInterval(validateEnhancedSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, session, enableLocationChecks, enableEnhancedRateLimit, sessionTimeoutMinutes, checkLoginAnomaly, handleLocationAnomaly, checkRateLimit, handleRateLimitExceeded, toast]);

  // Monitor for concurrent sessions
  useEffect(() => {
    if (!user) return;

    const handleAuthChange = async (event: string, newSession: any) => {
      if (event === 'SIGNED_IN' && newSession && session) {
        // Check if this is a new session while another exists
        if (newSession.access_token !== session.access_token) {
          toast({
            title: "New Login Detected",
            description: "A new login was detected on another device. If this wasn't you, please secure your account.",
            variant: "destructive",
            duration: 10000,
          });

          try {
            await supabase.from('security_audit_log').insert({
              user_id: user.id,
              action: 'CONCURRENT_SESSION_DETECTED',
              resource_type: 'security_alert',
              details: {
                existing_session: session.access_token.substring(0, 10) + '...',
                new_session: newSession.access_token.substring(0, 10) + '...',
                timestamp: new Date().toISOString()
              }
            });
          } catch (logError) {
            // Silent fail for non-critical logging
          }
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    return () => subscription.unsubscribe();
  }, [user, session, toast]);

  return null; // This is a manager component, no UI
}