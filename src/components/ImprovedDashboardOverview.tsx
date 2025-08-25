
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatsCard } from '@/components/EnhancedStatsCard';
import { DashboardGrid } from '@/components/DashboardGrid';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Users,
  FileText,
  Clock,
  Building2,
  Target,
  PieChart,
  Activity
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const ImprovedDashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    totalRevenue, 
    pendingInvoices, 
    overdueAmount, 
    activeProjects,
    recentInvoices,
    loading,
    error 
  } = useDashboardStats();

  // Mock additional data for comprehensive dashboard
  const kpiData = {
    monthlyTarget: 45000,
    completionRate: 87,
    teamUtilization: 94,
    customerSatisfaction: 4.8
  };

  const urgentTasks = [
    { 
      id: 1, 
      title: 'Chase overdue payment from Acme Construction', 
      priority: 'high', 
      dueDate: 'Today',
      type: 'payment'
    },
    { 
      id: 2, 
      title: 'Submit CIS300 monthly return', 
      priority: 'medium', 
      dueDate: 'Tomorrow',
      type: 'compliance'
    },
    { 
      id: 3, 
      title: 'Update RAMS for Dagenham project', 
      priority: 'medium', 
      dueDate: 'This week',
      type: 'safety'
    }
  ];

  const quickActions = [
    { title: 'Create Invoice', icon: FileText, route: '/invoices', variant: 'default' as const },
    { title: 'New Quote', icon: PieChart, route: '/quotes', variant: 'secondary' as const },
    { title: 'Manage Team', icon: Users, route: '/business-manager', variant: 'secondary' as const },
    { title: 'AI Advisor', icon: Activity, route: '/advisor', variant: 'secondary' as const }
  ];

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Error loading dashboard</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout maxWidth="full" className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl" : "text-3xl"
            )}>
              Business Dashboard
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {!isMobile && (
            <Button onClick={() => navigate('/business-manager')}>
              <Building2 className="h-4 w-4 mr-2" />
              Business Manager
            </Button>
          )}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Key Performance Indicators</h2>
        </div>
        
        <DashboardGrid columns={isMobile ? 2 : 4} gap="md">
          <EnhancedStatsCard
            title="Total Revenue"
            value={`£${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true, label: 'vs last month' }}
            description="Monthly revenue performance"
            variant="featured"
          />
          <EnhancedStatsCard
            title="Active Projects"
            value={activeProjects}
            icon={Building2}
            trend={{ value: 8.3, isPositive: true }}
            description="Currently running projects"
            onClick={() => navigate('/business-manager')}
          />
          <EnhancedStatsCard
            title="Pending Invoices"
            value={pendingInvoices}
            icon={FileText}
            description="Awaiting payment"
            onClick={() => navigate('/invoices')}
          />
          <EnhancedStatsCard
            title="Overdue Amount"
            value={`£${overdueAmount.toLocaleString()}`}
            icon={AlertTriangle}
            trend={{ value: -15.2, isPositive: false }}
            description="Requires immediate attention"
            className="border-destructive/20 bg-destructive/5"
          />
        </DashboardGrid>
      </div>

      {/* Business Health Metrics */}
      <DashboardGrid columns={isMobile ? 1 : 2} gap="lg">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Business Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Target Progress</span>
                <span className="font-medium">
                  £{totalRevenue.toLocaleString()} / £{kpiData.monthlyTarget.toLocaleString()}
                </span>
              </div>
              <Progress value={(totalRevenue / kpiData.monthlyTarget) * 100} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{kpiData.completionRate}%</div>
                <div className="text-xs text-muted-foreground">Project Completion</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{kpiData.teamUtilization}%</div>
                <div className="text-xs text-muted-foreground">Team Utilization</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
              Urgent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    task.priority === 'high' ? 'bg-destructive' : 'bg-warning'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs h-5"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardGrid>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {recentInvoices.slice(0, isMobile ? 3 : 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-card/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{invoice.client || 'Unknown Client'}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-bold text-sm">£{Number(invoice.total || 0).toLocaleString()}</p>
                      <Badge 
                        variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'overdue' ? 'destructive' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent invoices found</p>
              <Button variant="outline" className="mt-3" onClick={() => navigate('/invoices')}>
                Create First Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardGrid columns={isMobile ? 2 : 4} gap="sm">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant={action.variant}
                className={cn(
                  "h-auto p-4 flex-col gap-2 hover:scale-105 transition-transform",
                  isMobile && "text-xs"
                )}
                onClick={() => navigate(action.route)}
              >
                <action.icon className={cn(
                  "text-current",
                  isMobile ? "h-5 w-5" : "h-6 w-6"
                )} />
                <span className="font-medium">{action.title}</span>
              </Button>
            ))}
          </DashboardGrid>
        </CardContent>
      </Card>
    </ResponsiveLayout>
  );
};
