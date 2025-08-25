import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Settings, 
  Eye,
  Clock,
  Users,
  Lock
} from 'lucide-react';

export function SecurityConfigurationManager() {
  const handleOpenSupabaseAuth = () => {
    window.open('https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/auth/settings', '_blank');
  };

  const handleOpenSupabaseUsers = () => {
    window.open('https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/auth/users', '_blank');
  };

  const handleOpenSupabaseFunctions = () => {
    window.open('https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/functions', '_blank');
  };

  const securityChecks = [
    {
      id: 'leaked-password',
      title: 'Leaked Password Protection',
      status: 'critical',
      description: 'Protects against compromised passwords',
      action: 'Enable in Auth Settings',
      link: 'auth/settings'
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting',
      status: 'good',
      description: 'Server-side rate limiting implemented',
      action: 'Review limits',
      link: 'functions'
    },
    {
      id: 'rls-policies',
      title: 'Row Level Security',
      status: 'good',
      description: 'All tables have proper RLS policies',
      action: 'Monitor policies',
      link: 'sql'
    },
    {
      id: 'audit-logging',
      title: 'Security Audit Logging',
      status: 'good',
      description: 'Comprehensive event tracking active',
      action: 'Review logs',
      link: 'functions'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive" className="ml-2">Critical</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">Warning</Badge>;
      case 'good':
        return <Badge variant="default" className="ml-2 bg-green-100 text-green-800">Good</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-red-800 dark:text-red-200">
                Action Required: Enable Leaked Password Protection
              </strong>
              <p className="text-red-700 dark:text-red-300 mt-1">
                This critical security feature prevents users from using compromised passwords.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleOpenSupabaseAuth}
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900"
            >
              Fix Now
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Security Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {securityChecks.map((check) => (
          <Card key={check.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(check.status)}
                  <CardTitle className="ml-2 text-base">{check.title}</CardTitle>
                  {getStatusBadge(check.status)}
                </div>
              </div>
              <CardDescription className="text-sm">
                {check.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (check.link === 'auth/settings') handleOpenSupabaseAuth();
                  else if (check.link === 'functions') handleOpenSupabaseFunctions();
                  else if (check.link === 'sql') window.open('https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/sql/new', '_blank');
                }}
                className="w-full"
              >
                {check.action}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Quick Security Actions
          </CardTitle>
          <CardDescription>
            Common security management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={handleOpenSupabaseAuth}
              className="flex items-center justify-center"
            >
              <Lock className="h-4 w-4 mr-2" />
              Auth Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={handleOpenSupabaseUsers}
              className="flex items-center justify-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              onClick={handleOpenSupabaseFunctions}
              className="flex items-center justify-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Implementation Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">✅ Already Implemented</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Server-side rate limiting on all authentication endpoints</li>
              <li>• Comprehensive Row Level Security (RLS) policies</li>
              <li>• Real-time security audit logging</li>
              <li>• Encrypted data storage with proper access controls</li>
              <li>• Company data isolation and validation</li>
              <li>• Session security monitoring</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-red-600">🚨 Requires Configuration</h4>
            <ul className="text-sm text-red-500 space-y-1 ml-4">
              <li>• Enable leaked password protection in Supabase Auth settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}