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
const LoanAdminsPage = Loadable(lazy(() => import('pages/users/loanAdmin')));
const ManageUsersPage = Loadable(lazy(() => import('pages/users/manage')));
const PropertyPage = Loadable(lazy(() => import('pages/property/property')));
const PropertyUnitsPage = Loadable(lazy(() => import('pages/property/propertyUnit')));
const RentalProfilesPage = Loadable(lazy(() => import('pages/property/rentalProfile')));
const TenantCapacityPage = Loadable(lazy(() => import('pages/tenantCapacity/tenantCapacity')));
const TenantFinancialRecordsPage = Loadable(lazy(() => import('pages/financialRecord/financialRecord')));
const PaymentOperationsPage = Loadable(lazy(() => import('pages/financialRecord/PaymentHistory')));
const RentRollPage = Loadable(lazy(() => import('pages/financialRecord/rentRoll')));
const LedgerHistoryPage = Loadable(lazy(() => import('pages/financialRecord/ledgerHistory')));
const BehavioralSnapshotsPage = Loadable(lazy(() => import('pages/behavioralFeature/snapshots')));
const BehavioralAnalyticsPage = Loadable(lazy(() => import('pages/behavioralFeature/analytics')));
const BehavioralTimelinePage = Loadable(lazy(() => import('pages/behavioralFeature/timeline')));
const BehavioralProfilePage = Loadable(lazy(() => import('pages/behavioralFeature/profile')));

// ==============================|| RISK PAGES ||============================== //

const RiskWeightPage = Loadable(lazy(() => import('pages/riskWeight/riskWeight')));
const AiRiskWeightsPage = Loadable(lazy(() => import('pages/riskWeight/aiRisk')));
const RiskAnalyticsDashboard = Loadable(lazy(() => import('pages/riskWeight/riskAnalytics')));

// ==============================|| ELIGIBILITY PAGE ||============================== //

const EligibilityPage = Loadable(lazy(() => import('pages/eligibility/eligibilityPage')));
const EligibilityOverviewPage = Loadable(lazy(() => import('pages/eligibility/overview')));
const EligibilityAssessmentsPage = Loadable(lazy(() => import('pages/eligibility/assessments')));
const EligibilityProfilePage = Loadable(lazy(() => import('pages/eligibility/profile')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

const ProfilePage = Loadable(lazy(() => import('pages/profile/profile')));

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
        {
          path: 'profile',
          children: [
            {
              path: '',
              element: <ProfilePage />
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
              path: 'loan-admins',
              element: <LoanAdminsPage />
            },
            {
              path: 'manage',
              element: <ManageUsersPage />
            }
          ]
        },

        // ==============================|| PROPERTIES ||============================== //

        {
          path: 'properties',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LANDLORD]} />,
          children: [
            {
              path: '',
              element: <PropertyPage />
            },
            {
              path: 'units',
              element: <PropertyUnitsPage />
            }
          ]
        },
        {
          path: 'rental-profiles',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LANDLORD]} />,
          children: [
            {
              path: '',
              element: <RentalProfilesPage />
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
            },
            {
              path: 'overview',
              element: <EligibilityOverviewPage />
            },
            {
              path: 'assessments',
              element: <EligibilityAssessmentsPage />
            },
            {
              path: 'profile',
              element: <EligibilityProfilePage />
            },
            {
              path: 'profile/:tenantId',
              element: <EligibilityProfilePage />
            }
          ]
        },

        // ==============================|| FINANCIAL CAPACITY ||============================== //

        {
          path: 'financial-capacity',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LOAN_ADMIN]} />,
          children: [
            {
              path: '',
              element: <TenantCapacityPage />
            },
            {
              path: 'eligibility',
              element: <EligibilityPage />
            },
            {
              path: 'risk-analysis',
              element: <RiskAnalyticsDashboard />
            }
          ]
        },

        // ==============================|| TENANT FINANCIAL RECORDS ||============================== //

        {
          path: 'financial-records',
          element: <RoleGuard allowedRoles={[USER_ROLES.TENANT, USER_ROLES.LANDLORD, USER_ROLES.SYSTEM_ADMIN]} />,
          children: [
            {
              path: '',
              element: <TenantFinancialRecordsPage />
            },
            {
              path: 'my-records',
              element: <TenantFinancialRecordsPage />
            }
          ]
        },

        // ==============================|| PAYMENT OPERATIONS ||============================== //

        {
          path: 'payment-operations',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LOAN_ADMIN, USER_ROLES.LANDLORD]} />,
          children: [
            {
              path: '',
              element: <PaymentOperationsPage />
            }
          ]
        },
        {
          path: 'landlord',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LOAN_ADMIN, USER_ROLES.LANDLORD]} />,
          children: [
            {
              path: 'payment-operations',
              element: <PaymentOperationsPage />
            },
            {
              path: 'rent-roll',
              element: <RentRollPage />
            },
            {
              path: 'ledger-history',
              element: <LedgerHistoryPage />
            }
          ]
        },

        // ==============================|| BEHAVIORAL FEATURES ||============================== //

        {
          path: 'behavioral',
          element: <RoleGuard allowedRoles={[USER_ROLES.SYSTEM_ADMIN, USER_ROLES.LOAN_ADMIN]} />,
          children: [
            {
              path: 'snapshots',
              element: <BehavioralSnapshotsPage />
            },
            {
              path: 'analytics',
              element: <BehavioralAnalyticsPage />
            },
            {
              path: 'timeline',
              element: <BehavioralTimelinePage />
            },
            {
              path: 'profile',
              element: <BehavioralProfilePage />
            },
            {
              path: 'profile/:id',
              element: <BehavioralProfilePage />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
