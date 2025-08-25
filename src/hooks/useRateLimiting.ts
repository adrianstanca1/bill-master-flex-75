import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export function useRateLimiting(action: string, config: RateLimitConfig) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockExpiresAt, setBlockExpiresAt] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    
    try {
      // Check if currently blocked via Supabase
      const { data: blockData } = await supabase
        .from('security_audit_log')
        .select('details')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('action', 'RATE_LIMIT_BLOCK')
        .eq('resource_id', action)
        .order('created_at', { ascending: false })
        .limit(1);

      if (blockData && blockData.length > 0) {
        const blockInfo = blockData[0].details as any;
        if (blockInfo && now < blockInfo.expiresAt) {
          setIsBlocked(true);
          setBlockExpiresAt(new Date(blockInfo.expiresAt));
          toast({
            title: "Rate limit exceeded",
            description: `Please wait before trying again. Block expires at ${new Date(blockInfo.expiresAt).toLocaleTimeString()}`,
            variant: "destructive"
          });
          return false;
        }
      }

      // Check attempt count within window via Supabase
      const windowStart = new Date(now - config.windowMs);
      const { data: attempts } = await supabase
        .from('security_audit_log')
        .select('created_at')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('action', 'RATE_LIMIT_ATTEMPT')
        .eq('resource_id', action)
        .gte('created_at', windowStart.toISOString());

      const attemptCount = attempts ? attempts.length : 0;
      
      if (attemptCount >= config.maxAttempts) {
        // Block user
        const expiresAt = now + config.blockDurationMs;
        await supabase.from('security_audit_log').insert({
          action: 'RATE_LIMIT_BLOCK',
          resource_type: 'rate_limiting',
          resource_id: action,
          details: JSON.stringify({ expiresAt, attemptCount, maxAttempts: config.maxAttempts, windowMs: config.windowMs })
        });
        
        setIsBlocked(true);
        setBlockExpiresAt(new Date(expiresAt));
        
        toast({
          title: "Rate limit exceeded",
          description: `Too many attempts. Please wait ${Math.ceil(config.blockDurationMs / 60000)} minutes before trying again.`,
          variant: "destructive"
        });
        return false;
      }

      // Record this attempt
      await supabase.from('security_audit_log').insert({
        action: 'RATE_LIMIT_ATTEMPT',
        resource_type: 'rate_limiting',
        resource_id: action,
        details: JSON.stringify({ timestamp: now, maxAttempts: config.maxAttempts })
      });
      
      return true;
    } catch (error) {
      console.error('Rate limiting check failed:', error);
      // Fallback to localStorage for offline mode
      return checkRateLimitFallback();
    }
  }, [action, config, toast]);

  const checkRateLimitFallback = useCallback((): boolean => {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    
    // Check if currently blocked
    const blockData = localStorage.getItem(`${key}_block`);
    if (blockData) {
      const blockInfo = JSON.parse(blockData);
      if (now < blockInfo.expiresAt) {
        setIsBlocked(true);
        setBlockExpiresAt(new Date(blockInfo.expiresAt));
        return false;
      } else {
        localStorage.removeItem(`${key}_block`);
        localStorage.removeItem(`${key}_attempts`);
        setIsBlocked(false);
        setBlockExpiresAt(null);
      }
    }

    // Check attempt count within window
    const attemptsData = localStorage.getItem(`${key}_attempts`);
    let attempts = attemptsData ? JSON.parse(attemptsData) : [];
    
    const windowStart = now - config.windowMs;
    attempts = attempts.filter((timestamp: number) => timestamp > windowStart);
    
    if (attempts.length >= config.maxAttempts) {
      const expiresAt = now + config.blockDurationMs;
      localStorage.setItem(`${key}_block`, JSON.stringify({ expiresAt }));
      setIsBlocked(true);
      setBlockExpiresAt(new Date(expiresAt));
      return false;
    }

    attempts.push(now);
    localStorage.setItem(`${key}_attempts`, JSON.stringify(attempts));
    return true;
  }, [action, config]);

  const resetRateLimit = useCallback(async () => {
    const key = `rate_limit_${action}`;
    try {
      // Clear from Supabase
      await supabase.from('security_audit_log').insert({
        action: 'RATE_LIMIT_RESET',
        resource_type: 'rate_limiting',
        resource_id: action,
        details: JSON.stringify({ timestamp: Date.now() })
      });
    } catch (error) {
      console.error('Failed to reset rate limit in Supabase:', error);
    }
    
    // Clear local storage as fallback
    localStorage.removeItem(`${key}_block`);
    localStorage.removeItem(`${key}_attempts`);
    setIsBlocked(false);
    setBlockExpiresAt(null);
  }, [action]);

  return {
    isBlocked,
    blockExpiresAt,
    checkRateLimit,
    resetRateLimit
  };
}