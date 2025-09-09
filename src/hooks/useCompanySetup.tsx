import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanySetupData {
  companyName: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
}

export function useCompanySetup() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const setupCompany = async (data: CompanySetupData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate company ID
      const companyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Update user profile with company info
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          company_id: companyId,
          display_name: data.companyName,
          role: 'admin',
        });

      if (profileError) throw profileError;

      toast({
        title: "Company setup complete",
        description: "Your company has been successfully configured.",
      });

      return companyId;
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        companyName: profile?.display_name || '',
        industry: '',
        email: user.email || '',
        phone: '',
        address: '',
      };
    } catch (error) {
      console.error('Error fetching company data:', error);
      return null;
    }
  };

  return {
    setupCompany,
    getCompanyData,
    isLoading,
  };
}