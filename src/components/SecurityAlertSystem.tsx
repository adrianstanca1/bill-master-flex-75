import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurityAlert {
  id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
}

export function SecurityAlertSystem() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const checkSecurityAlerts = async () => {
      try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
          .eq('action', 'SECURITY_VIOLATION')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching security alerts:', error);
          return;
        }

        if (data) {
          // Transform security_audit_log entries to SecurityAlert format
          const securityAlerts: SecurityAlert[] = data.map(log => ({
            id: log.id,
            event_type: log.action,
            severity: (log.details as any)?.severity || 'medium',
            details: log.details,
            created_at: log.created_at
          }));
          
          const newAlerts = securityAlerts.filter(alert => !dismissedAlerts.has(alert.id));
          setAlerts(newAlerts);

          // Show toast for critical alerts
          const criticalAlerts = newAlerts.filter(alert => 
            alert.severity === 'critical' && !dismissedAlerts.has(alert.id)
          );
          
          criticalAlerts.forEach(alert => {
            toast({
              title: "Critical Security Alert",
              description: getAlertMessage(alert),
              variant: "destructive",
              duration: 10000,
            });
          });
        }
      } catch (error) {
        console.error('Security alert check failed:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkSecurityAlerts();
    const interval = setInterval(checkSecurityAlerts, 30000);

    return () => clearInterval(interval);
  }, [dismissedAlerts, toast]);

  const getAlertMessage = (alert: SecurityAlert): string => {
    switch (alert.event_type) {
      case 'HIGH_THREAT_DETECTED':
        return 'Suspicious activity detected on your account. Please review recent actions.';
      case 'BRUTE_FORCE_DETECTED':
        return 'Multiple failed login attempts detected. Your account may be under attack.';
      case 'UNAUTHORIZED_ACCESS':
        return 'Unauthorized access attempt detected. Please secure your account.';
      case 'SECURITY_VIOLATION':
        return 'Security policy violation detected. Please contact support if this was not you.';
      default:
        return `Security event detected: ${alert.event_type}`;
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' ? AlertTriangle : Shield;
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'critical' ? 'text-destructive' : 'text-warning';
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  if (alerts.length === 0 || alerts.every(alert => dismissedAlerts.has(alert.id))) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts
        .filter(alert => !dismissedAlerts.has(alert.id))
        .slice(0, 3)
        .map(alert => {
          const Icon = getSeverityIcon(alert.severity);
          return (
            <Alert key={alert.id} className="border-border bg-card shadow-lg">
              <Icon className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
              <div className="flex-1">
                <AlertTitle className="text-sm font-medium">
                  Security Alert - {alert.severity.toUpperCase()}
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground mt-1">
                  {getAlertMessage(alert)}
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Alert>
          );
        })
      }
    </div>
  );
}