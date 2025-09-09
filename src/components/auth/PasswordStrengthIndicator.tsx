import { useState, useEffect } from "react";
import { Shield, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  onStrengthChange?: (strength: number, isValid: boolean) => void;
}

interface Requirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  weight: number;
}

const requirements: Requirement[] = [
  {
    id: "length",
    label: "At least 12 characters",
    test: (p) => p.length >= 12,
    weight: 2
  },
  {
    id: "uppercase", 
    label: "One uppercase letter",
    test: (p) => /[A-Z]/.test(p),
    weight: 1
  },
  {
    id: "lowercase",
    label: "One lowercase letter", 
    test: (p) => /[a-z]/.test(p),
    weight: 1
  },
  {
    id: "number",
    label: "One number",
    test: (p) => /\d/.test(p),
    weight: 1
  },
  {
    id: "special",
    label: "One special character (@$!%*?&)",
    test: (p) => /[@$!%*?&]/.test(p),
    weight: 1
  }
];

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true,
  onStrengthChange 
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setIsValid(false);
      onStrengthChange?.(0, false);
      return;
    }

    const passedRequirements = requirements.filter(req => req.test(password));
    const totalWeight = requirements.reduce((sum, req) => sum + req.weight, 0);
    const passedWeight = passedRequirements.reduce((sum, req) => sum + req.weight, 0);
    
    const strengthScore = (passedWeight / totalWeight) * 100;
    const valid = passedRequirements.length === requirements.length;
    
    setStrength(strengthScore);
    setIsValid(valid);
    onStrengthChange?.(strengthScore, valid);
  }, [password, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength === 0) return "hsl(var(--muted-foreground))";
    if (strength < 40) return "hsl(var(--destructive))";
    if (strength < 70) return "hsl(24.6 95% 53.1%)"; // warning-amber
    return "hsl(142.1 76.2% 36.3%)"; // success-green
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "Enter password";
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  if (!password && !showRequirements) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Password Strength
          </span>
          <span 
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: getStrengthColor() }}
          >
            {getStrengthLabel()}
          </span>
        </div>
        
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${strength}%`,
              backgroundColor: getStrengthColor()
            }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Password Requirements:</p>
          <div className="space-y-1">
            {requirements.map((req) => {
              const passed = password ? req.test(password) : false;
              return (
                <div 
                  key={req.id}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-all duration-200",
                    passed ? "text-success-green" : "text-muted-foreground"
                  )}
                >
                  {passed ? (
                    <Check className="w-4 h-4 text-success-green" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={passed ? "font-medium" : ""}>{req.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Tips */}
      {password && !isValid && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-amber/10 border border-warning-amber/20">
          <AlertCircle className="w-4 h-4 text-warning-amber mt-0.5 flex-shrink-0" />
          <div className="text-sm text-warning-amber">
            <p className="font-medium">Security Tip:</p>
            <p>Strong passwords protect your account from unauthorized access.</p>
          </div>
        </div>
      )}
    </div>
  );
}