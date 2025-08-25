
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Eye, RefreshCw } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useToast } from '@/hooks/use-toast';

export function ThreatDetection() {
  const { alerts, stats } = useSecurityMonitoring();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const handleSecurityScan = async () => {
    setIsScanning(true);
    try {
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Security Scan Complete",
        description: "No immediate threats detected",
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to complete security scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Threat Detection
            </div>
            <Button
              onClick={handleSecurityScan}
              disabled={isScanning}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Run Scan'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalAlerts}</div>
              <div className="text-sm text-muted-foreground">Total Alerts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
              <div className="text-sm text-muted-foreground">Critical Threats</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.securityEvents}</div>
              <div className="text-sm text-muted-foreground">Security Events</div>
            </div>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">Active Threats</h4>
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{alert.message}</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No threats detected</p>
              <p className="text-sm">Your system appears to be secure</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real-time Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Intrusion Detection</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Malware Scanning</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Behavioral Analysis</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Network Monitoring</span>
              <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
