import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSetup?: boolean;
}

export function ProtectedRoute({ children, requireSetup = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSetupComplete(true); // Simplified - always consider setup complete
  }, [requireSetup]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireSetup) {
    if (isSetupComplete === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">Validating setup...</p>
          </div>
        </div>
      );
    }

    if (!isSetupComplete) {
      return <Navigate to="/setup" replace />;
    }
  }

  return <>{children}</>;
}
