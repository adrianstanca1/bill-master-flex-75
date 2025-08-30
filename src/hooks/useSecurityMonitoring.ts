import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityAlert {
  id: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  details: any;
}

export function useSecurityMonitoring() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
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
        .limit(20);

      if (error) throw error;

      const alertsWithSeverity = (data || []).map(alert => ({
        ...alert,
        severity: determineSeverity(alert.action, alert.details)
      }));

      setAlerts(alertsWithSeverity);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineSeverity = (action: string, details: any): SecurityAlert['severity'] => {
    switch (action) {
      case 'SUSPICIOUS_ACTIVITY_DETECTED':
        return details?.violation_count > 5 ? 'critical' : 'high';
      case 'COMPANY_ID_CHANGE_BLOCKED':
      case 'SELF_ROLE_ESCALATION_BLOCKED':
        return 'high';
      case 'WEBHOOK_SECURITY_VIOLATION':
        return 'medium';
      default:
        return 'low';
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      // Just remove from local state for now
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('security_monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_audit_log',
          filter: 'action=in.(SUSPICIOUS_ACTIVITY_DETECTED,COMPANY_ID_CHANGE_BLOCKED,SELF_ROLE_ESCALATION_BLOCKED,WEBHOOK_SECURITY_VIOLATION)'
        },
        (payload) => {
          const newAlert = {
            ...payload.new,
            severity: determineSeverity(payload.new.action, payload.new.details)
          } as SecurityAlert;
          
          setAlerts(prev => [newAlert, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    loading,
    dismissAlert,
    refreshAlerts: fetchAlerts
  };
}