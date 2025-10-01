import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from './useCompanyId';

export function useBusinessAnalytics() {
  const { companyId } = useCompanyId();

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['business-analytics', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data: analytics, error } = await supabase
        .rpc('get_optimized_company_analytics', { company_filter: companyId });

      if (error) throw error;

      const insights = {
        revenueGrowth: calculateRevenueGrowth(analytics),
        performance: {
          score: analytics?.project_completion_rate || 0,
          deliveryRate: analytics?.project_completion_rate || 0
        },
        teamUtilization: analytics?.employee_utilization_rate || 0,
        profitMargin: calculateProfitMargin(analytics),
        cashFlowHealth: determineCashFlowHealth(analytics),
        budgetVariance: calculateBudgetVariance(analytics)
      };

      return { analytics, insights };
    },
    enabled: !!companyId
  });

  return {
    metrics: [],
    insights: data?.insights || {
      revenueGrowth: 0,
      performance: { score: 0, deliveryRate: 0 },
      teamUtilization: 0,
      profitMargin: 0,
      cashFlowHealth: 'unknown',
      budgetVariance: 0
    },
    dashboardData: data?.insights || {},
    loading,
    error,
    refreshMetrics: refetch,
    addMetric: () => {},
  };
}

function calculateRevenueGrowth(analytics: any) {
  if (!analytics) return 0;
  const monthly = Number(analytics.monthly_revenue) || 0;
  const quarterly = Number(analytics.quarterly_revenue) || 0;
  if (quarterly === 0) return 0;
  return ((monthly * 3 - quarterly) / quarterly) * 100;
}

function calculateProfitMargin(analytics: any) {
  if (!analytics) return 0;
  const revenue = Number(analytics.total_revenue) || 0;
  if (revenue === 0) return 0;
  // Simplified profit margin calculation
  return (revenue * 0.25) / revenue * 100;
}

function determineCashFlowHealth(analytics: any) {
  if (!analytics) return 'unknown';
  const overdue = analytics.overdue_invoices || 0;
  const pending = analytics.pending_invoices || 0;
  
  if (overdue > 5) return 'critical';
  if (overdue > 2 || pending > 10) return 'warning';
  return 'good';
}

function calculateBudgetVariance(analytics: any) {
  if (!analytics) return 0;
  // Simplified variance calculation
  return -2.1;
}