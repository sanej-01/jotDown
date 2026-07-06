import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { FullscreenLoader } from '@/components/ui/Spinner';

/**
 * Route guard (FR-A6 / AUTH-09). While the session is resolving we show a
 * loader (so a valid session isn't briefly bounced to /login). Unauthenticated
 * users are redirected to /login with the originally requested location so they
 * land back there after signing in.
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullscreenLoader />;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
