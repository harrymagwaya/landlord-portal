// =========================================
// FILE: components/profile/sections/LandlordProfileSection.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

import useAuth from 'hooks/useAuth';
import { useAllFinancialRecords } from 'hooks/useFinancial';
import { usePropertiesByLandlord } from 'hooks/useProperty';
import { useRentalProfiles } from 'hooks/useRentalProfle';

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

export default function LandlordProfileSection() {
  const { userId } = useAuth();
  const { data: propertiesData } = usePropertiesByLandlord(userId);
  const { data: rentalProfilesData } = useRentalProfiles();
  const { data: financialData } = useAllFinancialRecords({ size: 500 });

  const properties = extractList(propertiesData);
  const propertyIds = new Set(properties.map((property) => property.id || property.propertyId).filter(Boolean));
  const rentalProfiles = extractList(rentalProfilesData).filter((profile) => {
    const propertyId = profile.propertyId || profile.property?.id || profile.property?.propertyId;
    const landlordId = profile.landlordId || profile.landlord?.id || profile.landlord?.userId;
    return landlordId === userId || (propertyId && propertyIds.has(propertyId));
  });
  const activeProfiles = rentalProfiles.filter((profile) => profile.status === 'ACTIVE').length;
  const financialRecords = extractList(financialData).filter((record) => {
    const propertyId = record.propertyId || record.property?.id || record.property?.propertyId;
    return propertyId && propertyIds.has(propertyId);
  });
  const rentTotal = financialRecords
    .filter((record) => record.category === 'RENT')
    .reduce((sum, record) => sum + Number(record.amount || 0), 0);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Properties" value={properties.length} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Active Tenancies" value={activeProfiles} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Recorded Rent" value={`UGX ${rentTotal.toLocaleString()}`} />
      </Grid>

      <Grid size={12}>
        <MainCard title="Landlord Summary">
          <Typography color="text.secondary">Manage properties, tenants, and rental operations from one place.</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
