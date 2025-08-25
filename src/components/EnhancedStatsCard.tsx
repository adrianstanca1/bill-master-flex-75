
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnhancedStatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export function EnhancedStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  className,
  onClick,
  variant = 'default'
}: EnhancedStatsCardProps) {
  const isMobile = useIsMobile();

  const variants = {
    default: 'p-4 md:p-6',
    compact: 'p-3 md:p-4',
    featured: 'p-6 md:p-8 border-2 border-primary/20 bg-primary/5'
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        onClick && "cursor-pointer active:scale-[0.98]",
        variants[variant],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className={cn(
          "flex items-start justify-between",
          isMobile ? "flex-col space-y-3" : "flex-row"
        )}>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn(
                "text-primary",
                isMobile ? "h-5 w-5" : "h-6 w-6"
              )} />
              <h3 className={cn(
                "font-medium text-muted-foreground uppercase tracking-wide",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {title}
              </h3>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={cn(
                  "font-bold text-foreground",
                  isMobile ? "text-xl" : "text-2xl md:text-3xl"
                )}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
                {trend && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    trend.isPositive 
                      ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30" 
                      : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                  )}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                    {trend.label && ` ${trend.label}`}
                  </span>
                )}
              </div>
              
              {description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
