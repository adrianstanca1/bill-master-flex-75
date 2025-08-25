import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';
import { commonValidationRules } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
  icon: React.ReactNode;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pwd: string): number => {
    if (!pwd) return 0;
    
    let score = 0;
    const requirements = [
      pwd.length >= 12,
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[@$!%*?&]/.test(pwd),
      pwd.length >= 16
    ];
    
    score = requirements.filter(Boolean).length;
    return Math.min((score / requirements.length) * 100, 100);
  };

  const getRequirements = (pwd: string): PasswordRequirement[] => [
    {
      label: 'At least 12 characters',
      met: pwd.length >= 12,
      icon: pwd.length >= 12 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(pwd),
      icon: /[a-z]/.test(pwd) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(pwd),
      icon: /[A-Z]/.test(pwd) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
    },
    {
      label: 'Contains number',
      met: /\d/.test(pwd),
      icon: /\d/.test(pwd) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
    },
    {
      label: 'Contains special character (@$!%*?&)',
      met: /[@$!%*?&]/.test(pwd),
      icon: /[@$!%*?&]/.test(pwd) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
    }
  ];

  const strength = calculateStrength(password);
  const requirements = getRequirements(password);
  const isValid = commonValidationRules.password.pattern?.test(password) && password.length >= 12;

  const getStrengthColor = () => {
    if (strength < 40) return 'hsl(var(--destructive))';
    if (strength < 70) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getStrengthLabel = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Password Strength</span>
          <Badge 
            variant={strength < 40 ? 'destructive' : strength < 70 ? 'secondary' : 'default'}
            className="text-xs"
          >
            {getStrengthLabel()}
          </Badge>
        </div>
        <Progress 
          value={strength} 
          className="h-2"
          style={{ 
            '--progress-color': getStrengthColor(),
          } as React.CSSProperties}
        />
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground">Requirements:</div>
        {requirements.map((req, index) => (
          <div 
            key={index}
            className={`flex items-center gap-2 text-xs ${
              req.met ? 'text-success' : 'text-muted-foreground'
            }`}
          >
            <span className={req.met ? 'text-success' : 'text-destructive'}>
              {req.icon}
            </span>
            {req.label}
          </div>
        ))}
      </div>

      {!isValid && password.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
          <AlertTriangle className="h-3 w-3" />
          Password does not meet security requirements
        </div>
      )}
    </div>
  );
}