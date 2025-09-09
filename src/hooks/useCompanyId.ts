
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const getCompanyId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCompanyId('');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          setCompanyId('');
          return;
        }

        setCompanyId(profile?.company_id || '');
      } catch (error) {
        console.error('Error getting company ID:', error);
        setCompanyId('');
      }
    };

    getCompanyId();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          getCompanyId();
        } else {
          setCompanyId('');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return companyId;
};
