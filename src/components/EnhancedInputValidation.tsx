import React, { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ValidationRule, ValidationRules } from '@/lib/validation';

interface EnhancedInputValidationProps {
  children: React.ReactNode;
  rules?: ValidationRules;
  onValidationError?: (field: string, error: string) => void;
}

export function EnhancedInputValidation({ 
  children, 
  rules = {},
  onValidationError 
}: EnhancedInputValidationProps) {
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Comprehensive input sanitization
  const sanitizeInput = useCallback((value: string, fieldName: string): string => {
    // Log original input length for monitoring
    const originalLength = value.length;
    
    // First pass - DOMPurify sanitization
    let sanitized = DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      KEEP_CONTENT: false
    });

    // Second pass - remove dangerous patterns
    const dangerousPatterns = [
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<script/gi,
      /<\/script>/gi,
      /expression\s*\(/gi,
      /url\s*\(/gi,
      /import\s*\(/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /XMLHttpRequest/gi,
      /fetch\s*\(/gi
    ];

    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Third pass - length and character validation
    sanitized = sanitized
      .replace(/[<>]/g, '') // Remove any remaining angle brackets
      .split('\0').join('') // Remove null bytes without regex
      .trim();

    // Log suspicious input if significant changes made
    if (sanitized.length < originalLength * 0.8) {
      console.warn(`Suspicious input detected in field ${fieldName}, sanitized from ${originalLength} to ${sanitized.length} characters`);
      
      // Log to security audit
      supabase.from('security_audit_log').insert({
        action: 'SUSPICIOUS_INPUT_SANITIZED',
        resource_type: 'input_validation',
        details: {
          field: fieldName,
          original_length: originalLength,
          sanitized_length: sanitized.length,
          timestamp: new Date().toISOString()
        }
      });
      // Ignore promise errors for non-critical logging
    }

    return sanitized;
  }, []);

  // Enhanced validation function
  const validateField = useCallback((fieldName: string, value: string): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    // Required field validation
    if (rule.required && (!value || value.trim().length === 0)) {
      return 'This field is required';
    }

    // Length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum length is ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum length is ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        return customResult;
      }
      if (customResult === false) {
        return 'Invalid value';
      }
    }

    return null;
  }, [rules]);

  // Enhanced form validation wrapper
  const enhanceFormElement = useCallback((element: HTMLElement) => {
    if (element.tagName === 'FORM') {
      const form = element as HTMLFormElement;
      
      // Add validation to all inputs
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        const inputElement = input as HTMLInputElement;
        const fieldName = inputElement.name || inputElement.id;
        
        if (!fieldName) return;

        // Add real-time validation
        inputElement.addEventListener('blur', () => {
          let value = inputElement.value;
          
          // Sanitize if enabled for this field
          const rule = rules[fieldName];
          if (rule?.sanitize !== false) {
            value = sanitizeInput(value, fieldName);
            if (value !== inputElement.value) {
              inputElement.value = value;
            }
          }

          // Validate
          const error = validateField(fieldName, value);
          if (error) {
            setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
            onValidationError?.(fieldName, error);
          } else {
            setValidationErrors(prev => {
              const { [fieldName]: removed, ...rest } = prev;
              return rest;
            });
          }
        });

        // Add length monitoring for security
        inputElement.addEventListener('input', () => {
          const value = inputElement.value;
          
          // Monitor for suspiciously long inputs (potential attack)
          if (value.length > 10000) {
            console.warn(`Suspiciously long input in field ${fieldName}: ${value.length} characters`);
            
            supabase.from('security_audit_log').insert({
              action: 'SUSPICIOUS_INPUT_LENGTH',
              resource_type: 'input_monitoring',
              details: {
                field: fieldName,
                length: value.length,
                timestamp: new Date().toISOString()
              }
            });
            // Ignore promise errors for non-critical logging

            // Truncate and warn user
            inputElement.value = value.substring(0, 10000);
            toast({
              title: "Input Too Long",
              description: "Input has been truncated for security reasons.",
              variant: "destructive"
            });
          }
        });
      });

      // Override form submission
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate all fields before submission
        const formData = new FormData(form);
        let hasErrors = false;
        const errors: Record<string, string> = {};
        
        for (const [fieldName, value] of formData.entries()) {
          if (typeof value === 'string') {
            const error = validateField(fieldName, value);
            if (error) {
              errors[fieldName] = error;
              hasErrors = true;
            }
          }
        }
        
        if (hasErrors) {
          setValidationErrors(errors);
          toast({
            title: "Validation Error",
            description: "Please fix the highlighted errors before submitting.",
            variant: "destructive"
          });
          return;
        }
        
        // If validation passes, trigger original submit handler
        const originalSubmit = form.dataset.originalSubmit;
        if (originalSubmit) {
          // Restore original handler and submit
          form.removeEventListener('submit', arguments.callee as any);
          form.submit();
        }
      });
    }
  }, [rules, sanitizeInput, validateField, onValidationError, toast]);

  // Monitor DOM for new form elements
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // Check if the added element is a form or contains forms
            if (element.tagName === 'FORM') {
              enhanceFormElement(element);
            } else {
              const forms = element.querySelectorAll('form');
              forms.forEach(enhanceFormElement);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Enhance existing forms
    document.querySelectorAll('form').forEach(enhanceFormElement);

    return () => observer.disconnect();
  }, [enhanceFormElement]);

  return (
    <div data-validation-wrapper>
      {children}
      
      {/* Display validation errors */}
      {Object.entries(validationErrors).map(([field, error]) => (
        <div
          key={field}
          className="text-sm text-destructive mt-1"
          data-validation-error={field}
        >
          {error}
        </div>
      ))}
    </div>
  );
}
