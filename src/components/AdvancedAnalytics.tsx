import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Target,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  PieChart,
  LineChart,
  Activity,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  revenue: number;
  projects: number;
  efficiency: number;
  costs: number;
}

interface KPI {
  name: string;
  value: string;
  change: number;
  target: number;
  icon: React.ComponentType<any>;
  color: string;
}

export function AdvancedAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  const kpis: KPI[] = [
    {
      name: "Revenue Growth",
      value: "£125,000",
      change: 12.5,
      target: 15,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      name: "Project Efficiency",
      value: "87%",
      change: 5.2,
      target: 90,
      icon: Target,
      color: "text-blue-600"
    },
    {
      name: "Team Utilization",
      value: "92%",
      change: -2.1,
      target: 85,
      icon: Users,
      color: "text-purple-600"
    },
    {
      name: "Cost Variance",
      value: "8.3%",
      change: -1.5,
      target: 5,
      icon: AlertTriangle,
      color: "text-orange-600"
    }
  ];

  const projectMetrics = [
    { name: "Commercial Projects", completed: 15, active: 5, pipeline: 8, revenue: 425000 },
    { name: "Residential Projects", completed: 23, active: 7, pipeline: 12, revenue: 380000 },
    { name: "Infrastructure", completed: 8, active: 3, pipeline: 4, revenue: 650000 },
    { name: "Maintenance", completed: 45, active: 12, pipeline: 15, revenue: 125000 }
  ];

  const performanceTrends = [
    { metric: "On-time Delivery", current: 88, previous: 85, target: 95 },
    { metric: "Budget Adherence", current: 92, previous: 89, target: 95 },
    { metric: "Quality Score", current: 94, previous: 91, target: 98 },
    { metric: "Client Satisfaction", current: 89, previous: 87, target: 90 },
    { metric: "Safety Score", current: 96, previous: 94, target: 100 }
  ];

  const costBreakdown = [
    { category: "Labor", amount: 450000, percentage: 45, trend: 2.1 },
    { category: "Materials", amount: 320000, percentage: 32, trend: -1.5 },
    { category: "Equipment", amount: 130000, percentage: 13, trend: 0.8 },
    { category: "Subcontractors", amount: 100000, percentage: 10, trend: 3.2 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.name}</p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Target: {kpi.target}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Revenue trend visualization</p>
                  <p className="text-sm">Chart integration ready</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Project Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Project type distribution</p>
                  <p className="text-sm">Chart integration ready</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projectMetrics.map((project, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant="outline">
                        £{project.revenue.toLocaleString()} revenue
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="font-bold text-green-600">{project.completed}</div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="font-bold text-blue-600">{project.active}</div>
                        <div className="text-muted-foreground">Active</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="font-bold text-orange-600">{project.pipeline}</div>
                        <div className="text-muted-foreground">Pipeline</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceTrends.map((trend, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{trend.metric}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={trend.current >= trend.target ? "default" : "secondary"}>
                          {trend.current}%
                        </Badge>
                        <span className={`text-sm ${
                          trend.current > trend.previous ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trend.current > trend.previous ? '+' : ''}
                          {(trend.current - trend.previous).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={trend.current} className="h-3" />
                      <div 
                        className="absolute top-0 w-0.5 h-3 bg-red-500 opacity-50"
                        style={{ left: `${trend.target}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Previous: {trend.previous}%</span>
                      <span>Target: {trend.target}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {costBreakdown.map((cost, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{cost.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          £{cost.amount.toLocaleString()}
                        </span>
                        <Badge variant="outline">{cost.percentage}%</Badge>
                        <span className={`text-sm ${
                          cost.trend > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {cost.trend > 0 ? '+' : ''}{cost.trend}%
                        </span>
                      </div>
                    </div>
                    <Progress value={cost.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Business Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Trend analysis visualization</p>
                  <p className="text-sm">Chart integration ready</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Revenue Forecast</h4>
                  <p className="text-sm text-blue-700">
                    Based on current trends, projected revenue for next quarter: £180,000
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Efficiency Opportunity</h4>
                  <p className="text-sm text-green-700">
                    Optimizing schedule allocation could improve efficiency by 8%
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900">Cost Alert</h4>
                  <p className="text-sm text-orange-700">
                    Material costs trending 15% above budget - review suppliers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}