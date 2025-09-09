import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanySetup } from '@/hooks/useCompanySetup';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function AuthCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { getCompanyData } = useCompanySetup();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallbackHandler: Starting callback handling...');
        
        // First, try to get the session from the URL params (for magic link/OAuth flows)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback session error:', sessionError);
          toast({
            title: "Authentication Error",
            description: "There was an issue with authentication. Please try again.",
            variant: "destructive"
          });
          navigate('/auth', { replace: true });
          return;
        }

        if (sessionData.session) {
          console.log('AuthCallbackHandler: Session found, checking setup status...');
          
          // Check if user needs to complete setup
          try {
            const companyData = await getCompanyData();
            const setupComplete = companyData && companyData.companyName;
            
            if (setupComplete) {
              console.log('AuthCallbackHandler: Setup complete, redirecting to dashboard');
              toast({
                title: "Welcome back!",
                description: "Redirecting to your dashboard...",
              });
              navigate('/dashboard', { replace: true });
            } else {
              console.log('AuthCallbackHandler: Setup needed, redirecting to setup');
              toast({
                title: "Welcome!",
                description: "Let's set up your company profile to get started.",
              });
              navigate('/setup', { replace: true });
            }
          } catch (setupError) {
            console.error('AuthCallbackHandler: Setup check error:', setupError);
            // If there's an error checking setup, assume new user needs setup
            navigate('/setup', { replace: true });
          }
        } else {
          console.log('AuthCallbackHandler: No session found, redirecting to auth');
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('AuthCallbackHandler: General error:', err);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast, getCompanyData]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}