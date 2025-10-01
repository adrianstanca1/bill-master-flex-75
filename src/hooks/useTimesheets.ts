import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useTimesheets() {
  const [activeTimer] = useState(null);
  const [elapsedTime] = useState(0);
  const { toast } = useToast();

  const startTimerMutation = {
    mutate: () => {
      toast({
        title: "Timesheet feature coming soon",
        description: "Time tracking will be available once the construction_time_entries table is configured.",
      });
    },
    isPending: false
  };

  const stopTimerMutation = {
    mutate: () => {
      toast({
        title: "Timesheet feature coming soon",
        description: "Time tracking will be available once the construction_time_entries table is configured.",
      });
    },
    isPending: false
  };

  return {
    timesheets: [],
    isLoading: false,
    activeTimer,
    elapsedTime,
    startTimerMutation,
    stopTimerMutation,
  };
}
