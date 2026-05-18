export const USER_ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  LOAN_ADMIN: 'LOAN_ADMIN',
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT'
};

export const ALLOWED_ROLES = Object.values(USER_ROLES);

export const ROLE_DEFAULT_PATHS = {
  [USER_ROLES.SYSTEM_ADMIN]: '/dashboard/default',
  [USER_ROLES.LOAN_ADMIN]: '/dashboard/default',
  [USER_ROLES.LANDLORD]: '/dashboard/default',
  [USER_ROLES.TENANT]: '/dashboard/default'
};

export function getDefaultPathForRole(role) {
  return ROLE_DEFAULT_PATHS[role] || '/dashboard/default';
}

export function canAccessRole(role, allowedRoles = ALLOWED_ROLES) {
  return Boolean(role && allowedRoles.includes(role));
}
