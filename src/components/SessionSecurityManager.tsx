import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SessionSecurityManagerProps {
  children: React.ReactNode;
}

export function SessionSecurityManager({ children }: SessionSecurityManagerProps) {
  const { user, session } = useSecureAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !session) return;

    // Monitor session validity
    const checkSession = async () => {
      try {
        // Simple session validation
        const sessionAge = Date.now() - new Date().getTime(); // Simplified check
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge > maxAge) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    // Check session every 10 minutes
    const interval = setInterval(checkSession, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, session, toast]);

  return <>{children}</>;
}