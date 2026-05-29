// =========================================
// FILE: components/profile/sections/TenantProfileSection.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import MainCard from 'components/MainCard';

import useAuth from 'hooks/useAuth';
import { useEligibility } from 'hooks/useEligibility';
import { useTenantFinancialHistory } from 'hooks/useFinancial';
import { useLatestScore } from 'hooks/useScoring';
import { useUnitByTenant } from 'hooks/usePropertyUnits';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function TenantProfileSection() {
  const { userId } = useAuth();
  const { data: unit } = useUnitByTenant(userId);
  const { data: score } = useLatestScore(userId);
  const { data: eligibility } = useEligibility(userId);
  const { data: financialData } = useTenantFinancialHistory(userId);

  const records = extractList(financialData);
  const paymentTotal = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const eligibilityStatus = eligibility?.calculationAllowed ?? eligibility?.eligible ?? eligibility?.isEligible;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Assigned Unit">
          <Stack spacing={1}>
            <Typography variant="h4">{unit?.unitName || unit?.name || unit?.unitNumber || 'No unit assigned'}</Typography>

            <Typography color="text.secondary">{unit?.propertyName || unit?.property?.name || unit?.propertyId || 'Tenant unit assignment'}</Typography>

            <Chip label={unit ? 'ACTIVE TENANCY' : 'NO UNIT'} color={unit ? 'success' : 'default'} />
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Behavioral Score">
          <Typography variant="h2">{score?.creditScore ?? score?.score ?? score?.finalScore ?? '-'}</Typography>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Eligibility Status">
          <Typography variant="h3">{eligibilityStatus === undefined ? 'Not assessed' : eligibilityStatus ? 'Eligible' : 'Blocked'}</Typography>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Payment Summary">
          <Typography variant="h3">UGX {paymentTotal.toLocaleString()}</Typography>

          <Typography color="text.secondary">{records.length} financial records</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
