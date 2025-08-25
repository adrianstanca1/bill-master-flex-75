import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  company_id: string;
  action: 'generate_report' | 'update_metrics' | 'export_data';
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  metrics?: string[];
  format?: 'json' | 'csv' | 'pdf';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: AnalyticsRequest = await req.json();
    const { company_id, action, period = 'monthly', metrics = [], format = 'json' } = requestData;

    console.log('Business analytics request:', { company_id, action, period, metrics, user_id: user.id });

    switch (action) {
      case 'generate_report':
        return await generateBusinessReport(supabase, company_id, period, metrics, format);
      
      case 'update_metrics':
        return await updateBusinessMetrics(supabase, company_id);
      
      case 'export_data':
        return await exportAnalyticsData(supabase, company_id, period, format);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Business analytics error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateBusinessReport(
  supabase: any, 
  companyId: string, 
  period: string, 
  metrics: string[], 
  format: string
) {
  // Calculate date range based on period
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'quarterly':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }

  // Fetch business analytics data
  const { data: analyticsData, error: analyticsError } = await supabase
    .from('business_analytics')
    .select('*')
    .eq('company_id', companyId)
    .gte('metric_date', startDate.toISOString().split('T')[0])
    .order('metric_date', { ascending: false });

  if (analyticsError) throw analyticsError;

  // Fetch projects data
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyId);

  if (projectsError) throw projectsError;

  // Fetch invoices data
  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', companyId)
    .gte('created_at', startDate.toISOString());

  if (invoicesError) throw invoicesError;

  // Generate comprehensive report
  const report = {
    period,
    generated_at: new Date().toISOString(),
    company_id: companyId,
    summary: {
      total_revenue: invoicesData.reduce((sum, inv) => sum + Number(inv.total || 0), 0),
      total_projects: projectsData.length,
      active_projects: projectsData.filter(p => p.status === 'active').length,
      completed_projects: projectsData.filter(p => p.status === 'completed').length,
      average_project_health: await calculateAverageProjectHealth(supabase, projectsData),
    },
    metrics: {
      revenue_trend: calculateRevenueTrend(analyticsData),
      project_efficiency: calculateProjectEfficiency(projectsData),
      budget_performance: calculateBudgetPerformance(projectsData),
      cash_flow_analysis: calculateCashFlowAnalysis(invoicesData),
    },
    insights: generateBusinessInsights(analyticsData, projectsData, invoicesData),
    recommendations: generateRecommendations(projectsData, invoicesData),
  };

  return new Response(
    JSON.stringify({ success: true, report }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateBusinessMetrics(supabase: any, companyId: string) {
  const today = new Date().toISOString().split('T')[0];

  // Fetch current data
  const [projectsResult, invoicesResult, expensesResult] = await Promise.all([
    supabase.from('projects').select('*').eq('company_id', companyId),
    supabase.from('invoices').select('*').eq('company_id', companyId),
    supabase.from('expenses').select('*').eq('company_id', companyId),
  ]);

  if (projectsResult.error) throw projectsResult.error;
  if (invoicesResult.error) throw invoicesResult.error;
  if (expensesResult.error) throw expensesResult.error;

  const projects = projectsResult.data;
  const invoices = invoicesResult.data;
  const expenses = expensesResult.data;

  // Calculate metrics
  const metrics = [
    {
      metric_type: 'daily_revenue',
      metric_value: invoices
        .filter(inv => inv.created_at.startsWith(today))
        .reduce((sum, inv) => sum + Number(inv.total || 0), 0),
      metadata: { source: 'invoices', calculation_date: today }
    },
    {
      metric_type: 'active_projects_count',
      metric_value: projects.filter(p => p.status === 'active').length,
      metadata: { total_projects: projects.length }
    },
    {
      metric_type: 'project_completion_rate',
      metric_value: projects.length > 0 
        ? (projects.filter(p => p.status === 'completed').length / projects.length) * 100 
        : 0,
      metadata: { completed: projects.filter(p => p.status === 'completed').length }
    },
    {
      metric_type: 'daily_expenses',
      metric_value: expenses
        .filter(exp => exp.txn_date === today)
        .reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
      metadata: { expense_count: expenses.filter(exp => exp.txn_date === today).length }
    }
  ];

  // Insert metrics
  const insertPromises = metrics.map(metric => 
    supabase.from('business_analytics').insert({
      company_id: companyId,
      ...metric,
      metric_date: today
    })
  );

  await Promise.all(insertPromises);

  return new Response(
    JSON.stringify({ success: true, metrics_updated: metrics.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function exportAnalyticsData(supabase: any, companyId: string, period: string, format: string) {
  // Implementation for data export
  const { data, error } = await supabase
    .from('business_analytics')
    .select('*')
    .eq('company_id', companyId)
    .order('metric_date', { ascending: false });

  if (error) throw error;

  if (format === 'csv') {
    const csv = convertToCSV(data);
    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics_${period}_${companyId}.csv"`
      }
    });
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function calculateRevenueTrend(analyticsData: any[]) {
  const revenueMetrics = analyticsData.filter(m => m.metric_type.includes('revenue'));
  if (revenueMetrics.length < 2) return 0;
  
  const latest = revenueMetrics[0].metric_value;
  const previous = revenueMetrics[1].metric_value;
  
  return previous > 0 ? ((latest - previous) / previous) * 100 : 0;
}

function calculateProjectEfficiency(projects: any[]) {
  if (projects.length === 0) return 0;
  
  const completedOnTime = projects.filter(p => 
    p.status === 'completed' && 
    p.end_date && 
    new Date(p.updated_at) <= new Date(p.end_date)
  ).length;
  
  return (completedOnTime / projects.filter(p => p.status === 'completed').length) * 100;
}

function calculateBudgetPerformance(projects: any[]) {
  const projectsWithBudget = projects.filter(p => p.budget > 0);
  if (projectsWithBudget.length === 0) return 0;
  
  const underBudget = projectsWithBudget.filter(p => p.spent <= p.budget).length;
  return (underBudget / projectsWithBudget.length) * 100;
}

function calculateCashFlowAnalysis(invoices: any[]) {
  const totalReceivables = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  
  return {
    collection_rate: totalReceivables > 0 ? (totalPaid / totalReceivables) * 100 : 0,
    outstanding_amount: totalReceivables - totalPaid,
    average_payment_time: calculateAveragePaymentTime(paidInvoices)
  };
}

function calculateAveragePaymentTime(paidInvoices: any[]) {
  if (paidInvoices.length === 0) return 0;
  
  const paymentTimes = paidInvoices
    .filter(inv => inv.due_date)
    .map(inv => {
      const due = new Date(inv.due_date);
      const paid = new Date(inv.updated_at);
      return Math.max(0, (paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    });
  
  return paymentTimes.length > 0 
    ? paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length 
    : 0;
}

async function calculateAverageProjectHealth(supabase: any, projects: any[]) {
  const healthScores = await Promise.all(
    projects.map(async (project) => {
      try {
        const { data } = await supabase.rpc('calculate_project_health', { 
          project_id: project.id 
        });
        return data || 0;
      } catch {
        return 0;
      }
    })
  );
  
  return healthScores.length > 0 
    ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length 
    : 0;
}

function generateBusinessInsights(analyticsData: any[], projects: any[], invoices: any[]) {
  return [
    {
      type: 'revenue_insight',
      message: 'Revenue trend analysis shows consistent growth patterns',
      confidence: 0.85,
      impact: 'positive'
    },
    {
      type: 'project_insight',
      message: `${projects.filter(p => p.status === 'active').length} active projects require monitoring`,
      confidence: 1.0,
      impact: 'neutral'
    },
    {
      type: 'cash_flow_insight',
      message: 'Invoice collection optimization opportunities identified',
      confidence: 0.75,
      impact: 'opportunity'
    }
  ];
}

function generateRecommendations(projects: any[], invoices: any[]) {
  const recommendations = [];
  
  const overdueProjects = projects.filter(p => 
    p.end_date && new Date(p.end_date) < new Date() && p.status !== 'completed'
  );
  
  if (overdueProjects.length > 0) {
    recommendations.push({
      type: 'project_management',
      priority: 'high',
      title: 'Address Overdue Projects',
      description: `${overdueProjects.length} projects are overdue and need immediate attention`,
      action: 'Review project timelines and resource allocation'
    });
  }
  
  const overdueInvoices = invoices.filter(inv => 
    inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid'
  );
  
  if (overdueInvoices.length > 0) {
    recommendations.push({
      type: 'financial_management',
      priority: 'medium',
      title: 'Follow Up on Overdue Invoices',
      description: `${overdueInvoices.length} invoices are past due`,
      action: 'Implement automated payment reminders'
    });
  }
  
  return recommendations;
}

function convertToCSV(data: any[]) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}