import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSecurityValidation() {
  const [errors, setErrors] = useState<string[]>([]);
  const [violations, setViolations] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validate = async (input: string, context: string = 'general') => {
    const newErrors: string[] = [];
    const newViolations: string[] = [];

    // Check for XSS patterns
    const xssPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i];
    if (xssPatterns.some(pattern => pattern.test(input))) {
      newErrors.push('Potential XSS attempt detected');
      newViolations.push('XSS_ATTEMPT');
    }

    // Check for SQL injection patterns
    const sqlPatterns = [/union\s+select/i, /drop\s+table/i, /;\s*delete/i, /;\s*update/i];
    if (sqlPatterns.some(pattern => pattern.test(input))) {
      newErrors.push('Potential SQL injection detected');
      newViolations.push('SQL_INJECTION_ATTEMPT');
    }

    // Log security violations
    if (newViolations.length > 0) {
      supabase
        .from('security_audit_log')
        .insert([{
          action: 'SECURITY_VIOLATION',
          resource: context,
          details: { 
            violations: newViolations,
            input_length: input.length 
          }
        }])
        .then(() => {});
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
