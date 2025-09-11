import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useSecureLogging } from '@/hooks/useSecureLogging';
import { Shield, AlertTriangle, Activity, Clock } from 'lucide-react';

interface AgentInteraction {
  id: string;
  agent_id: string;
  agent_type: string;
  interaction_type: string;
  status: string;
  duration_ms: number;
  metadata: any;
  created_at: string;
}

export function SecurityAgentMonitor() {
  const [interactions, setInteractions] = useState<AgentInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);
  const { logSuspiciousActivity } = useSecureLogging();

  useEffect(() => {
    fetchAgentInteractions();
    const interval = setInterval(fetchAgentInteractions, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAgentInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch agent interactions:', error);
        return;
      }

      setInteractions(data || []);
      analyzeSuspiciousActivity(data || []);
    } catch (error) {
      console.error('Error fetching agent interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSuspiciousActivity = async (data: AgentInteraction[]) => {
    const recentInteractions = data.filter(
      interaction => new Date(interaction.created_at) > new Date(Date.now() - 5 * 60 * 1000)
    );

    // Detect rapid-fire requests from same agent
    const agentCounts = recentInteractions.reduce((acc, interaction) => {
      acc[interaction.agent_id] = (acc[interaction.agent_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const suspiciousAgents = Object.entries(agentCounts).filter(([_, count]) => count > 10);
    
    if (suspiciousAgents.length > 0) {
      setSuspiciousActivity(suspiciousAgents.length);
      
      // Log suspicious activity
      await logSuspiciousActivity('rapid_agent_requests', {
        suspicious_agents: suspiciousAgents,
        total_interactions: recentInteractions.length,
        time_window: '5_minutes'
      });
    } else {
      setSuspiciousActivity(0);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      timeout: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'monitoring': return <Activity className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Activity Monitor</CardTitle>
          <CardDescription>Loading agent interactions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {suspiciousActivity > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Detected {suspiciousActivity} suspicious agent(s) with high request frequency. 
            Activity has been logged for review.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Agent Activity Monitor
          </CardTitle>
          <CardDescription>
            Recent agent interactions and security monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {interactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No agent interactions found
              </div>
            ) : (
              interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getAgentTypeIcon(interaction.agent_type)}
                    <div>
                      <div className="font-medium">
                        {interaction.agent_type} • {interaction.interaction_type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Agent: {interaction.agent_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(interaction.status)}>
                      {interaction.status}
                    </Badge>
                    {interaction.duration_ms && (
                      <span className="text-sm text-muted-foreground">
                        {interaction.duration_ms}ms
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(interaction.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}