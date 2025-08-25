
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: 'high' | 'medium' | 'low';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  details?: any;
}

export function useSecurityMonitoring() {
  const { toast } = useToast();

  // Determine current user's role
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, company_id')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Monitor for suspicious activity
  const { data: suspiciousActivity } = useQuery({
    queryKey: ['suspicious-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Analyze for suspicious patterns
      const alerts: SecurityAlert[] = [];
      
      // Check for multiple failed operations with safe property access
      const failedOps = data.filter(log => {
        // Safely check if details contains error information
        const details = log.details as any;
        return (details && typeof details === 'object' && details.error) || log.action === 'FAILED_LOGIN';
      });
      
      if (failedOps.length > 5) {
        alerts.push({
          id: 'failed-ops',
          type: 'high',
          severity: 'high',
          message: `${failedOps.length} failed operations detected in the last hour`,
          timestamp: new Date().toISOString(),
          details: { count: failedOps.length }
        });
      }

      // Check for unusual deletion activity
      const deletions = data.filter(log => log.action === 'DELETE');
      if (deletions.length > 3) {
        alerts.push({
          id: 'unusual-deletions',
          type: 'medium',
          severity: 'medium',
          message: `Unusual deletion activity: ${deletions.length} records deleted`,
          timestamp: new Date().toISOString(),
          details: { deletions }
        });
      }

      // Check for after-hours activity
      const now = new Date();
      const afterHours = data.filter(log => {
        const logTime = new Date(log.created_at);
        const hour = logTime.getHours();
        return hour < 6 || hour > 22; // Before 6 AM or after 10 PM
      });

      if (afterHours.length > 0) {
        alerts.push({
          id: 'after-hours',
          type: 'low',
          severity: 'low',
          message: `${afterHours.length} after-hours activities detected`,
          timestamp: new Date().toISOString(),
          details: { count: afterHours.length }
        });
      }

      return alerts;
    },
    refetchInterval: 60000, // Check every minute
    enabled: !!profile && (profile as any)?.role === 'admin',
  });

  // Show alerts when detected
  useEffect(() => {
    if ((profile as any)?.role === 'admin' && suspiciousActivity && suspiciousActivity.length > 0) {
      suspiciousActivity.forEach(alert => {
        if (alert.type === 'high') {
          toast({
            title: "Security Alert",
            description: alert.message,
            variant: "destructive"
          });
        } else if (alert.type === 'medium') {
          toast({
            title: "Security Notice",
            description: alert.message,
          });
        }
      });
    }
  }, [suspiciousActivity, toast, profile]);

  // Monitor authentication events
  const { data: authEvents } = useQuery({
    queryKey: ['auth-events'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      // Log successful authentication
      if (session) {
        await supabase.from('security_audit_log').insert({
          user_id: session.user.id,
          action: 'SESSION_CHECK',
          resource_type: 'auth',
          resource_id: session.user.id,
          details: { 
            last_sign_in: session.user.last_sign_in_at,
            user_agent: navigator.userAgent 
          }
        });
      }

      return session;
    },
    refetchInterval: 300000, // Check every 5 minutes
  });

  return {
    alerts: suspiciousActivity || [],
    stats: {
      securityEvents: suspiciousActivity?.length || 0,
      totalAlerts: suspiciousActivity?.length || 0,
      criticalAlerts: suspiciousActivity?.filter(a => a.severity === 'high').length || 0
    },
    suspiciousActivity: suspiciousActivity || [],
    authEvents,
    isMonitoring: (profile as any)?.role === 'admin'
  };
}
