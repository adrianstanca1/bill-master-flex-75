import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity,
  Users,
  Globe,
  Lock,
  Eye,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ComponentType<any>;
}

interface SecurityAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  action?: string;
}

export function AuthenticationDashboard() {
  const [securityScore, setSecurityScore] = useState(85);

  // Fetch authentication metrics
  const { data: authMetrics } = useQuery({
    queryKey: ['auth-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('action, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 // Refetch every minute
  });

  // Fetch security alerts
  const { data: securityAlerts } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .in('action', ['LOGIN_FAILED', 'SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const securityMetrics: SecurityMetric[] = [
    {
      name: "Authentication Success Rate",
      value: 96,
      status: 'good',
      description: "Percentage of successful login attempts",
      icon: CheckCircle
    },
    {
      name: "Multi-Factor Usage",
      value: 45,
      status: 'warning',
      description: "Users with MFA enabled",
      icon: Shield
    },
    {
      name: "Active Sessions",
      value: 12,
      status: 'good',
      description: "Currently active user sessions",
      icon: Activity
    },
    {
      name: "Security Violations",
      value: 3,
      status: 'warning',
      description: "Security violations in the last 24h",
      icon: AlertTriangle
    }
  ];

  const recentAlerts: SecurityAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Multiple Failed Login Attempts',
      description: 'User attempted to login 5 times with incorrect credentials',
      timestamp: '5 minutes ago',
      action: 'Account temporarily locked'
    },
    {
      id: '2',
      type: 'info',
      title: 'New Device Login',
      description: 'User signed in from a new device in London, UK',
      timestamp: '15 minutes ago'
    },
    {
      id: '3',
      type: 'critical',
      title: 'Suspicious IP Activity',
      description: 'Multiple login attempts from blacklisted IP address',
      timestamp: '1 hour ago',
      action: 'IP blocked automatically'
    },
    {
      id: '4',
      type: 'info',
      title: 'Password Reset Requested',
      description: 'User requested password reset via email',
      timestamp: '2 hours ago'
    }
  ];

  const authStats = authMetrics ? {
    totalEvents: authMetrics.length,
    successfulLogins: authMetrics.filter(m => m.action === 'USER_SIGNIN_SUCCESS').length,
    failedLogins: authMetrics.filter(m => m.action === 'USER_SIGNIN_FAILED').length,
    signups: authMetrics.filter(m => m.action === 'USER_SIGNUP_SUCCESS').length
  } : { totalEvents: 0, successfulLogins: 0, failedLogins: 0, signups: 0 };

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertStyle = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Authentication Dashboard</h2>
          <p className="text-muted-foreground">Monitor authentication security and user access</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Security Score: {securityScore}%
          </Badge>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Full Report
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Security Score</span>
              <span className="text-2xl font-bold">{securityScore}%</span>
            </div>
            <Progress value={securityScore} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {securityMetrics.map((metric, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className={`mx-auto mb-2 p-2 rounded-full w-fit ${
                    metric.status === 'good' ? 'bg-green-100' :
                    metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <metric.icon className={`h-5 w-5 ${
                      metric.status === 'good' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm font-medium">{metric.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Authentication Activity (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{authStats.successfulLogins}</div>
                  <div className="text-sm text-green-700">Successful Logins</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{authStats.failedLogins}</div>
                  <div className="text-sm text-red-700">Failed Attempts</div>
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{authStats.signups}</div>
                <div className="text-sm text-blue-700">New Registrations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 border rounded-lg ${getAlertStyle(alert.type)}`}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      {alert.action && (
                        <p className="text-xs font-medium mt-2">Action: {alert.action}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <Lock className="h-5 w-5 mb-1" />
              Reset Passwords
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Users className="h-5 w-5 mb-1" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Globe className="h-5 w-5 mb-1" />
              IP Restrictions
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Shield className="h-5 w-5 mb-1" />
              Security Policies
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Recommendations:</strong> Consider enabling mandatory MFA for all users and implementing IP whitelisting for enhanced security.
        </AlertDescription>
      </Alert>
    </div>
  );
}