import { Outlet } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

// project imports
import TenantHeader from './TenantHeader';
import TenantBottomNav from './TenantBottomNav';

// ==============================|| TENANT MOBILE LAYOUT ||============================== //

export default function TenantLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <TenantHeader />

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          px: 2,
          pt: 2,
          pb: 10
        }}
      >
        <Stack spacing={2.5}>
          <Outlet />
        </Stack>
      </Container>

      <TenantBottomNav />
    </Box>
  );
}
