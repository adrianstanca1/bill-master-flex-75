
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, MessageSquare, Settings, Play, Pause, BarChart3, Brain, FileText, Calculator, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AgentChat from '@/components/AgentChat';
import { AdvisorAgent } from '@/components/AdvisorAgent';

interface Agent {
  id: string;
  name: string;
  type: 'assistant' | 'analyzer' | 'generator' | 'monitor';
  status: 'active' | 'inactive' | 'training' | 'error';
  description: string;
  icon: React.ComponentType<any>;
  lastUsed?: string;
  totalInteractions: number;
  successRate: number;
  capabilities: string[];
}

export function AgentsDashboard() {
  const { toast } = useToast();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [agents] = useState<Agent[]>([
    {
      id: 'invoice-agent',
      name: 'Invoice Agent',
      type: 'analyzer',
      status: 'active',
      description: 'Analyzes invoices, finds overdue amounts, and drafts client emails',
      icon: FileText,
      lastUsed: '2 hours ago',
      totalInteractions: 156,
      successRate: 94,
      capabilities: ['Invoice Analysis', 'Overdue Detection', 'Email Drafting', 'Cash Flow Analysis']
    },
    {
      id: 'business-advisor',
      name: 'Business Advisor',
      type: 'assistant',
      status: 'active',
      description: 'Provides business advice, strategy recommendations, and operational insights',
      icon: Brain,
      lastUsed: '1 hour ago',
      totalInteractions: 89,
      successRate: 97,
      capabilities: ['Strategic Planning', 'Risk Assessment', 'Performance Analysis', 'Growth Planning']
    },
    {
      id: 'quote-bot',
      name: 'Quote Bot',
      type: 'generator',
      status: 'active',
      description: 'Generates detailed quotes with materials and labor calculations',
      icon: Calculator,
      lastUsed: '30 minutes ago',
      totalInteractions: 203,
      successRate: 91,
      capabilities: ['Quote Generation', 'Material Costing', 'Margin Calculation', 'Competitive Analysis']
    },
    {
      id: 'tender-bot',
      name: 'Tender Bot',
      type: 'analyzer',
      status: 'inactive',
      description: 'Scrapes and analyzes tender opportunities from various sources',
      icon: Search,
      lastUsed: '1 day ago',
      totalInteractions: 45,
      successRate: 88,
      capabilities: ['Web Scraping', 'Tender Analysis', 'Opportunity Scoring', 'Document Extraction']
    },
    {
      id: 'tax-bot',
      name: 'Tax Bot',
      type: 'analyzer',
      status: 'active',
      description: 'Calculates taxes, VAT, and provides compliance guidance',
      icon: Calculator,
      lastUsed: '4 hours ago',
      totalInteractions: 67,
      successRate: 99,
      capabilities: ['Tax Calculation', 'VAT Processing', 'Compliance Check', 'CIS Calculations']
    },
    {
      id: 'security-monitor',
      name: 'Security Monitor',
      type: 'monitor',
      status: 'active',
      description: 'Monitors system security, detects threats, and ensures compliance',
      icon: Shield,
      lastUsed: 'Real-time',
      totalInteractions: 2340,
      successRate: 96,
      capabilities: ['Threat Detection', 'Audit Logging', 'Policy Enforcement', 'Risk Assessment']
    }
  ]);

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleAgent = (agentId: string) => {
    toast({
      title: "Agent Status Updated",
      description: `Agent ${agentId} has been toggled`,
    });
  };

  const testAgent = (agentId: string) => {
    setActiveAgent(agentId);
    toast({
      title: "Testing Agent",
      description: `Running test for ${agentId}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agents Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {agents.filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {agents.reduce((sum, a) => sum + a.totalInteractions, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Interactions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Success Rate</div>
            </div>
          </div>

          <div className="grid gap-4">
            {agents.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <div key={agent.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.capabilities.slice(0, 3).map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAgent(agent.id)}
                      >
                        {agent.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Used:</span>
                      <div className="font-medium">{agent.lastUsed}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Interactions:</span>
                      <div className="font-medium">{agent.totalInteractions}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <div className="font-medium">{agent.successRate}%</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => testAgent(agent.id)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {activeAgent && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Testing Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chat" className="w-full">
              <TabsList>
                <TabsTrigger value="chat">Chat Interface</TabsTrigger>
                <TabsTrigger value="advisor">Business Advisor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="space-y-4">
                <AgentChat />
              </TabsContent>
              
              <TabsContent value="advisor" className="space-y-4">
                <AdvisorAgent />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
