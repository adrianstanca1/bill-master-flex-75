
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield } from 'lucide-react';
import { useSecureValidation } from '@/hooks/useSecureValidation';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function SecurityAlert() {
  const { isValid, violations } = useSecureValidation();
  const navigate = useNavigate();

  const handleSecurityAction = async () => {
    try {
      // If user has no company association, redirect to setup
      if (violations.some(v => v.includes('setup required'))) {
        navigate('/setup');
        return;
      }

      // For other violations, sign out for safety
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Security action failed:', error);
      navigate('/auth');
    }
  };

  if (isValid) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert className="border-red-500 bg-red-50 max-w-4xl mx-auto">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-red-800">Security Issue Detected</strong>
            <div className="text-red-700 mt-1">
              {violations.map((violation, index) => (
                <div key={index} className="text-sm">• {violation}</div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSecurityAction}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Shield className="h-3 w-3 mr-1" />
              Secure Account
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
