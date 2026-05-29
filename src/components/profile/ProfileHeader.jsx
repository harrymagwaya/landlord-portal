// =========================================
// FILE: components/profile/ProfileHeader.jsx
// =========================================

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

import useUserProfile from 'hooks/useUserProfile';

export default function ProfileHeader() {
  const { data: user } = useUserProfile();
  const role = user?.role || user?.userRole;

  return (
    <MainCard>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
        <Avatar
          sx={{
            width: 90,
            height: 90,
            fontSize: 32
          }}
        >
          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </Avatar>

        <Box flex={1}>
          <Typography variant="h3">
            {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User Profile'}
          </Typography>

          <Typography color="text.secondary">{user?.email}</Typography>

          <Stack direction="row" spacing={1} mt={1}>
            <Chip label={role || 'USER'} color="primary" />

            <Chip label={user?.status || 'ACTIVE'} color="success" />
          </Stack>
        </Box>

      </Stack>
    </MainCard>
  );
}
