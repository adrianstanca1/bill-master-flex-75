import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface SecurityQuickFixProps {
  className?: string;
}

export function SecurityQuickFix({ className }: SecurityQuickFixProps) {
  return (
    <Alert className={`border-red-500 bg-red-50 dark:bg-red-950 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong className="text-red-800 dark:text-red-200">
              Security Alert: Leaked Password Protection Disabled
            </strong>
            <p className="text-red-700 dark:text-red-300 mt-1 text-sm">
              Enable this feature in Supabase to prevent users from using compromised passwords.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/auth/settings', '_blank')}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900 whitespace-nowrap"
          >
            Fix in Supabase
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}