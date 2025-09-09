import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/AuthProvider";

export default function AuthStatus() {
  const { user, isAuthenticated, signOut, loading } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated) {
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
        {user?.email}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleSignOut}
      >
        Sign out
      </Button>
    </div>
  );
}