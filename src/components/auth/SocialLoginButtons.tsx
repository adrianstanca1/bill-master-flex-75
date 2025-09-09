import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Github, Apple } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLoginButtonsProps {
  onOAuthSignIn: (provider: 'google' | 'github' | 'apple') => Promise<void>;
  disabled?: boolean;
  enabledProviders: {
    google: boolean;
    github: boolean;
    apple: boolean;
  };
}

export function SocialLoginButtons({ 
  onOAuthSignIn, 
  disabled = false, 
  enabledProviders 
}: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthClick = async (provider: 'google' | 'github' | 'apple') => {
    setLoadingProvider(provider);
    try {
      await onOAuthSignIn(provider);
    } finally {
      setLoadingProvider(null);
    }
  };

  const providers = [
    {
      id: 'google' as const,
      name: 'Google',
      enabled: enabledProviders.google,
      className: "hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/30",
      icon: (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )
    },
    {
      id: 'github' as const,
      name: 'GitHub',
      enabled: enabledProviders.github,
      className: "hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800/30",
      icon: <Github className="w-5 h-5 mr-2" />
    },
    {
      id: 'apple' as const,
      name: 'Apple',
      enabled: enabledProviders.apple,
      className: "hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800/30",
      icon: <Apple className="w-5 h-5 mr-2" />
    }
  ];

  const enabledCount = providers.filter(p => p.enabled).length;

  if (enabledCount === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">
          Social login providers not configured
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {providers
        .filter(provider => provider.enabled)
        .map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            size="lg"
            disabled={disabled || loadingProvider !== null}
            onClick={() => handleOAuthClick(provider.id)}
            className={cn(
              "w-full h-12 text-sm font-medium transition-all duration-200",
              "border-2 hover:shadow-md",
              provider.className,
              loadingProvider === provider.id && "cursor-not-allowed opacity-80"
            )}
          >
            {loadingProvider === provider.id ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                {provider.icon}
                Continue with {provider.name}
              </>
            )}
          </Button>
        ))
      }
      
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>🔒 Your data is encrypted and secure</p>
        <p>We'll never post anything without your permission</p>
      </div>
    </div>
  );
}