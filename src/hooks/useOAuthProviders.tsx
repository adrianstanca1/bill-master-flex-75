export function useOAuthProviders() {
  return {
    providers: ['google', 'github', 'apple'],
    enabledProviders: {
      google: true,
      github: true,
      apple: true,
    },
    loading: false,
    validateProvider: () => true
  };
}