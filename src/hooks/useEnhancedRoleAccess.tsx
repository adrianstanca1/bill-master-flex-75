import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEnhancedRoleAccess() {
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRole('user');
          setLoading(false);
          return;
        }

        // Fetch actual user role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        } else {
          // Map database roles to component roles
          const dbRole = profile?.role || 'member';
          setUserRole(dbRole === 'admin' ? 'admin' : 'user');
        }
        
        // Log access check for security auditing
        await supabase.from('security_audit_log').insert({
          action: 'ROLE_ACCESS_CHECK',
          resource: 'user_role',
          user_id: user.id,
          details: { 
            role_checked: profile?.role || 'member',
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  const checkAccess = (requiredRole: string) => {
    // Check access based on actual user role
    if (requiredRole === 'admin') return userRole === 'admin';
    if (requiredRole === 'moderator') return userRole === 'admin'; // Only admins can be moderators
    return true; // All authenticated users have basic access
  };

  const updateRole = async (newRole: string) => {
    toast({
      title: "Role management disabled",
      description: "Role changes require admin approval through secure channels",
      variant: "destructive"
    });
  };

  return {
    userRole,
    canAccessFinancials: userRole === 'admin', // Only admins can access financials
    canAccessAnalytics: userRole === 'admin',   // Only admins can see analytics
    isAdmin: userRole === 'admin',
    loading,
    checkAccess,
    updateRole,
  };
}