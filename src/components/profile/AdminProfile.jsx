// =========================================
// FILE: components/profile/sections/AdminProfileSection.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

import { useLoanApplications } from 'api/loans';
import { useProperties } from 'hooks/useProperty';
import { useRentalProfiles } from 'hooks/useRentalProfle';
import { useUsers } from 'hooks/useUsers';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function AnalyticsCard({ title, value }) {
  return (
    <MainCard>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>

      <Typography variant="h3">{value}</Typography>
    </MainCard>
  );
}

export default function AdminProfileSection() {
  const { data: usersData } = useUsers({ size: 500 });
  const { data: propertiesData } = useProperties({ size: 500 });
  const { data: rentalProfilesData } = useRentalProfiles();
  const { data: loans = [] } = useLoanApplications('ALL');

  const users = extractList(usersData);
  const properties = extractList(propertiesData);
  const rentalProfiles = extractList(rentalProfilesData);
  const activeProfiles = rentalProfiles.filter((profile) => profile.status === 'ACTIVE').length;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Total Users" value={users.length} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Properties" value={properties.length} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Loan Applications" value={loans.length} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Active Rental Profiles" value={activeProfiles} />
      </Grid>

      <Grid size={12}>
        <MainCard title="Administrator Access">
          <Typography color="text.secondary">
            Access platform analytics, behavioral scoring insights, eligibility monitoring, and user administration.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
