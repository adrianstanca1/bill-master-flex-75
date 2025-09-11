import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BusinessMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeProjects: number;
  totalClients: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueGrowth: number;
  projectCompletion: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'quote' | 'payment' | 'project';
  title: string;
  amount?: number;
  client: string;
  date: string;
  status: string;
}

export function ComprehensiveBusinessDashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalRevenue: 487500,
    monthlyRevenue: 45250,
    activeProjects: 8,
    totalClients: 24,
    pendingInvoices: 5,
    overdueInvoices: 2,
    revenueGrowth: 12.5,
    projectCompletion: 73
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      amount: 15000,
      client: 'TechCorp Ltd',
      date: '2024-01-20',
      status: 'completed'
    },
    {
      id: '2',
      type: 'invoice',
      title: 'Invoice Created',
      amount: 8500,
      client: 'Green Homes',
      date: '2024-01-19',
      status: 'sent'
    },
    {
      id: '3',
      type: 'project',
      title: 'Project Milestone',
      client: 'BuildCorp',
      date: '2024-01-18',
      status: 'completed'
    },
    {
      id: '4',
      type: 'quote',
      title: 'Quote Approved',
      amount: 25000,
      client: 'Modern Office',
      date: '2024-01-17',
      status: 'approved'
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="h-4 w-4" />;
      case 'quote': return <FileText className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'project': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'approved': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'sent': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="pro-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-gradient">
                  £{(metrics.totalRevenue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{metrics.revenueGrowth}% this month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-primary">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-gradient">{metrics.activeProjects}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3" />
                  {metrics.projectCompletion}% avg completion
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-secondary">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-gradient">{metrics.totalClients}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3" />
                  Growing network
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-primary">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invoices</p>
                <p className="text-2xl font-bold text-gradient">{metrics.pendingInvoices}</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {metrics.overdueInvoices} overdue
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-secondary">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.client}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <p className="font-semibold">£{activity.amount.toLocaleString()}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Project Completion Rate</span>
                    <span className="text-sm font-bold">{metrics.projectCompletion}%</span>
                  </div>
                  <Progress value={metrics.projectCompletion} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <span className="text-sm font-bold">{metrics.revenueGrowth}%</span>
                  </div>
                  <Progress value={metrics.revenueGrowth} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Client Satisfaction</span>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">On-time Delivery</span>
                    <span className="text-sm font-bold">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">£{metrics.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.pendingInvoices}</p>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overdue Amount</p>
                  <p className="text-2xl font-bold text-red-600">£12,500</p>
                  <p className="text-xs text-muted-foreground mt-1">{metrics.overdueInvoices} invoices</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-6">
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle>Project Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-muted-foreground">Planning</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">5</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                  <p className="text-sm text-muted-foreground">On Hold</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6 mt-6">
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle>Client Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">18</p>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">4</p>
                  <p className="text-sm text-muted-foreground">Prospects</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">2</p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}