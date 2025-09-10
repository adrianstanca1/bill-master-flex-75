import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedFormField } from "./AnimatedFormField";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useOAuthProviders } from "@/hooks/useOAuthProviders";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Fingerprint, 
  Lock, 
  UserCheck, 
  Mail, 
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface EnhancedAuthFlowProps {
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export function EnhancedAuthFlow({ mode, onModeChange }: EnhancedAuthFlowProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithOAuth, loading: authLoading } = useAuthContext();
  const { enabledProviders } = useOAuthProviders();

  // Form state
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

  // Security features state
  const [securityLevel, setSecurityLevel] = useState<"basic" | "enhanced" | "enterprise">("basic");
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);

  useEffect(() => {
    const totalSteps = mode === "signup" ? 3 : 2;
    setProgress((step / totalSteps) * 100);
  }, [step, mode]);

  const handleOAuthProvider = async (provider: 'google' | 'github' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        toast({
          title: "Authentication Failed",
          description: "Unable to connect with this provider. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep: number) => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!email.trim()) {
        errors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address";
      }

      if (mode === "signup" && (!firstName.trim() || !lastName.trim())) {
        if (!firstName.trim()) errors.firstName = "First name is required";
        if (!lastName.trim()) errors.lastName = "Last name is required";
      }
    }

    if (currentStep === 2 && mode === "signup") {
      if (!password) {
        errors.password = "Password is required";
      } else if (!isPasswordValid) {
        errors.password = "Password must meet all security requirements";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setFormErrors({});
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      let result;
      
      if (mode === "signup") {
        result = await signUp(email, password, { 
          firstName: firstName.trim(), 
          lastName: lastName.trim(),
          securityLevel,
          biometricEnabled: enableBiometric,
          twoFactorEnabled: enable2FA
        });
        
        if (!result.error) {
          toast({
            title: "Account Created Successfully! 🎉",
            description: "Please check your email to verify your account.",
          });
          // Reset form and show success state
          setStep(1);
          setEmail("");
          setPassword("");
          setFirstName("");
          setLastName("");
        } else {
          toast({
            title: "Registration Failed",
            description: result.error.message || "Please check your details and try again.",
            variant: "destructive",
          });
        }
      } else {
        result = await signIn(email, password);
        if (result.error) {
          toast({
            title: "Sign In Failed",
            description: "Invalid credentials. Please check your email and password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back! 👋",
            description: "You have been successfully signed in.",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold">
              {mode === "signup" ? "Create Your Account" : "Welcome Back"}
            </h3>
            <p className="text-muted-foreground">
              {mode === "signup" 
                ? "Let's start with your basic information" 
                : "Sign in to access your dashboard"
              }
            </p>
          </div>

          {/* Enhanced Social Login */}
          <SocialLoginButtons
            onOAuthSignIn={handleOAuthProvider}
            disabled={loading}
            enabledProviders={enabledProviders}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <AnimatedFormField
                  id="firstName"
                  type="text"
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChange={setFirstName}
                  required
                  error={formErrors.firstName}
                />
                <AnimatedFormField
                  id="lastName"
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={setLastName}
                  required
                  error={formErrors.lastName}
                />
              </div>
            )}
            
            <AnimatedFormField
              id="email"
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              value={email}
              onChange={setEmail}
              required
              icon={<Mail className="h-5 w-5" />}
              error={formErrors.email}
            />

            {mode === "signin" && (
              <AnimatedFormField
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                required
                showPasswordToggle
                icon={<Lock className="h-5 w-5" />}
                error={formErrors.password}
              />
            )}
          </div>

          <Button
            type="button"
            onClick={mode === "signin" ? handleSubmit : handleNextStep}
            disabled={loading || authLoading}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === "signin" ? "Signing In..." : "Processing..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {mode === "signin" ? "Sign In" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </div>
      );
    }

    if (step === 2 && mode === "signup") {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold">Secure Your Account</h3>
            <p className="text-muted-foreground">
              Create a strong password to protect your account
            </p>
          </div>

          <div className="space-y-4">
            <AnimatedFormField
              id="password"
              type="password"
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChange={setPassword}
              required
              showPasswordToggle
              icon={<KeyRound className="h-5 w-5" />}
              error={formErrors.password}
            />
            
            {password && (
              <PasswordStrengthIndicator
                password={password}
                onStrengthChange={(strength, isValid) => {
                  setPasswordStrength(strength);
                  setIsPasswordValid(isValid);
                }}
                showRequirements={true}
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isPasswordValid || loading}
              className="flex-1"
            >
              <div className="flex items-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>
          </div>
        </div>
      );
    }

    if (step === 3 && mode === "signup") {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold">Choose Security Level</h3>
            <p className="text-muted-foreground">
              Select your preferred security settings
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                level: "basic" as const,
                title: "Basic Security",
                description: "Standard email and password protection",
                icon: <Lock className="w-5 h-5" />,
                badge: "Default"
              },
              {
                level: "enhanced" as const,
                title: "Enhanced Security",
                description: "Additional security monitoring and alerts",
                icon: <Shield className="w-5 h-5" />,
                badge: "Recommended"
              },
              {
                level: "enterprise" as const,
                title: "Enterprise Security",
                description: "Maximum security with advanced features",
                icon: <Fingerprint className="w-5 h-5" />,
                badge: "Maximum"
              }
            ].map((option) => (
              <Card
                key={option.level}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  securityLevel === option.level && "ring-2 ring-primary border-primary"
                )}
                onClick={() => setSecurityLevel(option.level)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {option.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{option.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {option.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {securityLevel === option.level && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create Account
                  <UserCheck className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-md mx-auto elevated-card">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {mode === "signup" ? "Join Our Platform" : "Welcome Back"}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Step {step} of {mode === "signup" ? "3" : "1"}
          </Badge>
        </div>
        {mode === "signup" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStep()}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          </span>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => onModeChange(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}