import { useState, useEffect } from "react";
import { useAuthContext } from "./AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Smartphone,
  Lock,
  Eye,
  Settings,
  Activity,
  Users,
  Key,
  Fingerprint,
  Monitor,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface SecurityMetrics {
  securityScore: number;
  lastLogin: string;
  activeSessions: number;
  failedAttempts: number;
  deviceCount: number;
  passwordStrength: "weak" | "medium" | "strong";
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
}

interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  location?: string;
  device?: string;
}

export function SecurityDashboard() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    securityScore: 75,
    lastLogin: new Date().toISOString(),
    activeSessions: 2,
    failedAttempts: 0,
    deviceCount: 3,
    passwordStrength: "strong",
    twoFactorEnabled: false,
    biometricEnabled: false
  });
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security events from audit log
      const { data: auditData, error: auditError } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (auditError) {
        console.error('Error loading security events:', auditError);
      } else if (auditData) {
        const securityEvents: SecurityEvent[] = auditData.map(event => ({
          id: event.id,
          type: event.action,
          description: getEventDescription(event.action, event.details),
          timestamp: event.created_at,
          severity: getSeverityLevel(event.action),
          location: (event.details as any)?.location || 'Unknown',
          device: (event.details as any)?.device || 'Unknown Device'
        }));
        
        setEvents(securityEvents);
      }

      // Calculate security score based on various factors
      let score = 0;
      if (metrics.passwordStrength === "strong") score += 30;
      else if (metrics.passwordStrength === "medium") score += 20;
      else score += 10;
      
      if (metrics.twoFactorEnabled) score += 25;
      if (metrics.biometricEnabled) score += 20;
      if (metrics.failedAttempts === 0) score += 15;
      if (metrics.activeSessions <= 2) score += 10;
      
      setMetrics(prev => ({ ...prev, securityScore: score }));
      
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventDescription = (action: string, details: any) => {
    switch (action) {
      case 'USER_LOGIN':
        return 'Successful login';
      case 'USER_LOGIN_FAILED':
        return 'Failed login attempt';
      case 'PASSWORD_CHANGED':
        return 'Password was changed';
      case 'TWO_FACTOR_ENABLED':
        return 'Two-factor authentication enabled';
      case 'DEVICE_REGISTERED':
        return 'New device registered';
      case 'SUSPICIOUS_ACTIVITY':
        return 'Suspicious activity detected';
      default:
        return action.replace(/_/g, ' ').toLowerCase();
    }
  };

  const getSeverityLevel = (action: string): "low" | "medium" | "high" | "critical" => {
    const highSeverity = ['USER_LOGIN_FAILED', 'SUSPICIOUS_ACTIVITY', 'BRUTE_FORCE_DETECTED'];
    const mediumSeverity = ['PASSWORD_CHANGED', 'DEVICE_REGISTERED'];
    
    if (highSeverity.includes(action)) return 'high';
    if (mediumSeverity.includes(action)) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      // Log the security event
      await supabase.from('security_audit_log').insert({
        user_id: user?.id,
        action: enabled ? 'TWO_FACTOR_ENABLED' : 'TWO_FACTOR_DISABLED',
        resource: 'user_settings',
        details: { twoFactorEnabled: enabled }
      });

      setMetrics(prev => ({ ...prev, twoFactorEnabled: enabled }));
      
      toast({
        title: enabled ? "2FA Enabled" : "2FA Disabled",
        description: enabled 
          ? "Two-factor authentication has been enabled for your account."
          : "Two-factor authentication has been disabled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication settings.",
        variant: "destructive"
      });
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    setMetrics(prev => ({ ...prev, biometricEnabled: enabled }));
    
    toast({
      title: enabled ? "Biometric Authentication Enabled" : "Biometric Authentication Disabled",
      description: enabled 
        ? "Biometric authentication is now active for your account."
        : "Biometric authentication has been disabled.",
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Dashboard
              </CardTitle>
              <CardDescription>
                Monitor and manage your account security
              </CardDescription>
            </div>
            <Badge variant={metrics.securityScore >= 80 ? "default" : "destructive"}>
              Security Score: {metrics.securityScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.securityScore}%
              </div>
              <div className="text-sm text-muted-foreground">Security Score</div>
              <Progress value={metrics.securityScore} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.deviceCount}</div>
              <div className="text-sm text-muted-foreground">Trusted Devices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.failedAttempts}</div>
              <div className="text-sm text-muted-foreground">Recent Failed Attempts</div>
            </div>
          </div>

          {metrics.securityScore < 80 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your security score is below recommended levels. Consider enabling additional security features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Password Protected</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metrics.twoFactorEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-sm">Two-Factor Auth</span>
                  </div>
                  <Badge variant={metrics.twoFactorEnabled ? "default" : "secondary"}>
                    {metrics.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metrics.biometricEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-sm">Biometric Login</span>
                  </div>
                  <Badge variant={metrics.biometricEnabled ? "default" : "secondary"}>
                    {metrics.biometricEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Login</span>
                    <span>{format(new Date(metrics.lastLogin), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Password Strength</span>
                    <Badge variant={metrics.passwordStrength === 'strong' ? 'default' : 'secondary'}>
                      {metrics.passwordStrength}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Switch
                  checked={metrics.twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Biometric Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Use fingerprint or face recognition to sign in
                  </div>
                </div>
                <Switch
                  checked={metrics.biometricEnabled}
                  onCheckedChange={handleToggleBiometric}
                />
              </div>
              
              <Button variant="outline" className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Activity Log</CardTitle>
              <CardDescription>
                Recent security events for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity)}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{event.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')} • {event.location}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.severity}
                    </Badge>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent security events
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trusted Devices</CardTitle>
              <CardDescription>
                Manage devices that have access to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "MacBook Pro", type: "Desktop", location: "London, UK", lastSeen: "Currently active" },
                  { name: "iPhone 14", type: "Mobile", location: "London, UK", lastSeen: "2 hours ago" },
                  { name: "Chrome Browser", type: "Web", location: "Manchester, UK", lastSeen: "1 day ago" }
                ].map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {device.type === "Desktop" && <Monitor className="w-5 h-5" />}
                        {device.type === "Mobile" && <Smartphone className="w-5 h-5" />}
                        {device.type === "Web" && <Globe className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{device.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {device.location} • {device.lastSeen}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
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