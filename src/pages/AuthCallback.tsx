import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SEO from "@/components/SEO";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait a bit for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isAuthenticated) {
        toast({
          title: "Welcome!",
          description: "Successfully signed in. Redirecting to dashboard...",
        });
        navigate("/dashboard", { replace: true });
      } else if (!loading) {
        toast({
          title: "Authentication Error", 
          description: "Failed to complete sign in. Please try again.",
          variant: "destructive"
        });
        navigate("/auth", { replace: true });
      }
    };

    if (!loading) {
      handleCallback();
    }
  }, [isAuthenticated, loading, navigate, toast]);

  return (
    <>
      <SEO title="Signing in..." description="Completing authentication" noindex />
      <main className="container max-w-md mx-auto py-20">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
            <LoadingSpinner size="lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Completing Sign In</h1>
            <p className="text-muted-foreground">Please wait while we verify your credentials...</p>
          </div>
        </div>
      </main>
    </>
  );
}