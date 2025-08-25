
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Clock } from 'lucide-react';
import { useCompanyId } from '@/hooks/useCompanyId';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TimesheetControls } from '@/components/TimesheetControls';
import { useTimesheets } from '@/hooks/useTimesheets';
import type { Timesheet } from '@/types/business';

export function TimesheetTracker() {
  const companyId = useCompanyId();
  const { 
    timesheets, 
    isLoading, 
    activeTimer, 
    elapsedTime, 
    startTimerMutation, 
    stopTimerMutation 
  } = useTimesheets();

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (description: string, projectId: string) => {
    startTimerMutation.mutate({ description, selectedProject: projectId });
  };

  const handleStopTimer = () => {
    stopTimerMutation.mutate();
  };

  if (!companyId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please set up your company in Settings first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Time Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimesheetControls
            activeTimer={activeTimer}
            elapsedTime={elapsedTime}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            startLoading={startTimerMutation.isPending}
            stopLoading={stopTimerMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Recent Timesheets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Timesheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text="Loading timesheets..." />
          ) : timesheets && timesheets.length > 0 ? (
            <div className="space-y-3">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={timesheet.status === 'active' ? 'default' : 'secondary'}>
                          {timesheet.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(timesheet.start_time).toLocaleDateString()}
                        </span>
                      </div>
                      {timesheet.description && (
                        <p className="text-sm">{timesheet.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {formatDuration(timesheet.start_time, timesheet.end_time)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(timesheet.start_time).toLocaleTimeString()} - 
                        {timesheet.end_time ? new Date(timesheet.end_time).toLocaleTimeString() : 'Running'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No timesheets yet. Start your first timer!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
