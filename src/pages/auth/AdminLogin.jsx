import { Link } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/AuthLogin';

export default function AdminLogin() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack spacing={1.5} sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Typography variant="h3">Admin Login</Typography>
              <Typography component={Link} to={'/login'} variant="body1" sx={{ textDecoration: 'none' }} color="primary">
                Back to portal sign-in
              </Typography>
            </Stack>
            <Typography color="text.secondary">Sign in to manage platform users, governance, and system-wide configuration.</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin forcedAppType="XPRO_ADMIN_PORTAL" allowPortalSelection={false} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
