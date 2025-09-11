import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  FileText,
  Users,
  Target,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const monthlyRevenueData = [
  { month: 'Jan', revenue: 45000, projects: 3, clients: 8 },
  { month: 'Feb', revenue: 52000, projects: 4, clients: 10 },
  { month: 'Mar', revenue: 48000, projects: 3, clients: 9 },
  { month: 'Apr', revenue: 61000, projects: 5, clients: 12 },
  { month: 'May', revenue: 55000, projects: 4, clients: 11 },
  { month: 'Jun', revenue: 67000, projects: 6, clients: 14 }
];

const projectStatusData = [
  { name: 'Completed', value: 12, color: '#10B981' },
  { name: 'Active', value: 5, color: '#3B82F6' },
  { name: 'Planning', value: 3, color: '#F59E0B' },
  { name: 'On Hold', value: 1, color: '#EF4444' }
];

const clientTypeData = [
  { type: 'Business', count: 15, revenue: 285000 },
  { type: 'Individual', count: 6, revenue: 95000 },
  { type: 'Government', count: 3, revenue: 150000 }
];

export function EnhancedReportingDashboard() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('6months');
  const [reportType, setReportType] = useState('financial');

  const handleExportReport = (type: string) => {
    toast({
      title: "Exporting Report",
      description: `${type} report is being generated and will be downloaded shortly.`,
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${type} report has been downloaded successfully.`,
      });
    }, 2000);
  };

  const generatePDFReport = () => {
    handleExportReport('Comprehensive PDF');
  };

  const generateExcelReport = () => {
    handleExportReport('Excel Spreadsheet');
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="elevated-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Intelligence Reports
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={generatePDFReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF Report
              </Button>
              <Button onClick={generateExcelReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="client">Client Analysis</SelectItem>
                  <SelectItem value="project">Project Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6 mt-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">£328,000</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +15.2% vs last period
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Project Value</p>
                    <p className="text-2xl font-bold text-blue-600">£47,429</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +8.5% improvement
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
                    <p className="text-2xl font-bold text-yellow-600">£32,500</p>
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      3 overdue invoices
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className="text-2xl font-bold text-purple-600">28.5%</p>
                    <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      Healthy margins
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="elevated-card">
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`£${value.toLocaleString()}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Distribution */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Projects */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle>Monthly Project Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="projects" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Type Analysis */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle>Client Type Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientTypeData.map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{client.type}</p>
                        <p className="text-sm text-muted-foreground">{client.count} clients</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">£{(client.revenue / 1000).toFixed(0)}k</p>
                        <p className="text-sm text-muted-foreground">
                          £{(client.revenue / client.count / 1000).toFixed(0)}k avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Client Growth */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle>Client Acquisition Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="clients" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                  <p className="text-xs text-green-600 mt-1">Excellent rating</p>
                </div>
              </CardContent>
            </Card>

            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">87%</p>
                  <p className="text-sm text-muted-foreground">On-time Delivery</p>
                  <p className="text-xs text-blue-600 mt-1">Above industry avg</p>
                </div>
              </CardContent>
            </Card>

            <Card className="pro-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">73%</p>
                  <p className="text-sm text-muted-foreground">Project Completion</p>
                  <p className="text-xs text-purple-600 mt-1">Strong progress</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}