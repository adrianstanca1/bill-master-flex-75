import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Users, BarChart3, Shield, Briefcase, Calculator, Bot, Settings, Clock } from 'lucide-react';

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'enhanced' | 'integrated';
  category: string;
}

export function CompletedFeaturesList() {
  const features: Feature[] = [
    {
      name: 'Invoice Management',
      description: 'Complete invoice creation, tracking, status management with PDF export capabilities',
      icon: <FileText className="h-5 w-5" />,
      status: 'completed',
      category: 'Financial'
    },
    {
      name: 'Quote System',
      description: 'Quote creation, preview, send/download functionality with client management',
      icon: <Calculator className="h-5 w-5" />,
      status: 'enhanced',
      category: 'Financial'
    },
    {
      name: 'Client Management',
      description: 'Comprehensive client database with search, filtering, and relationship tracking',
      icon: <Users className="h-5 w-5" />,
      status: 'completed',
      category: 'CRM'
    },
    {
      name: 'Project Tracking',
      description: 'Advanced project management with progress tracking, milestones, and budget monitoring',
      icon: <Briefcase className="h-5 w-5" />,
      status: 'completed',
      category: 'Operations'
    },
    {
      name: 'Business Analytics',
      description: 'Real-time dashboards with KPIs, revenue tracking, and performance metrics',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'enhanced',
      category: 'Analytics'
    },
    {
      name: 'Security Dashboard',
      description: 'Advanced security monitoring, audit logging, and threat detection',
      icon: <Shield className="h-5 w-5" />,
      status: 'completed',
      category: 'Security'
    },
    {
      name: 'AI Agents System',
      description: 'Intelligent business advisors and automated workflow assistants',
      icon: <Bot className="h-5 w-5" />,
      status: 'integrated',
      category: 'AI/Automation'
    },
    {
      name: 'User Authentication',
      description: 'Secure login system with role-based access control and session management',
      icon: <Settings className="h-5 w-5" />,
      status: 'completed',
      category: 'Security'
    },
    {
      name: 'Expense Tracking',
      description: 'Expense management with receipt uploads and categorization',
      icon: <Calculator className="h-5 w-5" />,
      status: 'completed',
      category: 'Financial'
    },
    {
      name: 'HR Management',
      description: 'Employee management, timesheet tracking, and payroll processing',
      icon: <Users className="h-5 w-5" />,
      status: 'completed',
      category: 'HR'
    },
    {
      name: 'Reporting System',
      description: 'Comprehensive business reports with data visualization and export capabilities',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'enhanced',
      category: 'Analytics'
    },
    {
      name: 'Time Tracking',
      description: 'Project-based time logging with productivity analytics',
      icon: <Clock className="h-5 w-5" />,
      status: 'integrated',
      category: 'Operations'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'enhanced': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'integrated': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Financial': return 'bg-green-100 text-green-800';
      case 'CRM': return 'bg-blue-100 text-blue-800';
      case 'Operations': return 'bg-orange-100 text-orange-800';
      case 'Analytics': return 'bg-purple-100 text-purple-800';
      case 'Security': return 'bg-red-100 text-red-800';
      case 'AI/Automation': return 'bg-yellow-100 text-yellow-800';
      case 'HR': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient">System Features Complete</h2>
        <p className="text-muted-foreground">
          Your construction business management platform is fully operational with {features.length} core features
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="pro-card">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {features.filter(f => f.status === 'completed').length}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="pro-card">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {features.filter(f => f.status === 'enhanced').length}
            </p>
            <p className="text-sm text-muted-foreground">Enhanced</p>
          </CardContent>
        </Card>
        
        <Card className="pro-card">
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {features.filter(f => f.status === 'integrated').length}
            </p>
            <p className="text-sm text-muted-foreground">Integrated</p>
          </CardContent>
        </Card>
        
        <Card className="pro-card">
          <CardContent className="p-4 text-center">
            <Briefcase className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-600">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Features by Category */}
      {categories.map((category) => (
        <Card key={category} className="elevated-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getCategoryColor(category)}>
                {category}
              </Badge>
              <span>Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features
                .filter(feature => feature.category === category)
                .map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-muted">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{feature.name}</h4>
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* System Status */}
      <Card className="elevated-card border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">System Ready for Production</h3>
              <p className="text-green-700">
                All core business features are implemented and fully functional. Your construction management platform is ready for live deployment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}