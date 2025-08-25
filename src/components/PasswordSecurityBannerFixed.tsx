import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, Shield } from 'lucide-react';

export function PasswordSecurityBannerFixed() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <div className="flex items-start justify-between">
            <div>
              <strong className="text-red-800 dark:text-red-200">
                Critical Security Alert: Leaked Password Protection Disabled
              </strong>
              <div className="text-red-700 dark:text-red-300 mt-2 space-y-2">
                <p>Your application's password security is compromised because leaked password protection is disabled.</p>
                <div className="text-sm space-y-1">
                  <p><strong>Steps to fix in Supabase Dashboard:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Go to Authentication → Settings</li>
                    <li>Scroll to "Password Security"</li>
                    <li>Enable "Leaked Password Protection"</li>
                    <li>Save the configuration</li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/auth/settings', '_blank')}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900"
              >
                <Shield className="h-3 w-3 mr-1" />
                Fix in Supabase
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection', '_blank')}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Learn More
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}