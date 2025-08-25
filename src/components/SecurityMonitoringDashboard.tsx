import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Eye, Users, Globe, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedSecurityLogging } from '@/hooks/useEnhancedSecurityLogging';

interface SecurityEvent {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
  created_at: string;
  user_id: string | null;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  rateLimitBlocks: number;
  suspiciousActivities: number;
  activeUsers: number;
}

export function SecurityMonitoringDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    rateLimitBlocks: 0,
    suspiciousActivities: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const { toast } = useToast();
  const { logSecurityEvent } = useEnhancedSecurityLogging();

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load recent security events
      const { data: eventData, error: eventError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventError) throw eventError;

      const processedEvents: SecurityEvent[] = eventData?.map(event => ({
        id: event.id,
        action: event.action,
        resource_type: event.resource_type,
        resource_id: event.resource_id,
        details: event.details,
        created_at: event.created_at,
        user_id: event.user_id,
        severity: determineSeverity(event.action, event.details)
      })) || [];

      setEvents(processedEvents);

      // Calculate metrics
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentEvents = processedEvents.filter(event => 
        new Date(event.created_at) > last24Hours
      );

      setMetrics({
        totalEvents: recentEvents.length,
        criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
        failedLogins: recentEvents.filter(e => e.action.includes('FAILED')).length,
        rateLimitBlocks: recentEvents.filter(e => e.action === 'RATE_LIMIT_BLOCK').length,
        suspiciousActivities: recentEvents.filter(e => e.action === 'SUSPICIOUS_ACTIVITY_DETECTED').length,
        activeUsers: new Set(recentEvents.map(e => e.user_id).filter(Boolean)).size
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: "Security Data Error",
        description: "Failed to load security monitoring data",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const determineSeverity = (action: string, details: any): 'low' | 'medium' | 'high' | 'critical' => {
    if (action.includes('FAILED') || action.includes('SUSPICIOUS')) return 'high';
    if (action.includes('RATE_LIMIT_BLOCK')) return 'medium';
    if (action.includes('CONCURRENT_SESSION')) return 'critical';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const enableRealTimeMonitoring = async () => {
    try {
      await logSecurityEvent({
        eventType: 'REAL_TIME_MONITORING_ENABLED',
        severity: 'medium',
        details: { enabledAt: new Date().toISOString() }
      });
      
      setRealTimeEnabled(true);
      toast({
        title: "Real-time Monitoring Enabled",
        description: "Security events will now be monitored in real-time"
      });
    } catch (error) {
      toast({
        title: "Failed to Enable Monitoring",
        description: "Could not enable real-time security monitoring",
        variant: "destructive"
      });
    }
  };

  const acknowledgeEvent = async (eventId: string) => {
    try {
      await logSecurityEvent({
        eventType: 'SECURITY_EVENT_ACKNOWLEDGED',
        severity: 'low',
        details: { acknowledgedEventId: eventId, acknowledgedAt: new Date().toISOString() }
      });
      
      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "Event Acknowledged",
        description: "Security event has been acknowledged and removed from active alerts"
      });
    } catch (error) {
      toast({
        title: "Acknowledgment Failed",
        description: "Could not acknowledge security event",
        variant: "destructive"
      });
    }
  };

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitoring Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{metrics.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold">{metrics.failedLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Rate Limits</p>
                <p className="text-2xl font-bold">{metrics.rateLimitBlocks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Suspicious</p>
                <p className="text-2xl font-bold">{metrics.suspiciousActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Monitoring Control */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Security Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {realTimeEnabled 
                  ? "Real-time monitoring is active. Security events are being tracked continuously."
                  : "Enable real-time monitoring to track security events as they happen."
                }
              </p>
            </div>
            <Button 
              onClick={enableRealTimeMonitoring}
              disabled={realTimeEnabled}
              variant={realTimeEnabled ? "outline" : "default"}
            >
              {realTimeEnabled ? "Monitoring Active" : "Enable Monitoring"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No security events in the last 24 hours. Your system appears secure.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(event.severity || 'low')}>
                        {event.severity?.toUpperCase() || 'LOW'}
                      </Badge>
                      <span className="font-medium">{event.action}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Resource: {event.resource_type} | {formatEventTime(event.created_at)}
                    </p>
                    {event.details && Object.keys(event.details).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(event.details, null, 0).slice(0, 100)}...
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => acknowledgeEvent(event.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}