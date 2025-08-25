
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, FileText, Calculator, Users, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

interface ActivityItem {
  id: string;
  type: 'quote' | 'timesheet' | 'reminder' | 'project' | 'calculation';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export function RecentActivity() {
  const companyId = useCompanyId();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const activities: ActivityItem[] = [];

      // Fetch recent quotes
      const { data: quotes } = await supabase
        .from('quotes')
        .select('id, title, created_at, status')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5);

      quotes?.forEach(quote => {
        activities.push({
          id: quote.id,
          type: 'quote',
          title: 'Quote Created',
          description: quote.title,
          timestamp: quote.created_at,
          status: quote.status,
        });
      });

      // Fetch recent timesheets
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('id, description, created_at, status')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5);

      timesheets?.forEach(timesheet => {
        activities.push({
          id: timesheet.id,
          type: 'timesheet',
          title: 'Time Logged',
          description: timesheet.description || 'Work session',
          timestamp: timesheet.created_at,
          status: timesheet.status,
        });
      });

      // Fetch recent reminders
      const { data: reminders } = await supabase
        .from('reminders')
        .select('id, title, created_at, completed')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5);

      reminders?.forEach(reminder => {
        activities.push({
          id: reminder.id,
          type: 'reminder',
          title: 'Reminder Created',
          description: reminder.title,
          timestamp: reminder.created_at,
          status: reminder.completed ? 'completed' : 'pending',
        });
      });

      // Fetch recent projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3);

      projects?.forEach(project => {
        activities.push({
          id: project.id,
          type: 'project',
          title: 'Project Created',
          description: project.name,
          timestamp: project.created_at,
        });
      });

      // Sort all activities by timestamp
      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10);
    },
    enabled: !!companyId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-4 w-4" />;
      case 'timesheet':
        return <Clock className="h-4 w-4" />;
      case 'reminder':
        return <AlertCircle className="h-4 w-4" />;
      case 'project':
        return <Users className="h-4 w-4" />;
      case 'calculation':
        return <Calculator className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variant = status === 'completed' ? 'default' : 
                   status === 'pending' ? 'secondary' : 
                   status === 'active' ? 'default' : 'outline';
    
    return <Badge variant={variant} className="text-xs">{status}</Badge>;
  };

  if (!companyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Please sign in to view recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No recent activity
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
