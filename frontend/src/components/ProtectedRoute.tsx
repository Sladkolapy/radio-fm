import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks';
import AuthLayout from '@features/auth/ui/AuthLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
}