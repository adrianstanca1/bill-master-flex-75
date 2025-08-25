
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface BusinessMetricsProps {
  data: {
    revenue: {
      current: number;
      target: number;
      growth: number;
    };
    projects: {
      active: number;
      completed: number;
      pending: number;
    };
    team: {
      utilization: number;
      capacity: number;
    };
  };
}

const BusinessMetrics = memo(({ data }: BusinessMetricsProps) => {
  const isMobile = useIsMobile();
  
  const revenueProgress = (data.revenue.current / data.revenue.target) * 100;
  const isRevenuePositive = data.revenue.growth > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Revenue Card */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-primary" />
            Revenue Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                £{data.revenue.current.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                / £{data.revenue.target.toLocaleString()}
              </span>
            </div>
            <Progress value={revenueProgress} className="h-2" />
            <div className="flex items-center gap-2">
              {isRevenuePositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isRevenuePositive ? "text-green-600" : "text-red-600"
              )}>
                {isRevenuePositive ? '+' : ''}{data.revenue.growth}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Card */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-primary" />
            Project Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{data.projects.active}</div>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{data.projects.completed}</div>
                <Badge variant="secondary" className="text-xs">Done</Badge>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{data.projects.pending}</div>
                <Badge variant="outline" className="text-xs">Pending</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Utilization Card */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            Team Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{data.team.utilization}%</span>
              <span className="text-sm text-muted-foreground">
                of {data.team.capacity} capacity
              </span>
            </div>
            <Progress value={data.team.utilization} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Optimal range: 80-95%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BusinessMetrics.displayName = 'BusinessMetrics';

export { BusinessMetrics };
