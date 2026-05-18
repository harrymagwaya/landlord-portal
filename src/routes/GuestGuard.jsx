import { Navigate, Outlet } from 'react-router-dom';

import useAuth from 'hooks/useAuth';

export default function GuestGuard() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/auth/loading" replace />;
  }

  return <Outlet />;
}
