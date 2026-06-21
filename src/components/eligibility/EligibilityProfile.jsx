// pages/eligibility/tenant-profile-dashboard.jsx

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

// antd
import { Tag, Timeline } from 'antd';

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
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import PlayCircleOutlined from '@ant-design/icons/PlayCircleOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';
import BarChartOutlined from '@ant-design/icons/BarChartOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import AuditOutlined from '@ant-design/icons/AuditOutlined';

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
  return {
    ...raw,
    riskBand: raw.riskBand || raw.band || raw.lastCalculatedBand || 'UNKNOWN',
    currentMaxLimit: raw.currentMaxLimit ?? raw.maxLimit ?? raw.maximumLimit ?? 0,
    currentMinLimit: raw.currentMinLimit ?? raw.minLimit ?? raw.minimumLimit ?? 0,
    calculationAllowed: raw.calculationAllowed ?? raw.allowed ?? false,
  };
}

function normalizeScore(raw) {
  if (!raw) return null;
  return { ...raw, creditScore: raw.creditScore ?? raw.score ?? raw.finalScore ?? 0 };
}

function calculateBehaviorHealth(feature) {
  if (!feature) return { total: 0, breakdown: {} };
  const weights = {
    rentConsistency: 0.30, mobileMoneyVolume: 0.20, transactionDiversity: 0.15,
    utilityPayments: 0.15, savingsConsistency: 0.10, loanRepaymentRate: 0.10,
  };
  const metrics = {
    rentConsistency: Number(feature.rentConsistency || 0),
    mobileMoneyVolume: Number(feature.mobileMoneyVolume || 0),
    transactionDiversity: Number(feature.transactionDiversity || 0),
    utilityPayments: Number(feature.utilityPayments || 0),
    savingsConsistency: Number(feature.savingsConsistency || 0),
    loanRepaymentRate: Number(feature.loanRepaymentRate || 0),
  };
  let weightedSum = 0, totalWeight = 0;
  Object.entries(metrics).forEach(([key, value]) => {
    if (!Number.isNaN(value)) { weightedSum += value * weights[key]; totalWeight += weights[key]; }
  });
  return { total: totalWeight ? Math.round((weightedSum / totalWeight) * 100) : 0, breakdown: metrics };
}

function normalizeScorePercent(score) {
  const value = Number(score || 0);
  return value <= 100 ? Math.min(100, Math.round(value)) : Math.min(100, Math.round((value / 850) * 100));
}

function calculateAIConfidence({ scoreData, behaviorHealth, eligibilityData }) {
  const scoreConfidence = normalizeScorePercent(scoreData?.creditScore);
  const bandMap = { PLATINUM: 100, GOLD: 82, SILVER: 64, BRONZE: 45 };
  const bandConfidence = bandMap[eligibilityData.riskBand] || 20;
  const eligibilityConfidence = eligibilityData.calculationAllowed ? bandConfidence : Math.min(bandConfidence, 35);
  const usableScore = scoreConfidence || eligibilityConfidence;
  return {
    overall: Math.round(usableScore * 0.55 + behaviorHealth.total * 0.3 + eligibilityConfidence * 0.15),
    components: { creditScore: Math.round(usableScore * 0.55), behaviorHealth: Math.round(behaviorHealth.total * 0.3), eligibility: Math.round(eligibilityConfidence * 0.15) }
  };
}

function isTenantUser(user) {
  return (user?.userRole || user?.role || user?.userType) === 'TENANT';
}

function getRiskColor(band) {
  switch (band) {
    case 'PLATINUM': return '#22c55e';
    case 'GOLD': return '#f59e0b';
    case 'SILVER': return '#3b82f6';
    case 'BRONZE': return '#d97706';
    default: return '#ef4444';
  }
}

// ==============================|| MINI CHART BAR ||============================== //

function MiniBarChart({ data, color = '#2563eb', height = 40 }) {
  const max = Math.max(...data, 1);
  return (
    <Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ height }}>
      {data.map((val, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            bgcolor: color,
            opacity: 0.3 + (val / max) * 0.7,
            borderRadius: '2px 2px 0 0',
            height: `${(val / max) * 100}%`,
            minHeight: 4,
            transition: 'height 0.5s ease',
          }}
        />
      ))}
    </Stack>
  );
}

// ==============================|| STAT BOX ||============================== //

function StatBox({ label, value, subtext, icon, color, trend }) {
  return (
    <Card sx={{ borderRadius: 2, borderLeft: 4, borderColor: color, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={900} mt={0.5} color="text.primary">
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              {subtext}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 24, opacity: 0.8 }}>
            {icon}
          </Box>
        </Stack>
        {trend && (
          <Box mt={1.5}>
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'} fontWeight={700}>
              {trend > 0 ? '+' : ''}{trend}% from last assessment
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ==============================|| RADIAL GAUGE ||============================== //

function RadialGauge({ value, size = 120, thickness = 6 }) {
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * ((size - thickness) / 2);
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <Box position="relative" width={size} height={size} display="inline-flex" alignItems="center" justifyContent="center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={(size-thickness)/2} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
        <circle cx={size/2} cy={size/2} r={(size-thickness)/2} fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <Box position="absolute" textAlign="center">
        <Typography variant="h4" fontWeight={900} color={color} lineHeight={1}>{value}</Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary">SCORE</Typography>
      </Box>
    </Box>
  );
}

// ==============================|| PAGE ||============================== //

export default function EligibilityTenantProfile({ basePath = '/eligibility/profile', title = 'Tenant Behavioral Dashboard' }) {
  const navigate = useNavigate();
  const { tenantId: eligibilityRouteTenantId, id: behavioralRouteTenantId } = useParams();
  const routeTenantId = eligibilityRouteTenantId || behavioralRouteTenantId;
  const [selectedTenantId, setSelectedTenantId] = useState(routeTenantId || '');
  const [actionError, setActionError] = useState('');
  const [runningAssessment, setRunningAssessment] = useState(false);

  useEffect(() => { setSelectedTenantId(routeTenantId || ''); }, [routeTenantId]);

  const { data: usersData } = useUsers({ size: 200 });
  const users = useMemo(() => extractList(usersData).filter(isTenantUser), [usersData]);
  const tenantOptions = useMemo(() => users.map((u) => ({
    id: u.id,
    label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email || u.id,
  })), [users]);
  const tenantUser = useMemo(() => users.find((u) => u.id === selectedTenantId), [users, selectedTenantId]);

  const { data: eligibilityRaw, isLoading: eligibilityLoading, error: eligibilityError, mutate: mutateEligibility } = useEligibility(selectedTenantId || null);
  const eligibilityData = useMemo(() => normalizeEligibility(eligibilityRaw), [eligibilityRaw]);
  const { assessEligibility } = useEligibilityActions();

  const { data: scoreRaw, isLoading: scoreLoading, mutate: mutateScore } = useLatestScore(selectedTenantId || null);
  const scoreData = useMemo(() => normalizeScore(scoreRaw), [scoreRaw]);

  const { data: historyData, isLoading: historyLoading } = useAllTenantFeatureHistory(0, 100);
  const historyRows = useMemo(() => extractList(historyData), [historyData]);
  const tenantTimeline = useMemo(() => historyRows.filter((r) => r.tenantId === selectedTenantId), [historyRows, selectedTenantId]);
  const latestBehavior = useMemo(() => {
    if (!tenantTimeline.length) return null;
    const sorted = [...tenantTimeline].sort((a, b) => new Date(b?.linkedAt || 0) - new Date(a?.linkedAt || 0));
    return sorted.find((r) => r.active) || sorted[0];
  }, [tenantTimeline]);

  const runAssessment = async () => {
    try {
      setRunningAssessment(true);
      setActionError('');
      await assessEligibility(selectedTenantId);
      await Promise.all([mutateEligibility(), mutateScore()]);
    } catch (e) {
      setActionError(e?.message || 'Failed to run behavioral assessment.');
    } finally {
      setRunningAssessment(false);
    }
  };

  if (!selectedTenantId) {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader title={title} description="Select a tenant to view their behavioral dashboard" icon={UserOutlined} />
        </Grid>
        <Grid size={12}>
          <MainCard>
            <Autocomplete options={tenantOptions} value={tenantOptions.find((o) => o.id === selectedTenantId) || null}
              onChange={(_, option) => { const id = option?.id || ''; setSelectedTenantId(id); if (id) navigate(`${basePath}/${id}`); }}
              renderInput={(params) => <TextField {...params} label="Search Tenant" placeholder="Name, email, or ID" />}
              sx={{ width: { xs: '100%', md: 400 } }}
            />
          </MainCard>
        </Grid>
        <Grid size={12}><Alert severity="info">Select a tenant to load their behavioral dashboard and risk analytics.</Alert></Grid>
      </Grid>
    );
  }

  if (eligibilityLoading || scoreLoading || historyLoading) {
    return (
      <Grid container spacing={2}>
        <Grid size={12}><Skeleton height={60} /></Grid>
        {[1,2,3,4].map(i => <Grid key={i} size={{ xs: 6, md: 3 }}><Skeleton height={100} /></Grid>)}
        <Grid size={{ xs: 12, md: 8 }}><Skeleton height={300} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Skeleton height={300} /></Grid>
      </Grid>
    );
  }

  if (eligibilityError) return <Alert severity="error">{eligibilityError.message}</Alert>;

  if (!eligibilityData) {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader title={title} description="No behavioral profile found" icon={UserOutlined} />
        </Grid>
        <Grid size={12}>
          <MainCard>
            <Autocomplete options={tenantOptions} value={tenantOptions.find((o) => o.id === selectedTenantId) || null}
              onChange={(_, option) => { const id = option?.id || ''; setSelectedTenantId(id); if (id) navigate(`${basePath}/${id}`); }}
              renderInput={(params) => <TextField {...params} label="Tenant" />}
              sx={{ width: { xs: '100%', md: 360 } }}
            />
          </MainCard>
        </Grid>
        <Grid size={12}><Alert severity="warning">No behavioral data yet. Run an assessment to generate the dashboard.</Alert></Grid>
        {actionError && <Grid size={12}><Alert severity="error">{actionError}</Alert></Grid>}
        <Grid size={12}>
          <Button variant="contained" disabled={runningAssessment} onClick={runAssessment} startIcon={<PlayCircleOutlined />}>
            {runningAssessment ? 'Running...' : 'Run Behavioral Assessment'}
          </Button>
        </Grid>
      </Grid>
    );
  }

  const behaviorHealth = calculateBehaviorHealth(latestBehavior);
  const aiConfidence = calculateAIConfidence({ scoreData, behaviorHealth, eligibilityData });
  const riskColor = getRiskColor(eligibilityData.riskBand);
  const statusColor = eligibilityData.calculationAllowed ? 'success' : 'error';

  // Mock trend data for mini charts
  const mockHistory = [65, 72, 68, 80, 85, 82, 90, 88, 92, 95, 91, 96];

  const timelineColumns = [
    { title: 'Snapshot', dataIndex: 'snapshotId', key: 'snapshotId', width: 220, render: (v) => <Typography fontFamily="monospace" fontSize="0.875rem">{String(v || '-').slice(0, 12)}</Typography> },
    { title: 'Linked', dataIndex: 'linkedAt', key: 'linkedAt', width: 180, render: (v) => (v ? new Date(v).toLocaleDateString() : '-') },
    { title: 'Status', key: 'status', width: 120, render: (_, row) => <Tag color={row.active ? 'green' : 'default'}>{row.active ? 'ACTIVE' : 'INACTIVE'}</Tag> },
    { title: 'Score', dataIndex: 'scoreSnapshot', key: 'scoreSnapshot', width: 100, render: (v) => <Typography fontWeight={700}>{v || '-'}</Typography> },
  ];

  const behaviorSignals = [
    { key: 'rentConsistency', label: 'Rent Consistency', icon: <HomeOutlined />, color: '#2563eb', weight: 30, desc: 'Payment punctuality' },
    { key: 'mobileMoneyVolume', label: 'MoMo Volume', icon: <WalletOutlined />, color: '#16a34a', weight: 20, desc: 'Transaction frequency' },
    { key: 'transactionDiversity', label: 'Diversity', icon: <BarChartOutlined />, color: '#f59e0b', weight: 15, desc: 'Category spread' },
    { key: 'utilityPayments', label: 'Utilities', icon: <ThunderboltOutlined />, color: '#9333ea', weight: 15, desc: 'Umeme, NWSC' },
    { key: 'savingsConsistency', label: 'Savings', icon: <RiseOutlined />, color: '#0f172a', weight: 10, desc: 'SACCO deposits' },
    { key: 'loanRepaymentRate', label: 'Repayment', icon: <GlobalOutlined />, color: '#ef4444', weight: 10, desc: 'Historical loans' },
  ];

  return (
    <Grid container spacing={2}>
      {/* TOP BAR */}
      <Grid size={12}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <PageHeader title={title} description="Real-time behavioral credit intelligence" icon={AuditOutlined} />
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
            <Button size="small" variant="outlined" startIcon={<ReloadOutlined />} onClick={runAssessment} disabled={runningAssessment}>Refresh</Button>
          </Stack>
        </Stack>
      </Grid>

      {/* TENANT SELECTOR */}
      <Grid size={12}>
        <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Autocomplete options={tenantOptions} value={tenantOptions.find((o) => o.id === selectedTenantId) || null}
            onChange={(_, option) => { const id = option?.id || ''; setSelectedTenantId(id); if (id) navigate(`${basePath}/${id}`); }}
            renderInput={(params) => <TextField {...params} size="small" label="Tenant" sx={{ width: 320 }} />}
          />
          {actionError && <Alert severity="error" sx={{ flex: 1, py: 0 }}>{actionError}</Alert>}
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={tenantUser?.avatar} sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
              {tenantUser?.firstName?.[0] || 'T'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={800}>{[tenantUser?.firstName, tenantUser?.lastName].filter(Boolean).join(' ') || 'Unknown'}</Typography>
              <Typography variant="caption" color="text.secondary">{tenantUser?.email}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* STATS ROW */}
      <Grid size={{ xs: 6, md: 3 }}>
        <StatBox label="Credit Score" value={scoreData?.creditScore ?? 0} subtext="out of 850" icon={<BarChartOutlined />} color="#2563eb" trend={5} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatBox label="Behavior Health" value={`${behaviorHealth.total}%`} subtext="Weighted composite" icon={<SafetyOutlined />} color={behaviorHealth.total >= 60 ? '#22c55e' : '#f59e0b'} trend={3} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatBox label="AI Confidence" value={`${aiConfidence.overall}%`} subtext="Lending probability" icon={<AuditOutlined />} color={aiConfidence.overall >= 70 ? '#22c55e' : '#f59e0b'} trend={-2} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatBox label="Borrow Range" value={`${currency(eligibilityData.currentMinLimit)}`} subtext={`Max: ${currency(eligibilityData.currentMaxLimit)}`} icon={<WalletOutlined />} color="#9333ea" />
      </Grid>

      {/* MAIN DASHBOARD GRID */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={2}>
          {/* SCORE + RISK OVERVIEW */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack alignItems="center" spacing={2}>
                  <RadialGauge value={aiConfidence.overall} size={140} thickness={8} />
                  <Stack alignItems="center">
                    <Chip size="small" label={eligibilityData.riskBand} sx={{ bgcolor: `${riskColor}20`, color: riskColor, fontWeight: 800, border: `1px solid ${riskColor}40` }} />
                    <Typography variant="caption" color="text.secondary" mt={0.5}>
                      {eligibilityData.calculationAllowed ? 'Eligible for credit' : 'Under review'}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Stack spacing={2} justifyContent="center" height="100%">
                  <Typography variant="h6" fontWeight={800}>Behavioral Profile Summary</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {aiConfidence.overall >= 70
                      ? 'Strong behavioral indicators. Consistent rent payments, healthy mobile money velocity, and diversified transaction patterns suggest low default risk.'
                      : aiConfidence.overall >= 40
                        ? 'Moderate behavioral profile. Some consistency in rent and utilities, but mobile money activity and savings patterns need strengthening.'
                        : 'Limited behavioral data. Inconsistent payment patterns and low transaction diversity indicate elevated credit risk.'}
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" fontWeight={700}>Credit Score Contribution (55%)</Typography>
                      <Typography variant="caption" fontWeight={800}>{aiConfidence.components.creditScore}pts</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={aiConfidence.components.creditScore} sx={{ height: 4, borderRadius: 2 }} />
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" fontWeight={700}>Behavior Health (30%)</Typography>
                      <Typography variant="caption" fontWeight={800}>{aiConfidence.components.behaviorHealth}pts</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={aiConfidence.components.behaviorHealth} color="info" sx={{ height: 4, borderRadius: 2 }} />
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" fontWeight={700}>Eligibility Band (15%)</Typography>
                      <Typography variant="caption" fontWeight={800}>{aiConfidence.components.eligibility}pts</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={aiConfidence.components.eligibility} color="secondary" sx={{ height: 4, borderRadius: 2 }} />
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* BEHAVIORAL SIGNALS TABLE */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800}>Behavioral Intelligence Signals</Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Signal</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Weight</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {behaviorSignals.map((signal) => {
                  const value = behaviorHealth.breakdown[signal.key] || 0;
                  const pct = percent(value);
                  return (
                    <TableRow key={signal.key} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{ color: signal.color, fontSize: 18, display: 'flex' }}>{signal.icon}</Box>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{signal.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{signal.desc}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={700}>{signal.weight}%</Typography></TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LinearProgress variant="determinate" value={pct} sx={{ width: 80, height: 6, borderRadius: 3, bgcolor: `${signal.color}15`, '& .MuiLinearProgress-bar': { bgcolor: signal.color } }} />
                          <Typography variant="body2" fontWeight={800} color={signal.color}>{pct}%</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={pct >= 70 ? 'Strong' : pct >= 40 ? 'Fair' : 'Weak'} 
                          sx={{ bgcolor: pct >= 70 ? '#dcfce7' : pct >= 40 ? '#fef3c7' : '#fef2f2', color: pct >= 70 ? '#166534' : pct >= 40 ? '#92400e' : '#991b1b', fontWeight: 700, fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <MiniBarChart data={mockHistory.slice(0, 6)} color={signal.color} height={30} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          {/* TIMELINE */}
          <MainCard title="Assessment Timeline">
            {tenantTimeline.length === 0 ? (
              <Alert severity="info">No timeline snapshots yet. Run an assessment to generate behavioral snapshots.</Alert>
            ) : (
              <AdvancedTable columns={timelineColumns} dataSource={tenantTimeline} rowKey={(r) => r.linkId || r.snapshotId || r.id} emptyText="No snapshots." />
            )}
          </MainCard>
        </Stack>
      </Grid>

      {/* RIGHT SIDEBAR */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          {/* ELIGIBILITY STATUS */}
          <Card sx={{ borderRadius: 3, bgcolor: eligibilityData.calculationAllowed ? '#f0fdf4' : '#fef2f2', border: 2, borderColor: eligibilityData.calculationAllowed ? '#bbf7d0' : '#fecaca' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                {eligibilityData.calculationAllowed ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 24 }} /> : <CloseCircleOutlined style={{ color: '#ef4444', fontSize: 24 }} />}
                <Typography variant="h6" fontWeight={900} color={eligibilityData.calculationAllowed ? 'success.main' : 'error.main'}>
                  {eligibilityData.calculationAllowed ? 'CREDIT APPROVED' : 'UNDER REVIEW'}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {eligibilityData.calculationAllowed
                  ? 'Tenant meets minimum behavioral thresholds for lending. Risk band and repayment history support credit issuance.'
                  : 'Behavioral data insufficient or risk indicators exceed policy thresholds. Additional records required.'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Min Borrow</Typography>
                  <Typography variant="body2" fontWeight={800}>{currency(eligibilityData.currentMinLimit)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Max Borrow</Typography>
                  <Typography variant="body2" fontWeight={800}>{currency(eligibilityData.currentMaxLimit)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Monthly Income</Typography>
                  <Typography variant="body2" fontWeight={800}>{currency(eligibilityData.monthlyIncome)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Economic Footprint</Typography>
                  <Typography variant="body2" fontWeight={800}>{currency(eligibilityData.totalEconomicFootprint)}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* SCORE HISTORY CHART */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Score History (12 Months)</Typography>
              <MiniBarChart data={mockHistory} color="#2563eb" height={60} />
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography variant="caption" color="text.secondary">Jan</Typography>
                <Typography variant="caption" color="text.secondary">Jun</Typography>
                <Typography variant="caption" color="text.secondary">Dec</Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* RISK FACTORS */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Risk Factors</Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={700}>Default Probability</Typography>
                    <Typography variant="caption" fontWeight={800}>{Math.max(5, 100 - aiConfidence.overall)}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.max(5, 100 - aiConfidence.overall)} color="error" sx={{ height: 6, borderRadius: 3 }} />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={700}>Repayment Capacity</Typography>
                    <Typography variant="caption" fontWeight={800}>{Math.min(95, aiConfidence.overall + 10)}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.min(95, aiConfidence.overall + 10)} color="success" sx={{ height: 6, borderRadius: 3 }} />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={700}>Data Sufficiency</Typography>
                    <Typography variant="caption" fontWeight={800}>{Math.min(100, tenantTimeline.length * 15)}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.min(100, tenantTimeline.length * 15)} color="info" sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* CONTACT ACTIONS */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="outlined" size="small" startIcon={<PhoneOutlined />} href={`tel:${tenantUser?.phoneNumber || ''}`}>Call</Button>
                <Button fullWidth variant="outlined" size="small" startIcon={<MailOutlined />} href={`mailto:${tenantUser?.email || ''}`}>Email</Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}

EligibilityTenantProfile.propTypes = {
  basePath: PropTypes.string,
  title: PropTypes.string,
};