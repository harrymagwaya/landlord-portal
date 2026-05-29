// =========================================
// FILE: components/profile/SecurityCard.jsx
// =========================================

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

export default function SecurityCard() {
  return (
    <MainCard title="Security">
      <Stack spacing={2}>
        <Typography color="text.secondary">Account access is managed by your authenticated portal session.</Typography>
      </Stack>
    </MainCard>
  );
}
