
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, Calendar, Bell, Camera, Package, Shield,
  Zap
} from 'lucide-react';

interface QuickAction {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
  color: string;
  description: string;
}

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
}

export function QuickActions({ onTabChange }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    { 
      icon: Clock, 
      label: 'Start Timer', 
      action: () => onTabChange('timesheets'), 
      color: 'text-blue-600',
      description: 'Begin time tracking'
    },
    { 
      icon: Calendar, 
      label: 'Add Daywork', 
      action: () => onTabChange('dayworks'), 
      color: 'text-green-600',
      description: 'Record daily progress'
    },
    { 
      icon: Bell, 
      label: 'Set Reminder', 
      action: () => onTabChange('reminders'), 
      color: 'text-yellow-600',
      description: 'Create task reminder'
    },
    { 
      icon: Camera, 
      label: 'Upload Photo', 
      action: () => onTabChange('photos'), 
      color: 'text-purple-600',
      description: 'Document site progress'
    },
    { 
      icon: Package, 
      label: 'Track Asset', 
      action: () => onTabChange('assets'), 
      color: 'text-indigo-600',
      description: 'Manage equipment'
    },
    { 
      icon: Shield, 
      label: 'Create RAMS', 
      action: () => onTabChange('rams'), 
      color: 'text-red-600',
      description: 'Generate safety document'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 md:h-24 flex-col gap-2 p-3 text-center hover:shadow-md transition-all"
              onClick={action.action}
            >
              <action.icon className={`h-5 w-5 md:h-6 md:w-6 ${action.color}`} />
              <div className="space-y-1">
                <span className="text-xs md:text-sm font-medium leading-none">
                  {action.label}
                </span>
                <span className="text-xs text-muted-foreground hidden md:block">
                  {action.description}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
