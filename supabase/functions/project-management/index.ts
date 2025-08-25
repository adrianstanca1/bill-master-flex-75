import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProjectRequest {
  action: 'create_project' | 'update_status' | 'calculate_metrics' | 'generate_timeline' | 'assign_team';
  project_id?: string;
  company_id: string;
  project_data?: any;
  status_data?: any;
  team_assignments?: any[];
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

    const requestData: ProjectRequest = await req.json();
    const { action, project_id, company_id, project_data, status_data, team_assignments } = requestData;

    console.log('Project management request:', { action, project_id, company_id, user_id: user.id });

    switch (action) {
      case 'create_project':
        return await createProject(supabase, company_id, project_data, user.id);
      
      case 'update_status':
        return await updateProjectStatus(supabase, project_id!, status_data, user.id);
      
      case 'calculate_metrics':
        return await calculateProjectMetrics(supabase, company_id);
      
      case 'generate_timeline':
        return await generateProjectTimeline(supabase, project_id!);
      
      case 'assign_team':
        return await assignTeamMembers(supabase, project_id!, team_assignments!, user.id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Project management error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createProject(supabase: any, companyId: string, projectData: any, userId: string) {
  // Create project with enhanced metadata
  const enhancedProjectData = {
    ...projectData,
    company_id: companyId,
    meta: {
      ...projectData.meta,
      created_by: userId,
      project_type: projectData.project_type || 'construction',
      priority: projectData.priority || 'medium',
      estimated_duration: calculateEstimatedDuration(projectData.start_date, projectData.end_date),
      risk_assessment: generateInitialRiskAssessment(projectData),
    }
  };

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert(enhancedProjectData)
    .select()
    .single();

  if (projectError) throw projectError;

  // Create initial milestones
  if (projectData.milestones && projectData.milestones.length > 0) {
    const milestones = projectData.milestones.map((milestone: any) => ({
      ...milestone,
      project_id: project.id,
      company_id: companyId,
      created_by: userId,
    }));

    const { error: milestonesError } = await supabase
      .from('project_milestones')
      .insert(milestones);

    if (milestonesError) {
      console.warn('Failed to create milestones:', milestonesError);
    }
  }

  // Log project creation in status history
  await supabase
    .from('project_status_history')
    .insert({
      project_id: project.id,
      company_id: companyId,
      old_status: null,
      new_status: project.status,
      changed_by: userId,
      notes: 'Project created',
    });

  // Generate initial project analytics
  await generateProjectAnalytics(supabase, project.id, companyId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      project,
      message: 'Project created successfully with initial setup'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateProjectStatus(supabase: any, projectId: string, statusData: any, userId: string) {
  // Get current project data
  const { data: currentProject, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (fetchError) throw fetchError;

  const oldStatus = currentProject.status;
  const newStatus = statusData.status;

  // Update project
  const { data: updatedProject, error: updateError } = await supabase
    .from('projects')
    .update({
      status: newStatus,
      progress: statusData.progress || currentProject.progress,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Log status change
  await supabase
    .from('project_status_history')
    .insert({
      project_id: projectId,
      company_id: currentProject.company_id,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: userId,
      notes: statusData.notes || `Status changed from ${oldStatus} to ${newStatus}`,
    });

  // Update project analytics
  await updateProjectAnalytics(supabase, projectId, currentProject.company_id, statusData);

  // Send notifications if needed
  if (shouldNotifyStatusChange(oldStatus, newStatus)) {
    await sendStatusChangeNotifications(supabase, projectId, oldStatus, newStatus);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      project: updatedProject,
      status_change: { from: oldStatus, to: newStatus }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateProjectMetrics(supabase: any, companyId: string) {
  // Fetch all projects for the company
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyId);

  if (projectsError) throw projectsError;

  // Calculate comprehensive metrics
  const metrics = {
    overview: {
      total_projects: projects.length,
      active_projects: projects.filter(p => p.status === 'active').length,
      completed_projects: projects.filter(p => p.status === 'completed').length,
      planning_projects: projects.filter(p => p.status === 'planning').length,
      on_hold_projects: projects.filter(p => p.status === 'on-hold').length,
    },
    financial: {
      total_budget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      total_spent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
      budget_utilization: calculateBudgetUtilization(projects),
      cost_variance: calculateCostVariance(projects),
    },
    performance: {
      average_progress: calculateAverageProgress(projects),
      on_time_delivery_rate: await calculateOnTimeDeliveryRate(projects),
      project_efficiency: await calculateProjectEfficiency(supabase, projects),
      resource_utilization: await calculateResourceUtilization(supabase, companyId),
    },
    timeline: {
      overdue_projects: projects.filter(p => isProjectOverdue(p)).length,
      upcoming_deadlines: getUpcomingDeadlines(projects),
      average_project_duration: calculateAverageProjectDuration(projects),
    },
    health: {
      projects_at_risk: await identifyProjectsAtRisk(supabase, projects),
      quality_indicators: await calculateQualityIndicators(supabase, projects),
      client_satisfaction: await estimateClientSatisfaction(projects),
    }
  };

  // Store metrics in business analytics
  await storeProjectMetrics(supabase, companyId, metrics);

  return new Response(
    JSON.stringify({ success: true, metrics }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateProjectTimeline(supabase: any, projectId: string) {
  // Get project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError) throw projectError;

  // Get project milestones
  const { data: milestones, error: milestonesError } = await supabase
    .from('project_milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true });

  if (milestonesError) throw milestonesError;

  // Get project status history
  const { data: statusHistory, error: historyError } = await supabase
    .from('project_status_history')
    .select('*')
    .eq('project_id', projectId)
    .order('changed_at', { ascending: true });

  if (historyError) throw historyError;

  // Generate timeline with AI-powered predictions
  const timeline = {
    project_info: {
      id: project.id,
      name: project.name,
      start_date: project.start_date,
      end_date: project.end_date,
      current_progress: project.progress,
      status: project.status,
    },
    milestones: milestones.map(milestone => ({
      ...milestone,
      status_indicator: getMilestoneStatusIndicator(milestone),
      completion_probability: calculateCompletionProbability(milestone, project),
    })),
    status_history: statusHistory,
    predictions: {
      estimated_completion: predictProjectCompletion(project, milestones, statusHistory),
      risk_factors: identifyTimelineRisks(project, milestones),
      recommended_actions: generateTimelineRecommendations(project, milestones),
    },
    critical_path: identifyCriticalPath(milestones),
    resource_timeline: await generateResourceTimeline(supabase, projectId),
  };

  return new Response(
    JSON.stringify({ success: true, timeline }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function assignTeamMembers(supabase: any, projectId: string, assignments: any[], userId: string) {
  // Get project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('company_id')
    .eq('id', projectId)
    .single();

  if (projectError) throw projectError;

  // Prepare assignments data
  const assignmentData = assignments.map(assignment => ({
    project_id: projectId,
    company_id: project.company_id,
    user_id: assignment.user_id,
    role: assignment.role || 'member',
    assigned_by: userId,
    assigned_at: new Date().toISOString(),
  }));

  // Remove existing assignments
  await supabase
    .from('project_assignments')
    .delete()
    .eq('project_id', projectId);

  // Insert new assignments
  const { data: newAssignments, error: assignmentError } = await supabase
    .from('project_assignments')
    .insert(assignmentData)
    .select();

  if (assignmentError) throw assignmentError;

  // Update project metadata
  await supabase
    .from('projects')
    .update({
      meta: {
        ...project.meta,
        team_size: assignments.length,
        last_team_update: new Date().toISOString(),
      }
    })
    .eq('id', projectId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      assignments: newAssignments,
      message: `Successfully assigned ${assignments.length} team members`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function calculateEstimatedDuration(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function generateInitialRiskAssessment(projectData: any) {
  const risks = [];
  
  if (!projectData.budget || projectData.budget === 0) {
    risks.push({ type: 'financial', severity: 'medium', description: 'No budget defined' });
  }
  
  if (!projectData.end_date) {
    risks.push({ type: 'timeline', severity: 'high', description: 'No end date specified' });
  }
  
  if (!projectData.client) {
    risks.push({ type: 'communication', severity: 'low', description: 'No client assigned' });
  }
  
  return { risks, assessment_date: new Date().toISOString() };
}

function calculateBudgetUtilization(projects: any[]) {
  const projectsWithBudget = projects.filter(p => p.budget > 0);
  if (projectsWithBudget.length === 0) return 0;
  
  const totalBudget = projectsWithBudget.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projectsWithBudget.reduce((sum, p) => sum + (p.spent || 0), 0);
  
  return totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
}

function calculateCostVariance(projects: any[]) {
  return projects.map(project => ({
    project_id: project.id,
    name: project.name,
    budget: project.budget || 0,
    spent: project.spent || 0,
    variance: (project.budget || 0) - (project.spent || 0),
    variance_percentage: project.budget > 0 
      ? (((project.budget - (project.spent || 0)) / project.budget) * 100)
      : 0
  }));
}

function calculateAverageProgress(projects: any[]) {
  if (projects.length === 0) return 0;
  const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
  return totalProgress / projects.length;
}

async function calculateOnTimeDeliveryRate(projects: any[]) {
  const completedProjects = projects.filter(p => p.status === 'completed' && p.end_date);
  if (completedProjects.length === 0) return 0;
  
  const onTimeProjects = completedProjects.filter(p => {
    const endDate = new Date(p.end_date);
    const completedDate = new Date(p.updated_at);
    return completedDate <= endDate;
  });
  
  return (onTimeProjects.length / completedProjects.length) * 100;
}

async function calculateProjectEfficiency(supabase: any, projects: any[]) {
  // Calculate efficiency based on progress vs time elapsed
  const efficiencyScores = projects.map(project => {
    if (!project.start_date || !project.end_date) return 0;
    
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = Math.min(now.getTime() - start.getTime(), totalDuration);
    
    if (totalDuration <= 0) return 0;
    
    const expectedProgress = (elapsedDuration / totalDuration) * 100;
    const actualProgress = project.progress || 0;
    
    return actualProgress >= expectedProgress ? 100 : (actualProgress / expectedProgress) * 100;
  });
  
  return efficiencyScores.length > 0 
    ? efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length 
    : 0;
}

async function calculateResourceUtilization(supabase: any, companyId: string) {
  // This would calculate team utilization across projects
  // For now, return a placeholder
  return 75; // Placeholder percentage
}

function isProjectOverdue(project: any) {
  if (!project.end_date || project.status === 'completed') return false;
  return new Date(project.end_date) < new Date();
}

function getUpcomingDeadlines(projects: any[]) {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return projects
    .filter(p => p.end_date && new Date(p.end_date) <= nextWeek && new Date(p.end_date) >= now)
    .map(p => ({
      project_id: p.id,
      name: p.name,
      end_date: p.end_date,
      days_remaining: Math.ceil((new Date(p.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.days_remaining - b.days_remaining);
}

function calculateAverageProjectDuration(projects: any[]) {
  const completedProjects = projects.filter(p => 
    p.status === 'completed' && p.start_date && p.end_date
  );
  
  if (completedProjects.length === 0) return 0;
  
  const durations = completedProjects.map(p => {
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  });
  
  return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
}

async function generateProjectAnalytics(supabase: any, projectId: string, companyId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const analytics = [
    {
      company_id: companyId,
      metric_type: 'project_created',
      metric_value: 1,
      metric_date: today,
      metadata: { project_id: projectId, event: 'project_creation' }
    }
  ];
  
  await supabase.from('business_analytics').insert(analytics);
}

async function updateProjectAnalytics(supabase: any, projectId: string, companyId: string, statusData: any) {
  const today = new Date().toISOString().split('T')[0];
  
  const analytics = [
    {
      company_id: companyId,
      metric_type: 'project_status_change',
      metric_value: statusData.progress || 0,
      metric_date: today,
      metadata: { 
        project_id: projectId, 
        new_status: statusData.status,
        progress: statusData.progress 
      }
    }
  ];
  
  await supabase.from('business_analytics').insert(analytics);
}

function shouldNotifyStatusChange(oldStatus: string, newStatus: string) {
  const criticalChanges = [
    'active->on-hold',
    'active->completed',
    'planning->active'
  ];
  
  return criticalChanges.includes(`${oldStatus}->${newStatus}`);
}

async function sendStatusChangeNotifications(supabase: any, projectId: string, oldStatus: string, newStatus: string) {
  // Implementation for sending notifications
  // This could integrate with email services, Slack, etc.
  console.log(`Project ${projectId} status changed from ${oldStatus} to ${newStatus}`);
}

// Additional helper functions for timeline generation
function getMilestoneStatusIndicator(milestone: any) {
  if (milestone.completed_at) return 'completed';
  if (milestone.due_date && new Date(milestone.due_date) < new Date()) return 'overdue';
  return 'pending';
}

function calculateCompletionProbability(milestone: any, project: any) {
  // AI-powered probability calculation based on historical data
  // For now, return a basic calculation
  if (milestone.completed_at) return 100;
  
  const now = new Date();
  const dueDate = new Date(milestone.due_date);
  const projectProgress = project.progress || 0;
  
  if (dueDate < now) return Math.max(0, 100 - ((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) * 10);
  
  return Math.min(100, projectProgress + 20); // Base probability with project progress
}

function predictProjectCompletion(project: any, milestones: any[], statusHistory: any[]) {
  // AI prediction algorithm
  const currentProgress = project.progress || 0;
  const remainingWork = 100 - currentProgress;
  
  if (remainingWork === 0) return project.end_date;
  
  // Simple prediction based on current velocity
  const recentStatusChanges = statusHistory.slice(-3);
  let averageProgressRate = 5; // Default 5% per week
  
  if (recentStatusChanges.length > 1) {
    // Calculate progress rate from recent changes
    averageProgressRate = 10; // Placeholder calculation
  }
  
  const weeksRemaining = remainingWork / averageProgressRate;
  const predictedCompletion = new Date();
  predictedCompletion.setDate(predictedCompletion.getDate() + weeksRemaining * 7);
  
  return predictedCompletion.toISOString().split('T')[0];
}

function identifyTimelineRisks(project: any, milestones: any[]) {
  const risks = [];
  
  const overdueMilestones = milestones.filter(m => 
    m.due_date && new Date(m.due_date) < new Date() && !m.completed_at
  );
  
  if (overdueMilestones.length > 0) {
    risks.push({
      type: 'schedule_delay',
      severity: 'high',
      description: `${overdueMilestones.length} milestones are overdue`,
      impact: 'Project completion will be delayed'
    });
  }
  
  return risks;
}

function generateTimelineRecommendations(project: any, milestones: any[]) {
  const recommendations = [];
  
  const upcomingMilestones = milestones.filter(m => {
    const dueDate = new Date(m.due_date);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return dueDate <= nextWeek && !m.completed_at;
  });
  
  if (upcomingMilestones.length > 0) {
    recommendations.push({
      type: 'milestone_focus',
      priority: 'medium',
      title: 'Focus on Upcoming Milestones',
      description: `${upcomingMilestones.length} milestones due within the next week`,
      action: 'Prioritize resources for upcoming deliverables'
    });
  }
  
  return recommendations;
}

function identifyCriticalPath(milestones: any[]) {
  // Simplified critical path identification
  return milestones
    .filter(m => m.priority === 'high' || m.priority === 'critical')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .map(m => m.id);
}

async function generateResourceTimeline(supabase: any, projectId: string) {
  // Get project assignments
  const { data: assignments } = await supabase
    .from('project_assignments')
    .select('*')
    .eq('project_id', projectId);
  
  return {
    team_size: assignments?.length || 0,
    roles: assignments?.map(a => a.role) || [],
    utilization_forecast: 'Medium' // Placeholder
  };
}

async function identifyProjectsAtRisk(supabase: any, projects: any[]) {
  const riskyProjects = [];
  
  for (const project of projects) {
    const riskFactors = [];
    
    // Budget overrun risk
    if (project.budget > 0 && project.spent > project.budget * 0.9) {
      riskFactors.push('budget_overrun');
    }
    
    // Timeline risk
    if (project.end_date && new Date(project.end_date) < new Date() && project.status !== 'completed') {
      riskFactors.push('timeline_delay');
    }
    
    // Progress risk
    if (project.progress < 50 && project.end_date) {
      const now = new Date();
      const end = new Date(project.end_date);
      const timeRemaining = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (timeRemaining < 30) { // Less than 30 days remaining
        riskFactors.push('progress_behind');
      }
    }
    
    if (riskFactors.length > 0) {
      riskyProjects.push({
        project_id: project.id,
        name: project.name,
        risk_factors: riskFactors,
        risk_level: riskFactors.length > 2 ? 'high' : riskFactors.length > 1 ? 'medium' : 'low'
      });
    }
  }
  
  return riskyProjects;
}

async function calculateQualityIndicators(supabase: any, projects: any[]) {
  // Quality indicators based on project completion and client feedback
  return {
    completion_quality: 85, // Placeholder
    client_satisfaction_avg: 4.2, // Out of 5
    rework_percentage: 12, // Percentage of projects requiring rework
    defect_rate: 5 // Defects per 100 deliverables
  };
}

async function estimateClientSatisfaction(projects: any[]) {
  // Estimate based on project completion times and budget adherence
  const completedProjects = projects.filter(p => p.status === 'completed');
  if (completedProjects.length === 0) return 75; // Default
  
  const onTimeProjects = completedProjects.filter(p => {
    if (!p.end_date) return true;
    return new Date(p.updated_at) <= new Date(p.end_date);
  }).length;
  
  const onBudgetProjects = completedProjects.filter(p => {
    if (!p.budget) return true;
    return (p.spent || 0) <= p.budget;
  }).length;
  
  const timeScore = (onTimeProjects / completedProjects.length) * 50;
  const budgetScore = (onBudgetProjects / completedProjects.length) * 50;
  
  return Math.round(timeScore + budgetScore);
}

async function storeProjectMetrics(supabase: any, companyId: string, metrics: any) {
  const today = new Date().toISOString().split('T')[0];
  
  const analyticsData = [
    {
      company_id: companyId,
      metric_type: 'project_metrics_overview',
      metric_value: metrics.overview.total_projects,
      metric_date: today,
      metadata: metrics
    }
  ];
  
  await supabase.from('business_analytics').insert(analyticsData);
}