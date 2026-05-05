import { Navigate, Outlet } from 'react-router-dom';

import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';

export default function GuestGuard() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={APP_DEFAULT_PATH} replace />;
  }

  return <Outlet />;
}
