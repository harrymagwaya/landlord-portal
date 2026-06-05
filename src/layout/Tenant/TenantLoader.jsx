// material-ui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// ==============================|| TENANT MOBILE LOADER ||============================== //

export default function TenantLoader() {
  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 4
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={52} height={52} />

          <Box flex={1}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={18} />
          </Box>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 2.5,
          borderRadius: 4
        }}
      >
        <Skeleton width="45%" height={20} />
        <Skeleton width="70%" height={42} sx={{ mt: 1 }} />
        <Skeleton variant="rounded" height={12} sx={{ mt: 2, borderRadius: 999 }} />
      </Paper>

      <Paper
        sx={{
          p: 2.5,
          borderRadius: 4
        }}
      >
        <Skeleton width="50%" height={20} />
        <Stack spacing={1.5} mt={2}>
          <Skeleton variant="rounded" height={64} />
          <Skeleton variant="rounded" height={64} />
          <Skeleton variant="rounded" height={64} />
        </Stack>
      </Paper>
    </Stack>
  );
}
