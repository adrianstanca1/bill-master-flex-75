import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
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

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ['quotes', companyId?.companyId],
    queryFn: async () => {
      if (!companyId?.companyId) return [];
      const { data, error } = await supabase
        .from('quotes')
        .select('total')
        .eq('company_id', companyId.companyId);
      if (error) throw error;
      return data;
    },
    enabled: !!companyId?.companyId,
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', companyId?.companyId],
    queryFn: async () => {
      if (!companyId?.companyId) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select('amount, status')
        .eq('company_id', companyId.companyId);
      if (error) throw error;
      return data;
    },
    enabled: !!companyId?.companyId,
  });

  if (!companyId?.companyId) {
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

  if (quotesLoading || invoicesLoading) {
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

  const totalQuoteValue = quotesData?.reduce((sum, q) => sum + (q.total || 0), 0) || 0;
  const totalInvoiceValue = invoicesData?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;

  const statsCards: StatCard[] = [
    {
      title: 'Total Quote Value',
      value: `£${totalQuoteValue.toLocaleString()}`,
      icon: <FileText className="h-4 w-4" />,
      change: quotesData?.length ? `${quotesData.length} quotes` : '0 quotes',
    },
    {
      title: 'Invoice Revenue',
      value: `£${totalInvoiceValue.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
      change: invoicesData?.length ? `${invoicesData.length} invoices` : '0 invoices',
    },
    {
      title: 'Hours This Month',
      value: '0h',
      icon: <DollarSign className="h-4 w-4" />,
      change: 'Feature coming soon',
    },
    {
      title: 'Overdue Items',
      value: '0',
      icon: <FileText className="h-4 w-4" />,
      change: 'Feature coming soon',
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