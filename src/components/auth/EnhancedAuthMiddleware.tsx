import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedAuthMiddlewareProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireEmailVerified?: boolean;
  requireSetup?: boolean;
  allowedRoles?: string[];
  sessionTimeoutMinutes?: number;
}

export function EnhancedAuthMiddleware({
  children,
  requireAuth = true,
  requireEmailVerified = false,
  requireSetup = false,
  allowedRoles = [],
  sessionTimeoutMinutes = 60
}: EnhancedAuthMiddlewareProps) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const [authChecks, setAuthChecks] = useState({
    emailVerified: true,
    setupComplete: true,
    roleAuthorized: true,
    sessionValid: true
  });
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const performAuthChecks = async () => {
      if (loading) return;

      setCheckingAuth(true);
      const checks = {
        emailVerified: true,
        setupComplete: true,
        roleAuthorized: true,
        sessionValid: true
      };

      try {
        // Basic auth check
        if (requireAuth && !isAuthenticated) {
          navigate('/auth', { state: { from: location }, replace: true });
          return;
        }

        if (!requireAuth) {
          setAuthChecks(checks);
          setCheckingAuth(false);
          return;
        }

        if (!user) {
          setAuthChecks(checks);
          setCheckingAuth(false);
          return;
        }

        // Email verification check
        if (requireEmailVerified && !user.email_confirmed_at) {
          checks.emailVerified = false;
        }

        // Get user profile and check setup
        if (requireSetup || allowedRoles.length > 0) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            setUserProfile(profile);

            // Setup check
            if (requireSetup && (!profile || !profile.company_id || !profile.display_name)) {
              checks.setupComplete = false;
            }

            // Role authorization check
            if (allowedRoles.length > 0) {
              const userRole = profile?.role || 'user';
              if (!allowedRoles.includes(userRole)) {
                checks.roleAuthorized = false;
              }
            }
          }
        }

        // Session timeout check
        const { data: session } = await supabase.auth.getSession();
        if (session?.session) {
          // Use current time vs session refresh time for timeout check
          const sessionRefreshTime = new Date(session.session.refresh_token || Date.now()).getTime();
          const sessionAge = Date.now() - sessionRefreshTime;
          const timeoutMs = sessionTimeoutMinutes * 60 * 1000;
          
          if (sessionAge > timeoutMs) {
            checks.sessionValid = false;
          }
        }

        setAuthChecks(checks);
        
        // Handle redirects based on failed checks
        if (!checks.emailVerified) {
          toast({
            title: "Email Verification Required",
            description: "Please verify your email address to continue.",
            variant: "destructive"
          });
          navigate('/auth/verify-email', { replace: true });
          return;
        }

        if (!checks.setupComplete) {
          toast({
            title: "Setup Required",
            description: "Please complete your account setup to continue.",
          });
          navigate('/setup', { replace: true });
          return;
        }

        if (!checks.roleAuthorized) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive"
          });
          navigate('/dashboard', { replace: true });
          return;
        }

        if (!checks.sessionValid) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          navigate('/auth', { replace: true });
          return;
        }

      } catch (error) {
        console.error('Auth middleware error:', error);
        toast({
          title: "Authentication Error",
          description: "There was an issue verifying your access. Please try again.",
          variant: "destructive"
        });
      } finally {
        setCheckingAuth(false);
      }
    };

    performAuthChecks();
  }, [
    user, 
    loading, 
    isAuthenticated, 
    requireAuth, 
    requireEmailVerified, 
    requireSetup, 
    allowedRoles, 
    sessionTimeoutMinutes,
    navigate,
    location,
    toast
  ]);

  // Show loading while performing auth checks
  if (loading || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-center text-muted-foreground">
              Verifying access permissions...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show auth failures if any checks failed
  if (!authChecks.emailVerified || !authChecks.setupComplete || !authChecks.roleAuthorized || !authChecks.sessionValid) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-orange-200 bg-orange-50">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              {!authChecks.emailVerified && <AlertTriangle className="w-8 h-8 text-orange-600" />}
              {!authChecks.setupComplete && <AlertTriangle className="w-8 h-8 text-orange-600" />}
              {!authChecks.roleAuthorized && <Shield className="w-8 h-8 text-orange-600" />}
              {!authChecks.sessionValid && <Clock className="w-8 h-8 text-orange-600" />}
            </div>
            
            <h3 className="text-lg font-semibold text-orange-900 mb-2 text-center">
              {!authChecks.emailVerified && "Email Verification Required"}
              {!authChecks.setupComplete && "Setup Required"}  
              {!authChecks.roleAuthorized && "Access Denied"}
              {!authChecks.sessionValid && "Session Expired"}
            </h3>
            
            <p className="text-center text-orange-700 mb-4 text-sm">
              {!authChecks.emailVerified && "Please verify your email address to continue accessing this page."}
              {!authChecks.setupComplete && "Complete your account setup to access all features."}
              {!authChecks.roleAuthorized && "You don't have the required permissions to view this page."}
              {!authChecks.sessionValid && "Your session has expired for security reasons. Please sign in again."}
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!authChecks.emailVerified) navigate('/auth/verify-email');
                  else if (!authChecks.setupComplete) navigate('/setup');
                  else if (!authChecks.roleAuthorized || !authChecks.sessionValid) navigate('/dashboard');
                }}
                size="sm"
              >
                {!authChecks.emailVerified && "Verify Email"}
                {!authChecks.setupComplete && "Complete Setup"}
                {!authChecks.roleAuthorized && "Go to Dashboard"}
                {!authChecks.sessionValid && "Sign In Again"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}