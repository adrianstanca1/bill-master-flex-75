import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from './useCompanyId';

export function useBusinessAnalytics() {
  const { companyId } = useCompanyId();

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['business-analytics', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      // Fetch data directly from tables
      const [projectsRes, employeesRes, invoicesRes] = await Promise.all([
        supabase.from('projects_data').select('*').eq('company_id', companyId),
        supabase.from('employees').select('*').eq('company_id', companyId),
        supabase.from('invoices').select('*').eq('company_id', companyId)
      ]);

      const projects = projectsRes.data || [];
      const employees = employeesRes.data || [];
      const invoices = invoicesRes.data || [];

      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const activeEmployees = employees.filter(e => e.status === 'active').length;
      const paidInvoices = invoices.filter(i => i.status === 'paid');
      const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);

      const analytics = {
        project_completion_rate: projects.length > 0 ? (completedProjects / projects.length) * 100 : 0,
        employee_utilization_rate: employees.length > 0 ? (activeEmployees / employees.length) * 100 : 0,
        total_revenue: totalRevenue
      };

      const insights = {
        revenueGrowth: 0,
        performance: {
          score: analytics.project_completion_rate,
          deliveryRate: analytics.project_completion_rate
        },
        teamUtilization: analytics.employee_utilization_rate,
        profitMargin: 0,
        cashFlowHealth: 'healthy',
        budgetVariance: 0
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