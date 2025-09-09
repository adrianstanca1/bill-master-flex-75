import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSecurityBruteForce() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockExpiresAt, setBlockExpiresAt] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkBruteForce = useCallback(async (userId?: string) => {
    if (!userId) return { isBlocked: false };

    try {
      // Check recent failed attempts from security audit log
      const { data: attempts, error } = await supabase
        .from('security_audit_log')
        .select('created_at, action')
        .eq('user_id', userId)
        .like('action', '%FAILED%')
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Brute force check failed:', error);
        return { isBlocked: false };
      }

      const failureCount = attempts?.length || 0;
      const isBlocked = failureCount >= 5;

      setIsBlocked(isBlocked);

      if (isBlocked) {
        const blockExpiry = new Date(Date.now() + 15 * 60 * 1000);
        setBlockExpiresAt(blockExpiry);
        
        toast({
          title: "Account Temporarily Blocked",
          description: "Too many failed attempts. Please try again later.",
          variant: "destructive",
          duration: 10000,
        });
      } else if (failureCount > 3) {
        toast({
          title: "Security Warning",
          description: `${failureCount} failed attempts detected. Please verify your credentials.`,
          variant: "destructive",
        });
      }

      return { 
        isBlocked, 
        failureCount,
        expiresAt: isBlocked ? new Date(Date.now() + 15 * 60 * 1000) : null
      };
    } catch (error) {
      console.error('Brute force protection error:', error);
      return { isBlocked: false };
    }
  }, [toast]);

  const logFailedAttempt = useCallback(async (userId: string, action: string) => {
    try {
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: userId,
          action: action,
          resource: 'authentication',
          details: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  return {
    isBlocked,
    blockExpiresAt,
    checkBruteForce,
    logFailedAttempt
  };
}