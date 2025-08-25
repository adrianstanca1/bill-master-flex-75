import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  FileText, 
  Camera, 
  Users, 
  Settings,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  status: 'active' | 'coming-soon';
  path?: string;
}

export function SimpleToolManager() {
  const tools: Tool[] = [
    {
      id: 'tax-calculator',
      name: 'Tax Calculator',
      description: 'Calculate income tax, VAT, and National Insurance',
      icon: <Calculator className="h-5 w-5" />,
      category: 'Finance',
      status: 'active',
      path: '/tools/tax'
    },
    {
      id: 'invoice-generator',
      name: 'Invoice Generator',
      description: 'Create and manage professional invoices',
      icon: <FileText className="h-5 w-5" />,
      category: 'Finance',
      status: 'active',
      path: '/invoices'
    },
    {
      id: 'site-photos',
      name: 'Site Photos',
      description: 'Manage construction site photography',
      icon: <Camera className="h-5 w-5" />,
      category: 'Project',
      status: 'active',
      path: '/site-manager'
    },
    {
      id: 'employee-manager',
      name: 'Employee Manager',
      description: 'Manage employee records and timesheets',
      icon: <Users className="h-5 w-5" />,
      category: 'HR',
      status: 'active',
      path: '/hr'
    },
    {
      id: 'project-tracker',
      name: 'Project Tracker',
      description: 'Track project progress and timelines',
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'Project',
      status: 'active',
      path: '/projects'
    },
    {
      id: 'security-dashboard',
      name: 'Security Dashboard',
      description: 'Monitor system security and compliance',
      icon: <Shield className="h-5 w-5" />,
      category: 'Security',
      status: 'active',
      path: '/security'
    },
    {
      id: 'time-tracker',
      name: 'Advanced Time Tracker',
      description: 'Enhanced time tracking with GPS',
      icon: <Clock className="h-5 w-5" />,
      category: 'HR',
      status: 'coming-soon'
    },
    {
      id: 'advanced-reporting',
      name: 'Advanced Reporting',
      description: 'Generate detailed business reports',
      icon: <Settings className="h-5 w-5" />,
      category: 'Analytics',
      status: 'coming-soon'
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  const handleToolClick = (tool: Tool) => {
    if (tool.status === 'active' && tool.path) {
      window.location.href = tool.path;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Business Tools</h1>
        <p className="text-muted-foreground">Essential tools for construction business management</p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools
              .filter(tool => tool.category === category)
              .map(tool => (
                <Card 
                  key={tool.id} 
                  className={`cursor-pointer transition-shadow hover:shadow-md ${
                    tool.status === 'coming-soon' ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleToolClick(tool)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      {tool.icon}
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </div>
                    <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                      {tool.status === 'active' ? 'Active' : 'Coming Soon'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    {tool.status === 'active' && (
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        Launch Tool
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}