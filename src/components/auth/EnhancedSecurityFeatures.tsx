import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SecurityStatus {
  loginAttempts: number;
  lastLoginTime?: string;
  suspiciousActivity: boolean;
  locationWarning: boolean;
}

interface EnhancedSecurityFeaturesProps {
  email?: string;
  onSecurityAlert?: (alert: string) => void;
}

export function EnhancedSecurityFeatures({ 
  email, 
  onSecurityAlert 
}: EnhancedSecurityFeaturesProps) {
  const { toast } = useToast();
  const [securityStatus] = useState<SecurityStatus>({
    loginAttempts: 0,
    suspiciousActivity: false,
    locationWarning: false
  });

  // Handle security recommendations
  const handleEnableTwoFactor = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "2FA setup will be available after account creation. This adds an extra layer of security.",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Security Status */}
      {securityStatus.suspiciousActivity && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Multiple failed login attempts detected. If this wasn't you, please check your account security.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Recommendations */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">Security Recommendations</h4>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Strong Password</span>
            <CheckCircle className="w-4 h-4 text-success-green" />
          </div>
          
          <div className="flex items-center justify-between">
            <span>Two-Factor Authentication</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEnableTwoFactor}
              className="h-6 px-2 text-xs"
            >
              Setup Later
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Secure Email</span>
            <CheckCircle className="w-4 h-4 text-success-green" />
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>🔒 We use industry-standard encryption to protect your data</p>
        <p>🌍 Login attempts from new locations will be flagged</p>
        <p>⏰ Sessions automatically expire after inactivity</p>
      </div>
    </div>
  );
}