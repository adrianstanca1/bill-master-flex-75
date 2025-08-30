import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { secureStorage } from '@/lib/SecureStorage';

interface SecureRoleAccessState {
  userRole: 'admin' | 'manager' | 'member' | null;
  companyId: string | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManageEmployees: boolean;
  canAccessFinancials: boolean;
  canViewAnalytics: boolean;
  canManageRoles: boolean;
  canViewSecurity: boolean;
}

export function useSecureRoleBasedAccess(): SecureRoleAccessState {
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'member' | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSecureUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRole(null);
          setCompanyId(null);
          setLoading(false);
          return;
        }

        // Enhanced profile fetch with role validation (fallback if role column doesn't exist)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('company_id, id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Security-first: default to most restrictive role
          setUserRole('member');
          
          // Log security event for failed role check
          await supabase.from('security_audit_log').insert({
            action: 'ROLE_CHECK_FAILED',
            resource_type: 'user_role',
            details: { 
              user_id: user.id,
              error: error.message,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          // Default to member role until role column is added to database
          const role = 'member';
          
          setUserRole(role);
          setCompanyId(profile.company_id);
          
          // Store role securely for offline validation
          await secureStorage.setItem('user_role', role);
          await secureStorage.setItem('company_id', profile.company_id);

          // Enhanced security logging
          await supabase.from('security_audit_log').insert({
            action: 'ROLE_ACCESS_VERIFIED',
            resource_type: 'user_role',
            details: { 
              user_id: user.id,
              role: role,
              company_id: profile.company_id,
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          });
        }

      } catch (error) {
        console.error('Error in secure role check:', error);
        setUserRole('member'); // Fail safe to most restrictive role
        
        // Log critical security error
        await supabase.from('security_audit_log').insert({
          action: 'CRITICAL_ROLE_ERROR',
          resource_type: 'security',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            severity: 'critical'
          }
        });

        toast({
          title: "Security Warning",
          description: "Unable to verify permissions. Limited access granted for security.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSecureUserRole();

    // Enhanced real-time role monitoring
    const channel = supabase
      .channel('secure-role-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
        },
        async (payload) => {
          const newRole = payload.new.role;
          const oldRole = payload.old.role;
          
          // Log role change for security audit
          await supabase.from('security_audit_log').insert({
            action: 'ROLE_CHANGED',
            resource_type: 'user_role',
            details: {
              old_role: oldRole,
              new_role: newRole,
              changed_at: new Date().toISOString(),
              user_id: payload.new.id
            }
          });
          
          setUserRole(newRole);
          await secureStorage.setItem('user_role', newRole);
          
          toast({
            title: "Role Updated",
            description: `Your role has been changed from ${oldRole} to ${newRole}`,
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
    companyId,
    loading,
    isAdmin,
    isManager,
    canManageEmployees: isManager,
    canAccessFinancials: isAdmin, // Only admins can access financials
    canViewAnalytics: isManager,  // Managers and admins can view analytics
    canManageRoles: isAdmin,      // Only admins can manage roles
    canViewSecurity: isAdmin      // Only admins can view security dashboard
  };
}