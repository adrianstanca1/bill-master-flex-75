export interface Project {
  id: string;
  name: string;
  status: string;
  budget?: number;
  progress?: number;
  spent?: number;
}

export function useProjectsData() {
  return {
    projects: [] as Project[],
    projectsWithHealth: [] as Project[],
    analytics: { isLoading: false },
    loading: false,
    error: null,
    refetch: () => {}
  };
}