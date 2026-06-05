import { getAppIdForRole, USER_ROLES } from './roles';

const AUTH_STORAGE_KEY = 'lando-auth-session';

function readStoredSession() {
  if (typeof window === 'undefined') return null;

  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    return storedSession ? JSON.parse(storedSession) : null;
  } catch (error) {
    return null;
  }
}

export function getAppIdForPath(path, fallbackRole = USER_ROLES.LANDLORD) {
  if (!path) return getAppIdForRole(fallbackRole);

  const normalizedPath = String(path).replace(/^\/free(?=\/|$)/, '');

  if (normalizedPath === '/tenant' || normalizedPath.startsWith('/tenant/')) return getAppIdForRole(USER_ROLES.TENANT);
  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) return getAppIdForRole(USER_ROLES.SYSTEM_ADMIN);
  if (normalizedPath === '/loan' || normalizedPath.startsWith('/loan/')) return getAppIdForRole(USER_ROLES.LOAN_ADMIN);
  if (normalizedPath === '/landlord' || normalizedPath.startsWith('/landlord/')) return getAppIdForRole(USER_ROLES.LANDLORD);

  return getAppIdForRole(fallbackRole);
}

export function getCurrentAppHeaderValue(fallbackRole = USER_ROLES.LANDLORD) {
  const session = readStoredSession();

  if (session?.appType || session?.appName) {
    return session.appType || session.appName;
  }

  if (typeof window !== 'undefined') {
    return getAppIdForPath(window.location.pathname, fallbackRole);
  }

  return getAppIdForRole(session?.role || fallbackRole);
}


export function getLoginPathForAppType(appType) {
  switch (appType) {
    case 'XPRO_RENTAL_MOBILE_APP':
      return '/user/login';
    case 'XPRO_ADMIN_PORTAL':
      return '/admin/login';
    case 'XPRO_LANDLORD_WEB_APP':
    case 'XPRO_LOAN_WEB_APP':
    default:
      return '/login';
  }
}

export function getLoginStateForAppType(appType) {
  if (appType === 'XPRO_LANDLORD_WEB_APP' || appType === 'XPRO_LOAN_WEB_APP') {
    return { portalAppType: appType };
  }

  return undefined;
}
