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
  const { setupCompany, getCompanyData, isLoading } = useCompanySetup();

  // Add missing method for backward compatibility
  const checkSetupStatus = async () => {
    const data = await getCompanyData();
    return !!data?.companyName;
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Complete",
            description: "Redirecting to your dashboard...",
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          // Check if user needs to complete setup
          const setupComplete = await checkSetupStatus();
          
          if (setupComplete) {
            // User has completed setup - go to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            // New user - redirect to setup
            toast({
              title: "Welcome!",
              description: "Let's set up your company profile to get started.",
            });
            navigate('/setup', { replace: true });
          }
        } else {
          // No session found - redirect to auth
          navigate('/auth');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, checkSetupStatus]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}