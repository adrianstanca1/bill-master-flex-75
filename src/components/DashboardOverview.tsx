
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useNavigate } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { 
    totalRevenue, 
    pendingInvoices, 
    overdueAmount, 
    activeProjects,
    recentInvoices,
    loading,
    error 
  } = useDashboardStats();

  const urgentTasks = [
    { id: 1, title: 'Chase overdue payment from Acme Construction', priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Submit CIS300 monthly return', priority: 'medium', dueDate: 'Tomorrow' },
    { id: 3, title: 'Update RAMS for Dagenham project', priority: 'medium', dueDate: 'This week' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`£${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Pending Invoices"
          value={pendingInvoices}
          icon={FileText}
          onClick={() => navigate('/invoices')}
        />
        <StatsCard
          title="Overdue Amount"
          value={`£${overdueAmount.toLocaleString()}`}
          icon={AlertTriangle}
          className="border-red-200"
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          icon={TrendingUp}
          onClick={() => navigate('/business-manager')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.client || 'Unknown Client'}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">£{Number(invoice.total || 0).toLocaleString()}</p>
                      <Badge 
                        variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'overdue' ? 'destructive' : 'secondary'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No invoices found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Urgent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              className="h-16 flex-col"
              onClick={() => navigate('/invoices')}
            >
              <FileText className="h-6 w-6 mb-1" />
              Create Invoice
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={() => navigate('/business-manager')}
            >
              <Users className="h-6 w-6 mb-1" />
              Manage Team
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={() => navigate('/quotes')}
            >
              <Calendar className="h-6 w-6 mb-1" />
              Create Quote
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={() => navigate('/advisor')}
            >
              <TrendingUp className="h-6 w-6 mb-1" />
              Get Advice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
