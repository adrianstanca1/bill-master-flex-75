
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";

export default function EnhancedAuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSecureSignOut = async () => {
    try {
      await supabase.from('security_audit_log').insert({
        action: 'LOGOUT',
        resource_type: 'auth',
        details: { 
          logout_time: new Date().toISOString(),
          user_agent: navigator.userAgent 
        }
      });
    } catch (e) {
      console.warn('Audit log insert failed (non-blocking):', e);
    } finally {
      await supabase.auth.signOut();
    }
  };

  if (!email) {
    return <Link to="/auth" className="text-sm text-muted-foreground hover:underline">Sign in</Link>;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-muted-foreground">{email}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/security">
          <Button variant="secondary" size="sm" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Security
          </Button>
        </Link>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSecureSignOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
