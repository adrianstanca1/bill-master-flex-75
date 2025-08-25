import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Camera,
  Settings
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  location?: string;
  client?: string;
  start_date?: string;
  end_date?: string;
  meta: any;
  created_at: string;
  company_id: string;
}

interface ProjectDashboardProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDashboard({ projectId, onBack }: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return { ...data, meta: data.meta || {} } as Project;
    },
    enabled: !!projectId,
  });

  // Fetch project timesheets
  const { data: timesheets } = useQuery({
    queryKey: ['project-timesheets', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch project expenses - Skip if project_id doesn't exist in expenses table
  const { data: expenses } = useQuery({
    queryKey: ['project-expenses', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId && !!companyId,
  });

  // Fetch project photos
  const { data: photos } = useQuery({
    queryKey: ['project-photos', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_photos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Update project progress
  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ meta: { ...project?.meta, progress: Math.max(0, Math.min(100, progress)) } })
        .eq('id', projectId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast({ title: "Progress updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p>Project not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const totalHours = timesheets?.reduce((sum, t) => {
    if (t.end_time && t.start_time) {
      const duration = new Date(t.end_time).getTime() - new Date(t.start_time).getTime();
      return sum + (duration / (1000 * 60 * 60));
    }
    return sum;
  }, 0) || 0;

  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const progress = project.meta?.progress || 0;
  const budget = project.meta?.budget || 0;
  const status = project.meta?.status || 'planning';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'default';
      case 'in-progress': return 'secondary';
      case 'completed': return 'outline';
      case 'on-hold': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Projects
          </Button>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.meta?.description || 'No description'}</p>
        </div>
        <Badge variant={getStatusColor(status)} className="text-lg px-3 py-1">
          {status}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{progress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours Logged</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">£{totalExpenses.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Status</p>
                <p className="text-2xl font-bold">
                  {budget > 0 ? `${((totalExpenses / budget) * 100).toFixed(0)}%` : 'N/A'}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${totalExpenses > budget * 0.8 ? 'text-destructive' : 'text-primary'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timesheets">Time</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.client && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Client:</span>
                    <span>{project.client}</span>
                  </div>
                )}
                {project.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>{project.location}</span>
                  </div>
                )}
                {project.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Start:</span>
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">End:</span>
                    <span>{new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                {budget > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Budget:</span>
                    <span>£{budget.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Current Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateProgressMutation.mutate(progress - 10)}
                    disabled={updateProgressMutation.isPending}
                  >
                    -10%
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateProgressMutation.mutate(progress + 10)}
                    disabled={updateProgressMutation.isPending}
                  >
                    +10%
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateProgressMutation.mutate(100)}
                    disabled={updateProgressMutation.isPending}
                  >
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {timesheets && timesheets.length > 0 ? (
                <div className="space-y-2">
                  {timesheets.slice(0, 10).map((timesheet) => (
                    <div key={timesheet.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">
                          {new Date(timesheet.start_time).toLocaleDateString()}
                        </span>
                        {timesheet.description && (
                          <p className="text-sm text-muted-foreground">{timesheet.description}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {timesheet.end_time ? 
                          `${((new Date(timesheet.end_time).getTime() - new Date(timesheet.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)}h` :
                          'Active'
                        }
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No time entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Project Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses && expenses.length > 0 ? (
                <div className="space-y-2">
                  {expenses.slice(0, 10).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{expense.category || 'Uncategorized'}</span>
                        {expense.supplier && (
                          <p className="text-sm text-muted-foreground">{expense.supplier}</p>
                        )}
                      </div>
                      <span className="font-bold">£{Number(expense.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No expenses recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Site Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {photos && photos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {photos.slice(0, 9).map((photo) => (
                    <div key={photo.id} className="border rounded-lg overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || 'Site photo'} 
                        className="w-full h-32 object-cover"
                      />
                      {photo.caption && (
                        <div className="p-2">
                          <p className="text-sm">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No photos uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Project settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}