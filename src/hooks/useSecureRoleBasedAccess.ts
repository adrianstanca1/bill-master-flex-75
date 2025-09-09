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

        // Fetch user profile with role and company_id from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, company_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Security-first: default to most restrictive role
          setUserRole('member');
          
          // Log security event for failed role check
          await supabase.from('security_audit_log').insert({
            action: 'ROLE_CHECK_FAILED',
            resource: 'user_role',
            user_id: user.id,
            details: { 
              error: error.message,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          // Use actual role from database
          const role = profile?.role || 'member';
          
          setUserRole(role as 'admin' | 'manager' | 'member');
          setCompanyId(profile?.company_id || null);
          
          // Store role securely for offline validation
          await secureStorage.setItem('user_role', role);
          await secureStorage.setItem('company_id', profile?.company_id || '');

          // Enhanced security logging
          await supabase.from('security_audit_log').insert({
            action: 'ROLE_ACCESS_VERIFIED',
            resource: 'user_role',
            user_id: user.id,
            details: { 
              role: role,
              company_id: profile?.company_id,
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
          resource: 'security',
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
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('secure-role-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            const newRole = payload.new.role || 'member';
            const oldRole = payload.old.role || 'member';
            
            // Log role change for security audit
            await supabase.from('security_audit_log').insert({
              action: 'ROLE_CHANGED',
              resource: 'user_role',
              user_id: user.id,
              details: {
                old_role: oldRole,
                new_role: newRole,
                changed_at: new Date().toISOString()
              }
            });
            
            setUserRole(newRole);
            setCompanyId(payload.new.company_id);
            await secureStorage.setItem('user_role', newRole);
            
            toast({
              title: "Role Updated",
              description: `Your role has been changed from ${oldRole} to ${newRole}`,
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