import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useEnhancedSecurityLogging } from '@/hooks/useEnhancedSecurityLogging';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { SecurityMonitoringDashboard } from './SecurityMonitoringDashboard';
import { EnhancedSecurityScanResults } from './EnhancedSecurityScanResults';

export function SecurityEnhancementPanel() {
  const { logSecurityEvent } = useEnhancedSecurityLogging();
  const { isBlocked } = useRateLimiting('security_check', {
    maxAttempts: 5,
    windowMs: 60000,
    blockDurationMs: 300000
  });

  const securityStatus = {
    completed: [
      'Input validation on forms',
      'File upload security',
      'CORS security hardening',
      'Secure storage implementation',
      'Rate limiting protection',
      'Enhanced security logging'
    ],
    pending: [
      'Reduce OTP expiry to 5-10 minutes',
      'Enable leaked password protection',
      'Database function search path updates'
    ]
  };

  const handleConfigurationFix = (type: string) => {
    logSecurityEvent({
      eventType: 'SECURITY_CONFIG_ACCESS',
      severity: 'low',
      details: { configuration_type: type },
      resourceType: 'security_config',
      resourceId: type
    });

    if (type === 'otp') {
      window.open('https://supabase.com/dashboard/project/zwxyoeqsbntsogvgwily/auth/settings', '_blank');
    } else if (type === 'password') {
      window.open('https://supabase.com/dashboard/project/zwxyoeqsbntsogvgwily/auth/settings', '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Security Enhancement Status
          </CardTitle>
          <CardDescription>
            Comprehensive security improvements have been implemented
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed Security Fixes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {securityStatus.completed.map((item, index) => (
                <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Configuration Updates Needed
            </h4>
            <div className="space-y-2">
              {securityStatus.pending.map((item, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-orange-800">{item}</span>
                    {item.includes('OTP') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigurationFix('otp')}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        disabled={isBlocked}
                      >
                        Fix in Supabase <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                    {item.includes('password') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigurationFix('password')}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        disabled={isBlocked}
                      >
                        Fix in Supabase <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Security Improvements Implemented</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All form inputs now use comprehensive validation and sanitization</li>
              <li>• File uploads have enhanced security with MIME type verification</li>
              <li>• Edge functions use secure CORS with specific domain restrictions</li>
              <li>• Secure storage now uses encryption and Supabase backend</li>
              <li>• Rate limiting prevents brute force attacks on forms</li>
              <li>• Enhanced security logging tracks all security events</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Security Scan Results */}
      <EnhancedSecurityScanResults />

      {/* Security Monitoring Dashboard */}
      <SecurityMonitoringDashboard />
    </div>
  );
}