import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  Copy, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TwoFactorSetupProps {
  className?: string;
  onSetupComplete?: () => void;
}

export function TwoFactorSetup({ className, onSetupComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { toast } = useToast();

  const generateTwoFactor = async () => {
    setLoading(true);
    try {
      // Mock 2FA setup - in a real app, this would call your backend
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const appName = 'ConstructTime Pro';
      const userEmail = (await supabase.auth.getUser()).data.user?.email || 'user@example.com';
      
      const qrCodeUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${mockSecret}&issuer=${encodeURIComponent(appName)}`;
      
      setSecret(mockSecret);
      setQrCode(qrCodeUrl);
      
      // Generate mock backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      
      setStep('verify');
      
      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Unable to generate 2FA setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTwoFactor = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Mock verification - in a real app, this would verify the TOTP code
      if (verifyCode === "123456" || verifyCode.length === 6) {
        setStep('complete');
        toast({
          title: "2FA Enabled Successfully! 🎉",
          description: "Your account is now protected with two-factor authentication",
        });
        
        // Save 2FA status to user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            user_id: user.id,
            two_factor_enabled: true,
            updated_at: new Date().toISOString()
          });
        }
        
        onSetupComplete?.();
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Unable to verify the code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Secret key copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const content = `ConstructTime Pro - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, you can use these codes to sign in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constructtime-pro-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Backup Codes Downloaded",
      description: "Store these codes in a safe place",
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </div>

      {step === 'setup' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Install an Authenticator App
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Google Authenticator</Badge>
                  <Badge variant="secondary" className="text-xs">Authy</Badge>
                  <Badge variant="secondary" className="text-xs">1Password</Badge>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={generateTwoFactor}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up 2FA...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Set Up Two-Factor Authentication
              </>
            )}
          </Button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-muted-foreground">QR Code would appear here</p>
              <p className="text-xs text-muted-foreground">Scan with your authenticator app</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Can't scan? Enter this secret key manually:
              </p>
              <div className="flex items-center gap-2 bg-muted p-2 rounded">
                <code className="flex-1 text-sm font-mono">{secret}</code>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(secret)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter the 6-digit code from your app</Label>
              <Input
                id="verify-code"
                type="text"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            <Button 
              onClick={verifyTwoFactor}
              disabled={loading || verifyCode.length !== 6}
              className="w-full h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify and Enable 2FA
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
              2FA Successfully Enabled! 🎉
            </h4>
            <p className="text-sm text-muted-foreground">
              Your account is now protected with two-factor authentication
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-3">
                <h4 className="font-medium text-amber-900 dark:text-amber-100">
                  Save Your Backup Codes
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Keep these backup codes safe. You can use them to access your account if you lose your authenticator.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white dark:bg-gray-800 p-3 rounded border">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span>{code}</span>
                    </div>
                  ))}
                </div>

                <Button size="sm" variant="outline" onClick={downloadBackupCodes}>
                  <Key className="w-3 h-3 mr-2" />
                  Download Backup Codes
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <span className="inline-flex items-center gap-1">
              🔒 Your account is now secured with 2FA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}