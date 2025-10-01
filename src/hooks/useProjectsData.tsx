import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from './useCompanyId';

export interface Project {
  id: string;
  name: string;
  status: string;
  budget?: number;
  progress?: number;
  spent?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export function useProjectsData() {
  const { companyId } = useCompanyId();

  const { data: projects = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('projects_data')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status || 'active',
        budget: project.budget ? Number(project.budget) : undefined,
        progress: 0, // Calculate based on tasks/milestones if available
        spent: 0, // Calculate from expenses if available
        start_date: project.start_date,
        end_date: project.end_date,
        description: project.description
      })) as Project[];
    },
    enabled: !!companyId
  });

  const projectsWithHealth = projects.map(project => ({
    ...project,
    health: calculateProjectHealth(project)
  }));

  return {
    projects,
    projectsWithHealth,
    analytics: { isLoading: loading },
    loading,
    error,
    refetch
  };
}

function calculateProjectHealth(project: Project) {
  if (!project.budget) return 'good';
  
  const spentRatio = (project.spent || 0) / project.budget;
  const progressRatio = (project.progress || 0) / 100;
  
  if (spentRatio > progressRatio + 0.2) return 'critical';
  if (spentRatio > progressRatio + 0.1) return 'warning';
  return 'good';
}