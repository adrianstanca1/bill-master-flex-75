import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityViolation {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  canDismiss: boolean;
}

export function EnhancedSecurityAlert() {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const checkSecurityViolations = useCallback(async () => {
    try {
      const { data: auditLogs } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('action', 'SECURITY_VIOLATION')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (auditLogs) {
        const newViolations: SecurityViolation[] = auditLogs.map(log => ({
          id: log.id,
          type: (log.details as any)?.violation_type || 'UNKNOWN',
          severity: (log.details as any)?.severity || 'medium',
          message: getViolationMessage((log.details as any)?.violation_type),
          timestamp: log.created_at,
          canDismiss: (log.details as any)?.severity !== 'high'
        }));

        setViolations(newViolations);
      }

      // Check for suspicious patterns
      const { data: suspiciousActivity } = await supabase
        .from('security_audit_log')
        .select('action, created_at')
        .in('action', ['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_INPUT_DETECTED'])
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (suspiciousActivity && suspiciousActivity.length > 10) {
        setViolations(prev => [...prev, {
          id: 'suspicious-pattern-' + Date.now(),
          type: 'SUSPICIOUS_PATTERN',
          severity: 'high',
          message: 'High volume of suspicious activity detected in the last hour',
          timestamp: new Date().toISOString(),
          canDismiss: false
        }]);
      }
    } catch (error) {
      console.error('Error checking security violations:', error);
    }
  }, []);

  useEffect(() => {
    checkSecurityViolations();

    // Real-time monitoring
    const interval = setInterval(checkSecurityViolations, 30000);
    return () => clearInterval(interval);
  }, [checkSecurityViolations]);

  const getViolationMessage = (violationType: string): string => {
    const messages: Record<string, string> = {
      'COMPANY_ASSOCIATION_REMOVED': 'User company association was compromised - immediate attention required',
      'INVALID_COMPANY_ASSOCIATION': 'User attempted to access data without proper company authorization',
      'COMPANY_ISOLATION_BREACH': 'Attempted unauthorized access to another company\'s data',
      'SUSPICIOUS_INPUT_DETECTED': 'Potentially malicious input was detected and blocked',
      'BRUTE_FORCE_DETECTED': 'Multiple failed login attempts detected from this account',
      'SESSION_HIJACK_ATTEMPT': 'Potential session hijacking attempt detected',
      'SUSPICIOUS_PATTERN': 'Unusual activity pattern detected'
    };
    
    return messages[violationType] || `Security violation: ${violationType}`;
  };

  const handleSecurityAction = async (violationId: string, action: 'investigate' | 'dismiss') => {
    if (action === 'dismiss') {
      setDismissed(prev => new Set([...prev, violationId]));
    } else {
      // Log investigation action
      await supabase.from('security_audit_log').insert({
        action: 'SECURITY_INVESTIGATION_STARTED',
        resource_type: 'security_violation',
        details: {
          violation_id: violationId,
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Investigation Started",
        description: "Security team has been notified.",
      });
    }
  };

  const activeViolations = violations.filter(v => !dismissed.has(v.id));

  if (activeViolations.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 space-y-2">
      {activeViolations.map((violation) => (
        <Alert 
          key={violation.id} 
          className={`max-w-4xl mx-auto ${
            violation.severity === 'high' 
              ? 'border-red-500 bg-red-50' 
              : violation.severity === 'medium'
              ? 'border-orange-500 bg-orange-50'
              : 'border-yellow-500 bg-yellow-50'
          }`}
        >
          <AlertTriangle className={`h-4 w-4 ${
            violation.severity === 'high' 
              ? 'text-red-600' 
              : violation.severity === 'medium'
              ? 'text-orange-600'
              : 'text-yellow-600'
          }`} />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong className={
                violation.severity === 'high' 
                  ? 'text-red-800' 
                  : violation.severity === 'medium'
                  ? 'text-orange-800'
                  : 'text-yellow-800'
              }>
                Security Alert ({violation.severity.toUpperCase()})
              </strong>
              <div className={`mt-1 text-sm ${
                violation.severity === 'high' 
                  ? 'text-red-700' 
                  : violation.severity === 'medium'
                  ? 'text-orange-700'
                  : 'text-yellow-700'
              }`}>
                {violation.message}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(violation.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSecurityAction(violation.id, 'investigate')}
                className={`${
                  violation.severity === 'high' 
                    ? 'border-red-300 text-red-700 hover:bg-red-100' 
                    : violation.severity === 'medium'
                    ? 'border-orange-300 text-orange-700 hover:bg-orange-100'
                    : 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                <Shield className="h-3 w-3 mr-1" />
                Investigate
              </Button>
              {violation.canDismiss && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSecurityAction(violation.id, 'dismiss')}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}