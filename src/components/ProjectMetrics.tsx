
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

interface ProjectMetricsProps {
  projectId?: string;
}

export function ProjectMetrics({ projectId }: ProjectMetricsProps) {
  const companyId = useCompanyId();

  const { data: projects } = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const { data: timesheets } = useQuery({
    queryKey: ['timesheets-summary', companyId, projectId],
    queryFn: async () => {
      if (!companyId) return [];
      let query = supabase
        .from('timesheets')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'completed');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const { data: reminders } = useQuery({
    queryKey: ['reminders-summary', companyId, projectId],
    queryFn: async () => {
      if (!companyId) return [];
      let query = supabase
        .from('reminders')
        .select('*')
        .eq('company_id', companyId);
      
      if (projectId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const activeProjects = projects?.filter(p => p.end_date === null || new Date(p.end_date) > new Date()) || [];
  const completedProjects = projects?.filter(p => p.end_date && new Date(p.end_date) <= new Date()) || [];
  
  const totalHours = timesheets?.reduce((sum, ts) => {
    if (ts.start_time && ts.end_time) {
      const start = new Date(ts.start_time);
      const end = new Date(ts.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return sum;
  }, 0) || 0;

  const pendingReminders = reminders?.filter(r => !r.completed) || [];
  const overdueReminders = reminders?.filter(r => 
    !r.completed && new Date(r.due_date) < new Date()
  ) || [];

  if (!companyId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Please sign in to view project metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeProjects.length}</div>
          <p className="text-xs text-muted-foreground">
            {completedProjects.length} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Hours logged this period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingReminders.length}</div>
          <p className="text-xs text-muted-foreground">
            Tasks awaiting completion
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{overdueReminders.length}</div>
          <p className="text-xs text-muted-foreground">
            Items past due date
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
