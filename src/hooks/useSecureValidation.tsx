import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export function useSecureValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [violations, setViolations] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validate = async (data: Record<string, any>, rules: ValidationRule[]) => {
    const newErrors: ValidationError[] = [];
    const newViolations: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];
      
      for (const validationRule of rule.rules) {
        if (validationRule === 'required' && !value) {
          newErrors.push({
            field: rule.field,
            message: rule.message || `${rule.field} is required`
          });
        }
        
        if (validationRule === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.push({
            field: rule.field,
            message: rule.message || 'Invalid email format'
          });
        }
        
        if (validationRule.startsWith('min:')) {
          const min = parseInt(validationRule.split(':')[1]);
          if (value && value.length < min) {
            newErrors.push({
              field: rule.field,
              message: rule.message || `Minimum length is ${min}`
            });
          }
        }
        
        if (validationRule.startsWith('max:')) {
          const max = parseInt(validationRule.split(':')[1]);
          if (value && value.length > max) {
            newErrors.push({
              field: rule.field,
              message: rule.message || `Maximum length is ${max}`
            });
          }
        }
      }
    }

    // Log validation attempts to security audit
    if (newErrors.length > 0) {
      newViolations.push(...newErrors.map(e => e.message));
      await supabase.rpc('track_user_activity', {
        activity_type: 'VALIDATION_FAILED',
        resource_type: 'form_validation',
        metadata: { errors: newErrors }
      }).catch(console.error);
    }

    setErrors(newErrors);
    setViolations(newViolations);
    setIsValid(newErrors.length === 0);

    return newErrors.length === 0;
  };

  return {
    validate,
    isValid,
    errors,
    violations
  };
}