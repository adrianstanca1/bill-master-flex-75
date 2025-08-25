
import React from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

import { BusinessMetrics } from "@/components/BusinessMetrics";
import { ProjectsOverview } from "@/components/ProjectsOverview";
import { FinancialSummary } from "@/components/FinancialSummary";
import { QuickActionsPanel } from "@/components/QuickActionsPanel";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useBusinessAnalytics } from "@/hooks/useBusinessAnalytics";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const BusinessManager: React.FC = () => {
  const navigate = useNavigate();
  const { totalRevenue, pendingInvoices, overdueAmount, activeProjects, recentInvoices, loading } = useDashboardStats();
  const { insights, dashboardData } = useBusinessAnalytics();

  // Enhanced business metrics with real analytics
  const businessMetricsData = {
    revenue: {
      current: totalRevenue,
      target: totalRevenue * 1.2,
      growth: insights.revenueGrowth
    },
    projects: {
      active: activeProjects,
      completed: Math.floor(dashboardData.performance.deliveryRate || 0),
      pending: Math.floor(activeProjects * 0.3)
    },
    team: {
      utilization: insights.teamUtilization,
      capacity: 100
    },
    financial: {
      profitMargin: insights.profitMargin,
      cashFlow: insights.cashFlowHealth,
      budgetVariance: insights.budgetVariance
    }
  };


  // Financial summary data
  const financialData = {
    totalRevenue,
    monthlyRevenue: totalRevenue * 0.1, // Assume 10% is monthly
    pendingInvoices,
    overdueAmount,
    profitMargin: 15.2,
    cashFlow: totalRevenue * 0.15,
    recentTransactions: recentInvoices.map((invoice, index) => ({
      id: invoice.id,
      type: 'income' as const,
      description: `Payment from ${invoice.client || 'Client'}`,
      amount: Number(invoice.total || 0),
      date: invoice.created_at,
      status: invoice.status === 'paid' ? 'completed' as const : 'pending' as const
    })).slice(0, 5)
  };

  const handleViewProject = (id: string) => {
    navigate(`/projects?view=${id}`);
  };

  const handleCreateProject = () => {
    navigate('/projects?mode=create');
  };

  const handleViewFinancials = () => {
    navigate('/invoices');
  };

  const handleCreateInvoice = () => {
    navigate('/invoices');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <ResponsiveLayout>
          <div className="flex items-center justify-center h-64">
            <div className="cyber-loader"></div>
          </div>
        </ResponsiveLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <ResponsiveLayout>
        <SEO 
          title="Business Manager | AS Agents" 
          description="Comprehensive business management and analytics dashboard with real-time insights" 
        />
        <div className="space-y-6">
          <div className="cyber-header">
            <h1 className="text-4xl font-bold text-gradient cyber-glow">Business Manager</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Advanced business intelligence and project management platform
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="cyber-stat">
                <span className="text-cyber-primary font-medium">Health Score:</span>
                <span className="ml-1">{typeof insights.cashFlowHealth === 'number' ? Math.round(insights.cashFlowHealth) : 85}%</span>
              </div>
              <div className="cyber-stat">
                <span className="text-cyber-primary font-medium">Growth:</span>
                <span className={cn("ml-1", insights.revenueGrowth >= 0 ? 'text-success' : 'text-destructive')}>
                  {insights.revenueGrowth > 0 ? '+' : ''}{insights.revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BusinessMetrics data={businessMetricsData} />
              <ProjectsOverview 
                onViewProject={handleViewProject}
                onCreateProject={handleCreateProject}
              />
              <FinancialSummary 
                data={financialData}
                onViewFinancials={handleViewFinancials}
                onCreateInvoice={handleCreateInvoice}
              />
            </div>
            <div>
              <QuickActionsPanel />
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    </div>
  );
};

export default BusinessManager;
