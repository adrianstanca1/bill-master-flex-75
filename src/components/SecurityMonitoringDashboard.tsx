import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Clock, X } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { formatDistanceToNow } from 'date-fns';

export function SecurityMonitoringDashboard() {
  const { alerts, loading, dismissAlert } = useSecurityMonitoring();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'SUSPICIOUS_ACTIVITY_DETECTED':
        return 'Multiple security violations detected';
      case 'COMPANY_ID_CHANGE_BLOCKED':
        return 'Unauthorized company change attempt';
      case 'SELF_ROLE_ESCALATION_BLOCKED':
        return 'User attempted to change own role';
      case 'WEBHOOK_SECURITY_VIOLATION':
        return 'Invalid webhook signature';
      default:
        return action.replace(/_/g, ' ').toLowerCase();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Loading security monitoring...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">All Clear</h3>
            <p className="text-muted-foreground">No security alerts detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-destructive mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">
                      {getActionDescription(alert.action)}
                    </h4>
                    {alert.details.violation_count && (
                      <p className="text-sm text-muted-foreground">
                        {alert.details.violation_count} violations in {alert.details.time_window}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}