import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from './AuthGuard';
import RoleGuard from './RoleGuard';
import RoleRedirect from './RoleRedirect';
import { USER_ROLES } from 'utils/roles';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const LoanReviewPage = Loadable(lazy(() => import('pages/loans/review')));
const AuthLoadingPage = Loadable(lazy(() => import('pages/auth/AuthLoading')));
const TenantsPage = Loadable(lazy(() => import('pages/users/tenants')));
const LandlordsPage = Loadable(lazy(() => import('pages/users/landlords')));
const ManageUsersPage = Loadable(lazy(() => import('pages/users/manage')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <AuthGuard />,
  children: [
    {
      path: 'auth/loading',
      element: <AuthLoadingPage />
    },
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: '/',
          element: <RoleRedirect />
        },
        {
          path: 'dashboard',
          children: [
            {
              path: 'default',
              element: <DashboardDefault />
            }
          ]
        },
        {
          path: 'typography',
          element: <Typography />
        },
        {
          path: 'color',
          element: <Color />
        },
        {
          path: 'shadow',
          element: <Shadow />
        },
        {
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'loans',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LOAN_ADMIN]} />,
          children: [
            {
              path: 'review',
              element: <LoanReviewPage />
            }
          ]
        },
        {
          path: 'users',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN]} />,
          children: [
            {
              path: 'tenants',
              element: <TenantsPage />
            },
            {
              path: 'landlords',
              element: <LandlordsPage />
            },
            {
              path: 'manage',
              element: <ManageUsersPage />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
