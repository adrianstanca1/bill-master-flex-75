
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';



interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileOptimized({ 
  children, 
  className = ''
}: MobileOptimizedProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'touch-manipulation select-none' : ''} ${className}`}>
      {children}
    </div>
  );
}
