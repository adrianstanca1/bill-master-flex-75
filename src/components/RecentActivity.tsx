import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

interface ActivityItem {
  id: string;
  type: 'quote';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export function RecentActivity() {
  const companyId = useCompanyId();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity', companyId?.companyId],
    queryFn: async () => {
      if (!companyId?.companyId) return [];
      
      const activities: ActivityItem[] = [];

      // Fetch recent quotes
      const { data: quotes } = await supabase
        .from('quotes')
        .select('id, title, created_at, status')
        .eq('company_id', companyId.companyId)
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

      return activities;
    },
    enabled: !!companyId?.companyId,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variant = status === 'sent' ? 'default' : 
                   status === 'draft' ? 'secondary' : 
                   status === 'accepted' ? 'default' : 'outline';
    
    return <Badge variant={variant} className="text-xs">{status}</Badge>;
  };

  if (!companyId?.companyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
                <div key={activity.id} className="flex items-start space-x-3">
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
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}