export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  sanitize?: boolean;
  custom?: (value: string) => boolean | string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export const commonValidationRules: ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    minLength: 3,
    required: true,
    sanitize: true
  },
  password: {
    minLength: 12, // Increased from 8 for stronger security
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    required: true,
    sanitize: false // Don't sanitize passwords
  },
  phone: {
    pattern: /^\+?[1-9]\d{0,15}$/,
    maxLength: 20,
    minLength: 10,
    sanitize: true
  },
  name: {
    pattern: /^[a-zA-Z\s'.-]+$/,
    minLength: 2, // Increased from 1
    maxLength: 50, // Reduced from 100 for security
    required: true,
    sanitize: true
  },
  company: {
    pattern: /^[a-zA-Z0-9\s&'.-]+$/,
    minLength: 2,
    maxLength: 100, // Reduced from 200 for security
    required: true,
    sanitize: true
  },
  description: {
    maxLength: 500, // Reduced from 5000 for security
    minLength: 1,
    sanitize: true
  },
  address: {
    minLength: 5,
    maxLength: 200, // Reduced from 500 for security
    sanitize: true
  },
  postcode: {
    pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, // UK postcode format
    maxLength: 8,
    minLength: 5,
    sanitize: true
  },
  currency: {
    pattern: /^[A-Z]{3}$/,
    maxLength: 3,
    minLength: 3,
    sanitize: true
  },
  amount: {
    pattern: /^\d*\.?\d{0,2}$/,
    maxLength: 15,
    sanitize: true
  },
  url: {
    pattern: /^https?:\/\/[^\s]+$/,
    maxLength: 2048,
    sanitize: true
  },
  username: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    minLength: 3,
    maxLength: 50,
    sanitize: true
  }
};
