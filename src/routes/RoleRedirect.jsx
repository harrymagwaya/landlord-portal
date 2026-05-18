import { Navigate } from 'react-router-dom';

import useAuth from 'hooks/useAuth';
import { getDefaultPathForRole } from 'utils/roles';

export default function RoleRedirect() {
  const { role } = useAuth();

  return <Navigate to={getDefaultPathForRole(role)} replace />;
}
