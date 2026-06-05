import { Navigate, Outlet, useLocation } from 'react-router-dom';

import useAuth from 'hooks/useAuth';

function getLoginPath(pathname) {
  const normalizedPath = String(pathname || '').replace(/^\/free(?=\/|$)/, '');

  if (normalizedPath === '/tenant' || normalizedPath.startsWith('/tenant/')) return '/user/login';
  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) return '/admin/login';

  return '/login';
}

export default function AuthGuard() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={getLoginPath(location.pathname)} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
