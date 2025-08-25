
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Bot,
  BarChart3,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AgentInteraction {
  id: string;
  agent_id: string;
  interaction_type: string;
  status: string;
  duration_ms: number;
  created_at: string;
}

interface AgentDashboardProps {
  agentId: string;
  agentName: string;
  agentDescription: string;
}

export function AgentDashboard({ agentId, agentName, agentDescription }: AgentDashboardProps) {
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['agent-interactions', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_interactions')
        .select('*')
        .eq('agent_type', agentId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  const totalInteractions = interactions.length;
  const avgResponseTime = 250; // Mock average response time
  const successRate = (interactions.filter(int => int.status === 'completed').length / Math.max(totalInteractions, 1)) * 100;

  const recentInteractions = interactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {agentName} Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">{agentDescription}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{totalInteractions}</div>
              <div className="text-sm text-muted-foreground">Total Interactions</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-yellow-50">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{avgResponseTime.toFixed(0)}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {interactions.filter(int => {
                  const today = new Date();
                  const intDate = new Date(int.created_at);
                  return intDate.toDateString() === today.toDateString();
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          ) : recentInteractions.length > 0 ? (
            <div className="space-y-4">
              {recentInteractions.map((interaction) => (
                <div key={interaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{interaction.interaction_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(interaction.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={interaction.status === 'completed' ? 'default' : 'destructive'}>
                      {interaction.status}
                    </Badge>
                     <span className="text-sm text-muted-foreground">
                       250ms
                     </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h3>
              <p className="text-gray-500">Start using this agent to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
