
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DashboardGrid({ 
  children, 
  columns = 'auto',
  gap = 'md',
  className = ''
}: DashboardGridProps) {
  const isMobile = useIsMobile();
  
  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  };

  const getColumnClasses = () => {
    if (isMobile) {
      return 'grid-cols-1';
    }
    
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case 'auto': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={cn(
      'grid w-full',
      getColumnClasses(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}
