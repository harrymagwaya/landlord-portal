import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';

import useAuth from 'hooks/useAuth';
import { canAccessRole, getDefaultPathForRole } from 'utils/roles';

export default function RoleGuard({ allowedRoles }) {
  const { role } = useAuth();

  if (!canAccessRole(role, allowedRoles)) {
    return <Navigate to={getDefaultPathForRole(role)} replace />;
  }

  return <Outlet />;
}

RoleGuard.propTypes = { allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired };
