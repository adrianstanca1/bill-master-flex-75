
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Clock, FileText, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

interface StatCard {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export function QuickStatsGrid() {
  const companyId = useCompanyId();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      // Fetch quotes
      const { data: quotes } = await supabase
        .from('quotes')
        .select('total, status, created_at')
        .eq('company_id', companyId);

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, status, created_at')
        .eq('company_id', companyId);

      // Fetch timesheets for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('start_time, end_time, status')
        .eq('company_id', companyId)
        .gte('start_time', startOfMonth.toISOString());

      // Fetch overdue reminders
      const { data: reminders } = await supabase
        .from('reminders')
        .select('due_date, completed')
        .eq('company_id', companyId)
        .eq('completed', false)
        .lt('due_date', new Date().toISOString());

      return {
        quotes: quotes || [],
        invoices: invoices || [],
        timesheets: timesheets || [],
        overdueReminders: reminders || [],
      };
    },
    enabled: !!companyId,
  });

  if (!companyId) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Sign in to view stats
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalQuoteValue = stats?.quotes.reduce((sum, q) => sum + (q.total || 0), 0) || 0;
  const totalInvoiceValue = stats?.invoices.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
  
  const monthlyHours = stats?.timesheets.reduce((sum, ts) => {
    if (ts.start_time && ts.end_time) {
      const start = new Date(ts.start_time);
      const end = new Date(ts.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return sum;
  }, 0) || 0;

  const statsCards: StatCard[] = [
    {
      title: 'Total Quote Value',
      value: `£${totalQuoteValue.toLocaleString()}`,
      icon: <FileText className="h-4 w-4" />,
      change: stats?.quotes.length ? `${stats.quotes.length} quotes` : '0 quotes',
    },
    {
      title: 'Invoice Revenue',
      value: `£${totalInvoiceValue.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
      change: stats?.invoices.length ? `${stats.invoices.length} invoices` : '0 invoices',
    },
    {
      title: 'Hours This Month',
      value: `${monthlyHours.toFixed(1)}h`,
      icon: <Clock className="h-4 w-4" />,
      change: `${stats?.timesheets.length || 0} sessions`,
    },
    {
      title: 'Overdue Items',
      value: `${stats?.overdueReminders.length || 0}`,
      icon: <AlertTriangle className="h-4 w-4" />,
      trend: (stats?.overdueReminders.length || 0) > 0 ? 'down' : 'neutral',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && (
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
                {stat.change}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
