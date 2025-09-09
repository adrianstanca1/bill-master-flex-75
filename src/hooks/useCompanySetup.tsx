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
      if (!user) {
        console.log('useCompanySetup: No user found');
        return null;
      }

      console.log('useCompanySetup: Fetching profile for user:', user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('useCompanySetup: Error fetching profile:', error);
        return null;
      }

      console.log('useCompanySetup: Profile data:', profile);

      return {
        companyName: profile?.display_name || '',
        industry: '',
        email: user.email || '',
        phone: '',
        address: '',
        companyId: profile?.company_id || null,
        role: profile?.role || 'user'
      };
    } catch (error) {
      console.error('useCompanySetup: Error fetching company data:', error);
      return null;
    }
  };

  return {
    setupCompany,
    getCompanyData,
    isLoading,
  };
}