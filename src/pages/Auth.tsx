import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useOAuthProviders } from "@/hooks/useOAuthProviders";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { PasswordSecurityBannerFixed } from "@/components/PasswordSecurityBannerFixed";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { EnhancedSecurityFeatures } from "@/components/auth/EnhancedSecurityFeatures";
import { AnimatedFormField } from "@/components/auth/AnimatedFormField";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Mail, Loader2, Shield, ArrowLeft, UserPlus, LogIn, KeyRound, Sparkles } from "lucide-react";
import { AuthMethodSelector } from "@/components/auth/AuthMethodSelector";
import { SessionManager } from "@/components/auth/SessionManager";

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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectTo]);

  const handleOAuthProvider = async (provider: 'google' | 'github' | 'apple') => {
    console.log(`Starting OAuth with ${provider}`);
    setLoading(true);
    setFormErrors({});
    
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        console.error('OAuth error:', error);
        toast({
          title: "Sign In Failed",
          description: "Unable to connect with this provider. Please try email/password login instead.",
          variant: "destructive"
        });
      } else {
        console.log('OAuth initiated successfully');
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

  // Clear errors when switching modes
  const handleModeSwitch = (newMode: "signin" | "signup" | "forgot") => {
    setMode(newMode);
    setFormErrors({});
    setPassword("");
    setConfirmPassword("");
    setPasswordStrength(0);
    setIsPasswordValid(false);
  };

  // Handle password strength changes
  const handlePasswordStrengthChange = (strength: number, isValid: boolean) => {
    setPasswordStrength(strength);
    setIsPasswordValid(isValid);
    
    if (formErrors.password && isValid) {
      setFormErrors(prev => {
        const { password, ...rest } = prev;
        return rest;
      });
    }
  };

// Consolidated form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "Email address is required";
    }

    if (mode === "forgot") {
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (mode === "signup") {
      if (!isPasswordValid) {
        errors.password = "Password must meet all security requirements";
      }
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (mode === "signup") {
      if (!firstName?.trim()) {
        errors.firstName = "First name is required";
      }
      
      if (!lastName?.trim()) {
        errors.lastName = "Last name is required";
      }

      if (password && confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }

      if (!acceptTerms) {
        errors.terms = "You must accept the terms and conditions";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(`Submitting auth form in ${mode} mode`);
    
    if (!validateForm()) {
      // Show first validation error
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        console.log('Form validation failed:', firstError);
        toast({
          title: "Validation Error",
          description: firstError,
          variant: "destructive"
        });
      }
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/reset-password`
        });

        if (error) {
          toast({
            title: "Reset Failed",
            description: "Unable to send reset email. Please check your email address and try again.",
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

    setLoading(true);
    try {
      let result;
      
      if (mode === "signup") {
        result = await signUp(email, password, { 
          firstName: firstName.trim(), 
          lastName: lastName.trim() 
        });
        
        if (!result.error) {
          // Show email confirmation and prepare for setup flow
          setShowEmailConfirmation(true);
          
          // If user is immediately confirmed (depends on email confirmation settings)
          if (result.data && !result.data.email_confirmed_at) {
            // User needs to confirm email first
            toast({
              title: "Almost there!",
              description: "Please check your email and click the confirmation link to complete your registration.",
            });
          }
        } else if (result.error.message?.includes("User already registered")) {
          toast({
            title: "Account already exists",
            description: "Please sign in to continue.",
          });
          setMode("signin");
        } else {
          toast({
            title: "Sign up failed",
            description: "Unable to create account. Please check your details and try again.",
            variant: "destructive",
          });
        }
      } else {
        result = await signIn(email, password);
        if (result.error) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please check your credentials and try again.",
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
        
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
              {mode === "signin" && <LogIn className="w-10 h-10 text-primary-foreground" />}
              {mode === "signup" && <UserPlus className="w-10 h-10 text-primary-foreground" />}
              {mode === "forgot" && <KeyRound className="w-10 h-10 text-primary-foreground" />}
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gradient animate-slide-up">
            {mode === "signin" && "Welcome Back"}
            {mode === "signup" && "Join Our Platform"}
            {mode === "forgot" && "Reset Password"}
          </h1>
          <p className="text-muted-foreground text-lg animate-slide-up">
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

        <Tabs defaultValue="enhanced" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Enhanced Auth
            </TabsTrigger>
            <TabsTrigger value="traditional">Traditional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhanced" className="mt-6">
            <AuthMethodSelector 
              mode={mode === "signup" ? "signup" : "signin"}
              onModeChange={(newMode) => handleModeSwitch(newMode)}
            />
          </TabsContent>
          
          <TabsContent value="traditional" className="mt-6">
            <div className="elevated-card p-8 animate-scale-in">
              {mode !== "forgot" && (
                <>
                  {/* Enhanced Social Login */}
                  <SocialLoginButtons
                    onOAuthSignIn={handleOAuthProvider}
                    disabled={loading}
                    enabledProviders={enabledProviders}
                  />

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-4 text-muted-foreground font-medium">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </>
              )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatedFormField
                  id="firstName"
                  type="text"
                  label="First Name"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={setFirstName}
                  required
                  autoComplete="given-name"
                  error={formErrors.firstName}
                />
                <AnimatedFormField
                  id="lastName"
                  type="text"
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={setLastName}
                  required
                  autoComplete="family-name"
                  error={formErrors.lastName}
                />
              </div>
            )}
            
            <AnimatedFormField
              id="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
              icon={<Mail className="h-5 w-5" />}
              error={formErrors.email}
            />
            
            {mode !== "forgot" && (
              <div className="space-y-4">
                <AnimatedFormField
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  showPasswordToggle
                  error={formErrors.password}
                />
                
                {mode === "signup" && password && (
                  <PasswordStrengthIndicator
                    password={password}
                    onStrengthChange={handlePasswordStrengthChange}
                    showRequirements={true}
                  />
                )}
              </div>
            )}

            {mode === "signup" && (
              <AnimatedFormField
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                autoComplete="new-password"
                showPasswordToggle
                error={formErrors.confirmPassword}
              />
            )}

            {/* Terms and Security Features for Signup */}
            {mode === "signup" && (
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className={cn(
                      "mt-1",
                      formErrors.terms && "border-destructive"
                    )}
                  />
                  <div className="space-y-1">
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/terms")}
                        className="text-primary hover:underline font-medium"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/policy")}
                        className="text-primary hover:underline font-medium"
                      >
                        Privacy Policy
                      </button>
                    </label>
                    {formErrors.terms && (
                      <p className="text-sm text-destructive animate-slide-up">
                        {formErrors.terms}
                      </p>
                    )}
                  </div>
                </div>
                
                <EnhancedSecurityFeatures
                  email={email}
                  onSecurityAlert={(alert) => toast({
                    title: "Security Alert",
                    description: alert,
                    variant: "destructive"
                  })}
                 />
               </div>
             )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 font-medium animate-fade-in bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
              disabled={loading || (mode === "signup" && (!isPasswordValid || !acceptTerms))}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "signin" && "Signing In..."}
                  {mode === "signup" && "Creating Account..."}
                  {mode === "forgot" && "Sending Email..."}
                </>
              ) : (
                <>
                  {mode === "signin" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot" && "Send Reset Email"}
                </>
              )}
            </Button>
              </form>

              {/* Navigation Links */}
              <div className="mt-8 text-center space-y-3 animate-fade-in">
                {mode === "signin" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button 
                        onClick={() => handleModeSwitch("signup")}
                        className="text-primary hover:underline font-medium interactive-link"
                      >
                        Create one now
                      </button>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <button 
                        onClick={() => handleModeSwitch("forgot")}
                        className="text-primary hover:underline font-medium interactive-link"
                      >
                        Forgot your password?
                      </button>
                    </p>
                  </>
                )}
                
                {mode === "signup" && (
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      onClick={() => handleModeSwitch("signin")}
                      className="text-primary hover:underline font-medium interactive-link"
                    >
                      Sign in here
                    </button>
                  </p>
                )}
                
                {mode === "forgot" && (
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleModeSwitch("signin")}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors interactive-link"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                    </button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Session Management for authenticated users */}
        {isAuthenticated && (
          <div className="mt-8">
            <SessionManager />
          </div>
        )}
      </main>
    </>
  );
}