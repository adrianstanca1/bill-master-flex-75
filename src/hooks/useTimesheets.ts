import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useTimesheets() {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { toast } = useToast();

  const startTimerMutation = {
    mutate: () => {
      toast({
        title: "Feature coming soon",
        description: "Timesheet functionality will be available once the timesheets module is implemented.",
      });
    },
    isPending: false
  };

  const stopTimerMutation = {
    mutate: () => {
      toast({
        title: "Feature coming soon",
        description: "Timesheet functionality will be available once the timesheets module is implemented.",
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