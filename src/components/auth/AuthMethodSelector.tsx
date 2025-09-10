import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnhancedSecurityFeatures } from "./EnhancedSecurityFeatures";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { EnhancedAuthFlow } from "./EnhancedAuthFlow";
import { SecurityDashboard } from "./SecurityDashboard";
import { useOAuthProviders } from "@/hooks/useOAuthProviders";
import { useAuthContext } from "./AuthProvider";
import { Sparkles, Shield, Zap, Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthMethodSelectorProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export function AuthMethodSelector({ 
  mode, 
  onModeChange 
}: AuthMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<"enhanced" | "social" | "security" | "dashboard">("enhanced");
  const { enabledProviders } = useOAuthProviders();
  const { isAuthenticated } = useAuthContext();

  const methods = [
    {
      id: "enhanced" as const,
      title: "Enhanced Authentication",
      description: "Modern, secure login with advanced features",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "Recommended",
      features: ["Smart Security", "Biometric Support", "Progressive Setup"]
    },
    {
      id: "social" as const,
      title: "Social Login",
      description: "Quick sign-in with your preferred provider",
      icon: <Zap className="w-5 h-5" />,
      badge: "Fast",
      features: ["One-Click Login", "Secure OAuth", "Auto Profile Setup"]
    },
    {
      id: "security" as const,
      title: "Security Features",
      description: "Advanced security and monitoring tools",
      icon: <Shield className="w-5 h-5" />,
      badge: "Enterprise",
      features: ["Multi-Factor Auth", "Device Management", "Activity Monitoring"]
    },
    {
      id: "dashboard" as const,
      title: "Security Dashboard",
      description: "Monitor and manage your account security",
      icon: <Settings className="w-5 h-5" />,
      badge: "Manage",
      features: ["Security Score", "Activity Log", "Device Control"]
    }
  ];

  const renderMethodContent = () => {
    switch (selectedMethod) {
      case "enhanced":
        return (
          <div className="mt-6">
            <EnhancedAuthFlow 
              mode={mode}
              onModeChange={onModeChange}
            />
          </div>
        );
      
      case "social":
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Social Authentication
              </CardTitle>
              <CardDescription>
                Sign in quickly and securely with your preferred social provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialLoginButtons
                onOAuthSignIn={async (provider) => {
                  console.log(`Social login with ${provider}`);
                }}
                disabled={false}
                enabledProviders={enabledProviders}
              />
            </CardContent>
          </Card>
        );
      
      case "security":
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Enhanced Security Features
              </CardTitle>
              <CardDescription>
                Advanced security options for enterprise-grade protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedSecurityFeatures />
            </CardContent>
          </Card>
        );

      case "dashboard":
        return (
          <div className="mt-6">
            {isAuthenticated ? (
              <SecurityDashboard />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Security Dashboard
                  </CardTitle>
                  <CardDescription>
                    Sign in to access your security dashboard and manage account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Authentication required to access security features
                  </p>
                  <Button onClick={() => setSelectedMethod("enhanced")}>
                    Sign In to Continue
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2 animate-slide-up">
        <h2 className="text-3xl font-bold text-gradient">
          Choose Your Authentication Method
        </h2>
        <p className="text-lg text-muted-foreground">
          Select the authentication approach that works best for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {methods.map((method, index) => (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover-lift animate-scale-in",
              selectedMethod === method.id && "ring-2 ring-primary border-primary shadow-glow",
              "hover:border-primary/50"
            )}
            onClick={() => setSelectedMethod(method.id)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary mx-auto mb-3 flex items-center justify-center">
                <div className="text-primary-foreground">
                  {method.icon}
                </div>
              </div>
              <CardTitle className="text-base flex items-center justify-center gap-2">
                {method.title}
                <Badge variant={selectedMethod === method.id ? "default" : "secondary"} className="text-xs">
                  {method.badge}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                {method.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {method.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {renderMethodContent()}
    </div>
  );
}