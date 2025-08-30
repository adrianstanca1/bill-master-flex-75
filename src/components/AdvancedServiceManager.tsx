import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Zap, 
  Monitor, 
  Database, 
  Cloud, 
  Shield, 
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: number;
  responseTime: number;
  lastUpdate: Date;
  metrics: {
    requests: number;
    errors: number;
    performance: number;
  };
}

interface ServiceOptimization {
  id: string;
  service: string;
  type: 'performance' | 'reliability' | 'security';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  implemented: boolean;
}

export function AdvancedServiceManager() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: 'auth',
      name: 'Authentication Service',
      status: 'online',
      uptime: 99.8,
      responseTime: 145,
      lastUpdate: new Date(),
      metrics: { requests: 1250, errors: 3, performance: 98 }
    },
    {
      id: 'database',
      name: 'Database Operations',
      status: 'online',
      uptime: 99.9,
      responseTime: 89,
      lastUpdate: new Date(),
      metrics: { requests: 2840, errors: 1, performance: 96 }
    },
    {
      id: 'api',
      name: 'API Gateway',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 280,
      lastUpdate: new Date(),
      metrics: { requests: 3200, errors: 15, performance: 92 }
    },
    {
      id: 'storage',
      name: 'File Storage',
      status: 'online',
      uptime: 100,
      responseTime: 120,
      lastUpdate: new Date(),
      metrics: { requests: 890, errors: 0, performance: 99 }
    }
  ]);

  const [optimizations] = useState<ServiceOptimization[]>([
    {
      id: 'cache-optimization',
      service: 'API Gateway',
      type: 'performance',
      title: 'Implement Response Caching',
      description: 'Add intelligent caching layer to reduce API response times by 40%',
      impact: 'high',
      implemented: false
    },
    {
      id: 'connection-pooling',
      service: 'Database Operations',
      type: 'performance',
      title: 'Connection Pool Optimization',
      description: 'Optimize database connection pooling for better concurrent request handling',
      impact: 'medium',
      implemented: true
    },
    {
      id: 'rate-limiting',
      service: 'Authentication Service',
      type: 'security',
      title: 'Advanced Rate Limiting',
      description: 'Implement intelligent rate limiting based on user behavior patterns',
      impact: 'high',
      implemented: true
    },
    {
      id: 'error-recovery',
      service: 'API Gateway',
      type: 'reliability',
      title: 'Auto-Recovery Mechanisms',
      description: 'Implement automatic failover and recovery for degraded services',
      impact: 'high',
      implemented: false
    }
  ]);

  const [monitoring, setMonitoring] = useState({
    totalRequests: 8180,
    totalErrors: 19,
    avgResponseTime: 158,
    systemLoad: 65
  });

  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: service.responseTime + (Math.random() - 0.5) * 20,
        metrics: {
          ...service.metrics,
          requests: service.metrics.requests + Math.floor(Math.random() * 10),
          performance: Math.min(100, service.metrics.performance + (Math.random() - 0.5) * 2)
        },
        lastUpdate: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'degraded': return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'offline': return <Badge variant="destructive">Offline</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const implementOptimization = async (optimizationId: string) => {
    toast({
      title: "Optimization Started",
      description: "Implementing service optimization...",
    });

    // Simulate optimization implementation
    setTimeout(() => {
      toast({
        title: "Optimization Complete",
        description: "Service optimization has been successfully implemented.",
      });
    }, 3000);
  };

  const runSystemDiagnostics = async () => {
    toast({
      title: "System Diagnostics",
      description: "Running comprehensive system health check...",
    });

    // Simulate diagnostics
    setTimeout(() => {
      toast({
        title: "Diagnostics Complete",
        description: "All systems are operating within normal parameters.",
      });
    }, 5000);
  };

  const degradedServices = services.filter(s => s.status === 'degraded').length;
  const offlineServices = services.filter(s => s.status === 'offline').length;
  const avgUptime = services.reduce((acc, s) => acc + s.uptime, 0) / services.length;

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across all services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoring.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((monitoring.totalErrors / monitoring.totalRequests) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">{monitoring.totalErrors} total errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoring.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {(degradedServices > 0 || offlineServices > 0) && (
        <Alert variant={offlineServices > 0 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {offlineServices > 0 
              ? `${offlineServices} service(s) offline, ${degradedServices} service(s) degraded`
              : `${degradedServices} service(s) experiencing degraded performance`
            }
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                    <h3 className="font-semibold">{service.name}</h3>
                    {getStatusBadge(service.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Updated {service.lastUpdate.toLocaleTimeString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="text-lg font-semibold">{service.uptime}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                    <div className="text-lg font-semibold">{Math.round(service.responseTime)}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Requests</div>
                    <div className="text-lg font-semibold">{service.metrics.requests}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Performance</div>
                    <div className="text-lg font-semibold">{Math.round(service.metrics.performance)}%</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance Score</span>
                    <span>{Math.round(service.metrics.performance)}%</span>
                  </div>
                  <Progress value={service.metrics.performance} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Optimizations</CardTitle>
              <CardDescription>
                Recommended improvements to enhance service performance and reliability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((opt) => (
                  <div key={opt.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{opt.title}</h4>
                          <Badge variant="outline">{opt.service}</Badge>
                          <Badge variant={opt.impact === 'high' ? 'destructive' : opt.impact === 'medium' ? 'default' : 'secondary'}>
                            {opt.impact} impact
                          </Badge>
                          {opt.implemented && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Implemented
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{opt.description}</p>
                      </div>
                      {!opt.implemented && (
                        <Button 
                          size="sm" 
                          onClick={() => implementOptimization(opt.id)}
                        >
                          Implement
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{monitoring.systemLoad}%</div>
                <Progress value={monitoring.systemLoad} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Current system resource utilization
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <span className="text-sm">{service.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{service.metrics.requests}</span>
                        <div className="w-16">
                          <Progress 
                            value={(service.metrics.requests / Math.max(...services.map(s => s.metrics.requests))) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Diagnostics
              </CardTitle>
              <CardDescription>
                Run comprehensive system health checks and diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runSystemDiagnostics} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Full System Diagnostics
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Health Checks</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Database Connection</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>API Endpoints</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Authentication</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>File Storage</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Memory Usage</span>
                        <span>68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU Usage</span>
                        <span>42%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network I/O</span>
                        <span>Normal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disk Usage</span>
                        <span>35%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}