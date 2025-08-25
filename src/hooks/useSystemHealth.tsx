export function useSystemHealth() {
  return {
    isHealthy: true,
    metrics: {},
    loading: false,
    checkHealth: () => {},
    systemHealth: { 
      status: 'healthy',
      database: { status: 'healthy' },
      auth: { status: 'healthy' },
      functions: { status: 'healthy' },
      apis: { status: 'healthy' },
      lastCheck: new Date().toISOString()
    },
    runHealthCheck: () => {}
  };
}