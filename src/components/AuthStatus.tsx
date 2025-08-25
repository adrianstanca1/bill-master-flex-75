
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .finally(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return (
      <Link 
        to="/auth" 
        className="text-sm text-muted-foreground hover:underline transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground hidden sm:inline">
        {user.email}
      </span>
      <button
        className="button-secondary py-1 px-2"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </div>
  );
}
