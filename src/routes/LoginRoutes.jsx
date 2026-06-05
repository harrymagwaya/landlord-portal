import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import GuestGuard from './GuestGuard';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));
const TenantLoginPage = Loadable(lazy(() => import('pages/auth/TenantLogin')));
const AdminLoginPage = Loadable(lazy(() => import('pages/auth/AdminLogin')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  element: <GuestGuard />,
  children: [
    {
      path: '/',
      children: [
        {
          path: '/login',
          element: <LoginPage />
        },
        {
          path: '/register',
          element: <RegisterPage />
        },
        {
          path: '/user/login',
          element: <TenantLoginPage />
        },
        {
          path: '/tenant/login',
          element: <TenantLoginPage />
        },
        {
          path: '/admin/login',
          element: <AdminLoginPage />
        }
      ]
    }
  ]
};

export default LoginRoutes;
