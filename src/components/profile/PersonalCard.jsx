// =========================================
// FILE: components/profile/PersonalInformationCard.jsx
// =========================================

import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

import useUserProfile from 'hooks/useUserProfile';

function Item({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography fontWeight={600}>{value || '-'}</Typography>
    </Stack>
  );
}

export default function PersonalInformationCard() {
  const { data: user } = useUserProfile();

  return (
    <MainCard title="Personal Information">
      <Stack spacing={2}>
        <Item label="First Name" value={user?.firstName} />

        <Divider />

        <Item label="Last Name" value={user?.lastName} />

        <Divider />

        <Item label="Email" value={user?.email} />

        <Divider />

        <Item label="Phone Number" value={user?.phoneNumber} />

        <Divider />

        <Item label="Role" value={user?.role || user?.userRole} />
      </Stack>
    </MainCard>
  );
}
