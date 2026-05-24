// pages/eligibility/overview.jsx

import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';

// project imports
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useEligibilityList } from 'hooks/useEligibility';

// icons
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

// ==============================|| PAGE ||============================== //

export default function EligibilityOverview() {
  const { data, isLoading } = useEligibilityList(0, 100);

  const rows = useMemo(() => extractList(data), [data]);

  const totalExposure = rows.reduce((sum, row) => sum + Number(row.currentMaxLimit || 0), 0);

  const avgLimit = rows.length ? Math.round(totalExposure / rows.length) : 0;

  const allowedCount = rows.filter((r) => r.calculationAllowed).length;

  const rejectedCount = rows.filter((r) => r.lastCalculatedBand === 'REJECT').length;

  const distribution = {
    PLATINUM: rows.filter((r) => r.lastCalculatedBand === 'PLATINUM').length,
    GOLD: rows.filter((r) => r.lastCalculatedBand === 'GOLD').length,
    SILVER: rows.filter((r) => r.lastCalculatedBand === 'SILVER').length,
    BRONZE: rows.filter((r) => r.lastCalculatedBand === 'BRONZE').length,
    REJECT: rows.filter((r) => r.lastCalculatedBand === 'REJECT').length
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Eligibility Intelligence"
          description="Borrowing power analytics & lending exposure"
          icon={SafetyCertificateOutlined}
        />
      </Grid>

      <Grid size={12}>
        <Alert severity="info">
          Eligibility decisions are generated using behavioral analytics, rental consistency, mobile money activity and adaptive risk
          weighting.
        </Alert>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Eligible Tenants</Typography>

          <Typography variant="h3" fontWeight={800} mt={1}>
            {allowedCount}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Avg Borrowing Limit</Typography>

          <Typography variant="h3" fontWeight={800} mt={1}>
            {avgLimit}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Rejected Profiles</Typography>

          <Typography variant="h3" fontWeight={800} mt={1}>
            {rejectedCount}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Total Exposure</Typography>

          <Typography variant="h3" fontWeight={800} mt={1}>
            {totalExposure}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={12}>
        <MainCard title="Risk Distribution">
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`PLATINUM ${distribution.PLATINUM}`} color="success" />
            <Chip label={`GOLD ${distribution.GOLD}`} color="warning" />
            <Chip label={`SILVER ${distribution.SILVER}`} color="primary" />
            <Chip label={`BRONZE ${distribution.BRONZE}`} color="secondary" />
            <Chip label={`REJECT ${distribution.REJECT}`} color="error" />
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title="Portfolio Lending Health">
          <Stack spacing={2}>
            <Typography variant="body2">Overall Lending Confidence</Typography>

            <LinearProgress
              variant="determinate"
              value={rows.length ? Math.min(100, Math.round((allowedCount / rows.length) * 100)) : 0}
              sx={{
                height: 12,
                borderRadius: 999
              }}
            />
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
