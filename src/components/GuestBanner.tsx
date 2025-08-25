
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function GuestBanner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated) return null;

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          You're using the app as a guest. Sign up to save your data and access all features.
        </span>
        <Button asChild size="sm" className="ml-4">
          <Link to="/auth">Sign Up</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
