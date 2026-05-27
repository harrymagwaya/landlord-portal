// pages/eligibility/overview.jsx

import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';

// antd
import { Tag } from 'antd';

// project imports
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useEligibilityList } from 'hooks/useEligibility';

// icons
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import AuditOutlined from '@ant-design/icons/AuditOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function calculatePortfolioHealth(approved, total) {
  if (!total) return 0;
  return Math.round((approved / total) * 100);
}

function getHealthColor(score) {
  if (score >= 75) return 'success';
  if (score >= 45) return 'warning';
  return 'error';
}

// ==============================|| PAGE ||============================== //

export default function EligibilityOverview() {
  const { data, isLoading, error } = useEligibilityList(0, 200);

  const rows = useMemo(() => extractList(data), [data]);

  // ================= KPIs ================= //

  const totalExposure = rows.reduce((sum, row) => sum + Number(row.currentMaxLimit || 0), 0);

  const avgLimit = rows.length ? Math.round(totalExposure / rows.length) : 0;

  const approvedCount = rows.filter((r) => r.calculationAllowed).length;

  const blockedCount = rows.filter((r) => !r.calculationAllowed).length;

  const approvalRatio = rows.length ? Math.round((approvedCount / rows.length) * 100) : 0;

  const portfolioHealth = calculatePortfolioHealth(approvedCount, rows.length);

  const distribution = {
    PLATINUM: rows.filter((r) => r.lastCalculatedBand === 'PLATINUM').length,
    GOLD: rows.filter((r) => r.lastCalculatedBand === 'GOLD').length,
    SILVER: rows.filter((r) => r.lastCalculatedBand === 'SILVER').length,
    BRONZE: rows.filter((r) => r.lastCalculatedBand === 'BRONZE').length,
    REJECT: rows.filter((r) => r.lastCalculatedBand === 'REJECT').length
  };

  // ================= UI ================= //

  return (
    <Grid container spacing={3}>
      {/* HEADER */}
      <Grid size={12}>
        <PageHeader
          title="Eligibility Overview"
          description="Executive portfolio intelligence & lending exposure analytics."
          icon={SafetyCertificateOutlined}
        />
      </Grid>

      {/* ALERT */}
      <Grid size={12}>
        <Alert severity="info">
          Eligibility intelligence combines behavioral analytics, AI risk scoring, mobile money intelligence and repayment behavior to
          generate adaptive lending decisions.
        </Alert>
      </Grid>

      {/* KPI CARDS */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            height: '100%'
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Total Exposure</Typography>

              <DollarOutlined style={{ fontSize: 20 }} />
            </Stack>

            <Typography variant="h3" fontWeight={800}>
              {totalExposure.toLocaleString()}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Portfolio lending capacity
            </Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            height: '100%'
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Average Limit</Typography>

              <RiseOutlined style={{ fontSize: 20 }} />
            </Stack>

            <Typography variant="h3" fontWeight={800}>
              {avgLimit.toLocaleString()}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Avg tenant borrowing strength
            </Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            height: '100%'
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Approved Profiles</Typography>

              <AuditOutlined style={{ fontSize: 20 }} />
            </Stack>

            <Typography variant="h3" fontWeight={800}>
              {approvedCount}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Eligible lending profiles
            </Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            height: '100%'
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Blocked Profiles</Typography>

              <FallOutlined style={{ fontSize: 20 }} />
            </Stack>

            <Typography variant="h3" fontWeight={800}>
              {blockedCount}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              High risk tenant profiles
            </Typography>
          </Stack>
        </Paper>
      </Grid>

      {/* PORTFOLIO HEALTH */}
      <Grid size={{ xs: 12, md: 8 }}>
        <MainCard title="Portfolio Lending Health">
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Overall Lending Confidence</Typography>

                <Typography variant="body2" fontWeight={700}>
                  {portfolioHealth}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={portfolioHealth}
                color={getHealthColor(portfolioHealth)}
                sx={{
                  mt: 1,
                  height: 14,
                  borderRadius: 999
                }}
              />
            </Box>

            <Divider />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 4
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    Approval Ratio
                  </Typography>

                  <Typography variant="h4" fontWeight={800} mt={1}>
                    {approvalRatio}%
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 4
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    Active Profiles
                  </Typography>

                  <Typography variant="h4" fontWeight={800} mt={1}>
                    {rows.length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 4
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    Portfolio Stability
                  </Typography>

                  <Typography variant="h4" fontWeight={800} mt={1}>
                    {portfolioHealth >= 75 ? 'STABLE' : portfolioHealth >= 45 ? 'MODERATE' : 'VOLATILE'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </MainCard>
      </Grid>

      {/* RISK DISTRIBUTION */}
      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title="Risk Distribution">
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography>PLATINUM</Typography>

              <Tag color="green">{distribution.PLATINUM}</Tag>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography>GOLD</Typography>

              <Tag color="gold">{distribution.GOLD}</Tag>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography>SILVER</Typography>

              <Tag color="blue">{distribution.SILVER}</Tag>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography>BRONZE</Typography>

              <Tag color="orange">{distribution.BRONZE}</Tag>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography>REJECTED</Typography>

              <Tag color="red">{distribution.REJECT}</Tag>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Approved ${approvedCount}`} color="success" />

              <Chip label={`Blocked ${blockedCount}`} color="error" />
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      {/* PORTFOLIO INSIGHTS */}
      <Grid size={12}>
        <MainCard title="AI Lending Intelligence">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: '100%'
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Exposure Analysis
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={1}>
                  Portfolio lending exposure is dynamically adjusted using AI-generated behavioral confidence and repayment risk
                  predictions.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: '100%'
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Risk Optimization
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={1}>
                  Borrowing limits are continuously optimized using transaction diversity, rent consistency and financial stability signals.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: '100%'
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Decision Confidence
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={1}>
                  Eligibility confidence scores improve portfolio stability while minimizing high-risk lending exposure.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
