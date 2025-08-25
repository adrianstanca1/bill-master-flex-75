import { commonValidationRules } from '@/lib/validation';

export function usePasswordSecurity() {
  const validatePasswordStrength = (password: string) => {
    if (!password) return { strength: 0, isSecure: false };
    
    const pattern = commonValidationRules.password.pattern;
    const minLength = commonValidationRules.password.minLength || 12;
    
    let score = 0;
    const requirements = [
      password.length >= minLength,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[@$!%*?&]/.test(password),
      password.length >= 16
    ];
    
    score = requirements.filter(Boolean).length;
    const strength = Math.min((score / requirements.length) * 100, 100);
    const isSecure = pattern ? pattern.test(password) && password.length >= minLength : false;
    
    return { strength, isSecure };
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return 'hsl(var(--destructive))';
    if (strength < 70) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  return {
    validatePasswordStrength,
    getPasswordStrengthColor,
    passwordStrength: 0,
    isSecure: false,
    isValidating: false,
    checkPassword: validatePasswordStrength
  };
}