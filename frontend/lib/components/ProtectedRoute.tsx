import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrg?: boolean;
}

export const ProtectedRoute = ({ children, requireOrg = true }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, currentOrgId, organizations } = useAuth();
  const location = useLocation();
  
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireOrg && organizations.length === 0) {
    return <Navigate to="/onboarding/create-org" replace />;
  }

  if (requireOrg && !currentOrgId && organizations.length > 0) {
    return <Navigate to="/onboarding/select-org" replace />;
  }

  return <>{children}</>;
};
