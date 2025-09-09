import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export interface SecureEmployee {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  employee_position?: string;
  salary?: number;
  hire_date?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  has_sensitive_access: boolean;
}

export function useSecureEmployees() {
  const { companyId } = useCompanyId();

  return useQuery({
    queryKey: ['secure-employees', companyId],
    queryFn: async (): Promise<SecureEmployee[]> => {
      if (!companyId) return [];
      
      const { data, error } = await supabase.rpc('get_employee_data');
      
      if (error) {
        console.error('Error fetching secure employee data:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Utility function to check if user has access to sensitive data
export function hasSensitiveAccess(employees: SecureEmployee[]): boolean {
  return employees.length > 0 && employees[0]?.has_sensitive_access === true;
}

// Utility function to filter employees that have sensitive data visible
export function getEmployeesWithSensitiveData(employees: SecureEmployee[]): SecureEmployee[] {
  return employees.filter(emp => emp.has_sensitive_access);
}

// Utility function to get employee display data safely
export function getEmployeeDisplayData(employee: SecureEmployee) {
  return {
    id: employee.id,
    name: employee.name,
    position: employee.employee_position || 'Member',
    status: employee.status || 'active',
    email: employee.has_sensitive_access ? employee.email : null,
    phone: employee.has_sensitive_access ? employee.phone : null,
    salary: employee.has_sensitive_access ? employee.salary : null,
    hire_date: employee.has_sensitive_access ? employee.hire_date : null,
    created_at: employee.created_at,
    updated_at: employee.updated_at,
    canViewSensitive: employee.has_sensitive_access
  };
}