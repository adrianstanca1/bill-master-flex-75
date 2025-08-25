import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: Date;
  blocked: boolean;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 30 },
  api_call: { maxAttempts: 100, windowMinutes: 1, blockDurationMinutes: 5 },
  password_reset: { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 60 },
  form_submit: { maxAttempts: 10, windowMinutes: 5, blockDurationMinutes: 10 },
  file_upload: { maxAttempts: 20, windowMinutes: 10, blockDurationMinutes: 15 }
};

export function useEnhancedRateLimit() {
  const [rateLimitStatus, setRateLimitStatus] = useState<Record<string, RateLimitResult>>({});
  const { toast } = useToast();

  const checkRateLimit = useCallback(async (
    action: string,
    identifier?: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> => {
    try {
      const finalConfig = { ...DEFAULT_CONFIGS[action], ...config };
      if (!finalConfig.maxAttempts) {
        // No rate limit for this action
        return { allowed: true, remaining: -1, blocked: false };
      }

      // Use user ID if available, otherwise IP would be ideal but we'll use session
      const { data: { user } } = await supabase.auth.getUser();
      const rateLimitKey = identifier || user?.id || 'anonymous';

      // Check current rate limit status
      const windowStart = new Date(Date.now() - finalConfig.windowMinutes * 60 * 1000);
      
      const { data: attempts } = await supabase
        .from('security_audit_log')
        .select('created_at')
        .eq('action', `RATE_LIMIT_${action.toUpperCase()}`)
        .eq('user_id', rateLimitKey)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: false });

      const currentAttempts = attempts?.length || 0;
      const remaining = Math.max(0, finalConfig.maxAttempts - currentAttempts);
      
      // Check if currently blocked
      const blockCheckTime = new Date(Date.now() - finalConfig.blockDurationMinutes * 60 * 1000);
      const { data: blockCheck } = await supabase
        .from('security_audit_log')
        .select('created_at')
        .eq('action', `RATE_LIMIT_BLOCKED_${action.toUpperCase()}`)
        .eq('user_id', rateLimitKey)
        .gte('created_at', blockCheckTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      const isBlocked = blockCheck && blockCheck.length > 0;
      const resetTime = isBlocked 
        ? new Date(new Date(blockCheck[0].created_at).getTime() + finalConfig.blockDurationMinutes * 60 * 1000)
        : undefined;

      const result: RateLimitResult = {
        allowed: !isBlocked && remaining > 0,
        remaining: isBlocked ? 0 : remaining,
        resetTime,
        blocked: isBlocked
      };

      // Log the attempt
      if (!isBlocked) {
        await supabase.from('security_audit_log').insert({
          user_id: rateLimitKey,
          action: `RATE_LIMIT_${action.toUpperCase()}`,
          resource_type: 'rate_limiting',
          details: {
            attempts: currentAttempts + 1,
            remaining: remaining - 1,
            config: finalConfig,
            timestamp: new Date().toISOString()
          }
        });

        // If this puts us over the limit, log block
        if (remaining <= 1) {
          await supabase.from('security_audit_log').insert({
            user_id: rateLimitKey,
            action: `RATE_LIMIT_BLOCKED_${action.toUpperCase()}`,
            resource_type: 'rate_limiting',
            details: {
              reason: 'Rate limit exceeded',
              block_duration_minutes: finalConfig.blockDurationMinutes,
              timestamp: new Date().toISOString()
            }
          });
          
          result.blocked = true;
          result.allowed = false;
          result.resetTime = new Date(Date.now() + finalConfig.blockDurationMinutes * 60 * 1000);
        }
      }

      setRateLimitStatus(prev => ({ ...prev, [action]: result }));
      return result;

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // On error, allow the action (fail open)
      return { allowed: true, remaining: -1, blocked: false };
    }
  }, []);

  const handleRateLimitExceeded = useCallback((action: string, result: RateLimitResult) => {
    if (result.blocked) {
      const resetTime = result.resetTime ? result.resetTime.toLocaleTimeString() : 'shortly';
      toast({
        title: "Rate Limit Exceeded",
        description: `Too many ${action} attempts. Please try again at ${resetTime}.`,
        variant: "destructive",
        duration: 8000,
      });
    } else if (result.remaining <= 2) {
      toast({
        title: "Rate Limit Warning",
        description: `Only ${result.remaining} ${action} attempts remaining.`,
        variant: "default",
        duration: 5000,
      });
    }
  }, [toast]);

  const isRateLimited = useCallback((action: string): boolean => {
    const status = rateLimitStatus[action];
    return status ? status.blocked || !status.allowed : false;
  }, [rateLimitStatus]);

  return {
    checkRateLimit,
    handleRateLimitExceeded,
    isRateLimited,
    rateLimitStatus
  };
}