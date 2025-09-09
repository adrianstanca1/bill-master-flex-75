import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface EmailVerificationFlowProps {
  email?: string;
  onVerificationComplete?: () => void;
}

export function EmailVerificationFlow({ email, onVerificationComplete }: EmailVerificationFlowProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle email verification on component mount
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const errorDescription = searchParams.get('error_description');

      if (errorDescription) {
        setStatus('error');
        toast({
          title: "Verification Failed",
          description: decodeURIComponent(errorDescription),
          variant: "destructive"
        });
        return;
      }

      if (accessToken && refreshToken && type === 'signup') {
        setStatus('verifying');
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setStatus('error');
            toast({
              title: "Verification Failed",
              description: error.message,
              variant: "destructive"
            });
          } else {
            setStatus('success');
            toast({
              title: "Email Verified!",
              description: "Your account has been successfully verified.",
            });
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Call completion handler
            onVerificationComplete?.();
            
            // Redirect to setup after a brief delay
            setTimeout(() => {
              navigate('/setup', { replace: true });
            }, 2000);
          }
        } catch (err) {
          setStatus('error');
          console.error('Email verification error:', err);
        }
      }
    };

    if (searchParams.has('access_token') || searchParams.has('error_description')) {
      handleEmailConfirmation();
    }
  }, [searchParams, navigate, toast, onVerificationComplete]);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide an email address to resend verification.",
        variant: "destructive"
      });
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Resend Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email Sent",
          description: "A new verification email has been sent.",
        });
        setCountdown(60); // 60 second cooldown
      }
    } catch (err) {
      console.error('Resend error:', err);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <LoadingSpinner />
          <p className="mt-4 text-center text-muted-foreground">
            Verifying your email address...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Email Verified!
          </h3>
          <p className="text-center text-green-700 mb-4">
            Your account has been successfully verified. You'll be redirected to complete your setup.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Verification Failed
          </h3>
          <p className="text-center text-red-700 mb-4">
            There was an issue verifying your email. Please try again or contact support.
          </p>
          <Button onClick={() => navigate('/auth')} variant="outline">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Click the link in the email to verify your account.</p>
          <p>If you don't see the email, check your spam folder.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={resending || countdown > 0}
            className="w-full"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Email
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}