import { Link as RouterLink, useLocation } from 'react-router-dom';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import useUserProfile from 'hooks/useUserProfile';

// Meta definitions using partial matching keys
const routeMeta = {
  home: {
    title: 'Home',
    subtitle: 'Your latest tenancy and score summary'
  },
  payments: {
    title: 'Payments',
    subtitle: 'Track and submit your rent records'
  },
  unit: {
    title: 'My Unit',
    subtitle: 'View your current rental assignment'
  },
  profile: {
    title: 'Profile',
    subtitle: 'Personal details and account status'
  }
};

// Helper to resolve route metadata even for nested paths
const getRouteMeta = (pathname) => {
  const segment = pathname.split('/').filter(Boolean)[1]; // Gets 'home', 'payments', etc.
  return routeMeta[segment] || { title: 'Tenant Portal', subtitle: 'Manage your tenancy' };
};

// ==============================|| TENANT HEADER ||============================== //

export default function TenantHeader() {
  const location = useLocation();
  const { data: user } = useUserProfile();

  const currentRoute = getRouteMeta(location.pathname);
  const initials = user?.firstName?.[0] || user?.email?.[0] || 'T';

  return (
    <Box
      component="header"
      sx={{
        px: 3,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        {/* Left Side: Dynamic Page Title & Context */}
        <Box minWidth={0}>
          <Typography variant="h4" component="h1" fontWeight={700} noWrap>
            {currentRoute.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
            {currentRoute.subtitle}
          </Typography>
        </Box>

        {/* Right Side: Profile Actions */}
        {location.pathname !== '/tenant/profile' && (
          <ButtonBase
            component={RouterLink}
            to="/tenant/profile"
            aria-label="View Profile"
            sx={{
              borderRadius: '50%',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: 1
              }}
            >
              {String(initials).toUpperCase()}
            </Avatar>
          </ButtonBase>
        )}
      </Stack>
    </Box>
  );
}
