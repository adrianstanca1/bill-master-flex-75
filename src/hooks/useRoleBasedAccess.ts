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

        // Fetch user profile with role (handle case where role column doesn't exist yet)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserRole('member'); // Default to member for safety
        } else {
          // For now, default to member until role column is added
          setUserRole('member');
        }

        // Log access check for security auditing
        await supabase.from('security_audit_log').insert({
          action: 'ROLE_ACCESS_CHECK',
          resource_type: 'user_role',
          details: { 
            user_id: user.id,
            role_checked: 'member', // Default until role system is fully implemented
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
    const channel = supabase
      .channel('role-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
        },
        (payload) => {
          const newRole = payload.new.role;
          setUserRole(newRole);
          toast({
            title: "Role Updated",
            description: `Your role has been changed to ${newRole}`,
            variant: newRole === 'admin' ? 'default' : 'destructive'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
    canViewAnalytics: isManager     // Only managers and admins can view analytics
  };
}