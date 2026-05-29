// =========================================
// FILE: pages/profile/ProfilePage.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import useAuth from 'hooks/useAuth';

import ProfileHeader from 'components/profile/ProfileHeader';
import PersonalInformationCard from 'components/profile/PersonalCard';
import SecurityCard from 'components/profile/SecurityCard';

import TenantProfileSection from 'components/profile/TenantProfile';
import LandlordProfileSection from 'components/profile/LandlordProfile';
import AdminProfileSection from 'components/profile/AdminProfile';

import { USER_ROLES } from 'utils/roles';

export default function ProfilePage() {
  const { role } = useAuth();


  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <ProfileHeader />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={3}>
          <PersonalInformationCard />

          <SecurityCard />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        {role === USER_ROLES.TENANT && <TenantProfileSection />}

        {role === USER_ROLES.LANDLORD && <LandlordProfileSection />}

        {(role === USER_ROLES.SYSTEM_ADMIN || role === USER_ROLES.LOAN_ADMIN) && <AdminProfileSection />}
      </Grid>
    </Grid>
  );
}
