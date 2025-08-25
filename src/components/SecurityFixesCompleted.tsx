import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';

export function SecurityFixesCompleted() {
  return (
    <Alert className="border-green-500 bg-green-50 dark:bg-green-950 max-w-4xl mx-auto mb-6 shadow-lg">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <strong className="text-green-800 dark:text-green-200 text-lg">✅ Security Fixes Implemented</strong>
            <div className="text-green-700 dark:text-green-300 mt-2 font-medium">
              Critical security improvements have been successfully implemented:
            </div>
          </div>
          
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-md border border-green-200 dark:border-green-700">
            <strong className="text-green-800 dark:text-green-200 block mb-2">Completed Security Enhancements:</strong>
            <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 ml-4 list-disc">
              <li>✅ Enhanced password validation (12+ chars, complexity requirements)</li>
              <li>✅ Input sanitization and XSS protection implemented</li>
              <li>✅ Database RLS policies hardened</li>
              <li>✅ Authentication flow security enhanced</li>
              <li>✅ Password strength indicator added</li>
              <li>✅ Brute force protection improved</li>
            </ul>
          </div>
          
          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md border border-yellow-200 dark:border-yellow-700">
            <strong className="text-yellow-800 dark:text-yellow-200 block mb-2">Remaining Actions Required:</strong>
            <ol className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 ml-4 list-decimal">
              <li>Enable leaked password protection in Supabase Dashboard</li>
              <li>Review OTP expiry settings in Authentication settings</li>
              <li>Test authentication flows with new security measures</li>
            </ol>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://supabase.com/dashboard/project/zwxyoeqsbntsogvgwily/settings/auth', '_blank')}
              className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Configure in Supabase
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}