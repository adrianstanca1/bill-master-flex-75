import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Shield, 
  AlertTriangle,
  LogOut,
  MapPin,
  Clock,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
  created_at: string;
}

interface SessionManagerProps {
  className?: string;
}

export function SessionManager({ className }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Mock session data - in a real app, this would come from your backend
      const mockSessions: Session[] = [
        {
          id: 'current',
          device_type: 'desktop',
          browser: 'Chrome 120 on Windows',
          location: 'London, UK',
          ip_address: '192.168.1.1',
          last_active: new Date().toISOString(),
          is_current: true,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: 'mobile-1',
          device_type: 'mobile',
          browser: 'Safari on iPhone',
          location: 'Manchester, UK',
          ip_address: '192.168.1.2',
          last_active: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          is_current: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
          id: 'tablet-1',
          device_type: 'tablet',
          browser: 'Chrome on iPad',
          location: 'Birmingham, UK',
          ip_address: '10.0.0.1',
          last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          is_current: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 1 week ago
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      toast({
        title: "Failed to load sessions",
        description: "Unable to retrieve session information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      // Mock session revocation - in a real app, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      toast({
        title: "Session revoked",
        description: "The selected session has been terminated",
      });
    } catch (error) {
      toast({
        title: "Failed to revoke session",
        description: "Unable to terminate the session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    setRevoking('all');
    try {
      // Mock revoking all other sessions
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSessions(prev => prev.filter(s => s.is_current));
      
      toast({
        title: "All other sessions revoked",
        description: "You've been signed out of all other devices",
      });
    } catch (error) {
      toast({
        title: "Failed to revoke sessions",
        description: "Unable to revoke other sessions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceTypeColor = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'tablet':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading sessions...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Active Sessions</CardTitle>
          </div>
          <CardDescription>
            Manage your active sessions across all devices. You can revoke access from any device at any time.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {sessions.length > 1 && (
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  You're signed in on {sessions.length} devices
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={revokeAllOtherSessions}
                disabled={revoking === 'all'}
              >
                {revoking === 'all' ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <LogOut className="w-3 h-3 mr-1" />
                    Sign out all others
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(session.device_type)}
                    <Badge variant="secondary" className={getDeviceTypeColor(session.device_type)}>
                      {session.device_type}
                    </Badge>
                    {session.is_current && (
                      <Badge variant="default" className="bg-green-500 text-white">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">{session.browser}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last active {formatDistanceToNow(new Date(session.last_active))} ago
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {session.ip_address}
                      </span>
                    </div>
                  </div>
                </div>

                {!session.is_current && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => revokeSession(session.id)}
                    disabled={revoking === session.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    {revoking === session.id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-3 h-3 mr-1" />
                        Revoke
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <p>🔒 Sessions are automatically expired after 30 days of inactivity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}