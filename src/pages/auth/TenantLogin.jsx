// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/AuthLogin';

export default function TenantLogin() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack spacing={1.5} sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">User Login</Typography>
            <Typography color="text.secondary">Sign in to view your unit, payments, score, and rental profile.</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin forcedAppType="XPRO_RENTAL_MOBILE_APP" allowPortalSelection={false} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
