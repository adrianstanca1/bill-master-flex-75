
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from './useCompanyId';
import { useToast } from '@/hooks/use-toast';
import type { Timesheet } from '@/types/business';

export function useTimesheets() {
  const [activeTimer, setActiveTimer] = useState<Timesheet | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  // Fetch timesheets
  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['timesheets', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Timesheet[];
    },
    enabled: !!companyId,
    refetchInterval: 5000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('timesheets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timesheets',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['timesheets', companyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  // Find active timer
  useEffect(() => {
    const active = timesheets?.find(t => t.status === 'active');
    setActiveTimer(active || null);
    
    if (active) {
      const startTime = new Date(active.start_time).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - startTime) / 1000));
    } else {
      setElapsedTime(0);
    }
  }, [timesheets]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.start_time).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async ({ description, selectedProject }: { description: string; selectedProject: string }) => {
      if (!companyId) throw new Error('No company ID');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (activeTimer) {
        throw new Error('Please stop the current timer before starting a new one');
      }

      const { data, error } = await supabase
        .from('timesheets')
        .insert({
          company_id: companyId,
          user_id: user.id,
          project_id: selectedProject || null,
          start_time: new Date().toISOString(),
          description: description.trim() || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Timer started",
        description: "Your timesheet tracking has begun.",
      });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start timer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: async () => {
      if (!activeTimer) throw new Error('No active timer');

      const { data, error } = await supabase
        .from('timesheets')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', activeTimer.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Timer stopped",
        description: "Your timesheet has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
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
