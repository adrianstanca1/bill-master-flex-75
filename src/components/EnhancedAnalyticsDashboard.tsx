import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Download
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface AnalyticsData {
  revenue: Array<{ month: string; amount: number; target: number }>;
  clients: Array<{ month: string; new: number; retained: number }>;
  projects: Array<{ status: string; count: number; value: number }>;
  performance: Array<{ metric: string; current: number; target: number; trend: 'up' | 'down' }>;
}

export function EnhancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('6m');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        revenue: [
          { month: 'Jan', amount: 45000, target: 50000 },
          { month: 'Feb', amount: 52000, target: 50000 },
          { month: 'Mar', amount: 48000, target: 55000 },
          { month: 'Apr', amount: 61000, target: 55000 },
          { month: 'May', amount: 58000, target: 60000 },
          { month: 'Jun', amount: 67000, target: 60000 }
        ],
        clients: [
          { month: 'Jan', new: 8, retained: 45 },
          { month: 'Feb', new: 12, retained: 48 },
          { month: 'Mar', new: 6, retained: 52 },
          { month: 'Apr', new: 15, retained: 58 },
          { month: 'May', new: 9, retained: 61 },
          { month: 'Jun', new: 18, retained: 67 }
        ],
        projects: [
          { status: 'Completed', count: 24, value: 156000 },
          { status: 'In Progress', count: 12, value: 89000 },
          { status: 'Planning', count: 8, value: 67000 },
          { status: 'On Hold', count: 3, value: 23000 }
        ],
        performance: [
          { metric: 'Revenue Growth', current: 18.5, target: 20, trend: 'up' },
          { metric: 'Client Retention', current: 92.3, target: 90, trend: 'up' },
          { metric: 'Project Completion', current: 87.2, target: 85, trend: 'up' },
          { metric: 'Profit Margin', current: 24.8, target: 25, trend: 'down' }
        ]
      };
      
      setData(mockData);
      setIsLoading(false);
    };

    loadData();
  }, [timeRange]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            {['1m', '3m', '6m', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="px-3"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.performance.map((metric, index) => (
              <Card key={metric.metric}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {metric.current}%
                    </p>
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.target}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue vs Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={data?.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`£${value.toLocaleString()}`, '']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#94A3B8" 
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Project Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value: number, name) => [
                        `${value} projects`,
                        name
                      ]}
                    />
                    <Pie
                      data={data?.projects}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {data?.projects.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {data?.projects.map((project, index) => (
                    <div key={project.status} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{project.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data?.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`£${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="amount" fill="#3B82F6" name="Actual Revenue" />
                  <Bar dataKey="target" fill="#94A3B8" name="Target Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={data?.clients}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="new" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="New Clients"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="retained" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Total Clients"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.projects.map((project, index) => (
              <Card key={project.status}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: COLORS[index % COLORS.length],
                        color: COLORS[index % COLORS.length]
                      }}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{project.count}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                    <p className="text-lg font-semibold text-green-600">
                      £{project.value.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}