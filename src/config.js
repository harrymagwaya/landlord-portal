// ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/dashboard/default';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;
export const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8081';
export const LOGIN_ENDPOINT = import.meta.env.VITE_APP_LOGIN_ENDPOINT || '/api/v1/auth/login';
export const USERS_ENDPOINT = '/api/v1/users';
export const APP_HEADER_KEY = 'X-APP';
export const APP_HEADER_VALUE = 'XPRO_LANDLORD_WEB_APP';

const config = {
  fontFamily: `'Public Sans', sans-serif`
};

export default config;
