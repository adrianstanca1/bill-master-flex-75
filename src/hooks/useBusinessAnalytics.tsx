import React from 'react';

export function useBusinessAnalytics() {
  return {
    metrics: [],
    insights: {
      revenueGrowth: 12.5,
      performance: { score: 85, deliveryRate: 92 },
      teamUtilization: 78,
      profitMargin: 24.5,
      cashFlowHealth: 'good',
      budgetVariance: -2.1
    },
    dashboardData: {
      revenueGrowth: 12.5,
      performance: { score: 85, deliveryRate: 92 },
      teamUtilization: 78,
      profitMargin: 24.5,
      cashFlowHealth: 'good',
      budgetVariance: -2.1
    },
    loading: false,
    error: null,
    refreshMetrics: () => {},
    addMetric: () => {},
  };
}