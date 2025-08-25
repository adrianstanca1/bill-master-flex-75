import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator,
  Calendar,
  FileText,
  TrendingUp,
  Zap,
  Bot,
  Brain,
  Settings,
  Clock,
  DollarSign,
  Target,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Wrench,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  usage: number;
  isAI: boolean;
  status: 'active' | 'maintenance' | 'new';
}

export function SmartToolsPanel() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('tools');

  const tools: Tool[] = [
    {
      id: 'vat-calculator',
      name: 'VAT Calculator',
      description: 'Calculate VAT for invoices and expenses',
      icon: Calculator,
      category: 'finance',
      usage: 85,
      isAI: false,
      status: 'active'
    },
    {
      id: 'project-estimator',
      name: 'AI Project Estimator',
      description: 'Generate accurate project cost estimates using AI',
      icon: Brain,
      category: 'estimation',
      usage: 92,
      isAI: true,
      status: 'new'
    },
    {
      id: 'schedule-optimizer',
      name: 'Schedule Optimizer',
      description: 'Optimize project schedules and resource allocation',
      icon: Calendar,
      category: 'planning',
      usage: 78,
      isAI: true,
      status: 'active'
    },
    {
      id: 'risk-analyzer',
      name: 'Risk Analyzer',
      description: 'Identify and assess project risks',
      icon: AlertTriangle,
      category: 'analysis',
      usage: 65,
      isAI: true,
      status: 'active'
    },
    {
      id: 'performance-tracker',
      name: 'Performance Tracker',
      description: 'Track team and project performance metrics',
      icon: BarChart3,
      category: 'analytics',
      usage: 88,
      isAI: false,
      status: 'active'
    },
    {
      id: 'document-generator',
      name: 'Smart Document Generator',
      description: 'Generate contracts, reports, and documentation',
      icon: FileText,
      category: 'documentation',
      usage: 71,
      isAI: true,
      status: 'active'
    },
    {
      id: 'cost-optimizer',
      name: 'Cost Optimizer',
      description: 'Analyze and optimize project costs',
      icon: DollarSign,
      category: 'finance',
      usage: 59,
      isAI: true,
      status: 'maintenance'
    },
    {
      id: 'team-manager',
      name: 'Team Manager',
      description: 'Manage team assignments and workload',
      icon: Users,
      category: 'management',
      usage: 82,
      isAI: false,
      status: 'active'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tools', count: tools.length },
    { id: 'finance', name: 'Finance', count: tools.filter(t => t.category === 'finance').length },
    { id: 'planning', name: 'Planning', count: tools.filter(t => t.category === 'planning').length },
    { id: 'analytics', name: 'Analytics', count: tools.filter(t => t.category === 'analytics').length },
    { id: 'management', name: 'Management', count: tools.filter(t => t.category === 'management').length },
    { id: 'ai', name: 'AI Tools', count: tools.filter(t => t.isAI).length }
  ];

  const recentUsage = [
    { tool: 'VAT Calculator', uses: 15, trend: 'up' },
    { tool: 'Project Estimator', uses: 12, trend: 'up' },
    { tool: 'Schedule Optimizer', uses: 8, trend: 'down' },
    { tool: 'Performance Tracker', uses: 6, trend: 'up' }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          tool.category === selectedCategory ||
                          (selectedCategory === 'ai' && tool.isAI);
    return matchesSearch && matchesCategory;
  });

  const handleToolLaunch = (tool: Tool) => {
    if (tool.status === 'maintenance') {
      toast({
        title: "Tool Under Maintenance",
        description: `${tool.name} is currently under maintenance. Please try again later.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tool Launched",
      description: `${tool.name} is starting...`,
    });

    // Here you would navigate to the specific tool or open it in a modal
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Tools</h2>
          <p className="text-muted-foreground">AI-powered tools to streamline your workflow</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Tools
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">Available Tools</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-all group cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        tool.isAI ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {tool.isAI && (
                            <Badge variant="secondary" className="text-xs">
                              <Bot className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          <Badge 
                            variant={
                              tool.status === 'active' ? 'default' :
                              tool.status === 'new' ? 'secondary' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {tool.status === 'new' ? 'NEW' : tool.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage</span>
                      <span className="font-medium">{tool.usage}%</span>
                    </div>
                    <Progress value={tool.usage} className="h-2" />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleToolLaunch(tool)}
                    disabled={tool.status === 'maintenance'}
                  >
                    {tool.status === 'maintenance' ? (
                      <>
                        <Wrench className="h-4 w-4 mr-2" />
                        Under Maintenance
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Launch Tool
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Most Used Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsage.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{item.tool}</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                        )}
                      </div>
                      <Badge variant="outline">{item.uses} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Tool Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Usage analytics visualization</p>
                  <p className="text-sm">Chart integration ready</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-8">
                <Brain className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Workflow Assistant</h3>
                <p className="text-muted-foreground mb-4">
                  Get intelligent suggestions and automate complex tasks
                </p>
                <Button>
                  <Bot className="h-4 w-4 mr-2" />
                  Start AI Session
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Smart Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered recommendations for project optimization
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Automated Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate comprehensive reports with natural language
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}