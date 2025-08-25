import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Mail, RefreshCw } from 'lucide-react';

interface EmailConfirmationBannerProps {
  onResendEmail: () => void;
  isResending: boolean;
}

export function EmailConfirmationBanner({ onResendEmail, isResending }: EmailConfirmationBannerProps) {
  return (
    <Alert className="border-primary/20 bg-primary/5 text-primary mb-6">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>
            Please check your email and click the confirmation link to activate your account.
            <br />
            <small className="text-xs opacity-75">
              Can't find the email? Check your spam folder or click resend below.
            </small>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onResendEmail}
          disabled={isResending}
          className="ml-4 border-primary/20 text-primary hover:bg-primary/10"
        >
          {isResending ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            'Resend Email'
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}