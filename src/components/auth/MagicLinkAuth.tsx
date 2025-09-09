import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MagicLinkAuthProps {
  className?: string;
}

export function MagicLinkAuth({ className }: MagicLinkAuthProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Failed to send magic link",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setSent(true);
        toast({
          title: "Magic link sent! ✨",
          description: "Check your email for a secure sign-in link",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSent(false);
    await handleMagicLink({ preventDefault: () => {} } as any);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Magic Link Sign In</h3>
        <p className="text-sm text-muted-foreground">
          No password needed. We'll send you a secure link to sign in instantly.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="magic-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Magic Link...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Send Magic Link
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-green-700 dark:text-green-400">
              Magic Link Sent! ✨
            </h4>
            <p className="text-sm text-muted-foreground">
              We've sent a secure sign-in link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Click the link in your email to sign in instantly. The link expires in 1 hour.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResend}
            disabled={loading}
            className="mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Magic Link"
            )}
          </Button>
        </div>
      )}
      
      <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <span className="inline-flex items-center gap-1">
          🔒 <strong>Secure & Passwordless</strong> - No passwords to remember or steal
        </span>
      </div>
    </div>
  );
}