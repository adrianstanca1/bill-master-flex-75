
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Play, Square, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

interface TimesheetControlsProps {
  activeTimer: any;
  elapsedTime: number;
  onStartTimer: (description: string, projectId: string) => void;
  onStopTimer: () => void;
  startLoading: boolean;
  stopLoading: boolean;
}

export function TimesheetControls({ 
  activeTimer, 
  elapsedTime, 
  onStartTimer, 
  onStopTimer, 
  startLoading, 
  stopLoading 
}: TimesheetControlsProps) {
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const companyId = useCompanyId();

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', companyId);
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    onStartTimer(description, selectedProject);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Current Timer Display */}
      <div className="text-center space-y-4">
        <div className="text-4xl md:text-6xl font-mono font-bold text-primary">
          {formatTime(elapsedTime)}
        </div>
        {activeTimer && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            <span>Timer running since {new Date(activeTimer.start_time).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Timer Controls */}
      {!activeTimer ? (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Project (Optional)</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Description (Optional)</Label>
            <Textarea
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleStartTimer}
            disabled={startLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Timer
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-accent rounded-lg">
            <h4 className="font-medium mb-2">Current Activity</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {activeTimer.description && (
                <p><strong>Description:</strong> {activeTimer.description}</p>
              )}
              {activeTimer.project_id && projects && (
                <p><strong>Project:</strong> {projects.find(p => p.id === activeTimer.project_id)?.name}</p>
              )}
            </div>
          </div>

          <Button 
            onClick={onStopTimer}
            disabled={stopLoading}
            variant="destructive"
            className="w-full h-12 text-lg"
            size="lg"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop Timer
          </Button>
        </div>
      )}
    </div>
  );
}
