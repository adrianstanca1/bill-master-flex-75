import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function useBruteForceProtection() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    checkBlockStatus();
  }, []);

  const checkBlockStatus = () => {
    const blockUntil = localStorage.getItem('auth_block_until');
    if (blockUntil && parseInt(blockUntil) > Date.now()) {
      setIsBlocked(true);
      return true;
    }
    setIsBlocked(false);
    return false;
  };

  const checkBruteForce = async (action: string) => {
    if (checkBlockStatus()) {
      return false;
    }

    const attempts = parseInt(localStorage.getItem('auth_attempts') || '0');
    const newAttempts = attempts + 1;
    
    localStorage.setItem('auth_attempts', newAttempts.toString());
    setAttemptCount(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      const blockUntil = Date.now() + LOCKOUT_DURATION;
      localStorage.setItem('auth_block_until', blockUntil.toString());
      setIsBlocked(true);

      // Log brute force attempt
      supabase
        .from('security_audit_log')
        .insert([{
          action: 'BRUTE_FORCE_DETECTED',
          resource: 'authentication',
          details: { 
            action,
            attempt_count: newAttempts,
            blocked_until: new Date(blockUntil).toISOString()
          }
        }])
        .then(() => {});

      return false;
    }

    return true;
  };

  const resetAttempts = () => {
    localStorage.removeItem('auth_attempts');
    localStorage.removeItem('auth_block_until');
    setAttemptCount(0);
    setIsBlocked(false);
  };

  return {
    isBlocked,
    attemptCount,
    checkBruteForce,
    resetAttempts
  };
}
