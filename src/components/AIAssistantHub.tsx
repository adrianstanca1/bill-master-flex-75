import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  Shield, 
  FileText,
  Calculator,
  Users,
  ChartBar,
  Sparkles,
  Bot,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAssistant {
  id: string;
  name: string;
  description: string;
  category: 'finance' | 'operations' | 'analysis' | 'communication' | 'security';
  capabilities: string[];
  status: 'available' | 'busy' | 'offline';
  usage: number;
  confidence: number;
}

interface AIInteraction {
  id: string;
  assistantId: string;
  query: string;
  response: string;
  timestamp: string;
  satisfaction: number;
  category: string;
}

export function AIAssistantHub() {
  const { toast } = useToast();
  const [assistants] = useState<AIAssistant[]>([
    {
      id: 'financial-advisor',
      name: 'Financial Advisor AI',
      description: 'Expert financial analysis, budgeting, and cash flow management',
      category: 'finance',
      capabilities: ['Cash Flow Analysis', 'Budget Planning', 'Investment Advice', 'Risk Assessment'],
      status: 'available',
      usage: 89,
      confidence: 94
    },
    {
      id: 'operations-optimizer',
      name: 'Operations Optimizer',
      description: 'Process improvement and operational efficiency recommendations',
      category: 'operations',
      capabilities: ['Process Analysis', 'Efficiency Metrics', 'Resource Optimization', 'Workflow Design'],
      status: 'available',
      usage: 76,
      confidence: 91
    },
    {
      id: 'market-analyst',
      name: 'Market Intelligence AI',
      description: 'Market trends, competitive analysis, and opportunity identification',
      category: 'analysis',
      capabilities: ['Market Research', 'Competitor Analysis', 'Trend Forecasting', 'Opportunity Mapping'],
      status: 'available',
      usage: 65,
      confidence: 88
    },
    {
      id: 'communication-specialist',
      name: 'Communication Specialist',
      description: 'Professional communication, client relations, and content creation',
      category: 'communication',
      capabilities: ['Email Drafting', 'Proposal Writing', 'Client Communication', 'Content Strategy'],
      status: 'busy',
      usage: 82,
      confidence: 96
    },
    {
      id: 'security-analyst',
      name: 'Security Compliance AI',
      description: 'Security monitoring, compliance checking, and risk mitigation',
      category: 'security',
      capabilities: ['Security Audits', 'Compliance Checks', 'Risk Monitoring', 'Policy Review'],
      status: 'available',
      usage: 71,
      confidence: 92
    }
  ]);

  const [interactions, setInteractions] = useState<AIInteraction[]>([
    {
      id: '1',
      assistantId: 'financial-advisor',
      query: 'What\'s my current cash flow position?',
      response: 'Based on recent data, your cash flow is positive with £15,240 incoming this month vs £12,890 outgoing. Key recommendations: 1) Consider investing surplus in short-term bonds, 2) Review payment terms with slow-paying clients.',
      timestamp: '2024-01-15T10:30:00Z',
      satisfaction: 5,
      category: 'Financial Analysis'
    },
    {
      id: '2',
      assistantId: 'operations-optimizer',
      query: 'How can I improve project delivery times?',
      response: 'Analysis shows 3 key bottlenecks: 1) Client approval delays (avg 4.2 days), 2) Resource allocation gaps, 3) Documentation overhead. Implementing automated approval tracking could reduce delays by 35%.',
      timestamp: '2024-01-15T09:15:00Z',
      satisfaction: 4,
      category: 'Process Improvement'
    }
  ]);

  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'finance': return <Calculator className="h-4 w-4" />;
      case 'operations': return <Zap className="h-4 w-4" />;
      case 'analysis': return <ChartBar className="h-4 w-4" />;
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const handleAskAssistant = async () => {
    if (!selectedAssistant || !query.trim()) return;

    const assistant = assistants.find(a => a.id === selectedAssistant);
    if (!assistant) return;

    setIsProcessing(true);
    try {
      // Here you would call the appropriate AI service based on assistant type
      let endpoint = 'advisor'; // Default endpoint
      if (assistant.category === 'finance') endpoint = 'agent';
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: { 
          message: query,
          context: { assistant: assistant.id, category: assistant.category }
        }
      });

      if (error) throw error;

      const newInteraction: AIInteraction = {
        id: Date.now().toString(),
        assistantId: selectedAssistant,
        query,
        response: data?.reply || 'I apologize, but I couldn\'t process your request at this time.',
        timestamp: new Date().toISOString(),
        satisfaction: 0,
        category: assistant.category
      };

      setInteractions(prev => [newInteraction, ...prev]);
      setQuery('');

      toast({
        title: "AI Response Ready",
        description: `${assistant.name} has analyzed your query`,
      });

    } catch (error: any) {
      toast({
        title: "AI Processing Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCapabilityColor = (capability: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800'];
    return colors[capability.length % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI Assistant Hub
          </h2>
          <p className="text-muted-foreground">Intelligent business assistants powered by advanced AI</p>
        </div>
      </div>

      <Tabs defaultValue="assistants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assistants">AI Assistants</TabsTrigger>
          <TabsTrigger value="interact">Ask AI</TabsTrigger>
          <TabsTrigger value="history">Interaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="assistants">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assistants.map((assistant) => (
              <Card key={assistant.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(assistant.category)}
                      <CardTitle className="text-lg">{assistant.name}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(assistant.status)}>
                      {assistant.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{assistant.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Capabilities */}
                  <div>
                    <div className="text-sm font-medium mb-2">Capabilities</div>
                    <div className="flex flex-wrap gap-1">
                      {assistant.capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline" className={`text-xs ${getCapabilityColor(capability)}`}>
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Usage Rate</div>
                      <div className="font-medium">{assistant.usage}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="font-medium">{assistant.confidence}%</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full" 
                    disabled={assistant.status !== 'available'}
                    onClick={() => {
                      setSelectedAssistant(assistant.id);
                      // Switch to interact tab
                      const interactTab = document.querySelector('[value="interact"]') as HTMLElement;
                      interactTab?.click();
                    }}
                  >
                    {assistant.status === 'available' ? 'Consult AI' : 'Currently Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Consultation Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAssistant && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">
                    Selected: {assistants.find(a => a.id === selectedAssistant)?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assistants.find(a => a.id === selectedAssistant)?.description}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Question</label>
                  <Input
                    placeholder="Ask your AI assistant anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAssistant()}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAskAssistant}
                    disabled={!selectedAssistant || !query.trim() || isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4" />
                        Ask AI
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setQuery('')}>
                    Clear
                  </Button>
                </div>
              </div>

              {!selectedAssistant && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select an AI assistant from the Assistants tab to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interactions.map((interaction) => {
                  const assistant = assistants.find(a => a.id === interaction.assistantId);
                  return (
                    <div key={interaction.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {assistant && getCategoryIcon(assistant.category)}
                          <span className="font-medium">{assistant?.name}</span>
                          <Badge variant="outline">{interaction.category}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Query:</strong> {interaction.query}
                        </div>
                        <div className="text-sm bg-muted/50 p-3 rounded">
                          <strong>AI Response:</strong> {interaction.response}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}