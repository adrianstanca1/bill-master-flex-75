import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useSecureRoleBasedAccess } from '@/hooks/useSecureRoleBasedAccess';
import { useCompanySetup } from '@/hooks/useCompanySetup';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { secureStorage } from '@/lib/SecureStorage';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEnhancedProtectedRouteProps {
  children: ReactNode;
  requireSetup?: boolean;
  requiredRole?: 'admin' | 'manager' | 'member';
  requiresFinancialAccess?: boolean;
  requiresSecurityAccess?: boolean;
}

export function SecurityEnhancedProtectedRoute({ 
  children, 
  requireSetup = false,
  requiredRole = 'member',
  requiresFinancialAccess = false,
  requiresSecurityAccess = false
}: SecurityEnhancedProtectedRouteProps) {
  const { user, loading: authLoading, isAuthenticated } = useSecureAuth();
  const { 
    userRole, 
    loading: roleLoading, 
    canAccessFinancials, 
    canViewSecurity,
    isAdmin,
    isManager
  } = useSecureRoleBasedAccess();
  const { setupCompany, getCompanyData, isLoading } = useCompanySetup();

  // Add missing method for backward compatibility
  const checkSetupStatus = async () => {
    const data = await getCompanyData();
    return !!data?.companyName;
  };
  const location = useLocation();

  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [securityViolation, setSecurityViolation] = useState<string | null>(null);

  useEffect(() => {
    const performSecurityChecks = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // Check session validity
        const sessionStart = await secureStorage.getItem('session_start');
        if (sessionStart) {
          const sessionAge = Date.now() - new Date(sessionStart).getTime();
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge > maxSessionAge) {
            setSecurityViolation('Session expired for security');
            await supabase.from('security_audit_log').insert({
              action: 'SESSION_EXPIRED',
              resource_type: 'auth',
              details: {
                user_id: user.id,
                session_age_hours: sessionAge / (60 * 60 * 1000),
                timestamp: new Date().toISOString(),
                severity: 'warning'
              }
            });
            return;
          }
        }

        // Check role-based access
        if (requiredRole === 'admin' && !isAdmin) {
          setSecurityViolation('Admin access required');
          await supabase.from('security_audit_log').insert({
            action: 'UNAUTHORIZED_ADMIN_ACCESS',
            resource_type: 'security',
            details: {
              user_id: user.id,
              user_role: userRole,
              required_role: 'admin',
              attempted_path: location.pathname,
              timestamp: new Date().toISOString(),
              severity: 'high'
            }
          });
          return;
        }

        if (requiredRole === 'manager' && !isManager) {
          setSecurityViolation('Manager access required');
          await supabase.from('security_audit_log').insert({
            action: 'UNAUTHORIZED_MANAGER_ACCESS',
            resource_type: 'security',
            details: {
              user_id: user.id,
              user_role: userRole,
              required_role: 'manager',
              attempted_path: location.pathname,
              timestamp: new Date().toISOString(),
              severity: 'medium'
            }
          });
          return;
        }

        // Check financial access
        if (requiresFinancialAccess && !canAccessFinancials) {
          setSecurityViolation('Financial access not authorized');
          await supabase.from('security_audit_log').insert({
            action: 'UNAUTHORIZED_FINANCIAL_ACCESS',
            resource_type: 'financial',
            details: {
              user_id: user.id,
              user_role: userRole,
              attempted_path: location.pathname,
              timestamp: new Date().toISOString(),
              severity: 'high'
            }
          });
          return;
        }

        // Check security dashboard access
        if (requiresSecurityAccess && !canViewSecurity) {
          setSecurityViolation('Security dashboard access denied');
          await supabase.from('security_audit_log').insert({
            action: 'UNAUTHORIZED_SECURITY_ACCESS',
            resource_type: 'security',
            details: {
              user_id: user.id,
              user_role: userRole,
              attempted_path: location.pathname,
              timestamp: new Date().toISOString(),
              severity: 'critical'
            }
          });
          return;
        }

        // Check setup status if required
        if (requireSetup) {
          const setupComplete = await checkSetupStatus();
          setIsSetupComplete(setupComplete);
        } else {
          setIsSetupComplete(true);
        }

        // Log successful access
        await supabase.from('security_audit_log').insert({
          action: 'ROUTE_ACCESS_GRANTED',
          resource_type: 'navigation',
          details: {
            user_id: user.id,
            user_role: userRole,
            path: location.pathname,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        console.error('Security check failed:', error);
        setSecurityViolation('Security validation failed');
        
        await supabase.from('security_audit_log').insert({
          action: 'SECURITY_CHECK_FAILED',
          resource_type: 'security',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            user_id: user?.id,
            path: location.pathname,
            timestamp: new Date().toISOString(),
            severity: 'critical'
          }
        });
      }
    };

    if (!authLoading && !roleLoading) {
      performSecurityChecks();
    }
  }, [
    isAuthenticated, 
    user, 
    userRole, 
    authLoading, 
    roleLoading, 
    requireSetup, 
    requiredRole,
    requiresFinancialAccess,
    requiresSecurityAccess,
    canAccessFinancials,
    canViewSecurity,
    isAdmin,
    isManager,
    location.pathname,
    checkSetupStatus
  ]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">Performing security validation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (securityViolation) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <strong>Access Denied:</strong> {securityViolation}
            <div className="mt-4 text-sm text-muted-foreground">
              This incident has been logged for security purposes.
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireSetup) {
    if (isSetupComplete === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <LoadingSpinner />
            <p className="text-muted-foreground">Validating setup status...</p>
          </div>
        </div>
      );
    }

    if (!isSetupComplete) {
      return <Navigate to="/setup" replace />;
    }
  }

  return <>{children}</>;
}