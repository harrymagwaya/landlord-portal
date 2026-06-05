export const USER_ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  LOAN_ADMIN: 'LOAN_ADMIN',
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT'
};

export const ALLOWED_ROLES = Object.values(USER_ROLES);

export const ROLE_ROUTE_BASES = {
  [USER_ROLES.SYSTEM_ADMIN]: '/admin',
  [USER_ROLES.LOAN_ADMIN]: '/loan',
  [USER_ROLES.LANDLORD]: '/landlord',
  [USER_ROLES.TENANT]: '/tenant'
};

export const ROLE_APP_IDS = {
  [USER_ROLES.SYSTEM_ADMIN]: 'XPRO_ADMIN_PORTAL',
  [USER_ROLES.LOAN_ADMIN]: 'XPRO_LOAN_WEB_APP',
  [USER_ROLES.LANDLORD]: 'XPRO_LANDLORD_WEB_APP',
  [USER_ROLES.TENANT]: 'XPRO_RENTAL_MOBILE_APP'
};

export const ROLE_DEFAULT_PATHS = {
  [USER_ROLES.SYSTEM_ADMIN]: '/admin/dashboard/default',
  [USER_ROLES.LOAN_ADMIN]: '/loan/dashboard/default',
  [USER_ROLES.LANDLORD]: '/landlord/dashboard/default',
  [USER_ROLES.TENANT]: '/tenant/home'
};

export function getDefaultPathForRole(role) {
  return ROLE_DEFAULT_PATHS[role] || ROLE_DEFAULT_PATHS[USER_ROLES.SYSTEM_ADMIN];
}

export function getRouteBaseForRole(role) {
  return ROLE_ROUTE_BASES[role] || '';
}

export function getAppIdForRole(role) {
  return ROLE_APP_IDS[role] || ROLE_APP_IDS[USER_ROLES.LANDLORD];
}

export function getPathForRole(role, path) {
  if (!path || !path.startsWith('/')) return path;
  if (['/login', '/register', '/auth/loading'].includes(path)) return path;

  if (Object.values(ROLE_ROUTE_BASES).some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return path;
  }

  if (role === USER_ROLES.TENANT) {
    if (path === '/dashboard/default') return '/tenant/home';
    if (path === '/profile') return '/tenant/profile';
    if (path === '/financial-records' || path === '/financial-records/my-records') return '/tenant/payments';
  }

  const prefix = getRouteBaseForRole(role);

  if (!prefix) return path;

  const normalizedPath = path.replace(/^\/landlord(?=\/|$)/, '');

  return `${prefix}${normalizedPath}`;
}

export function canAccessRole(role, allowedRoles = ALLOWED_ROLES) {
  return Boolean(role && allowedRoles.includes(role));
}
