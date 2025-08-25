
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  Key, 
  RefreshCw,
  ExternalLink,
  Database,
  Bot,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  lastChecked: string;
  responseTime: string;
  description: string;
  icon: React.ComponentType<any>;
  requiresApiKey: boolean;
  hasApiKey: boolean;
  testEndpoint?: string;
}

export function ServiceStatusChecker() {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Supabase Database',
      status: 'online',
      lastChecked: new Date().toISOString(),
      responseTime: '45ms',
      description: 'Main database connection',
      icon: Database,
      requiresApiKey: false,
      hasApiKey: true
    },
    {
      name: 'OpenAI API',
      status: 'warning',
      lastChecked: new Date(Date.now() - 300000).toISOString(),
      responseTime: '200ms',
      description: 'AI chat and completion services',
      icon: Bot,
      requiresApiKey: true,
      hasApiKey: false,
      testEndpoint: 'https://api.openai.com/v1/models'
    },
    {
      name: 'Supabase Functions',
      status: 'online',
      lastChecked: new Date().toISOString(),
      responseTime: '120ms',
      description: 'Edge functions for business logic',
      icon: Settings,
      requiresApiKey: false,
      hasApiKey: true
    },
    {
      name: 'Email Service',
      status: 'offline',
      lastChecked: new Date(Date.now() - 600000).toISOString(),
      responseTime: 'N/A',
      description: 'Email notifications and reminders',
      icon: Mail,
      requiresApiKey: true,
      hasApiKey: false
    }
  ]);

  const handleCheckAll = async () => {
    setIsChecking(true);
    toast({
      title: "Checking Services",
      description: "Testing all service connections...",
    });

    // Simulate service checks
    setTimeout(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        lastChecked: new Date().toISOString(),
        status: service.hasApiKey ? 'online' : 'warning'
      })));
      
      setIsChecking(false);
      toast({
        title: "Service Check Complete",
        description: "All available services tested successfully",
      });
    }, 2000);
  };

  const handleTestService = async (serviceName: string) => {
    toast({
      title: "Testing Service",
      description: `Testing ${serviceName} connection...`,
    });

    setTimeout(() => {
      toast({
        title: "Test Complete",
        description: `${serviceName} test completed`,
      });
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const onlineServices = services.filter(s => s.status === 'online').length;
  const totalServices = services.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Service Status Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor all connected services and API integrations
            </p>
          </div>
          <Button onClick={handleCheckAll} disabled={isChecking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check All'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{onlineServices}/{totalServices}</div>
              <div className="text-sm text-muted-foreground">Services Online</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">120ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>

          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <service.icon className="h-8 w-8 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{service.name}</h4>
                      {service.requiresApiKey && !service.hasApiKey && (
                        <Key className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {service.responseTime}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestService(service.name)}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Missing API Keys</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Some services require API keys to function properly. Add them to unlock full functionality.
              </p>
              <div className="space-y-2">
                {services.filter(s => s.requiresApiKey && !s.hasApiKey).map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{service.name}</span>
                    <Button size="sm" variant="outline">
                      Add API Key
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Service Configuration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-retry failed requests</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable health checks</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Log service responses</span>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Notification Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email on service failure</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alert on slow responses</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly status reports</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
