import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  resourceType?: string;
  resourceId?: string;
}

export function useSecureLogging() {
  const { toast } = useToast();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Use the secure-logger edge function for server-side logging
      const { data, error } = await supabase.functions.invoke('secure-logger', {
        body: {
          eventType: event.eventType,
          severity: event.severity,
          details: {
            ...event.details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          },
          resourceType: event.resourceType,
          resourceId: event.resourceId
        }
      });

      if (error) {
        console.error('Failed to log security event:', error);
        
        // Fallback to client-side logging if server-side fails
        await supabase.from('security_audit_log').insert({
          action: event.eventType,
          resource_type: event.resourceType || 'general',
          resource_id: event.resourceId,
          details: {
            ...event.details,
            fallback_logging: true,
            original_error: error.message,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Show toast for critical events
      if (event.severity === 'critical') {
        toast({
          title: "Security Alert",
          description: "A critical security event has been logged and administrators have been notified.",
          variant: "destructive",
        });
      }

      return { success: true, eventId: data?.eventId };
    } catch (error) {
      console.error('Security logging failed:', error);
      return { success: false, error: error.message };
    }
  }, [toast]);

  const logAuthenticationEvent = useCallback(async (eventType: string, details: Record<string, any>) => {
    return logSecurityEvent({
      eventType,
      severity: 'medium',
      details,
      resourceType: 'authentication'
    });
  }, [logSecurityEvent]);

  const logAccessEvent = useCallback(async (resourceType: string, resourceId: string, action: string) => {
    return logSecurityEvent({
      eventType: `${action.toUpperCase()}_${resourceType.toUpperCase()}`,
      severity: 'low',
      details: {
        action,
        timestamp: new Date().toISOString()
      },
      resourceType,
      resourceId
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback(async (activityType: string, details: Record<string, any>) => {
    return logSecurityEvent({
      eventType: 'SUSPICIOUS_ACTIVITY_DETECTED',
      severity: 'high',
      details: {
        activityType,
        ...details
      },
      resourceType: 'security_monitoring'
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logAuthenticationEvent,
    logAccessEvent,
    logSuspiciousActivity
  };
}