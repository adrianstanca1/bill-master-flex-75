import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Timesheet {
  id: string;
  project_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  status: string;
  description?: string;
}

export function useTimesheets() {
  const [activeTimer, setActiveTimer] = useState<Timesheet | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['timesheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('construction_time_entries')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data as Timesheet[];
    }
  });

  // Find active timer
  useEffect(() => {
    const active = timesheets.find(t => t.status === 'active' && !t.end_time);
    setActiveTimer(active || null);
  }, [timesheets]);

  // Update elapsed time for active timer
  useEffect(() => {
    if (!activeTimer) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeTimer.start_time).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const startTimerMutation = useMutation({
    mutationFn: async (data: { project_id: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: timeEntry, error } = await supabase
        .from('construction_time_entries')
        .insert({
          project_id: data.project_id,
          user_id: user.id,
          start_time: new Date().toISOString(),
          status: 'active',
          description: data.description
        })
        .select()
        .single();

      if (error) throw error;
      return timeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      toast({ title: 'Timer started' });
    },
    onError: (error) => {
      toast({
        title: 'Error starting timer',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const stopTimerMutation = useMutation({
    mutationFn: async (timesheetId: string) => {
      const endTime = new Date();
      const { data: timeEntry } = await supabase
        .from('construction_time_entries')
        .select('start_time')
        .eq('id', timesheetId)
        .single();

      if (!timeEntry) throw new Error('Timesheet not found');

      const startTime = new Date(timeEntry.start_time);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

      const { error } = await supabase
        .from('construction_time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
          status: 'completed'
        })
        .eq('id', timesheetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      toast({ title: 'Timer stopped' });
    },
    onError: (error) => {
      toast({
        title: 'Error stopping timer',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    timesheets,
    isLoading,
    activeTimer,
    elapsedTime,
    startTimerMutation,
    stopTimerMutation,
  };
}