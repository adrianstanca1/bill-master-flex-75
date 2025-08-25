
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOptimized } from '@/components/MobileOptimized';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveLayout({ 
  children, 
  className = '', 
  maxWidth = 'full',
  padding = 'md'
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2',
    md: 'px-4 py-4 md:px-6 md:py-6',
    lg: 'px-6 py-6 md:px-8 md:py-8'
  };

  return (
    <main className={cn(
      'w-full mx-auto min-h-[calc(100vh-4rem)]',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      isMobile ? 'safe-area-top safe-area-bottom' : '',
      className
    )}>
      <div className={cn(
        'w-full',
        isMobile ? 'space-y-4' : 'space-y-6'
      )}>
        {children}
      </div>
    </main>
  );
}
