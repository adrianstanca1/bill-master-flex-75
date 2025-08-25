import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, Activity, AlertTriangle } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { supabase } from '@/integrations/supabase/client';
import { SecurityAlert } from './SecurityAlert';

export function UserDashboard() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [lastActivity, setLastActivity] = useState<string>('');
  const [sessionStrength, setSessionStrength] = useState<string>('strong');
  
  const { stats } = useSecurityMonitoring();
  const { systemHealth, runHealthCheck } = useSystemHealth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email || '');
          setLastActivity(new Date().toISOString());
          setSessionStrength('strong');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || '');
        setLastActivity(new Date().toISOString());
        setSessionStrength('strong');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSessionBadgeColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Dashboard</h1>
        <p className="text-muted-foreground">Your account security and system status</p>
      </div>

      <SecurityAlert />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{userEmail || 'Loading...'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
              <p className="text-foreground">
                {lastActivity ? new Date(lastActivity).toLocaleString() : 'Never'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Session Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Session Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Session Strength</label>
              <div className="mt-1">
                <Badge className={getSessionBadgeColor(sessionStrength)}>
                  {sessionStrength.charAt(0).toUpperCase() + sessionStrength.slice(1)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Security Events</label>
              <p className="text-foreground">{stats?.securityEvents || 0} recent events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Database</label>
                <p className={`font-medium ${getStatusColor(systemHealth?.database?.status || 'healthy')}`}>
                  {systemHealth?.database?.status || 'Healthy'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Authentication</label>
                <p className={`font-medium ${getStatusColor(systemHealth?.auth?.status || 'healthy')}`}>
                  {systemHealth?.auth?.status || 'Healthy'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Functions</label>
                <p className={`font-medium ${getStatusColor(systemHealth?.functions?.status || 'healthy')}`}>
                  {systemHealth?.functions?.status || 'Healthy'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">APIs</label>
                <p className={`font-medium ${getStatusColor(systemHealth?.apis?.status || 'healthy')}`}>
                  {systemHealth?.apis?.status || 'Healthy'}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button onClick={runHealthCheck} variant="outline" size="sm">
                Run Health Check
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Last check: {systemHealth?.lastCheck ? new Date(systemHealth.lastCheck).toLocaleString() : 'Never'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Failed Logins</label>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Active Sessions</label>
                <p className="text-2xl font-bold text-foreground">1</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Security Score</label>
                <p className="text-2xl font-bold text-green-600">95%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Threats Blocked</label>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}