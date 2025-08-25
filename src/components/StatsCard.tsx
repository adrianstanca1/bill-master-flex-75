
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  onClick 
}: StatsCardProps) {
  return (
    <Card 
      className={cn(
        "widget-flash group relative overflow-hidden cursor-pointer",
        "transition-all duration-500 animate-widget-float hover:animate-none",
        "hover:scale-[1.02] hover:-translate-y-2 hover:shadow-glow",
        className
      )}
      onClick={onClick}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 via-transparent to-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <CardContent className="pt-4 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide animate-fade-in">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-scale-in">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full animate-bounce-in",
                  trend.isPositive 
                    ? "text-emerald bg-emerald/20 animate-pulse-glow" 
                    : "text-red-600 bg-red-600/20 animate-flash"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="p-2 bg-gradient-primary rounded-lg shadow-glow animate-float group-hover:animate-wiggle">
            <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
          </div>
        </div>
      </CardContent>

      {/* Interactive border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-emerald/30 transition-colors duration-500" />
    </Card>
  );
}
