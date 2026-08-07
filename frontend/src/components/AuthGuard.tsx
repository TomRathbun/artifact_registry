import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Requires a JWT in localStorage.
 * Token attachment is handled globally by setupAuth.ts.
 * Redirects unauthenticated users to /login, preserving the intended path.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
