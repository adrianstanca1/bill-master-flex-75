
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useLocation } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { SecurityAlert } from "./SecurityAlert";

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setLoading(false);
      
      // Log authentication events for security monitoring
      if (session && _event === 'SIGNED_IN') {
        try {
          await supabase.from('security_audit_log').insert({
            action: 'SIGN_IN',
            resource_type: 'auth',
            details: { 
              sign_in_time: new Date().toISOString(),
              user_agent: navigator.userAgent,
              location: window.location.pathname
            }
          });
        } catch (error) {
          console.warn('Failed to log authentication event:', error);
        }
      }
    });

    // THEN check for existing session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Session error:', error);
        }
        setSession(session);
      })
      .catch((err) => {
        console.error('Session check failed:', err);
        setSession(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <>
      <SecurityAlert />
      {children}
    </>
  );
}
