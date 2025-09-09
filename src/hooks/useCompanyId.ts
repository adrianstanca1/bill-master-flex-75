import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCompanyId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setCompanyId('');
          setLoading(false);
          return;
        }

        // Get company ID from user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          setCompanyId('');
        } else if (profile?.company_id) {
          setCompanyId(profile.company_id);
        } else {
          // Fallback to localStorage for backward compatibility during migration
          try {
            const settings = JSON.parse(localStorage.getItem('as-settings') || '{}');
            const candidate = String(settings.companyId || '').trim();
            if (candidate) {
              setCompanyId(candidate);
            }
          } catch (error) {
            console.error('Error parsing settings:', error);
          }
        }
      } catch (error) {
        console.error('Error getting company ID:', error);
        setCompanyId('');
      } finally {
        setLoading(false);
      }
    };

    getCompanyId();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setCompanyId('');
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          getCompanyId();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { companyId, loading };
};