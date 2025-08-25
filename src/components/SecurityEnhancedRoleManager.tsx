import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useSecureRoleManagement } from '@/hooks/useSecureRoleManagement';
import { SecurityImplementationStatus } from './SecurityImplementationStatus';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  created_at: string;
}

export function SecurityEnhancedRoleManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const { isAdmin, loading: roleLoading } = useRoleBasedAccess();
  const { updateUserRole, getCompanyUsers, validateRoleChange } = useSecureRoleManagement();
  const { toast } = useToast();

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      loadUsers();
    }
  }, [isAdmin, roleLoading]);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getCompanyUsers();
    if (result.success) {
      setUsers(result.data || []);
    }
    setLoading(false);
  };

  const handleRoleUpdate = async (userId: string, currentRole: string, newRole: string) => {
    const isValid = await validateRoleChange(currentRole, newRole, userId);
    if (!isValid) {
      return;
    }

    setUpdating(userId);
    const result = await updateUserRole(userId, newRole as 'admin' | 'manager' | 'member');
    
    if (result.success) {
      await loadUsers(); // Refresh the list
    }
    setUpdating(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'member': return 'secondary';
      default: return 'outline';
    }
  };

  // Show implementation status instead of full interface for now
  return (
    <div className="space-y-6">
      <SecurityImplementationStatus />
      
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Role Management Coming Soon</h3>
            <p className="text-muted-foreground">
              Role-based access control will be available after database migrations are complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}