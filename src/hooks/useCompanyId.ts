
import { useState, useEffect } from 'react';

const isValidUUID = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    // Try to get company ID from localStorage settings
    try {
      const settings = JSON.parse(localStorage.getItem('as-settings') || '{}');
      const candidate = String(settings.companyId || '').trim();
      if (candidate && isValidUUID(candidate)) {
        setCompanyId(candidate);
        return;
      }
    } catch (error) {
      console.error('Error parsing settings:', error);
    }

    // If no valid company ID found, leave empty so data queries are disabled
    setCompanyId('');
  }, []);

  return companyId;
};
