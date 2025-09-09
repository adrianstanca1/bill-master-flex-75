import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Settings,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'ai-analysis' | 'data-fetch' | 'notification' | 'calculation' | 'approval';
  config: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
}

interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'scheduled' | 'event';
  status: 'draft' | 'active' | 'paused' | 'completed';
  steps: WorkflowStep[];
  lastRun?: string;
  nextRun?: string;
}

export function AgentWorkflowManager() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>([
    {
      id: '1',
      name: 'Daily Business Health Check',
      description: 'Automated analysis of key business metrics and alerts',
      trigger: 'scheduled',
      status: 'active',
      lastRun: '2024-01-15T08:00:00Z',
      nextRun: '2024-01-16T08:00:00Z',
      steps: [
        { id: '1', name: 'Fetch Financial Data', type: 'data-fetch', config: {}, status: 'completed', progress: 100 },
        { id: '2', name: 'AI Risk Analysis', type: 'ai-analysis', config: {}, status: 'running', progress: 65 },
        { id: '3', name: 'Generate Report', type: 'calculation', config: {}, status: 'pending', progress: 0 },
        { id: '4', name: 'Send Notifications', type: 'notification', config: {}, status: 'pending', progress: 0 }
      ]
    },
    {
      id: '2',
      name: 'Invoice Follow-up Assistant',
      description: 'Automated overdue invoice tracking and client communication',
      trigger: 'event',
      status: 'active',
      steps: [
        { id: '1', name: 'Identify Overdue Invoices', type: 'data-fetch', config: {}, status: 'completed', progress: 100 },
        { id: '2', name: 'Draft Follow-up Emails', type: 'ai-analysis', config: {}, status: 'completed', progress: 100 },
        { id: '3', name: 'Await Approval', type: 'approval', config: {}, status: 'pending', progress: 0 }
      ]
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const executeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    try {
      toast({
        title: "Workflow Started",
        description: `Executing "${workflow.name}"...`,
      });

      // Simulate workflow execution
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'active' as const, lastRun: new Date().toISOString() }
          : w
      ));

      // Here you would typically call your backend workflow engine
      const { data, error } = await supabase.functions.invoke('smartops', {
        body: { 
          action: 'execute-workflow',
          workflowId,
          config: workflow 
        }
      });

      if (error) throw error;

      toast({
        title: "Workflow Completed",
        description: `"${workflow.name}" executed successfully`,
      });

    } catch (error: any) {
      toast({
        title: "Workflow Error",
        description: error.message || "Failed to execute workflow",
        variant: "destructive"
      });
    }
  }, [workflows, toast]);

  const pauseWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'paused' as const }
        : w
    ));
    toast({
      title: "Workflow Paused",
      description: "Workflow execution has been paused",
    });
  }, [toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'running': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'draft': return 'outline';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            AI Workflow Manager
          </h2>
          <p className="text-muted-foreground">Automate business processes with intelligent workflows</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <Badge variant={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{workflow.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Workflow Steps Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(workflow.steps.reduce((acc, step) => acc + step.progress, 0) / workflow.steps.length)}%</span>
                </div>
                <Progress 
                  value={workflow.steps.reduce((acc, step) => acc + step.progress, 0) / workflow.steps.length} 
                  className="h-2"
                />
              </div>

              {/* Steps Overview */}
              <div className="space-y-1">
                {workflow.steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <span>{step.name}</span>
                    </div>
                    <span className="text-muted-foreground">{step.progress}%</span>
                  </div>
                ))}
              </div>

              {/* Workflow Info */}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div>
                  <span className="font-medium">Trigger:</span> {workflow.trigger}
                </div>
                <div>
                  <span className="font-medium">Last Run:</span> {
                    workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'
                  }
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => executeWorkflow(workflow.id)}
                  disabled={workflow.status === 'active'}
                  className="flex items-center gap-1"
                >
                  <Play className="h-3 w-3" />
                  Run
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => pauseWorkflow(workflow.id)}
                  disabled={workflow.status !== 'active'}
                  className="flex items-center gap-1"
                >
                  <Pause className="h-3 w-3" />
                  Pause
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedWorkflow(workflow.id)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Workflow Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <div className="font-medium">Cash Flow Monitor</div>
              <div className="text-xs text-muted-foreground text-left">
                Daily analysis of incoming/outgoing payments with alerts
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <div className="font-medium">Client Engagement</div>
              <div className="text-xs text-muted-foreground text-left">
                Automated follow-ups and relationship management
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <div className="font-medium">Compliance Check</div>
              <div className="text-xs text-muted-foreground text-left">
                Regular compliance monitoring and reporting
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}