import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Mail, 
  Globe,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<any>;
  level: 'basic' | 'advanced' | 'enterprise';
}

export function AuthSecuritySettings() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('•••••••••••••••••••••••••••••••••••••••');

  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: 'mfa',
      name: 'Multi-Factor Authentication',
      description: 'Require a second form of authentication',
      enabled: false,
      icon: Smartphone,
      level: 'advanced'
    },
    {
      id: 'login_notifications',
      name: 'Login Notifications',
      description: 'Get notified of new sign-ins',
      enabled: true,
      icon: Mail,
      level: 'basic'
    },
    {
      id: 'session_timeout',
      name: 'Session Timeout',
      description: 'Automatically sign out after inactivity',
      enabled: true,
      icon: Settings,
      level: 'basic'
    },
    {
      id: 'ip_restrictions',
      name: 'IP Address Restrictions',
      description: 'Limit access to specific IP addresses',
      enabled: false,
      icon: Globe,
      level: 'enterprise'
    },
    {
      id: 'device_tracking',
      name: 'Device Tracking',
      description: 'Monitor and manage signed-in devices',
      enabled: true,
      icon: Shield,
      level: 'advanced'
    }
  ]);

  const [sessionInfo, setSessionInfo] = useState({
    currentDevice: 'Chrome on Windows',
    location: 'London, UK',
    lastAccess: new Date().toISOString(),
    activeSessions: 2
  });

  const handleSettingToggle = async (settingId: string) => {
    setLoading(true);
    try {
      const setting = securitySettings.find(s => s.id === settingId);
      const newEnabled = !setting?.enabled;

      // Update local state
      setSecuritySettings(prev => 
        prev.map(s => s.id === settingId ? { ...s, enabled: newEnabled } : s)
      );

      // Log security setting change
      await supabase.from('security_audit_log').insert({
        action: 'SECURITY_SETTING_CHANGED',
        resource_type: 'user_settings',
        details: {
          setting: settingId,
          enabled: newEnabled,
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Setting Updated",
        description: `${setting?.name} has been ${newEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Failed to update security setting:', error);
      toast({
        title: "Error",
        description: "Failed to update security setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    setLoading(true);
    try {
      // Generate a new API key (in a real app, this would be server-side)
      const newKey = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      setApiKey(newKey);
      setShowApiKey(true);

      // Log API key generation
      await supabase.from('security_audit_log').insert({
        action: 'API_KEY_GENERATED',
        resource_type: 'api_access',
        details: {
          timestamp: new Date().toISOString(),
          key_prefix: newKey.substring(0, 8)
        }
      });

      toast({
        title: "API Key Generated",
        description: "New API key has been generated successfully.",
      });
    } catch (error) {
      console.error('Failed to generate API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const revokeAllSessions = async () => {
    setLoading(true);
    try {
      // In a real app, this would revoke all sessions except current
      await supabase.from('security_audit_log').insert({
        action: 'ALL_SESSIONS_REVOKED',
        resource_type: 'session_management',
        details: {
          timestamp: new Date().toISOString(),
          revoked_sessions: sessionInfo.activeSessions - 1
        }
      });

      setSessionInfo(prev => ({ ...prev, activeSessions: 1 }));

      toast({
        title: "Sessions Revoked",
        description: "All other sessions have been signed out.",
      });
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
      toast({
        title: "Error",
        description: "Failed to revoke sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Settings</h2>
          <p className="text-muted-foreground">Manage your account security and access controls</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Security Score: 85%
        </Badge>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {securitySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      setting.level === 'enterprise' ? 'bg-purple-100 text-purple-600' :
                      setting.level === 'advanced' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <setting.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{setting.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            setting.level === 'enterprise' ? 'border-purple-200 text-purple-600' :
                            setting.level === 'advanced' ? 'border-blue-200 text-blue-600' :
                            'border-green-200 text-green-600'
                          }`}
                        >
                          {setting.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => handleSettingToggle(setting.id)}
                    disabled={loading}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Recommendation:</strong> Enable Multi-Factor Authentication and IP restrictions for enhanced security.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">
                      {sessionInfo.currentDevice} • {sessionInfo.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last access: {new Date(sessionInfo.lastAccess).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Other Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    {sessionInfo.activeSessions - 1} other active session(s)
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={revokeAllSessions}
                  disabled={loading || sessionInfo.activeSessions <= 1}
                >
                  Revoke All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={generateApiKey} disabled={loading}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this API key to authenticate requests to the AS Agents API
                </p>
              </div>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Keep your API key secure. Do not share it in publicly accessible areas or client-side code.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Security Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Sign in", time: "2 minutes ago", status: "success", ip: "192.168.1.1" },
                  { action: "API key generated", time: "1 hour ago", status: "success", ip: "192.168.1.1" },
                  { action: "Security setting changed", time: "2 hours ago", status: "success", ip: "192.168.1.1" },
                  { action: "Failed sign in", time: "1 day ago", status: "warning", ip: "203.0.113.1" }
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' :
                        log.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">IP: {log.ip}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}