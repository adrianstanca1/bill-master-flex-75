import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

export default function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if we have the necessary tokens
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    // Enhanced password validation
    if (password.length < 8) {
      toast({
        title: "Password too weak",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    // Additional security checks
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast({
        title: "Password too weak",
        description: "Password must contain uppercase, lowercase, and number characters.",
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

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Password Reset Error",
          description: error.message,
          variant: "destructive"
        });
        
        // Log failed password reset attempt
        try {
          await supabase.from('security_audit_log').insert({
            action: 'PASSWORD_RESET_FAILED',
            resource_type: 'authentication',
            details: {
              error: error.message,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated."
        });
        
        // Log successful password reset
        try {
          await supabase.from('security_audit_log').insert({
            action: 'PASSWORD_RESET_SUCCESS',
            resource_type: 'authentication',
            details: {
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Reset Password" 
        description="Reset your AS Agents account password" 
        noindex 
      />
      <main className="container max-w-md mx-auto py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <div className="elevated-card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  id="password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password (min. 6 characters)"
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required 
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  id="confirmPassword"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword} 
                  onChange={(e)=>setConfirmPassword(e.target.value)} 
                  required 
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              className="w-full h-12 font-semibold" 
              type="submit" 
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <button 
                className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors" 
                onClick={() => navigate('/auth')}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}