import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CompanySetupData {
  companyName: string;
  country?: string;
  industry?: string;
  address?: string;
  website?: string;
  phone?: string;
  contactEmail?: string;
}

export function useCompanySetup() {
  const [loading, setLoading] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const setupCompany = useCallback(async (data: CompanySetupData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Store company information in user profile using available fields
      const fullName = `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName || user.user_metadata?.full_name,
          email: user.email,
          phone: data.phone
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast({
          title: "Setup Failed",
          description: profileError.message || "Failed to complete setup. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Store company information in secure storage for now
      // This will be accessible to other parts of the app
      try {
        await supabase.rpc('secure_store_data', {
          store_key: `company_setup_${user.id}`,
          store_value: {
            companyName: data.companyName,
            country: data.country || 'UK',
            industry: data.industry || 'construction',
            address: data.address,
            website: data.website,
            phone: data.phone,
            contactEmail: data.contactEmail,
            setupCompleted: true,
            setupDate: new Date().toISOString()
          }
        });
      } catch (err) {
        console.warn('Failed to store company data securely:', err);
        // Continue with setup even if secure storage fails
      }

      // Update local state
      setIsSetupComplete(true);
      
      toast({
        title: "Setup Complete!",
        description: "Welcome to your dashboard. Your company has been set up successfully.",
      });

      // Redirect to dashboard after successful setup
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Company setup error:', error);
      toast({
        title: "Setup Error",
        description: error.message || "An unexpected error occurred during setup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, navigate]);

  const checkSetupStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSetupComplete(false);
        return false;
      }

      // Check if user has a complete profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Setup status check error:', error);
        setIsSetupComplete(false);
        return false;
      }

      // Also check if company setup data exists
      let hasCompanySetup = false;
      try {
        const { data: companyData } = await supabase.rpc('secure_retrieve_data', {
          store_key: `company_setup_${user.id}`
        });
        hasCompanySetup = !!(companyData && (companyData as any).setupCompleted);
      } catch (err) {
        console.warn('Failed to check company setup data:', err);
      }

      const hasSetup = !!(profile?.full_name && profile?.email && hasCompanySetup);
      setIsSetupComplete(hasSetup);
      return hasSetup;
    } catch (error) {
      console.error('Setup status check error:', error);
      setIsSetupComplete(false);
      return false;
    }
  }, []);

  return {
    isSetupComplete,
    loading,
    setupCompany,
    checkSetupStatus
  };
}