import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuthAnalyticsProps {
  className?: string;
}

interface LoginAttempt {
  id: string;
  timestamp: string;
  success: boolean;
  location: string;
  device: string;
  ip_address: string;
  method: 'email' | 'oauth' | 'magic_link';
  risk_score: number;
}

interface SecurityInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
}

export function AuthAnalytics({ className }: AuthAnalyticsProps) {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [insights, setInsights] = useState<SecurityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock analytics data - in a real app, this would come from your backend
      const mockAttempts: LoginAttempt[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          success: true,
          location: 'London, UK',
          device: 'Chrome on Windows',
          ip_address: '192.168.1.1',
          method: 'email',
          risk_score: 5
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          success: true,
          location: 'Manchester, UK',
          device: 'Safari on iPhone',
          ip_address: '192.168.1.2',
          method: 'oauth',
          risk_score: 10
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          success: false,
          location: 'Unknown',
          device: 'Chrome on Linux',
          ip_address: '10.0.0.1',
          method: 'email',
          risk_score: 85
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          success: true,
          location: 'Birmingham, UK',
          device: 'Chrome on iPad',
          ip_address: '192.168.1.3',
          method: 'magic_link',
          risk_score: 15
        }
      ];

      const mockInsights: SecurityInsight[] = [
        {
          type: 'success',
          title: '2FA Enabled',
          description: 'Your account is protected with two-factor authentication',
        },
        {
          type: 'warning',
          title: 'Failed Login Attempt',
          description: 'Suspicious login attempt detected from unknown location',
          action: 'Review Activity'
        },
        {
          type: 'info',
          title: 'New Device Login',
          description: 'Login from a new device was successful',
        }
      ];

      setLoginAttempts(mockAttempts);
      setInsights(mockInsights);
    } catch (error) {
      toast({
        title: "Failed to load analytics",
        description: "Unable to retrieve authentication analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'oauth':
        return <Globe className="w-4 h-4" />;
      case 'magic_link':
        return <Clock className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      oauth: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      magic_link: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    };
    
    return (
      <Badge variant="secondary" className={colors[method as keyof typeof colors]}>
        {method.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600 dark:text-green-400' };
    if (score < 70) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'High', color: 'text-red-600 dark:text-red-400' };
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const successfulLogins = loginAttempts.filter(a => a.success).length;
  const failedLogins = loginAttempts.filter(a => a.success === false).length;
  const uniqueLocations = new Set(loginAttempts.map(a => a.location)).size;

  return (
    <div className={className}>
      <div className="grid gap-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {successfulLogins}
                  </p>
                  <p className="text-xs text-muted-foreground">Successful Logins</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {failedLogins}
                  </p>
                  <p className="text-xs text-muted-foreground">Failed Attempts</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{uniqueLocations}</p>
                  <p className="text-xs text-muted-foreground">Unique Locations</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Security Insights
            </CardTitle>
            <CardDescription>
              Real-time security analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20"
              >
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                {insight.action && (
                  <Button variant="outline" size="sm">
                    {insight.action}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Authentication Activity
                </CardTitle>
                <CardDescription>
                  Your recent login attempts and security events
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Show Details
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={loadAnalytics}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loginAttempts.map((attempt) => {
                const risk = getRiskLevel(attempt.risk_score);
                return (
                  <div 
                    key={attempt.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        attempt.success ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      
                      <div className="flex items-center gap-2">
                        {getMethodIcon(attempt.method)}
                        {getMethodBadge(attempt.method)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium">
                            {attempt.success ? 'Successful login' : 'Failed attempt'}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(attempt.timestamp))} ago
                          </span>
                        </div>
                        
                        {showDetails && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {attempt.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Monitor className="w-3 h-3" />
                              {attempt.device}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {attempt.ip_address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Risk Level</div>
                      <div className={`text-sm font-medium ${risk.color}`}>
                        {risk.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}