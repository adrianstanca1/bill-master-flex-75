export function useBruteForceProtection() {
  return {
    isBlocked: false,
    checkBruteForce: () => {},
    resetAttempts: () => {}
  };
}