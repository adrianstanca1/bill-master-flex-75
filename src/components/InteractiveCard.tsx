
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'glass' | 'neon' | 'floating' | 'default';
  interactive?: boolean;
  shimmer?: boolean;
  className?: string;
  onClick?: () => void;
}

export function InteractiveCard({ 
  title, 
  children, 
  icon: Icon, 
  variant = 'default',
  interactive = true,
  shimmer = false,
  className = '',
  onClick 
}: InteractiveCardProps) {
  const variantClasses = {
    glass: 'bg-gradient-glass backdrop-blur-xl border border-border/50 shadow-floating',
    neon: 'bg-surface border-2 border-emerald/30 shadow-neon animate-pulse-glow',
    floating: 'bg-card shadow-floating hover:shadow-glow',
    default: 'bg-card border border-border shadow-widget'
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-500",
        variantClasses[variant],
        interactive && [
          "hover:scale-[1.02] hover:-translate-y-1 cursor-pointer",
          "animate-widget-float hover:animate-none",
          "hover:shadow-glow"
        ],
        shimmer && "before:absolute before:inset-0 before:bg-shimmer before:animate-shimmer",
        className
      )}
      onClick={onClick}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 via-transparent to-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect */}
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      {title && (
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="flex items-center gap-3 text-text-primary group-hover:text-emerald transition-colors">
            {Icon && (
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow group-hover:animate-wiggle">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {title}
            </span>
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="relative z-10">
        {children}
      </CardContent>

      {/* Interactive border glow */}
      {interactive && (
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-emerald/30 transition-colors duration-500" />
      )}
    </Card>
  );
}

interface FlashCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function FlashCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  className = ''
}: FlashCardProps) {
  return (
    <InteractiveCard 
      variant="floating" 
      shimmer 
      className={cn("animate-morph hover:animate-none", className)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider animate-fade-in">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-scale-in">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full animate-bounce-in",
                trend.isPositive 
                  ? "bg-emerald/20 text-emerald animate-pulse-glow" 
                  : "bg-red-500/20 text-red-400"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-gradient-primary rounded-xl shadow-glow animate-float">
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
      </div>
    </InteractiveCard>
  );
}
