import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedAccess } from './useRoleBasedAccess';

export function useSecureRoleManagement() {
  const { isAdmin } = useRoleBasedAccess();
  const { toast } = useToast();

  const updateUserRole = useCallback(async (
    targetUserId: string, 
    newRole: 'admin' | 'manager' | 'member'
  ) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can change user roles",
        variant: "destructive"
      });
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      // Log the role change attempt
      await supabase.from('security_audit_log').insert({
        action: 'ROLE_CHANGE_ATTEMPT',
        resource_type: 'user_management',
        resource_id: targetUserId,
        details: {
          new_role: newRole,
          attempted_by: (await supabase.auth.getUser()).data.user?.id,
          timestamp: new Date().toISOString()
        }
      });

      // Note: Role updates are disabled until database migration is complete
      toast({
        title: "Feature Not Available",
        description: "Role management requires database migrations to be completed first",
        variant: "destructive"
      });

      return { success: false, error: 'Database migration required' };
    } catch (error: any) {
      console.error('Role update failed:', error);
      
      toast({
        title: "Role Update Failed",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });

      return { success: false, error: error.message };
    }
  }, [isAdmin, toast]);

  const getCompanyUsers = useCallback(async () => {
    try {
      // For now, select without role column until it's added to database
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add default role to each user
      const usersWithRoles = (data || []).map(user => ({
        id: user.id,
        full_name: user.display_name || 'Unknown User',
        email: 'user@example.com',
        created_at: user.created_at,
        role: 'member' as const
      }));

      return { success: true, data: usersWithRoles };
    } catch (error: any) {
      console.error('Failed to fetch company users:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const validateRoleChange = useCallback(async (
    currentRole: string, 
    newRole: string, 
    targetUserId: string
  ): Promise<boolean> => {
    // Prevent self-role changes
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser?.id === targetUserId) {
      toast({
        title: "Invalid Operation",
        description: "You cannot change your own role",
        variant: "destructive"
      });
      return false;
    }

    // Only admins can assign admin role
    if (newRole === 'admin' && !isAdmin) {
      toast({
        title: "Access Denied", 
        description: "Only administrators can assign admin privileges",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [isAdmin, toast]);

  return {
    updateUserRole,
    getCompanyUsers,
    validateRoleChange,
    canManageRoles: isAdmin
  };
}