import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink } from 'lucide-react';

export function PasswordSecurityBanner() {
  return (
    <Alert className="border-red-500 bg-red-50 max-w-4xl mx-auto mb-6 shadow-lg">
      <Shield className="h-5 w-5 text-red-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <strong className="text-red-800 text-lg">⚠️ CRITICAL SECURITY ACTION REQUIRED</strong>
            <div className="text-red-700 mt-2 font-medium">
              Leaked Password Protection is currently DISABLED. This leaves your organization vulnerable to compromised passwords.
            </div>
          </div>
          
          <div className="bg-red-100 p-3 rounded-md border border-red-200">
            <strong className="text-red-800 block mb-2">Immediate Action Required:</strong>
            <ol className="text-red-700 text-sm space-y-1 ml-4 list-decimal">
              <li>Go to Supabase Dashboard → Authentication → Settings</li>
              <li>Find "Password Security" section</li>
              <li>Enable "Leaked Password Protection" toggle</li>
              <li>Save changes</li>
            </ol>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => window.open('https://supabase.com/dashboard/project/tjgbyygllssqsywxpxqe/settings/auth', '_blank')}
              className="bg-red-600 hover:bg-red-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Fix Now in Supabase
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection', '_blank')}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Learn More
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}