import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AuthRedirectHandler() {
  const { toast } = useToast();

  useEffect(() => {
    // Handle auth redirects (email confirmation, password reset, etc.)
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth redirect error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Check URL for auth-related hash fragments
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const error_description = hashParams.get('error_description');
      const type = hashParams.get('type');

      if (error_description) {
        toast({
          title: "Authentication Error",
          description: decodeURIComponent(error_description),
          variant: "destructive",
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (accessToken && type === 'signup') {
        toast({
          title: "Email Confirmed!",
          description: "Your email has been confirmed. Welcome to Construction Dashboard!",
          duration: 5000,
        });
        // Clean up URL and redirect to dashboard
        window.history.replaceState({}, document.title, '/dashboard');
      }

      if (type === 'recovery') {
        toast({
          title: "Password Reset",
          description: "You can now set a new password.",
        });
        // Redirect to password reset form
        window.history.replaceState({}, document.title, '/reset-password');
      }
    };

    // Only run on mount and if there are auth-related hash parameters
    if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
      handleAuthRedirect();
    }
  }, [toast]);

  return null;
}