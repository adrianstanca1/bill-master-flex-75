import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuthContext } from './AuthProvider';

export function AuthStatus() {
  const { user, loading, isAuthenticated, signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Guest Mode</span>
        <Button asChild size="sm" variant="outline">
          <Link to="/auth">
            <User className="h-3 w-3 mr-1" />
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground hidden sm:inline">
        {user?.email}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-1"
      >
        <LogOut className="h-3 w-3" />
        Sign out
      </Button>
    </div>
  );
}