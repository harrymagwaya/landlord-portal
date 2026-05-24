// pages/eligibility/tenant-profile.jsx

import { useParams } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

// project
import PageHeader from 'components/PageHeader';
import MainCard from 'components/MainCard';

// hooks
import { useEligibility } from 'hooks/useEligibility';

// icons
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| PAGE ||============================== //

export default function EligibilityTenantProfile() {
  const { tenantId } = useParams();

  const { data, isLoading } = useEligibility(tenantId);

  if (!data) return null;

  const health = data.currentMaxLimit >= 500 ? 92 : data.currentMaxLimit >= 300 ? 75 : data.currentMaxLimit >= 100 ? 50 : 20;

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Tenant Eligibility Profile" description="Detailed borrowing intelligence" icon={UserOutlined} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Risk Band</Typography>

          <Typography variant="h3" fontWeight={800} mt={1}>
            {data.riskBand}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Max Limit</Typography>

          <Typography variant="h3" fontWeight={800} mt={1}>
            {data.currentMaxLimit}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Approval Status</Typography>

          <Typography variant="h3" fontWeight={800} mt={1}>
            {data.calculationAllowed ? 'APPROVED' : 'BLOCKED'}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={12}>
        <MainCard title="Borrowing Strength">
          <Stack spacing={2}>
            <Typography variant="body2">AI Lending Confidence</Typography>

            <LinearProgress
              variant="determinate"
              value={health}
              color={health >= 70 ? 'success' : health >= 40 ? 'warning' : 'error'}
              sx={{
                height: 12,
                borderRadius: 999
              }}
            />

            <Chip label={`${health}% Confidence`} color={health >= 70 ? 'success' : health >= 40 ? 'warning' : 'error'} />
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title="Eligibility Insights">
          <Stack spacing={2}>
            <Typography>
              Tenant borrowing profile generated from behavioral rental analytics and financial transaction intelligence.
            </Typography>

            <Typography>
              Recommended borrowing range:{' '}
              <b>
                {data.currentMinLimit} - {data.currentMaxLimit}
              </b>
            </Typography>

            <Typography>Last reviewed: {new Date(data.reviewedAt).toLocaleString()}</Typography>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
