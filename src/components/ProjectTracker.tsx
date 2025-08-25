
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { Building2, Plus, Eye, Calendar, Users, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Project {
  id: string;
  name: string;
  location?: string;
  client?: string;
  start_date?: string;
  end_date?: string;
  meta: any;
  created_at: string;
}

export function ProjectTracker() {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    client: '',
    start_date: '',
    end_date: '',
    description: '',
    budget: '',
    status: 'planning',
  });

  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data?.map(project => ({ ...project, meta: project.meta || {} })) as Project[];
    },
    enabled: !!companyId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projects', companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!companyId) throw new Error('No company ID');
      
      const projectData = {
        company_id: companyId,
        name: data.name,
        location: data.location || null,
        client: data.client || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        meta: {
          description: data.description,
          budget: data.budget ? parseFloat(data.budget) : 0,
          status: data.status,
          progress: 0,
        },
      };

      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: () => {
      toast({ title: "Project created successfully" });
      resetForm();
      setViewMode('list');
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Project updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }
    createProjectMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      client: '',
      start_date: '',
      end_date: '',
      description: '',
      budget: '',
      status: 'planning',
    });
  };

  const viewProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('view');
  };

  const updateProjectStatus = (project: Project, status: string) => {
    updateProjectMutation.mutate({
      id: project.id,
      updates: {
        meta: { ...project.meta, status }
      }
    });
  };

  const updateProjectProgress = (project: Project, progress: number) => {
    updateProjectMutation.mutate({
      id: project.id,
      updates: {
        meta: { ...project.meta, progress }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'on-hold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (viewMode === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">Add a new construction project to track</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('list')}>
            <Eye className="h-4 w-4 mr-2" />
            View Projects
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Kitchen Extension"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    placeholder="Client name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Project address"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Project description and scope"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget">Budget (£)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (viewMode === 'view' && selectedProject) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
            <p className="text-muted-foreground">{selectedProject.meta?.description || 'No description'}</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('list')}>
            Back to Projects
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProject.client && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Client:</span>
                  <span>{selectedProject.client}</span>
                </div>
              )}
              {selectedProject.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{selectedProject.location}</span>
                </div>
              )}
              {selectedProject.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Start:</span>
                  <span>{new Date(selectedProject.start_date).toLocaleDateString()}</span>
                </div>
              )}
              {selectedProject.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">End:</span>
                  <span>{new Date(selectedProject.end_date).toLocaleDateString()}</span>
                  {calculateDaysRemaining(selectedProject.end_date) > 0 && (
                    <Badge variant="outline">
                      {calculateDaysRemaining(selectedProject.end_date)} days left
                    </Badge>
                  )}
                </div>
              )}
              {selectedProject.meta?.budget && (
                <div>
                  <span className="font-medium">Budget:</span>
                  <span className="ml-2">£{selectedProject.meta.budget.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={selectedProject.meta?.status || 'planning'} 
                  onValueChange={(value) => updateProjectStatus(selectedProject, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Progress: {selectedProject.meta?.progress || 0}%</Label>
                <Progress value={selectedProject.meta?.progress || 0} className="mt-2" />
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateProjectProgress(selectedProject, Math.max(0, (selectedProject.meta?.progress || 0) - 10))}
                  >
                    -10%
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateProjectProgress(selectedProject, Math.min(100, (selectedProject.meta?.progress || 0) + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Tracker</h1>
          <p className="text-muted-foreground">Manage your construction projects</p>
        </div>
        <Button onClick={() => setViewMode('create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">Loading projects...</div>
          ) : projects && projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                      {project.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(project.meta?.status || 'planning')}>
                        {project.meta?.status || 'planning'}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => viewProject(project)}>
                        View
                      </Button>
                    </div>
                  </div>
                  
                  {project.meta?.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{project.meta.progress}%</span>
                      </div>
                      <Progress value={project.meta.progress} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {project.start_date && (
                      <div>
                        <span className="text-muted-foreground">Start:</span>
                        <p>{new Date(project.start_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {project.end_date && (
                      <div>
                        <span className="text-muted-foreground">End:</span>
                        <p>{new Date(project.end_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {project.meta?.budget && (
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <p>£{project.meta.budget.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p>{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No projects yet. Create your first project!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
