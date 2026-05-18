// ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/dashboard/default';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;
export const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8081';
export const LOGIN_ENDPOINT = import.meta.env.VITE_APP_LOGIN_ENDPOINT || '/api/v1/auth/login';
export const USERS_ENDPOINT = '/api/v1/users';
export const LOANS_ENDPOINT = import.meta.env.VITE_APP_LOANS_ENDPOINT || '/api/v1/loans';
export const PROPERTIES_ENDPOINT = '/api/v1/properties';
export const UNITS_ENDPOINT = '/api/v1/units';
export const ADDRESSES_ENDPOINT = '/api/v1/addresses';
export const CREDIT_SCORING_ENDPOINT = '/api/v1/credit-scoring';
export const SCORING_ENDPOINT = '/api/v1/scoring';
export const BEHAVIORAL_FEATURES_ENDPOINT = '/api/v1/behavioral-features';
export const ELIGIBILITY_ENDPOINT = '/api/v1/eligibility';
export const FINANCIAL_RECORDS_ENDPOINT = '/api/v1/financial-records';
export const LANDLORDS_ENDPOINT = '/api/v1/landlords';
export const LOAN_ADMINS_ENDPOINT = '/api/v1/loan-admins';
export const LEDGER_ENDPOINT = '/api/v1/ledger';
export const RENTAL_PROFILES_ENDPOINT = '/api/v1/rental-profiles';
export const RISK_WEIGHTS_ENDPOINT = '/api/v1/admin/weights';
export const TENANT_CAPACITIES_ENDPOINT = '/api/v1/tenant-capacities';
export const TENANTS_ENDPOINT = '/api/v1/tenants';
export const APP_HEADER_KEY = 'X-APP';
export const APP_HEADER_VALUE = 'XPRO_LANDLORD_WEB_APP';
export const ACTOR_ID_HEADER = import.meta.env.VITE_APP_ACTOR_ID_HEADER || 'X-ACTOR-ID';

const config = {
  fontFamily: `'Public Sans', sans-serif`
};

export default config;
