import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';
import useUserProfile from 'hooks/useUserProfile';
import { getDefaultPathForRole } from 'utils/roles';

export default function AuthLoadingPage() {
  const { role } = useAuth();
  const { isLoading, error } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!role || isLoading) return undefined;

    const redirectTo = location.state?.redirectTo;
    const nextPath = redirectTo && redirectTo !== APP_DEFAULT_PATH ? redirectTo : getDefaultPathForRole(role);
    const timer = window.setTimeout(() => navigate(nextPath, { replace: true }), 450);

    return () => window.clearTimeout(timer);
  }, [isLoading, location.state?.redirectTo, navigate, role]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <MainCard sx={{ width: '100%', maxWidth: 460 }}>
        <Stack sx={{ gap: 3, alignItems: 'center', textAlign: 'center' }}>
          <CircularProgress size={42} />
          <Stack sx={{ gap: 0.75 }}>
            <Typography variant="h4">Checking authentication</Typography>
            <Typography color="text.secondary">Getting user data and preparing your workspace.</Typography>
          </Stack>
          <LinearProgress sx={{ width: '100%' }} />
          {error && (
            <Alert severity="warning" sx={{ width: '100%', textAlign: 'left' }}>
              Profile details could not be loaded, so the workspace will continue with your session role.
            </Alert>
          )}
        </Stack>
      </MainCard>
    </Box>
  );
}
