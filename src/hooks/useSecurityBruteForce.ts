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
      const { data, error } = await supabase.rpc('enhanced_brute_force_check', {
        check_user_id: userId,
        check_ip: null // IP detection would need server-side implementation
      });

      if (error) {
        console.error('Brute force check failed:', error);
        return { isBlocked: false };
      }

      const result = data as {
        user_blocked: boolean;
        ip_blocked: boolean;
        block_expires_at: string | null;
        user_failures: number;
        ip_failures: number;
      };

      const blocked = result.user_blocked || result.ip_blocked;
      setIsBlocked(blocked);

      if (result.block_expires_at) {
        setBlockExpiresAt(new Date(result.block_expires_at));
      }

      if (blocked) {
        toast({
          title: "Account Temporarily Blocked",
          description: "Too many failed attempts. Please try again later.",
          variant: "destructive",
          duration: 10000,
        });
      } else if (result.user_failures > 3) {
        toast({
          title: "Security Warning",
          description: `${result.user_failures} failed attempts detected. Please verify your credentials.`,
          variant: "destructive",
        });
      }

      return { 
        isBlocked: blocked, 
        failureCount: result.user_failures,
        expiresAt: result.block_expires_at ? new Date(result.block_expires_at) : null
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
          resource_type: 'authentication',
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