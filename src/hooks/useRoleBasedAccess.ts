import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleAccessState {
  userRole: 'admin' | 'manager' | 'member' | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManageEmployees: boolean;
  canAccessFinancials: boolean;
  canViewAnalytics: boolean;
  canViewSalaries: boolean;
}

export function useRoleBasedAccess(): RoleAccessState {
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'member' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Fetch user profile with role from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, company_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserRole('member'); // Default to member for safety
        } else {
          // Use actual role from database or default to member
          const role = profile?.role || 'member';
          setUserRole(role as 'admin' | 'manager' | 'member');
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
        setUserRole('member'); // Fail safe to most restrictive role
        toast({
          title: "Access Check Failed",
          description: "Unable to verify permissions. Limited access granted.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Listen for role changes
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('role-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newRole = payload.new.role || 'member';
            setUserRole(newRole);
            toast({
              title: "Role Updated",
              description: `Your role has been changed to ${newRole}`,
              variant: newRole === 'admin' ? 'default' : 'destructive'
            });
          }
        )
        .subscribe();

      return channel;
    };

    let subscription: any;
    setupSubscription().then(channel => subscription = channel);

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [toast]);

  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'admin' || userRole === 'manager';

  return {
    userRole,
    loading,
    isAdmin,
    isManager,
    canManageEmployees: isManager,
    canAccessFinancials: isManager, // Only managers and admins can access financials
    canViewAnalytics: isManager,    // Only managers and admins can view analytics
    canViewSalaries: isManager      // Only managers and admins can view salary information
  };
}