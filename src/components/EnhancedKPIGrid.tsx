import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Target,
  BarChart3,
  Activity,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  target?: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  description?: string;
  progress?: number;
}

interface EnhancedKPIGridProps {
  metrics?: KPIMetric[];
  className?: string;
}

const defaultMetrics: KPIMetric[] = [
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    value: '£87,420',
    previousValue: '£73,250',
    target: '£100,000',
    unit: '£',
    trend: 'up',
    trendPercentage: 19.4,
    status: 'good',
    icon: DollarSign,
    description: 'Revenue growth trending upward',
    progress: 87
  },
  {
    id: 'projects',
    title: 'Active Projects',
    value: 12,
    previousValue: 8,
    target: 15,
    trend: 'up',
    trendPercentage: 50,
    status: 'excellent',
    icon: BarChart3,
    description: 'Project portfolio expanding',
    progress: 80
  },
  {
    id: 'team-utilization',
    title: 'Team Utilization',
    value: '92%',
    previousValue: '89%',
    target: '95%',
    unit: '%',
    trend: 'up',
    trendPercentage: 3.4,
    status: 'excellent',
    icon: Users,
    description: 'High team efficiency',
    progress: 92
  },
  {
    id: 'profit-margin',
    title: 'Profit Margin',
    value: '18.5%',
    previousValue: '22.1%',
    target: '20%',
    unit: '%',
    trend: 'down',
    trendPercentage: -16.3,
    status: 'warning',
    icon: Target,
    description: 'Margin pressure detected',
    progress: 75
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Health',
    value: '£45,230',
    previousValue: '£38,900',
    trend: 'up',
    trendPercentage: 16.3,
    status: 'good',
    icon: Activity,
    description: 'Strong liquidity position',
    progress: 85
  },
  {
    id: 'overdue-invoices',
    title: 'Overdue Amount',
    value: '£12,340',
    previousValue: '£8,750',
    trend: 'up',
    trendPercentage: 41,
    status: 'critical',
    icon: AlertTriangle,
    description: 'Requires immediate attention',
    progress: 25
  }
];

export function EnhancedKPIGrid({ metrics = defaultMetrics, className }: EnhancedKPIGridProps) {
  const getStatusColor = (status: KPIMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: KPIMetric['trend'], percentage?: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    }
    return null;
  };

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Card key={metric.id} className="hover-glow transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", getStatusColor(metric.status))}>
                  {metric.status}
                </Badge>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Main Value */}
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  {metric.target && (
                    <div className="text-sm text-muted-foreground">
                      / {metric.target}
                    </div>
                  )}
                </div>

                {/* Trend Information */}
                {metric.trendPercentage && (
                  <div className="flex items-center gap-1 text-xs">
                    {getTrendIcon(metric.trend, metric.trendPercentage)}
                    <span className={cn(
                      "font-medium",
                      metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {metric.trendPercentage > 0 ? '+' : ''}
                      {metric.trendPercentage.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
                  </div>
                )}

                {/* Progress Bar */}
                {typeof metric.progress === 'number' && (
                  <div className="space-y-1">
                    <Progress 
                      value={metric.progress} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {metric.progress}% of target
                    </div>
                  </div>
                )}

                {/* Description */}
                {metric.description && (
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}