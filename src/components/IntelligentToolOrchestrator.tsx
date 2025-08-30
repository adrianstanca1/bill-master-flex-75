import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Zap, 
  Target, 
  Cpu, 
  BarChart3, 
  Settings, 
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ToolWorkflow {
  id: string;
  name: string;
  description: string;
  tools: string[];
  status: 'active' | 'paused' | 'completed' | 'failed';
  progress: number;
  priority: 'high' | 'medium' | 'low';
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  lastRun: Date;
  nextRun?: Date;
}

interface AIRecommendation {
  id: string;
  type: 'optimization' | 'automation' | 'integration' | 'security';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  tools: string[];
}

export function IntelligentToolOrchestrator() {
  const [workflows, setWorkflows] = useState<ToolWorkflow[]>([
    {
      id: 'financial-analysis',
      name: 'Daily Financial Analysis',
      description: 'Automated analysis of financial data with intelligent reporting',
      tools: ['Invoice Manager', 'Expense Tracker', 'Tax Calculator', 'Analytics'],
      status: 'active',
      progress: 75,
      priority: 'high',
      automationLevel: 'semi-auto',
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000)
    },
    {
      id: 'security-monitoring',
      name: 'Security Health Check',
      description: 'Continuous security monitoring and threat detection',
      tools: ['Security Monitor', 'Audit Logger', 'Compliance Checker'],
      status: 'active',
      progress: 100,
      priority: 'high',
      automationLevel: 'full-auto',
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      nextRun: new Date(Date.now() + 30 * 60 * 1000)
    },
    {
      id: 'project-optimization',
      name: 'Project Efficiency Optimizer',
      description: 'AI-driven project management optimization',
      tools: ['Project Tracker', 'Resource Manager', 'Timeline Optimizer'],
      status: 'paused',
      progress: 45,
      priority: 'medium',
      automationLevel: 'semi-auto',
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const [recommendations] = useState<AIRecommendation[]>([
    {
      id: 'auto-invoice',
      type: 'automation',
      title: 'Automate Invoice Generation',
      description: 'Set up automated invoice generation based on project milestones',
      confidence: 92,
      impact: 'high',
      effort: 'medium',
      tools: ['Invoice Manager', 'Project Tracker', 'Client Manager']
    },
    {
      id: 'smart-categorization',
      type: 'optimization',
      title: 'Smart Expense Categorization',
      description: 'Implement AI-powered expense categorization to reduce manual effort',
      confidence: 88,
      impact: 'medium',
      effort: 'low',
      tools: ['Expense Manager', 'Tax Calculator']
    },
    {
      id: 'predictive-analysis',
      type: 'integration',
      title: 'Predictive Cash Flow Analysis',
      description: 'Enable predictive analytics for better financial planning',
      confidence: 85,
      impact: 'high',
      effort: 'high',
      tools: ['Analytics', 'Financial Summary', 'Project Tracker']
    },
    {
      id: 'security-automation',
      type: 'security',
      title: 'Enhanced Security Automation',
      description: 'Implement automated security response protocols',
      confidence: 95,
      impact: 'high',
      effort: 'medium',
      tools: ['Security Monitor', 'Alert System', 'Audit Logger']
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused': return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'completed': return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'automation': return <Zap className="w-4 h-4" />;
      case 'integration': return <Target className="w-4 h-4" />;
      case 'security': return <AlertCircle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const runWorkflow = async (workflowId: string) => {
    toast({
      title: "Workflow Started",
      description: "Intelligent workflow orchestration initiated...",
    });

    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'active', progress: 0, lastRun: new Date() }
        : w
    ));

    // Simulate workflow progress
    const interval = setInterval(() => {
      setWorkflows(prev => prev.map(w => {
        if (w.id === workflowId && w.status === 'active') {
          const newProgress = Math.min(100, w.progress + 25);
          return {
            ...w,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'active'
          };
        }
        return w;
      }));
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      toast({
        title: "Workflow Complete",
        description: "All tools have been successfully orchestrated.",
      });
    }, 4000);
  };

  const pauseWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'paused' } : w
    ));

    toast({
      title: "Workflow Paused",
      description: "Workflow execution has been paused.",
    });
  };

  const implementRecommendation = async (recommendationId: string) => {
    toast({
      title: "Implementing AI Recommendation",
      description: "Setting up intelligent automation...",
    });

    // Simulate implementation
    setTimeout(() => {
      toast({
        title: "Recommendation Implemented",
        description: "AI-powered enhancement has been successfully configured.",
      });
    }, 3000);
  };

  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalRecommendations = recommendations.length;
  const highImpactRecommendations = recommendations.filter(r => r.impact === 'high').length;

  return (
    <div className="space-y-6">
      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              {workflows.length} total workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              {highImpactRecommendations} high impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Level</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Tools automated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+42%</div>
            <p className="text-xs text-muted-foreground">
              vs manual processes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList>
          <TabsTrigger value="workflows">Smart Workflows</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="orchestration">Tool Orchestration</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(workflow.status)}
                      <h3 className="font-semibold">{workflow.name}</h3>
                      {getStatusBadge(workflow.status)}
                      <Badge variant="outline">{workflow.automationLevel}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {workflow.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {workflow.tools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {workflow.status === 'paused' && (
                      <Button size="sm" onClick={() => runWorkflow(workflow.id)}>
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    {workflow.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => pauseWorkflow(workflow.id)}>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {workflow.status === 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => runWorkflow(workflow.id)}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Run Again
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{workflow.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${workflow.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Last Run:</span>
                    <div>{workflow.lastRun.toLocaleString()}</div>
                  </div>
                  {workflow.nextRun && (
                    <div>
                      <span className="text-muted-foreground">Next Run:</span>
                      <div>{workflow.nextRun.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              AI-powered recommendations based on your usage patterns and industry best practices.
            </AlertDescription>
          </Alert>

          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getRecommendationIcon(rec.type)}
                      <h3 className="font-semibold">{rec.title}</h3>
                      <Badge variant="outline">{rec.type}</Badge>
                      <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {rec.tools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => implementRecommendation(rec.id)}>
                    Implement
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <div className="font-medium">{rec.confidence}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <div className="font-medium capitalize">{rec.impact}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Effort:</span>
                    <div className="font-medium capitalize">{rec.effort}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tool Orchestration Control</CardTitle>
              <CardDescription>
                Configure how tools work together intelligently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Workflow</label>
                    <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a workflow" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflows.map((workflow) => (
                          <SelectItem key={workflow.id} value={workflow.id}>
                            {workflow.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button 
                      onClick={() => selectedWorkflow && runWorkflow(selectedWorkflow)}
                      disabled={!selectedWorkflow}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Workflow
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Intelligent Triggers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>New project created → Auto-setup financial tracking</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Invoice overdue → Send automated reminders</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Security alert → Trigger incident response</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Monthly report due → Generate analytics</span>
                      <Badge variant="outline">Inactive</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.automationLevel} automation
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{workflow.progress}%</div>
                        <div className="text-sm text-muted-foreground">efficiency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">£2,340</div>
                    <div className="text-sm text-muted-foreground">Monthly savings</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Time saved</span>
                      <span>32 hours/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error reduction</span>
                      <span>-68%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Process efficiency</span>
                      <span>+42%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}