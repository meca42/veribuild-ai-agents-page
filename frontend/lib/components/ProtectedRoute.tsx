import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { USE_MOCK_API } from '../env';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrg?: boolean;
}

export const ProtectedRoute = ({ children, requireOrg = true }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, currentOrgId, organizations } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute]', { 
    isLoading, 
    isAuthenticated, 
    USE_MOCK_API,
    requireOrg, 
    currentOrgId, 
    orgsCount: organizations.length,
    path: location.pathname 
  });

  if (isLoading) {
    console.log('[ProtectedRoute] Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (USE_MOCK_API) {
    console.log('[ProtectedRoute] Mock mode - allowing access');
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated - redirecting to login');
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireOrg && organizations.length === 0) {
    console.log('[ProtectedRoute] No orgs - redirecting to create org');
    return <Navigate to="/onboarding/create-org" replace />;
  }

  if (requireOrg && !currentOrgId && organizations.length > 0) {
    console.log('[ProtectedRoute] Has orgs but none selected - redirecting to select org');
    return <Navigate to="/onboarding/select-org" replace />;
  }

  console.log('[ProtectedRoute] All checks passed - rendering children');
  return <>{children}</>;
};
