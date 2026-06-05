import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';
import TenantLayout from 'layout/Tenant';
import RoleGuard from './RoleGuard';
import { USER_ROLES } from 'utils/roles';

const TenantHomePage = Loadable(lazy(() => import('pages/tenant/home')));
const TenantPaymentsPage = Loadable(lazy(() => import('pages/tenant/payments')));
const TenantUnitPage = Loadable(lazy(() => import('pages/tenant/unit')));
const TenantProfilePage = Loadable(lazy(() => import('pages/tenant/profile')));
const TenantResetPasswordPage = Loadable(lazy(() => import('pages/tenant/resetPassword')));

const TenantRoutes = {
  path: 'tenant',
  element: <RoleGuard allowedRoles={[USER_ROLES.TENANT]} />,
  children: [
    {
      path: '',
      element: <TenantLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="home" replace />
        },
        {
          path: 'home',
          element: <TenantHomePage />
        },
        {
          path: 'score',
          element: <Navigate to="/tenant/home" replace />
        },
        {
          path: 'payments',
          element: <TenantPaymentsPage />
        },
        {
          path: 'unit',
          element: <TenantUnitPage />
        },
        {
          path: 'profile',
          element: <TenantProfilePage />
        },
        {
          path: 'reset-password',
          element: <TenantResetPasswordPage />
        }
      ]
    }
  ]
};

export default TenantRoutes;
