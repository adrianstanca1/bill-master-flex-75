import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetric {
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  database: HealthMetric;
  auth: HealthMetric;
  functions: HealthMetric;
  apis: HealthMetric;
  lastCheck: string;
}

export function useSystemHealth() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    database: { status: 'healthy', lastCheck: new Date().toISOString() },
    auth: { status: 'healthy', lastCheck: new Date().toISOString() },
    functions: { status: 'healthy', lastCheck: new Date().toISOString() },
    apis: { status: 'healthy', lastCheck: new Date().toISOString() },
    lastCheck: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, any>>({});

  const checkHealth = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      // Check database
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      const dbResponseTime = Date.now() - dbStart;

      // Check auth
      const authStart = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      const authResponseTime = Date.now() - authStart;

      const newHealth: SystemHealth = {
        status: dbError ? 'degraded' : 'healthy',
        database: {
          status: dbError ? 'down' : dbResponseTime > 1000 ? 'degraded' : 'healthy',
          responseTime: dbResponseTime,
          lastCheck: new Date().toISOString()
        },
        auth: {
          status: authResponseTime > 1000 ? 'degraded' : 'healthy',
          responseTime: authResponseTime,
          lastCheck: new Date().toISOString()
        },
        functions: {
          status: 'healthy',
          lastCheck: new Date().toISOString()
        },
        apis: {
          status: 'healthy',
          lastCheck: new Date().toISOString()
        },
        lastCheck: new Date().toISOString()
      };

      setSystemHealth(newHealth);
      setMetrics({
        totalResponseTime: Date.now() - startTime,
        databaseResponseTime: dbResponseTime,
        authResponseTime: authResponseTime
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setSystemHealth(prev => ({ ...prev, status: 'down' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return {
    isHealthy: systemHealth.status === 'healthy',
    metrics,
    loading,
    checkHealth,
    systemHealth,
    runHealthCheck: checkHealth
  };
}