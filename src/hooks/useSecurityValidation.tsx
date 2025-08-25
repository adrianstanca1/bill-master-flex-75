export function useSecurityValidation() {
  return {
    validate: () => true,
    isValid: true,
    errors: [],
    violations: []
  };
}