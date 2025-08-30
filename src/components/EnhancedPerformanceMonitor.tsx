import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  MemoryStick, 
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

interface SystemHealth {
  overall: number;
  components: {
    [key: string]: {
      status: 'healthy' | 'warning' | 'critical';
      score: number;
      issues?: string[];
    };
  };
}

export function EnhancedPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      threshold: { warning: 70, critical: 90 },
      trend: 'stable',
      history: [42, 44, 43, 45, 46, 45, 44, 45]
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 68,
      unit: '%',
      threshold: { warning: 75, critical: 90 },
      trend: 'up',
      history: [62, 64, 65, 66, 67, 68, 67, 68]
    },
    {
      id: 'database',
      name: 'Database Response',
      value: 125,
      unit: 'ms',
      threshold: { warning: 200, critical: 500 },
      trend: 'down',
      history: [145, 140, 135, 130, 128, 125, 124, 125]
    },
    {
      id: 'api',
      name: 'API Response Time',
      value: 89,
      unit: 'ms',
      threshold: { warning: 150, critical: 300 },
      trend: 'stable',
      history: [92, 90, 88, 89, 91, 89, 88, 89]
    },
    {
      id: 'throughput',
      name: 'Request Throughput',
      value: 1250,
      unit: 'req/min',
      threshold: { warning: 2000, critical: 3000 },
      trend: 'up',
      history: [1180, 1200, 1220, 1240, 1250, 1255, 1252, 1250]
    },
    {
      id: 'errors',
      name: 'Error Rate',
      value: 0.8,
      unit: '%',
      threshold: { warning: 2, critical: 5 },
      trend: 'down',
      history: [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 0.8]
    }
  ]);

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 92,
    components: {
      'Authentication': { status: 'healthy', score: 98 },
      'Database': { status: 'healthy', score: 95 },
      'API Gateway': { status: 'warning', score: 87, issues: ['High latency on some endpoints'] },
      'File Storage': { status: 'healthy', score: 99 },
      'Security': { status: 'healthy', score: 94 }
    }
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const variation = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, metric.value + variation);
        const newHistory = [...metric.history.slice(1), newValue];
        
        // Determine trend
        const recent = newHistory.slice(-3);
        const trend = recent[2] > recent[0] + 2 ? 'up' : 
                     recent[2] < recent[0] - 2 ? 'down' : 'stable';

        return {
          ...metric,
          value: newValue,
          history: newHistory,
          trend
        };
      }));

      // Update system health
      setSystemHealth(prev => {
        const newOverall = Math.max(85, Math.min(100, prev.overall + (Math.random() - 0.5) * 2));
        return {
          ...prev,
          overall: newOverall
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.id === 'errors') {
      // For error rate, lower is better
      if (metric.value >= metric.threshold.critical) return 'critical';
      if (metric.value >= metric.threshold.warning) return 'warning';
      return 'healthy';
    } else {
      // For other metrics, higher values are concerning
      if (metric.value >= metric.threshold.critical) return 'critical';
      if (metric.value >= metric.threshold.warning) return 'warning';
      return 'healthy';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'cpu': return <Cpu className="w-5 h-5" />;
      case 'memory': return <MemoryStick className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'api': return <Globe className="w-5 h-5" />;
      case 'throughput': return <Zap className="w-5 h-5" />;
      case 'errors': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? "Monitoring Paused" : "Monitoring Resumed",
      description: isMonitoring 
        ? "Real-time performance monitoring has been paused"
        : "Real-time performance monitoring has been resumed",
    });
  };

  const runHealthCheck = async () => {
    toast({
      title: "Health Check Started",
      description: "Running comprehensive system health analysis...",
    });

    // Simulate health check
    setTimeout(() => {
      toast({
        title: "Health Check Complete",
        description: `System health: ${systemHealth.overall}% - All critical systems operational`,
      });
    }, 3000);
  };

  const criticalMetrics = metrics.filter(m => getMetricStatus(m) === 'critical').length;
  const warningMetrics = metrics.filter(m => getMetricStatus(m) === 'warning').length;

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Performance Monitor
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMonitoring}
              >
                {isMonitoring ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {isMonitoring ? 'Monitoring' : 'Paused'}
              </Button>
              <Button onClick={runHealthCheck}>
                Run Health Check
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Real-time system performance metrics and health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System Health</p>
                    <p className="text-3xl font-bold">{systemHealth.overall}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <Progress value={systemHealth.overall} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                    <p className="text-3xl font-bold">{criticalMetrics + warningMetrics}</p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${criticalMetrics > 0 ? 'text-red-600' : 'text-yellow-600'}`} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {criticalMetrics} critical, {warningMetrics} warnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-3xl font-bold">99.9%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {(criticalMetrics > 0 || warningMetrics > 0) && (
            <Alert variant={criticalMetrics > 0 ? "destructive" : "default"} className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {criticalMetrics > 0 
                  ? `${criticalMetrics} critical performance issue(s) detected. Immediate attention required.`
                  : `${warningMetrics} performance warning(s) detected. Consider investigating soon.`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const status = getMetricStatus(metric);
          return (
            <Card key={metric.id} className={status === 'critical' ? 'border-red-500' : status === 'warning' ? 'border-yellow-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(metric.id)}
                    <h3 className="font-semibold">{metric.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    {getStatusBadge(status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${getStatusColor(status)}`}>
                      {typeof metric.value === 'number' ? metric.value.toFixed(metric.id === 'errors' ? 1 : 0) : metric.value}
                    </span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                      <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={metric.id === 'errors' ? 
                        (metric.value / metric.threshold.critical) * 100 :
                        Math.min((metric.value / metric.threshold.critical) * 100, 100)
                      } 
                      className="h-2"
                    />
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Trend (last 8 readings)</p>
                    <div className="flex items-end gap-1 h-8">
                      {metric.history.map((value, index) => (
                        <div
                          key={index}
                          className="bg-blue-200 min-w-[4px] rounded-t"
                          style={{
                            height: `${(value / Math.max(...metric.history)) * 100}%`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Component Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Component Health</CardTitle>
          <CardDescription>Individual system component status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(systemHealth.components).map(([component, health]) => (
              <div key={component} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    health.status === 'healthy' ? 'bg-green-500' :
                    health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="font-medium">{component}</h4>
                    {health.issues && (
                      <p className="text-sm text-muted-foreground">
                        {health.issues.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{health.score}%</span>
                  {getStatusBadge(health.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}