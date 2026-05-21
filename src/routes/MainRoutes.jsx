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

// ==============================|| RISK PAGES ||============================== //

const RiskWeightPage = Loadable(lazy(() => import('pages/riskWeight/riskWeight')));
const AiRiskWeightsPage = Loadable(lazy(() => import('pages/riskWeight/aiRisk')));
const RiskAnalyticsDashboard = Loadable(lazy(() => import('pages/riskWeight/riskAnalytics')));

// ==============================|| ELIGIBILITY PAGE ||============================== //

const EligibilityPage = Loadable(lazy(() => import('pages/eligibility/EligibilityPage')));

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

        // ==============================|| DASHBOARD ||============================== //

        {
          path: 'dashboard',
          children: [
            {
              path: 'default',
              element: <DashboardDefault />
            }
          ]
        },

        // ==============================|| COMPONENT PAGES ||============================== //

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

        // ==============================|| LOANS ||============================== //

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

        // ==============================|| USERS ||============================== //

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
        },

        // ==============================|| RISK ENGINE ||============================== //

        {
          path: 'risk',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LOAN_ADMIN]} />,
          children: [
            {
              path: 'weights',
              element: <RiskWeightPage />
            },
            {
              path: 'ai-weights',
              element: <AiRiskWeightsPage />
            },
            {
              path: 'analytics',
              element: <RiskAnalyticsDashboard />
            }
          ]
        },

        // ==============================|| ELIGIBILITY ||============================== //

        {
          path: 'eligibility',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LOAN_ADMIN]} />,
          children: [
            {
              path: '',
              element: <EligibilityPage />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
