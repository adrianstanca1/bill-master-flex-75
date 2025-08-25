import DOMPurify from 'dompurify';
import { commonValidationRules, ValidationRule } from './validation';

export interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  stripTags?: boolean;
}

export function sanitizeInput(
  input: string,
  options: SanitizationOptions = {}
): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Apply length limits
  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  // Sanitize HTML content
  if (options.allowHtml) {
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  } else {
    // Strip all HTML tags
    sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  return sanitized;
}

export function validateAndSanitizeField(
  value: string,
  fieldType: keyof typeof commonValidationRules,
  options: SanitizationOptions = {}
): { isValid: boolean; sanitized: string; errors: string[] } {
  const rule = commonValidationRules[fieldType];
  const errors: string[] = [];
  let sanitized = value;

  // Sanitize if required
  if (rule.sanitize) {
    sanitized = sanitizeInput(value, {
      maxLength: rule.maxLength,
      ...options
    });
  }

  // Validate length
  if (rule.minLength && sanitized.length < rule.minLength) {
    errors.push(`Minimum length is ${rule.minLength} characters`);
  }
  if (rule.maxLength && sanitized.length > rule.maxLength) {
    errors.push(`Maximum length is ${rule.maxLength} characters`);
  }

  // Validate pattern
  if (rule.pattern && !rule.pattern.test(sanitized)) {
    errors.push(`Invalid ${fieldType} format`);
  }

  // Check if required
  if (rule.required && !sanitized.trim()) {
    errors.push(`${fieldType} is required`);
  }

  // Custom validation
  if (rule.custom) {
    const customResult = rule.custom(sanitized);
    if (typeof customResult === 'string') {
      errors.push(customResult);
    } else if (!customResult) {
      errors.push(`Invalid ${fieldType}`);
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

export function sanitizeFileUpload(file: File): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/csv'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push('File size too large (max 10MB)');
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const expectedExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'application/pdf': ['pdf'],
    'text/plain': ['txt'],
    'text/csv': ['csv']
  };

  if (extension && expectedExtensions[file.type]) {
    if (!expectedExtensions[file.type].includes(extension)) {
      errors.push('File extension does not match content type');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}