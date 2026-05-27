// pages/eligibility/tenant-profile.jsx

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';

// antd
import { Tag } from 'antd';

// project imports
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';

// hooks
import { useEligibility, useEligibilityActions } from 'hooks/useEligibility';
import { useLatestScore } from 'hooks/useScoring';
import { useAllTenantFeatureHistory } from 'hooks/useFeatureLinks';
import { useUsers } from 'hooks/useUsers';

// icons
import UserOutlined from '@ant-design/icons/UserOutlined';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function percent(value) {
  return Math.round(Number(value || 0) * 100);
}

function currency(value) {
  return `UGX ${Number(value || 0).toLocaleString()}`;
}

function normalizeEligibility(raw) {
  if (!raw) return null;

  const riskBand = raw.riskBand || raw.band || raw.lastCalculatedBand || raw.lastBand || raw.risk_category || null;
  const currentMaxLimit = raw.currentMaxLimit ?? raw.maxLimit ?? raw.maximumLimit ?? raw.maxBorrowLimit ?? raw.max ?? 0;
  const currentMinLimit = raw.currentMinLimit ?? raw.minLimit ?? raw.minimumLimit ?? raw.minBorrowLimit ?? raw.min ?? 0;
  const calculationAllowed =
    raw.calculationAllowed ?? raw.allowed ?? raw.isAllowed ?? raw.eligible ?? raw.isEligible ?? raw.approved ?? false;

  return {
    ...raw,
    riskBand,
    currentMaxLimit,
    currentMinLimit,
    calculationAllowed
  };
}

function normalizeScore(raw) {
  if (!raw) return null;

  const creditScore = raw.creditScore ?? raw.score ?? raw.finalScore ?? raw.riskScore ?? raw.totalScore ?? raw.value ?? raw.points ?? 0;

  return { ...raw, creditScore };
}

function calculateBehaviorHealth(feature) {
  if (!feature) return 0;

  const metrics = [
    Number(feature.rentConsistency || 0),
    Number(feature.mobileMoneyVolume || 0),
    Number(feature.transactionDiversity || 0),
    Number(feature.utilityPayments || 0),
    Number(feature.savingsConsistency || 0),
    Number(feature.loanRepaymentRate || 0)
  ];

  const valid = metrics.filter((v) => !Number.isNaN(v));

  if (!valid.length) return 0;

  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100);
}

function getRiskColor(band) {
  switch (band) {
    case 'PLATINUM':
      return 'success';

    case 'GOLD':
      return 'warning';

    case 'SILVER':
      return 'processing';

    case 'BRONZE':
      return 'orange';

    default:
      return 'error';
  }
}

// ==============================|| PAGE ||============================== //

export default function EligibilityTenantProfile() {
  const navigate = useNavigate();
  const { tenantId: routeTenantId } = useParams();
  const [selectedTenantId, setSelectedTenantId] = useState(routeTenantId || '');
  const [actionError, setActionError] = useState('');
  const [runningAssessment, setRunningAssessment] = useState(false);

  useEffect(() => {
    setSelectedTenantId(routeTenantId || '');
  }, [routeTenantId]);

  const { data: usersData } = useUsers({ size: 200 });

  const users = useMemo(() => extractList(usersData), [usersData]);

  const tenantOptions = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email || u.id
      })),
    [users]
  );

  const tenantUser = useMemo(() => users.find((u) => u.id === selectedTenantId), [users, selectedTenantId]);

  const {
    data: eligibilityRaw,
    isLoading: eligibilityLoading,
    error: eligibilityError,
    mutate: mutateEligibility
  } = useEligibility(selectedTenantId || null);
  const eligibilityData = useMemo(() => normalizeEligibility(eligibilityRaw), [eligibilityRaw]);
  const { assessEligibility } = useEligibilityActions();

  const { data: scoreRaw, isLoading: scoreLoading, mutate: mutateScore } = useLatestScore(selectedTenantId || null);
  const scoreData = useMemo(() => normalizeScore(scoreRaw), [scoreRaw]);

  const { data: historyData, isLoading: historyLoading } = useAllTenantFeatureHistory(0, 100);

  const historyRows = useMemo(() => extractList(historyData), [historyData]);

  const tenantTimeline = useMemo(() => {
    return historyRows.filter((r) => r.tenantId === selectedTenantId);
  }, [historyRows, selectedTenantId]);

  const latestBehavior = useMemo(() => {
    if (!tenantTimeline.length) return null;

    const sorted = [...tenantTimeline].sort((a, b) => {
      const at = new Date(a?.linkedAt || 0).getTime();
      const bt = new Date(b?.linkedAt || 0).getTime();
      return bt - at;
    });

    return sorted.find((r) => r.active) || sorted[0];
  }, [tenantTimeline]);

  const tenantSelectionCard = (
    <Grid size={12}>
      <MainCard>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
          <Autocomplete
            options={tenantOptions}
            value={tenantOptions.find((o) => o.id === selectedTenantId) || null}
            onChange={(_, option) => {
              const id = option?.id || '';
              setSelectedTenantId(id);
              if (id) navigate(`/eligibility/profile/${id}`);
            }}
            renderInput={(params) => <TextField {...params} label="Find Tenant" />}
            sx={{ width: { xs: '100%', md: 360 } }}
          />
        </Stack>
      </MainCard>
    </Grid>
  );

  if (!selectedTenantId) {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader title="Tenant Eligibility Intelligence" description="Pick a tenant to view profile" icon={UserOutlined} />
        </Grid>
        {tenantSelectionCard}
        <Grid size={12}>
          <Alert severity="info">Select a tenant to load their eligibility profile and timeline.</Alert>
        </Grid>
      </Grid>
    );
  }

  if (eligibilityLoading || scoreLoading || historyLoading) {
    return null;
  }

  if (eligibilityError) {
    return <Alert severity="error">{eligibilityError.message}</Alert>;
  }

  if (!eligibilityData) {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader
            title="Tenant Eligibility Intelligence"
            description="No eligibility record found for this tenant"
            icon={UserOutlined}
          />
        </Grid>
        {tenantSelectionCard}
        <Grid size={12}>
          <Alert severity="warning">No eligibility data yet. Run an assessment to generate borrowing limits and risk band.</Alert>
        </Grid>
        {actionError ? (
          <Grid size={12}>
            <Alert severity="error">{actionError}</Alert>
          </Grid>
        ) : null}
        <Grid size={12}>
          <Button
            variant="contained"
            disabled={runningAssessment}
            onClick={async () => {
              try {
                setRunningAssessment(true);
                setActionError('');
                await assessEligibility(selectedTenantId);
                await Promise.all([mutateEligibility(), mutateScore()]);
              } catch (e) {
                setActionError(e?.message || 'Failed to run eligibility assessment.');
              } finally {
                setRunningAssessment(false);
              }
            }}
          >
            {runningAssessment ? 'Running...' : 'Run Eligibility Assessment'}
          </Button>
        </Grid>
      </Grid>
    );
  }

  const behaviorHealth = calculateBehaviorHealth(latestBehavior);

  const aiConfidence =
    eligibilityData.currentMaxLimit >= 500
      ? 92
      : eligibilityData.currentMaxLimit >= 300
        ? 74
        : eligibilityData.currentMaxLimit >= 100
          ? 48
          : 22;

  const riskColor = aiConfidence >= 70 ? 'success' : aiConfidence >= 40 ? 'warning' : 'error';

  const timelineColumns = [
    {
      title: 'Snapshot',
      dataIndex: 'snapshotId',
      key: 'snapshotId',
      width: 220,
      render: (v) => <Typography fontFamily="monospace">{String(v || '-').slice(0, 8)}</Typography>
    },

    {
      title: 'Linked At',
      dataIndex: 'linkedAt',
      key: 'linkedAt',
      width: 220,
      render: (v) => (v ? new Date(v).toLocaleString() : '-')
    },

    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, row) => <Tag color={row.active ? 'green' : 'default'}>{row.active ? 'ACTIVE' : 'INACTIVE'}</Tag>
    }
  ];

return (
  <Grid container spacing={3}>
    {/* HEADER */}
    <Grid size={12}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <PageHeader
          title="Tenant Eligibility Intelligence"
          description="AI-powered borrowing analytics and behavioral risk assessment"
          icon={UserOutlined}
        />

        <Chip icon={<ArrowLeftOutlined />} label="Back" onClick={() => navigate(-1)} clickable />
      </Stack>
    </Grid>

    {tenantSelectionCard}

    {/* PROFILE + AI */}
    <Grid size={{ xs: 12, lg: 8 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4
        }}
      >
        <Stack spacing={3}>
          {/* TOP USER ROW */}
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={tenantUser?.avatar}
                sx={{
                  width: 68,
                  height: 68,
                  bgcolor: 'primary.main',
                  fontWeight: 700,
                  fontSize: 24
                }}
              >
                {tenantUser?.firstName?.[0] || 'T'}
              </Avatar>

              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h4" fontWeight={800}>
                    {tenantUser?.firstName} {tenantUser?.lastName}
                  </Typography>

                  <Chip
                    size="small"
                    label={eligibilityData.riskBand}
                    color={
                      eligibilityData.riskBand === 'PLATINUM'
                        ? 'success'
                        : eligibilityData.riskBand === 'GOLD'
                          ? 'warning'
                          : eligibilityData.riskBand === 'SILVER'
                            ? 'primary'
                            : 'error'
                    }
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {tenantUser?.email || 'No email'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {tenantUser?.phoneNumber || 'No phone'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<PhoneOutlined />} href={`tel:${tenantUser?.phoneNumber || ''}`}>
                Call
              </Button>

              <Button size="small" variant="outlined" startIcon={<MailOutlined />} href={`mailto:${tenantUser?.email || ''}`}>
                Email
              </Button>
            </Stack>
          </Stack>

          <Divider />

          {/* KPI STRIP */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Borrow Power
                </Typography>

                <Typography variant="h5" fontWeight={800} mt={1}>
                  {currency(eligibilityData.currentMaxLimit)}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Credit Score
                </Typography>

                <Typography variant="h5" fontWeight={800} mt={1}>
                  {scoreData?.creditScore ?? 0}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  AI Confidence
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  mt={1}
                  color={aiConfidence >= 70 ? 'success.main' : aiConfidence >= 40 ? 'warning.main' : 'error.main'}
                >
                  {aiConfidence}%
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>

                <Typography variant="h5" fontWeight={800} mt={1} color={eligibilityData.calculationAllowed ? 'success.main' : 'error.main'}>
                  {eligibilityData.calculationAllowed ? 'APPROVED' : 'BLOCKED'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* BORROW CAPACITY */}
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Borrowing Capacity
              </Typography>

              <Typography fontWeight={700}>
                {currency(eligibilityData.currentMinLimit)} — {currency(eligibilityData.currentMaxLimit)}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={aiConfidence}
              color={aiConfidence >= 70 ? 'success' : aiConfidence >= 40 ? 'warning' : 'error'}
              sx={{
                mt: 1.5,
                height: 10,
                borderRadius: 999
              }}
            />

            <Typography variant="body2" color="text.secondary" mt={1.5}>
              Borrowing limits are dynamically calculated using rental consistency, repayment behavior, financial activity and AI risk
              analysis.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Grid>

    {/* AI PANEL */}
    <Grid size={{ xs: 12, lg: 4 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          height: '100%',
          background:
            aiConfidence >= 70
              ? 'linear-gradient(135deg, rgba(76,175,80,0.08) 0%, rgba(76,175,80,0.01) 100%)'
              : aiConfidence >= 40
                ? 'linear-gradient(135deg, rgba(255,152,0,0.08) 0%, rgba(255,152,0,0.01) 100%)'
                : 'linear-gradient(135deg, rgba(244,67,54,0.08) 0%, rgba(244,67,54,0.01) 100%)'
        }}
      >
        <Stack spacing={3}>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              AI Lending Confidence
            </Typography>

            <Typography
              variant="h1"
              fontWeight={900}
              mt={1}
              color={aiConfidence >= 70 ? 'success.main' : aiConfidence >= 40 ? 'warning.main' : 'error.main'}
            >
              {aiConfidence}%
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              Predictive repayment confidence score
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={aiConfidence}
            color={aiConfidence >= 70 ? 'success' : aiConfidence >= 40 ? 'warning' : 'error'}
            sx={{
              height: 12,
              borderRadius: 999
            }}
          />

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary">
              AI Recommendation
            </Typography>

            <Typography variant="body1" mt={1.5} lineHeight={1.9}>
              {aiConfidence >= 70
                ? 'Tenant demonstrates stable repayment behavior, healthy financial activity and strong rental consistency.'
                : aiConfidence >= 40
                  ? 'Tenant demonstrates moderate lending reliability with manageable behavioral risk indicators.'
                  : 'Behavioral intelligence indicates elevated lending risk and inconsistent repayment activity.'}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Grid>

    {/* SIGNALS */}
    <Grid size={12}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={3}>
          Behavioral Intelligence Signals
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Rent Consistency</Typography>

                <Typography fontWeight={700}>{percent(latestBehavior?.rentConsistency)}%</Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={percent(latestBehavior?.rentConsistency)}
                sx={{
                  height: 8,
                  borderRadius: 999
                }}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Mobile Money Activity</Typography>

                <Typography fontWeight={700}>{percent(latestBehavior?.mobileMoneyVolume)}%</Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={percent(latestBehavior?.mobileMoneyVolume)}
                color="success"
                sx={{
                  height: 8,
                  borderRadius: 999
                }}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Transaction Diversity</Typography>

                <Typography fontWeight={700}>{percent(latestBehavior?.transactionDiversity)}%</Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={percent(latestBehavior?.transactionDiversity)}
                color="warning"
                sx={{
                  height: 8,
                  borderRadius: 999
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Grid>

    {/* TIMELINE */}
    <Grid size={12}>
      <MainCard title="Behavioral Timeline">
        <AdvancedTable
          columns={timelineColumns}
          dataSource={tenantTimeline}
          loading={historyLoading}
          rowKey={(r) => r.linkId || r.snapshotId || r.id}
          emptyText="No behavioral timeline found."
        />
      </MainCard>
    </Grid>
  </Grid>
);
}
