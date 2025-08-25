
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CyberButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'cyber' | 'ghost' | 'neon' | 'flash' | 'default';
  icon?: LucideIcon;
  loading?: boolean;
  glow?: boolean;
  shimmer?: boolean;
}

export function CyberButton({ 
  children, 
  variant = 'cyber', 
  icon: Icon, 
  loading = false,
  glow = false,
  shimmer = true,
  className = '',
  disabled,
  ...props 
}: CyberButtonProps) {
  const variantClasses = {
    cyber: 'button-flash',
    ghost: 'bg-transparent border-2 border-emerald/30 text-emerald hover:bg-emerald/10 hover:border-emerald',
    neon: 'bg-surface border-2 border-emerald/30 text-emerald shadow-neon animate-pulse-glow hover:shadow-glow',
    flash: 'button-flash animate-morph hover:animate-none',
    default: 'bg-primary text-primary-foreground hover:bg-primary/90'
  };

  const buttonVariant = variant === 'ghost' ? 'ghost' : 'default';
  const glowClass = glow ? 'shadow-glow hover:shadow-neon' : '';
  
  return (
    <Button
      variant={buttonVariant}
      className={cn(
        variantClasses[variant],
        glowClass,
        "touch-target relative overflow-hidden group animate-widget-hover",
        "transition-all duration-300 hover:scale-105 active:scale-95",
        shimmer && "before:absolute before:inset-0 before:bg-shimmer before:animate-shimmer before:opacity-0 hover:before:opacity-100",
        loading && "pointer-events-none animate-pulse",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center gap-2 relative z-10">
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : Icon ? (
          <Icon className="h-4 w-4 animate-bounce-in group-hover:animate-wiggle" />
        ) : null}
        <span className="animate-shimmer-text">
          {children}
        </span>
      </div>
      
      {/* Enhanced animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Flash border effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-emerald/50 transition-colors duration-300" />
    </Button>
  );
}

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({ 
  icon: Icon, 
  onClick, 
  className = '',
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-50 p-4 rounded-full shadow-neon',
        'bg-gradient-primary hover:scale-110 transition-all duration-300',
        'animate-float hover:animate-pulse-glow',
        'widget-flash hover:shadow-glow',
        positionClasses[position],
        className
      )}
    >
      <Icon className="h-6 w-6 text-primary-foreground animate-bounce-in" />
      
      {/* Pulsing ring effect */}
      <div className="absolute inset-0 rounded-full border-2 border-emerald/50 animate-ping opacity-75" />
    </button>
  );
}
