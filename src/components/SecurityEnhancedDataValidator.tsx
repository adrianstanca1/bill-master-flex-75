import React from 'react';
import { commonValidationRules, ValidationRules } from '@/lib/validation';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEnhancedDataValidatorProps {
  children: React.ReactNode;
}

class SecurityDataValidator {
  private static instance: SecurityDataValidator;
  
  static getInstance(): SecurityDataValidator {
    if (!SecurityDataValidator.instance) {
      SecurityDataValidator.instance = new SecurityDataValidator();
    }
    return SecurityDataValidator.instance;
  }

  // Enhanced input sanitization
  sanitizeInput(input: string, allowHtml: boolean = false): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potential script injections
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    if (allowHtml) {
      // Use DOMPurify for HTML content
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['class']
      });
    } else {
      // Strip all HTML for plain text
      sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    
    return sanitized.trim();
  }

  // Enhanced validation with security logging
  async validateData(data: Record<string, any>, rules: ValidationRules): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: Record<string, any>;
  }> {
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};
    const securityViolations: string[] = [];

    for (const [field, value] of Object.entries(data)) {
      const rule = rules[field];
      if (!rule) {
        sanitizedData[field] = value;
        continue;
      }

      let processedValue = value;

      // Sanitization
      if (rule.sanitize && typeof value === 'string') {
        const originalValue = value;
        processedValue = this.sanitizeInput(value);
        
        // Check if sanitization changed the value (potential security issue)
        if (originalValue !== processedValue) {
          securityViolations.push(`${field}: Input sanitized`);
        }
      }

      // Required field validation
      if (rule.required && (!processedValue || processedValue.toString().trim() === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Skip further validation if field is empty and not required
      if (!processedValue && !rule.required) {
        sanitizedData[field] = processedValue;
        continue;
      }

      const stringValue = processedValue.toString();

      // Length validation
      if (rule.minLength && stringValue.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
        continue;
      }

      if (rule.maxLength && stringValue.length > rule.maxLength) {
        errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
        securityViolations.push(`${field}: Excessive length detected`);
        continue;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(stringValue)) {
        errors[field] = `${field} format is invalid`;
        securityViolations.push(`${field}: Pattern validation failed`);
        continue;
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(stringValue);
        if (customResult !== true) {
          errors[field] = typeof customResult === 'string' ? customResult : `${field} is invalid`;
          continue;
        }
      }

      sanitizedData[field] = processedValue;
    }

    // Log security violations
    if (securityViolations.length > 0) {
      try {
        await supabase.from('security_audit_log').insert({
          action: 'INPUT_VALIDATION_VIOLATION',
          resource_type: 'data_validation',
          details: {
            violations: securityViolations,
            field_count: Object.keys(data).length,
            timestamp: new Date().toISOString(),
            severity: 'medium'
          }
        });
      } catch (logError) {
        console.error('Failed to log security violation:', logError);
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }

  // SQL injection prevention for dynamic queries
  sanitizeForSQL(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Basic SQL injection prevention
    return input
      .replace(/['";\\]/g, '') // Remove dangerous characters
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
      .trim();
  }

  // XSS prevention for display content
  sanitizeForDisplay(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'span'],
      ALLOWED_ATTR: ['class'],
      ALLOW_DATA_ATTR: false
    });
  }
}

export function SecurityEnhancedDataValidator({ children }: SecurityEnhancedDataValidatorProps) {
  // Make validator available globally
  React.useEffect(() => {
    (window as any).securityValidator = SecurityDataValidator.getInstance();
  }, []);

  return <>{children}</>;
}

// Export the validator instance for direct use
export const securityValidator = SecurityDataValidator.getInstance();

// Export enhanced validation rules
export const enhancedValidationRules = {
  ...commonValidationRules,
  // Enhanced password requirements
  strongPassword: {
    minLength: 14,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    required: true,
    sanitize: false,
    custom: (value: string) => {
      // Additional entropy checks
      const uniqueChars = new Set(value).size;
      if (uniqueChars < 8) return 'Password must contain at least 8 unique characters';
      
      // Check for common patterns
      if (/(.)\1{2,}/.test(value)) return 'Password cannot contain repeated characters';
      if (/123|abc|qwe|password/i.test(value)) return 'Password contains common patterns';
      
      return true;
    }
  },
  // Enhanced email validation
  secureEmail: {
    pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    maxLength: 254,
    minLength: 5,
    required: true,
    sanitize: true,
    custom: (value: string) => {
      // Block disposable email providers
      const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
      const domain = value.split('@')[1]?.toLowerCase();
      if (domain && disposableDomains.includes(domain)) {
        return 'Disposable email addresses are not allowed';
      }
      return true;
    }
  }
};