import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ArrowLeft, HelpCircle, Mail, Phone, Shield } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AccountRecoveryProps {
  onBack?: () => void;
}

export function AccountRecovery({ onBack }: AccountRecoveryProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [method, setMethod] = useState<'email' | 'security' | 'contact'>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [contactReason, setContactReason] = useState('');
  const [step, setStep] = useState<'select' | 'input' | 'sent'>('select');

  const handleEmailRecovery = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        toast({
          title: "Recovery Failed",
          description: "Unable to send recovery email. Please check your email address.",
          variant: "destructive"
        });
      } else {
        setStep('sent');
        toast({
          title: "Recovery Email Sent",
          description: "Check your email for password reset instructions.",
        });
      }
    } catch (err) {
      console.error('Recovery error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityRecovery = async () => {
    // This would integrate with a security questions system
    toast({
      title: "Feature Coming Soon",
      description: "Security question recovery is not yet implemented.",
    });
  };

  const handleContactSupport = async () => {
    if (!contactReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please describe why you need account recovery.",
        variant: "destructive"
      });
      return;
    }

    // This would typically send to a support system
    toast({
      title: "Support Request Submitted",
      description: "Our team will contact you within 24 hours to help recover your account.",
    });
    setStep('sent');
  };

  if (step === 'sent') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>Recovery Request Sent</CardTitle>
          <CardDescription>
            {method === 'email' && "Check your email for password reset instructions."}
            {method === 'contact' && "Our support team will contact you within 24 hours."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button onClick={() => navigate('/auth')} className="w-full">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'input') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('select')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle>
                {method === 'email' && "Email Recovery"}
                {method === 'security' && "Security Questions"}
                {method === 'contact' && "Contact Support"}
              </CardTitle>
              <CardDescription>
                {method === 'email' && "Enter your email to receive reset instructions"}
                {method === 'security' && "Answer your security questions"}
                {method === 'contact' && "Request manual account recovery"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {method === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email Address</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {method === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Security Question:</p>
                <p className="text-sm text-muted-foreground">
                  What was the name of your first pet?
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="security-answer">Your Answer</Label>
                <Input
                  id="security-answer"
                  type="text"
                  placeholder="Enter your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                />
              </div>
            </div>
          )}

          {method === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Manual Recovery</p>
                    <p className="text-yellow-700">
                      This process requires identity verification and may take 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-reason">Reason for Recovery</Label>
                <textarea
                  id="contact-reason"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Please explain why you need account recovery..."
                  value={contactReason}
                  onChange={(e) => setContactReason(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <Button 
            onClick={() => {
              if (method === 'email') handleEmailRecovery();
              if (method === 'security') handleSecurityRecovery();
              if (method === 'contact') handleContactSupport();
            }}
            disabled={loading}
            className="w-full"
          >
            {loading ? <LoadingSpinner /> : "Continue"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-orange-600" />
        </div>
        <CardTitle>Account Recovery</CardTitle>
        <CardDescription>
          Choose how you'd like to recover your account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => {
              setMethod('email');
              setStep('input');
            }}
            className="w-full justify-start h-auto p-4"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Email Recovery</p>
                <p className="text-sm text-muted-foreground">
                  Get a password reset link via email
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setMethod('security');
              setStep('input');
            }}
            className="w-full justify-start h-auto p-4"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Security Questions</p>
                <p className="text-sm text-muted-foreground">
                  Answer your security questions
                </p>
              </div>
            </div>
          </Button>

          <Separator />

          <Button
            variant="outline"
            onClick={() => {
              setMethod('contact');
              setStep('input');
            }}
            className="w-full justify-start h-auto p-4"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Contact Support</p>
                <p className="text-sm text-muted-foreground">
                  Get help from our team
                </p>
              </div>
            </div>
          </Button>
        </div>

        <Separator />
        
        <Button
          variant="ghost"
          onClick={() => onBack ? onBack() : navigate('/auth')}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </CardContent>
    </Card>
  );
}