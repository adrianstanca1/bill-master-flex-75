import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useOAuthProviders } from "@/hooks/useOAuthProviders";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { PasswordSecurityBannerFixed } from "@/components/PasswordSecurityBannerFixed";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Loader2, Shield, Github, Apple } from "lucide-react";

export default function Auth({ defaultMode = "signin" }: { defaultMode?: "signin" | "signup" | "forgot" }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = (location.state?.from?.pathname as string) || "/dashboard";
  const { isAuthenticated, signIn, signUp, signInWithOAuth, loading: authLoading } = useAuthContext();
  const { enabledProviders, loading: providersLoading } = useOAuthProviders();

  const [mode, setMode] = useState<"signin"|"signup"|"forgot">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectTo]);

  // Enhanced OAuth handler with proper error handling
  const handleOAuthProvider = async (provider: 'google' | 'github' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        console.error('OAuth error:', error);
        toast({
          title: "OAuth Error",
          description: error.message || "Failed to sign in with OAuth provider. Please try email/password login.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('OAuth error:', err);
      toast({
        title: "OAuth Error",
        description: "An unexpected error occurred during OAuth sign in. Please try email/password login.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({ 
        title: "Email required", 
        description: "Please enter your email address.", 
        variant: "destructive" 
      });
      return;
    }

    // Enhanced password validation for signup
    if (mode === 'signup') {
      if (!password) {
        toast({
          title: "Password required",
          description: "Please enter a password.",
          variant: "destructive"
        });
        return;
      }

      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
      if (password.length < 12 || !passwordPattern.test(password)) {
        toast({
          title: "Password Requirements",
          description: "Password must be at least 12 characters with uppercase, lowercase, number, and special character (@$!%*?&)",
          variant: "destructive"
        });
        return;
      }

      if (!firstName?.trim() || !lastName?.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your first and last name.",
          variant: "destructive"
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
          variant: "destructive"
        });
        return;
      }

      if (!acceptTerms) {
        toast({
          title: "Terms required",
          description: "Please accept the terms and conditions.",
          variant: "destructive"
        });
        return;
      }
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/reset-password`
        });

        if (error) {
          toast({
            title: "Reset Password Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Reset Email Sent",
            description: "Please check your email for password reset instructions."
          });
          setMode("signin");
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      toast({ 
        title: "Password required", 
        description: "Please enter your password.", 
        variant: "destructive" 
      });
      return;
    }

    if (password.length < 6) {
      toast({ 
        title: "Password too short", 
        description: "Password must be at least 6 characters long.", 
        variant: "destructive" 
      });
      return;
    }

    if (mode === "signup") {
      if (!firstName.trim() || !lastName.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your first and last name.",
          variant: "destructive"
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
          variant: "destructive"
        });
        return;
      }

      if (!acceptTerms) {
        toast({
          title: "Terms required",
          description: "Please accept the terms and conditions.",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    try {
      let result;
      
      if (mode === "signup") {
        result = await signUp(email, password, { 
          firstName: firstName.trim(), 
          lastName: lastName.trim() 
        });
        
        if (!result.error) {
          setShowEmailConfirmation(true);
        } else if (result.error.message.includes("User already registered")) {
          toast({
            title: "Account already exists",
            description: "Please sign in to continue.",
          });
          setMode("signin");
        } else {
          toast({
            title: "Sign up failed",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } else {
        result = await signIn(email, password);
        if (result.error) {
          toast({
            title: "Sign in failed",
            description: result.error.message,
            variant: "destructive",
          });
        }
      }
      
    } catch (err: any) {
      console.error("Auth error:", err);
      toast({ 
        title: "Authentication error", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to resend confirmation.",
        variant: "destructive"
      });
      return;
    }

    setIsResendingEmail(true);
    try {
      const result = await signUp(email, password, { 
        firstName: firstName.trim(), 
        lastName: lastName.trim() 
      });
      
      if (!result.error) {
        toast({
          title: "Email sent",
          description: "Check your inbox for the confirmation link.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsResendingEmail(false);
    }
  }

  return (
    <>
      <main className="container max-w-md mx-auto py-10">
        <SEO 
          title={mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"} 
          description="Secure authentication for your construction dashboard" 
          noindex 
        />
        
        <PasswordSecurityBannerFixed />
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-gradient">
            {mode === "signin" && "Welcome Back"}
            {mode === "signup" && "Join Our Platform"}
            {mode === "forgot" && "Reset Password"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {mode === "signin" && "Secure access to your business dashboard"}
            {mode === "signup" && "Create your secure account in seconds"}
            {mode === "forgot" && "We'll send you reset instructions"}
          </p>
        </div>

        {showEmailConfirmation && mode === "signup" && (
          <EmailConfirmationBanner 
            onResendEmail={handleResendEmail}
            isResending={isResendingEmail}
          />
        )}

        <div className="elevated-card p-8">
          {mode !== "forgot" && (
            <>
              {/* OAuth Providers */}
              <div className="space-y-3 mb-6">
                {enabledProviders.google && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-sm font-medium hover:bg-muted/50 transition-colors"
                    onClick={() => handleOAuthProvider('google')}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continue with Google
                  </Button>
                )}

                {enabledProviders.github && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-sm font-medium hover:bg-muted/50 transition-colors"
                    onClick={() => handleOAuthProvider('github')}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Github className="w-5 h-5 mr-2" />
                    )}
                    Continue with GitHub
                  </Button>
                )}

                {enabledProviders.apple && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-sm font-medium hover:bg-muted/50 transition-colors"
                    onClick={() => handleOAuthProvider('apple')}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Apple className="w-5 h-5 mr-2" />
                    )}
                    Continue with iCloud
                  </Button>
                )}

                {!enabledProviders.google &&
                 !enabledProviders.github &&
                 !enabledProviders.apple && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">OAuth providers not configured</p>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {mode === "signup" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                    First Name *
                  </label>
                  <input 
                    id="firstName"
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    type="text" 
                    placeholder="First name"
                    value={firstName} 
                    onChange={(e)=>setFirstName(e.target.value)} 
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                    Last Name *
                  </label>
                  <input 
                    id="lastName"
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    type="text" 
                    placeholder="Last name"
                    value={lastName} 
                    onChange={(e)=>setLastName(e.target.value)} 
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                  id="email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            
            {mode !== "forgot" && (
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password *
                </label>
                <div className="relative">
                  <input 
                    id="password"
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                    value={password} 
                    onChange={(e)=>setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input 
                    id="confirmPassword"
                    className="w-full px-4 py-3 pr-10 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword} 
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/policy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {mode === "signin" && "Sign In"}
              {mode === "signup" && "Create Account"}
              {mode === "forgot" && "Send Reset Email"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === "signin" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Forgot your password?{" "}
                  <button 
                    onClick={() => setMode("forgot")}
                    className="text-primary hover:underline font-medium"
                  >
                    Reset it
                  </button>
                </p>
              </>
            )}
            
            {mode === "signup" && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button 
                  onClick={() => setMode("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            
            {mode === "forgot" && (
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <button 
                  onClick={() => setMode("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}