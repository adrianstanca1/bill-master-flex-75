import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagicLinkAuth } from "./MagicLinkAuth";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { 
  Mail, 
  KeyRound, 
  Shield, 
  Sparkles, 
  Fingerprint,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthMethodSelectorProps {
  mode: 'signin' | 'signup';
  className?: string;
  onModeChange?: (mode: 'signin' | 'signup') => void;
}

export function AuthMethodSelector({ 
  mode, 
  className,
  onModeChange 
}: AuthMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'traditional' | 'magic' | 'biometric'>('traditional');

  const authMethods = [
    {
      id: 'traditional' as const,
      name: 'Email & Password',
      description: 'Classic email and password authentication',
      icon: <KeyRound className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      recommended: false
    },
    {
      id: 'magic' as const,
      name: 'Magic Link',
      description: 'Passwordless sign-in via email',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      recommended: true
    },
    {
      id: 'biometric' as const,
      name: 'Biometric',
      description: 'Fingerprint or Face recognition',
      icon: <Fingerprint className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      recommended: false,
      beta: true
    }
  ];

  const handleMethodSelect = (methodId: 'traditional' | 'magic' | 'biometric') => {
    setSelectedMethod(methodId);
  };

  const handleBiometricAuth = async () => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      alert('Biometric authentication is not supported on this device/browser');
      return;
    }

    try {
      // This is a simplified example - in production, you'd need proper WebAuthn implementation
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "ConstructTime Pro" },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        alert('Biometric authentication set up successfully!');
      }
    } catch (error) {
      alert('Biometric authentication failed or cancelled');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Sign-In Method</h2>
        <p className="text-muted-foreground">
          Select how you'd like to authenticate with your account
        </p>
      </div>

      <div className="grid gap-4">
        {authMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg",
              selectedMethod === method.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white",
                `bg-gradient-to-r ${method.color}`
              )}>
                {method.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{method.name}</h3>
                  {method.recommended && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      Recommended
                    </span>
                  )}
                  {method.beta && (
                    <span className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                      Beta
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              
              <div className={cn(
                "w-5 h-5 rounded-full border-2 transition-all",
                selectedMethod === method.id
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}>
                {selectedMethod === method.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {selectedMethod === 'magic' && (
          <MagicLinkAuth />
        )}
        
        {selectedMethod === 'biometric' && (
          <div className="text-center space-y-4 p-6 border rounded-xl">
            <Smartphone className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Biometric Authentication</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use your fingerprint, face, or other biometric data to sign in securely.
              </p>
            </div>
            <Button onClick={handleBiometricAuth} className="w-full h-12">
              <Fingerprint className="w-4 h-4 mr-2" />
              Set Up Biometric Sign-In
            </Button>
            <p className="text-xs text-muted-foreground">
              Requires compatible device and browser support
            </p>
          </div>
        )}
      </div>

      {mode === 'signup' && selectedMethod !== 'biometric' && (
        <div className="border-t pt-6">
          <TwoFactorSetup 
            onSetupComplete={() => console.log('2FA setup completed')}
          />
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>
          {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
        </span>
        <button 
          onClick={() => onModeChange?.(mode === 'signin' ? 'signup' : 'signin')}
          className="text-primary hover:underline font-medium"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}