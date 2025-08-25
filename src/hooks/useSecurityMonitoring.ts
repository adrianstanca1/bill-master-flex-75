import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  created_at: string;
  message?: string;
  timestamp?: string;
}

export function useSecurityMonitoring() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSecurityAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .in('action', [
          'SUSPICIOUS_ACTIVITY_DETECTED',
          'COMPANY_ID_CHANGE_BLOCKED',
          'SELF_ROLE_ESCALATION_BLOCKED',
          'WEBHOOK_SECURITY_VIOLATION'
        ])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedAlerts: SecurityAlert[] = data?.map(log => ({
        id: log.id,
        action: log.action,
        severity: (log.details as any)?.alert_level || 'medium',
        details: (log.details as Record<string, any>) || {},
        created_at: log.created_at,
        message: log.action.replace(/_/g, ' ').toLowerCase(),
        timestamp: log.created_at
      })) || [];

      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logSecurityViolation = useCallback(async (
    action: string,
    resourceType: string,
    details: Record<string, any>
  ) => {
    try {
      await supabase.from('security_audit_log').insert({
        action,
        resource_type: resourceType,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Failed to log security violation:', error);
    }
  }, []);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      // Mark alert as acknowledged by updating details
      const { data: currentAlert } = await supabase
        .from('security_audit_log')
        .select('details')
        .eq('id', alertId)
        .single();

      if (currentAlert) {
        const updatedDetails = {
          ...(currentAlert.details as Record<string, any>),
          acknowledged: true,
          dismissed_at: new Date().toISOString()
        };

        await supabase
          .from('security_audit_log')
          .update({ details: updatedDetails })
          .eq('id', alertId);
      }

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  }, []);

  useEffect(() => {
    loadSecurityAlerts();

    // Set up real-time monitoring for new security events
    const channel = supabase
      .channel('security-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_audit_log',
          filter: 'action.in.(SUSPICIOUS_ACTIVITY_DETECTED,COMPANY_ID_CHANGE_BLOCKED,SELF_ROLE_ESCALATION_BLOCKED,WEBHOOK_SECURITY_VIOLATION)'
        },
        (payload) => {
          const newAlert: SecurityAlert = {
            id: payload.new.id,
            action: payload.new.action,
            severity: (payload.new.details as any)?.alert_level || 'medium',
            details: (payload.new.details as Record<string, any>) || {},
            created_at: payload.new.created_at,
            message: payload.new.action.replace(/_/g, ' ').toLowerCase(),
            timestamp: payload.new.created_at
          };

          setAlerts(prev => [newAlert, ...prev]);

          // Show toast for high/critical alerts
          if (newAlert.severity === 'high' || newAlert.severity === 'critical') {
            toast({
              title: "Security Alert",
              description: `${newAlert.action.replace(/_/g, ' ').toLowerCase()}`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSecurityAlerts, toast]);

  return {
    alerts,
    loading,
    logSecurityViolation,
    dismissAlert,
    reloadAlerts: loadSecurityAlerts,
    stats: {
      total: alerts.length,
      totalAlerts: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      securityEvents: alerts.length
    }
  };
}