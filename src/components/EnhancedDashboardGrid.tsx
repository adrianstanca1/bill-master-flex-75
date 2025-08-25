import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Users,
  FileText,
  Clock,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useNavigate } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  icon: React.ComponentType<any>;
  onClick?: () => void;
  color?: string;
  subtitle?: string;
}

export function EnhancedDashboardGrid() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const { 
    totalRevenue, 
    pendingInvoices, 
    overdueAmount, 
    activeProjects,
    loading,
    error 
  } = useDashboardStats();

  const primaryMetrics: MetricCard[] = [
    {
      title: "Monthly Revenue",
      value: `£${totalRevenue.toLocaleString()}`,
      change: { value: 12.5, isPositive: true },
      icon: DollarSign,
      onClick: () => navigate('/business-manager'),
      color: "text-green-600",
      subtitle: "vs last month"
    },
    {
      title: "Active Projects",
      value: activeProjects,
      change: { value: 3, isPositive: true },
      icon: Target,
      onClick: () => navigate('/projects'),
      color: "text-blue-600",
      subtitle: "ongoing"
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices,
      icon: FileText,
      onClick: () => navigate('/invoices'),
      color: "text-orange-600",
      subtitle: "awaiting payment"
    },
    {
      title: "Overdue Amount",
      value: `£${overdueAmount.toLocaleString()}`,
      change: { value: -8.2, isPositive: false },
      icon: AlertTriangle,
      onClick: () => navigate('/invoices'),
      color: "text-red-600",
      subtitle: "requires attention"
    }
  ];

  const performanceMetrics = [
    { label: "Project Completion Rate", value: 92, target: 95, color: "bg-green-500" },
    { label: "Client Satisfaction", value: 88, target: 90, color: "bg-blue-500" },
    { label: "On-time Delivery", value: 85, target: 90, color: "bg-yellow-500" },
    { label: "Budget Adherence", value: 78, target: 85, color: "bg-purple-500" }
  ];

  const recentActivities = [
    { id: 1, action: "Invoice #1234 paid", amount: "£12,500", time: "2 hours ago", type: "payment" },
    { id: 2, action: "New project started", client: "ABC Construction", time: "4 hours ago", type: "project" },
    { id: 3, action: "Quote approved", amount: "£8,750", time: "6 hours ago", type: "quote" },
    { id: 4, action: "Employee timesheet submitted", employee: "John Doe", time: "1 day ago", type: "timesheet" }
  ];

  const upcomingTasks = [
    { id: 1, title: "Submit monthly VAT return", due: "Tomorrow", priority: "high" },
    { id: 2, title: "Safety inspection - Site A", due: "2 days", priority: "medium" },
    { id: 3, title: "Client meeting - Project X", due: "3 days", priority: "high" },
    { id: 4, title: "Equipment maintenance check", due: "1 week", priority: "low" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryMetrics.map((metric, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={metric.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  {metric.subtitle && (
                    <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-muted group-hover:scale-110 transition-transform`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
              
              {metric.change && (
                <div className="flex items-center mt-4">
                  {metric.change.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.change.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change.isPositive ? '+' : ''}{metric.change.value}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Views */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Revenue analytics visualization</p>
                  <p className="text-sm">Chart integration ready</p>
                </div>
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-medium">15 projects</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>In Progress</span>
                    <span className="font-medium">{activeProjects} projects</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Planning</span>
                    <span className="font-medium">3 projects</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {metric.value}% / {metric.target}%
                      </span>
                      <Badge variant={metric.value >= metric.target ? "default" : "secondary"}>
                        {metric.value >= metric.target ? "On Target" : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={metric.value} className="h-3" />
                    <div 
                      className="absolute top-0 w-0.5 h-3 bg-red-500 opacity-50"
                      style={{ left: `${metric.target}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                        activity.type === 'project' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'quote' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
                        {activity.type === 'project' && <Target className="h-4 w-4" />}
                        {activity.type === 'quote' && <FileText className="h-4 w-4" />}
                        {activity.type === 'timesheet' && <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    {activity.amount && (
                      <Badge variant="outline">{activity.amount}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={
                              task.priority === 'high' ? 'destructive' : 
                              task.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Due: {task.due}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}