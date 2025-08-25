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

export function useEnhancedSecurityLogging() {
  const { toast } = useToast();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Get current user and session info
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare comprehensive log entry
      const logEntry = {
        user_id: user?.id || null,
        action: event.eventType,
        resource_type: event.resourceType || 'system',
        resource_id: event.resourceId || null,
        details: {
          ...event.details,
          timestamp: new Date().toISOString(),
          severity: event.severity,
          session_id: session?.access_token ? 'authenticated' : 'anonymous',
          user_agent: navigator.userAgent,
          ip_address: 'client_side', // Would be populated server-side
          url: window.location.href,
          referrer: document.referrer || null
        }
      };

      // Log to Supabase
      const { error } = await supabase
        .from('security_audit_log')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log security event:', error);
        // Fallback to console logging
        console.warn('Security Event:', logEntry);
      }

      // Show toast for critical events
      if (event.severity === 'critical') {
        toast({
          title: "Critical Security Event",
          description: `${event.eventType}: Please contact support if this was unexpected`,
          variant: "destructive"
        });
      } else if (event.severity === 'high') {
        toast({
          title: "Security Alert",
          description: event.eventType,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Security logging failed:', error);
      // Always log to console as fallback
      console.warn('Security Event (fallback):', event);
    }
  }, [toast]);

  const logFormSubmission = useCallback((formType: string, formData: Record<string, any>) => {
    logSecurityEvent({
      eventType: 'FORM_SUBMISSION',
      severity: 'low',
      details: {
        form_type: formType,
        field_count: Object.keys(formData).length,
        has_file_upload: Object.values(formData).some(value => value instanceof File),
        timestamp: new Date().toISOString()
      },
      resourceType: 'form',
      resourceId: formType
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback((activityType: string, details: Record<string, any>) => {
    logSecurityEvent({
      eventType: 'SUSPICIOUS_ACTIVITY',
      severity: 'high',
      details: {
        activity_type: activityType,
        ...details
      },
      resourceType: 'security',
      resourceId: activityType
    });
  }, [logSecurityEvent]);

  const logAuthenticationEvent = useCallback((eventType: string, success: boolean, details?: Record<string, any>) => {
    logSecurityEvent({
      eventType: `AUTH_${eventType.toUpperCase()}`,
      severity: success ? 'medium' : 'high',
      details: {
        success,
        method: eventType,
        ...details
      },
      resourceType: 'authentication',
      resourceId: eventType
    });
  }, [logSecurityEvent]);

  const logDataAccess = useCallback((resourceType: string, action: string, resourceId?: string) => {
    logSecurityEvent({
      eventType: 'DATA_ACCESS',
      severity: 'low',
      details: {
        action,
        resource_type: resourceType,
        resource_id: resourceId
      },
      resourceType,
      resourceId
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logFormSubmission,
    logSuspiciousActivity,
    logAuthenticationEvent,
    logDataAccess
  };
}