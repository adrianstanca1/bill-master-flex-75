
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from './useCompanyId';

interface DashboardStats {
  totalRevenue: number;
  pendingInvoices: number;
  overdueAmount: number;
  activeProjects: number;
  recentInvoices: any[];
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const companyId = useCompanyId();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueAmount: 0,
    activeProjects: 0,
    recentInvoices: [],
    loading: true,
    error: null
  });

  const isValidUUID = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

  useEffect(() => {
    const fetchStats = async () => {
      if (!companyId || !isValidUUID(companyId)) {
        // No valid company context; show empty state without errors
        setStats(prev => ({ ...prev, loading: false, error: null }));
        return;
      }

      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Fetch invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (invoicesError) throw invoicesError;

        // Fetch projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', companyId);

        if (projectsError) throw projectsError;

        // Calculate stats
        const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total || 0), 0) || 0;
        const pendingInvoices = invoices?.filter(inv => inv.status === 'issued').length || 0;
        const overdueAmount = invoices?.filter(inv => {
          if (!inv.due_date || inv.status === 'paid') return false;
          return new Date(inv.due_date) < new Date();
        }).reduce((sum, inv) => sum + Number(inv.total || 0), 0) || 0;

        setStats({
          totalRevenue,
          pendingInvoices,
          overdueAmount,
          activeProjects: projects?.length || 0,
          recentInvoices: invoices?.slice(0, 5) || [],
          loading: false,
          error: null
        });

      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    };

    fetchStats();
  }, [companyId]);

  return stats;
};
