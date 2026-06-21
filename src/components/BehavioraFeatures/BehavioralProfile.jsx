import PropTypes from 'prop-types';
import { useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

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
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Skeleton from '@mui/material/Skeleton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, useTheme } from '@mui/material/styles';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import FileExcelOutlined from '@ant-design/icons/FileExcelOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';

// antd
import { Tag, Timeline } from 'antd';

// project imports
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';

// hooks
import { useAllTenantFeatureHistory } from 'hooks/useFeatureLinks';
import { useUser, useUsers } from 'hooks/useUsers';

// icons
import UserOutlined from '@ant-design/icons/UserOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';

// ==============================|| CONSTANTS ||============================== //

const METRIC_KEYS = [
  { key: 'rentConsistency', label: 'Rent Consistency', threshold: 70 },
  { key: 'mobileMoneyVolume', label: 'Mobile Money', threshold: 60 },
  { key: 'transactionDiversity', label: 'Transaction Diversity', threshold: 50 },
  { key: 'utilityPayments', label: 'Utility Payments', threshold: 60 },
  { key: 'savingsConsistency', label: 'Savings Consistency', threshold: 60 },
  { key: 'loanRepaymentRate', label: 'Loan Repayment', threshold: 60 }
];

const RISK_META = {
  LOW: { min: 75, label: 'LOW RISK', color: 'success', tag: 'green', tone: '#059669' },
  MODERATE: { min: 45, label: 'MODERATE', color: 'warning', tag: 'orange', tone: '#d97706' },
  HIGH: { min: 0, label: 'HIGH RISK', color: 'error', tag: 'red', tone: '#dc2626' }
};

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function toPercent(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

function toDecimal(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function calculateBehaviorScore(record) {
  if (!record || typeof record !== 'object') return 0;
  const values = METRIC_KEYS.map(({ key }) => toDecimal(record[key])).filter((v) => v > 0);
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100);
}

function getRiskMeta(score) {
  if (score >= RISK_META.LOW.min) return RISK_META.LOW;
  if (score >= RISK_META.MODERATE.min) return RISK_META.MODERATE;
  return RISK_META.HIGH;
}

function isTenantUser(user) {
  if (!user) return false;
  const role = user.userRole || user.role || user.userType;
  return role === 'TENANT';
}

function formatTenantName(user) {
  if (!user) return 'Unknown Tenant';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email || user.id;
}

function getInitials(user, fallback) {
  const name = user?.firstName || user?.username || fallback || 'T';
  return String(name).slice(0, 1).toUpperCase();
}

// ==============================|| TREND ||============================== //

function calculateTrend(current, previous) {
  const curr = toDecimal(current);
  const prev = toDecimal(previous);
  if (!prev || prev === 0) return { direction: 'neutral', change: 0, pctChange: 0 };
  const change = curr - prev;
  const pctChange = Math.round((change / prev) * 100);
  return {
    direction: change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'neutral',
    change: Math.round(change * 100) / 100,
    pctChange
  };
}

function TrendValue({ current, previous, label }) {
  const trend = calculateTrend(current, previous);
  if (trend.direction === 'neutral') return null;

  const isUp = trend.direction === 'up';
  const color = isUp ? '#059669' : '#dc2626';

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color }}>
      {isUp ? <ArrowUpOutlined style={{ fontSize: 12 }} /> : <ArrowDownOutlined style={{ fontSize: 12 }} />}
      <Typography variant="caption" fontWeight={600} sx={{ color }}>
        {isUp ? '+' : ''}
        {trend.pctChange}%
      </Typography>
    </Stack>
  );
}

// ==============================|| EXPORT ||============================== //

function convertToCSV(data, headers) {
  if (!data?.length) return '';
  const csvRows = [];
  csvRows.push(headers.map((h) => `"${h.label}"`).join(','));
  for (const row of data) {
    const values = headers.map((header) => {
      const value = header.getValue ? header.getValue(row) : row[header.key];
      const escaped = String(value ?? '-').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  return '\uFEFF' + csvRows.join('\n');
}

function downloadBlob(content, filename, type = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==============================|| PAGE ||============================== //

export default function TenantBehaviorProfile() {
  const theme = useTheme();
  const { id } = useParams();
  const [profileTenantId, setProfileTenantId] = useState(id || '');
  const [exportAnchor, setExportAnchor] = useState(null);
  const selectedTenantId = id || profileTenantId;

  const { data: usersData, isLoading: usersLoading } = useUsers({ size: 200 });
  const { data: tenantUser, isLoading: userLoading } = useUser(selectedTenantId || null);
  const { data: featureHistoryData, isLoading: historyLoading, error } = useAllTenantFeatureHistory(0, 200);

  const history = useMemo(() => extractList(featureHistoryData), [featureHistoryData]);
  const users = useMemo(() => extractList(usersData).filter(isTenantUser), [usersData]);

  const tenantOptions = useMemo(() => users.map((u) => ({ id: u.id, label: formatTenantName(u) })), [users]);

  const tenantSnapshots = useMemo(() => {
    if (!selectedTenantId) return [];
    return history
      .filter((r) => r.tenantId === selectedTenantId)
      .sort((a, b) => {
        const dateA = a.linkedAt ? new Date(a.linkedAt).getTime() : 0;
        const dateB = b.linkedAt ? new Date(b.linkedAt).getTime() : 0;
        return dateB - dateA || String(b.id).localeCompare(String(a.id));
      });
  }, [history, selectedTenantId]);

  const latestSnapshot = tenantSnapshots[0] || null;
  const previousSnapshot = tenantSnapshots[1] || null;
  const overallScore = useMemo(() => calculateBehaviorScore(latestSnapshot), [latestSnapshot]);
  const previousScore = useMemo(() => calculateBehaviorScore(previousSnapshot), [previousSnapshot]);
  const scoreTrend = useMemo(() => calculateTrend(overallScore / 100, previousScore / 100), [overallScore, previousScore]);
  const risk = useMemo(() => getRiskMeta(overallScore), [overallScore]);

  const isLoading = usersLoading || userLoading || historyLoading;
  const hasData = !!selectedTenantId && tenantSnapshots.length > 0;

  const handleExportMenuOpen = (event) => setExportAnchor(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchor(null);

  const exportToCSV = useCallback(() => {
    const headers = [
      { label: 'Snapshot ID', key: 'id', getValue: (r) => String(r.id).slice(0, 8) },
      { label: 'Date', key: 'linkedAt', getValue: (r) => (r.linkedAt ? new Date(r.linkedAt).toLocaleString() : '-') },
      { label: 'Behavioral Score', key: 'score', getValue: (r) => calculateBehaviorScore(r) },
      { label: 'Rent Consistency', key: 'rentConsistency', getValue: (r) => `${toPercent(r.rentConsistency)}%` },
      { label: 'Mobile Money', key: 'mobileMoneyVolume', getValue: (r) => `${toPercent(r.mobileMoneyVolume)}%` },
      { label: 'Transaction Diversity', key: 'transactionDiversity', getValue: (r) => `${toPercent(r.transactionDiversity)}%` },
      { label: 'Utility Payments', key: 'utilityPayments', getValue: (r) => `${toPercent(r.utilityPayments)}%` },
      { label: 'Savings Consistency', key: 'savingsConsistency', getValue: (r) => `${toPercent(r.savingsConsistency)}%` },
      { label: 'Loan Repayment', key: 'loanRepaymentRate', getValue: (r) => `${toPercent(r.loanRepaymentRate)}%` },
      { label: 'Risk Category', key: 'risk', getValue: (r) => getRiskMeta(calculateBehaviorScore(r)).label },
      { label: 'Active', key: 'active', getValue: (r) => (r.active ? 'Yes' : 'No') }
    ];
    const csv = convertToCSV(tenantSnapshots, headers);
    const filename = `tenant-${String(selectedTenantId).slice(0, 8)}-snapshots-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(csv, filename);
    handleExportMenuClose();
  }, [tenantSnapshots, selectedTenantId]);

  const exportToJSON = useCallback(() => {
    const exportData = tenantSnapshots.map((r) => ({
      id: r.id,
      linkedAt: r.linkedAt,
      score: calculateBehaviorScore(r),
      metrics: Object.fromEntries(METRIC_KEYS.map(({ key }) => [key, toPercent(r[key])])),
      risk: getRiskMeta(calculateBehaviorScore(r)).label,
      active: r.active
    }));
    const json = JSON.stringify(exportData, null, 2);
    const filename = `tenant-${String(selectedTenantId).slice(0, 8)}-snapshots-${new Date().toISOString().slice(0, 10)}.json`;
    downloadBlob(json, filename, 'application/json');
    handleExportMenuClose();
  }, [tenantSnapshots, selectedTenantId]);

  const columns = useMemo(
    () => [
      {
        title: 'Snapshot',
        key: 'snapshot',
        width: 280,
        render: (_, record) => {
          const score = calculateBehaviorScore(record);
          return (
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: score >= 75 ? alpha('#059669', 0.1) : score >= 45 ? alpha('#d97706', 0.1) : alpha('#dc2626', 0.1),
                  border: '1px solid',
                  borderColor: score >= 75 ? alpha('#059669', 0.2) : score >= 45 ? alpha('#d97706', 0.2) : alpha('#dc2626', 0.2)
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{
                    color: score >= 75 ? '#059669' : score >= 45 ? '#d97706' : '#dc2626'
                  }}
                >
                  {score}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={600} fontSize="0.875rem" noWrap>
                  Snapshot #{String(record.id).slice(0, 8)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  {record.linkedAt ? new Date(record.linkedAt).toLocaleDateString() : 'No date'}
                </Typography>
              </Box>
            </Stack>
          );
        }
      },
      {
        title: 'Trend',
        key: 'trend',
        width: 100,
        align: 'right',
        render: (_, record, index) => {
          const currentScore = calculateBehaviorScore(record);
          const prevRecord = tenantSnapshots[index + 1];
          const prevScore = prevRecord ? calculateBehaviorScore(prevRecord) : null;
          if (!prevScore)
            return (
              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                —
              </Typography>
            );
          return <TrendValue current={currentScore / 100} previous={prevScore / 100} />;
        }
      },
      {
        title: 'Rent',
        dataIndex: 'rentConsistency',
        key: 'rentConsistency',
        width: 140,
        render: (value) => {
          const pct = toPercent(value);
          return (
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  Discipline
                </Typography>
                <Typography variant="caption" fontWeight={600} fontSize="0.75rem">
                  {pct}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 4,
                  borderRadius: 0.5,
                  backgroundColor: alpha(theme.palette.divider, 0.3),
                  '& .MuiLinearProgress-bar': { borderRadius: 0.5 }
                }}
              />
            </Stack>
          );
        }
      },
      {
        title: 'Mobile',
        dataIndex: 'mobileMoneyVolume',
        key: 'mobileMoneyVolume',
        width: 100,
        render: (value) => (
          <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
            {toPercent(value)}%
          </Typography>
        )
      },
      {
        title: 'Savings',
        dataIndex: 'savingsConsistency',
        key: 'savingsConsistency',
        width: 100,
        render: (value) => (
          <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
            {toPercent(value)}%
          </Typography>
        )
      },
      {
        title: 'Loan',
        dataIndex: 'loanRepaymentRate',
        key: 'loanRepaymentRate',
        width: 100,
        render: (value) => (
          <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
            {toPercent(value)}%
          </Typography>
        )
      },
      {
        title: 'Risk',
        key: 'risk',
        width: 120,
        render: (_, record) => {
          const meta = getRiskMeta(calculateBehaviorScore(record));
          return (
            <Box
              sx={{
                display: 'inline-flex',
                px: 1.5,
                py: 0.5,
                borderRadius: 0.5,
                backgroundColor: alpha(meta.tone, 0.08),
                border: '1px solid',
                borderColor: alpha(meta.tone, 0.15)
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                fontSize="0.7rem"
                sx={{ color: meta.tone, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {meta.label}
              </Typography>
            </Box>
          );
        }
      }
    ],
    [tenantSnapshots, theme]
  );

  const handleTenantChange = useCallback((_, option) => setProfileTenantId(option?.id || ''), []);

  const tenantName = formatTenantName(tenantUser);
  const tenantInitials = getInitials(tenantUser, selectedTenantId);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <PageHeader
          title="Tenant Behavioral Profile"
          description="Behavioral intelligence and risk assessment dashboard."
          icon={UserOutlined}
        />
      </Grid>

      {!id && (
        <Grid size={12}>
          <MainCard>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
              <Autocomplete
                options={tenantOptions}
                loading={usersLoading}
                value={tenantOptions.find((o) => o.id === selectedTenantId) || null}
                onChange={handleTenantChange}
                renderInput={(params) => (
                  <TextField {...params} label="Find Tenant" helperText={usersLoading ? 'Loading tenants...' : ''} />
                )}
                sx={{ width: { xs: '100%', md: 360 } }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                {selectedTenantId && <Chip label="Selected" size="small" variant="outlined" sx={{ borderRadius: 0.5 }} />}
                {hasData && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadOutlined />}
                      onClick={handleExportMenuOpen}
                      sx={{ borderRadius: 0.5 }}
                    >
                      Export
                    </Button>
                    <Menu
                      anchorEl={exportAnchor}
                      open={Boolean(exportAnchor)}
                      onClose={handleExportMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <MenuItem onClick={exportToCSV}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        Export CSV
                      </MenuItem>
                      <MenuItem onClick={exportToJSON}>
                        <FileExcelOutlined style={{ marginRight: 8 }} />
                        Export JSON
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
      )}

      {error && (
        <Grid size={12}>
          <Alert severity="error" sx={{ borderRadius: 0.5 }}>
            {error.message || 'Failed to load behavioral data'}
          </Alert>
        </Grid>
      )}

      {isLoading && !hasData && (
        <Grid size={12}>
          <Paper sx={{ p: 4, borderRadius: 0.5 }}>
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={60} sx={{ borderRadius: 0.5 }} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Stack>
          </Paper>
        </Grid>
      )}

      {!selectedTenantId && !isLoading && (
        <Grid size={12}>
          <Paper sx={{ p: 4, borderRadius: 0.5, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
            <Typography color="text.secondary" variant="body2">
              Select a tenant to view their behavioral profile
            </Typography>
          </Paper>
        </Grid>
      )}

      {selectedTenantId && !hasData && !isLoading && !error && (
        <Grid size={12}>
          <Alert severity="info" sx={{ borderRadius: 0.5 }}>
            No behavioral snapshots found for this tenant.
          </Alert>
        </Grid>
      )}

      {hasData && (
        <>
          {/* PROFILE HEADER */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }}
            >
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={tenantUser?.avatarUrl || tenantUser?.avatar}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'grey.800',
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        borderRadius: 0.5
                      }}
                    >
                      {tenantInitials}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        <Typography variant="h6" fontWeight={600} fontSize="1.125rem">
                          {tenantName}
                        </Typography>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.5,
                            backgroundColor: alpha(risk.tone, 0.08),
                            border: '1px solid',
                            borderColor: alpha(risk.tone, 0.15)
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            fontSize="0.65rem"
                            sx={{ color: risk.tone, textTransform: 'uppercase', letterSpacing: 0.5 }}
                          >
                            {risk.label}
                          </Typography>
                        </Box>
                        {tenantSnapshots.length > 1 && <TrendValue current={overallScore / 100} previous={previousScore / 100} />}
                      </Stack>
                      <Stack direction="row" spacing={2} mt={0.5}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          {tenantUser?.email || 'No email on file'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          {tenantUser?.phoneNumber || 'No phone on file'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {tenantUser?.phoneNumber && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PhoneOutlined />}
                        href={`tel:${tenantUser.phoneNumber}`}
                        sx={{ borderRadius: 0.5, textTransform: 'none' }}
                      >
                        Call
                      </Button>
                    )}
                    {tenantUser?.email && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MailOutlined />}
                        href={`mailto:${tenantUser.email}`}
                        sx={{ borderRadius: 0.5, textTransform: 'none' }}
                      >
                        Email
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

                <Grid container spacing={3}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                      fontWeight={600}
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                    >
                      Behavioral Score
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="baseline" mt={0.5}>
                      <Typography variant="h4" fontWeight={700} fontSize="1.75rem" sx={{ color: risk.tone }}>
                        {overallScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                        /100
                      </Typography>
                    </Stack>
                    {tenantSnapshots.length > 1 && scoreTrend.direction !== 'neutral' && (
                      <Typography
                        variant="caption"
                        fontSize="0.75rem"
                        sx={{ color: scoreTrend.direction === 'up' ? '#059669' : '#dc2626' }}
                      >
                        {scoreTrend.direction === 'up' ? '+' : ''}
                        {scoreTrend.pctChange}% vs previous
                      </Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                      fontWeight={600}
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                    >
                      Snapshots
                    </Typography>
                    <Typography variant="h4" fontWeight={700} fontSize="1.75rem" mt={0.5}>
                      {tenantSnapshots.length}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                      fontWeight={600}
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                    >
                      Active Link
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      fontSize="1.75rem"
                      mt={0.5}
                      color={latestSnapshot?.active ? 'success.main' : 'text.primary'}
                    >
                      {latestSnapshot?.active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                      fontWeight={600}
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                    >
                      Last Updated
                    </Typography>
                    <Typography variant="h4" fontWeight={700} fontSize="1.75rem" mt={0.5}>
                      {latestSnapshot?.linkedAt
                        ? new Date(latestSnapshot.linkedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem" fontWeight={600}>
                      Score Distribution
                    </Typography>
                    <Typography variant="caption" fontWeight={600} fontSize="0.75rem" sx={{ color: risk.tone }}>
                      {overallScore}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={overallScore}
                    sx={{
                      height: 6,
                      borderRadius: 0.25,
                      backgroundColor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: risk.tone,
                        borderRadius: 0.25
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* RISK SUMMARY */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: alpha(risk.tone, 0.2),
                backgroundColor: alpha(risk.tone, 0.02),
                height: '100%'
              }}
            >
              <Stack spacing={2.5} justifyContent="center" height="100%">
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                    fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    Risk Assessment
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="baseline" mt={0.5}>
                    <Typography variant="h3" fontWeight={700} fontSize="2.5rem" sx={{ color: risk.tone }}>
                      {overallScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      /100
                    </Typography>
                  </Stack>
                </Box>

                <Divider sx={{ borderColor: alpha(risk.tone, 0.1) }} />

                <Stack spacing={1.5}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.7rem"
                    fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    Trend Analysis
                  </Typography>
                  {tenantSnapshots.length > 1 ? (
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          Previous
                        </Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
                          {previousScore}%
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          Current
                        </Typography>
                        <Typography variant="body2" fontWeight={700} fontSize="0.875rem" sx={{ color: risk.tone }}>
                          {overallScore}%
                        </Typography>
                      </Stack>
                      <Divider sx={{ borderColor: alpha(risk.tone, 0.1) }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          Change
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          fontSize="0.875rem"
                          sx={{
                            color: scoreTrend.direction === 'up' ? '#059669' : scoreTrend.direction === 'down' ? '#dc2626' : 'text.primary'
                          }}
                        >
                          {scoreTrend.direction === 'up' ? '+' : ''}
                          {scoreTrend.change * 100}%
                        </Typography>
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      Insufficient data for trend analysis. Minimum 2 snapshots required.
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ borderColor: alpha(risk.tone, 0.1) }} />

                <Typography variant="caption" color="text.secondary" fontSize="0.75rem" sx={{ lineHeight: 1.6 }}>
                  Composite score derived from rent discipline, mobile money velocity, transaction diversity, utility compliance, savings
                  consistency, and loan repayment history.
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* METRIC CARDS */}
          {METRIC_KEYS.map(({ key, label, threshold }) => {
            const current = toPercent(latestSnapshot?.[key]);
            const previous = toPercent(previousSnapshot?.[key]);
            const isHealthy = current >= threshold;

            return (
              <Grid size={{ xs: 12, md: 4, lg: 2 }} key={key}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: isHealthy ? alpha('#059669', 0.15) : alpha('#dc2626', 0.15),
                    backgroundColor: isHealthy ? alpha('#059669', 0.02) : alpha('#dc2626', 0.02),
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: isHealthy ? alpha('#059669', 0.3) : alpha('#dc2626', 0.3) }
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontSize="0.7rem"
                        fontWeight={600}
                        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                      >
                        {label}
                      </Typography>
                      {tenantSnapshots.length > 1 && previous > 0 && <TrendValue current={current / 100} previous={previous / 100} />}
                    </Stack>

                    <Typography variant="h4" fontWeight={700} fontSize="1.75rem" sx={{ color: isHealthy ? '#059669' : '#dc2626' }}>
                      {current}%
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(current, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 0.25,
                        backgroundColor: alpha(theme.palette.divider, 0.3),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: isHealthy ? '#059669' : '#dc2626',
                          borderRadius: 0.25
                        }
                      }}
                    />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Target {threshold}%
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        fontSize="0.65rem"
                        sx={{
                          color: isHealthy ? '#059669' : '#dc2626',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        {isHealthy ? 'On Track' : 'Below Target'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}

          {/* SNAPSHOTS TABLE */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <MainCard
              title="Behavioral Snapshots"
              secondary={
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadOutlined />}
                  onClick={handleExportMenuOpen}
                  sx={{ borderRadius: 0.5, textTransform: 'none' }}
                >
                  Export
                </Button>
              }
            >
              <AdvancedTable
                columns={columns}
                dataSource={tenantSnapshots}
                loading={historyLoading}
                rowKey={(r) => r.linkId || `${r.tenantId}-${r.snapshotId}`}
                emptyText="No tenant behavioral snapshots found."
              />
            </MainCard>
          </Grid>

          {/* TIMELINE */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <MainCard title="Feature Timeline">
              <Box sx={{ maxHeight: 520, overflowY: 'auto', pr: 1 }}>
                <Timeline
                  items={tenantSnapshots.map((item, index) => {
                    const score = calculateBehaviorScore(item);
                    const prevScore = index < tenantSnapshots.length - 1 ? calculateBehaviorScore(tenantSnapshots[index + 1]) : null;
                    const trend = prevScore ? calculateTrend(score / 100, prevScore / 100) : null;

                    return {
                      color: item.active ? 'green' : 'gray',
                      label: (
                        <Typography variant="caption" fontSize="0.7rem" color="text.secondary" fontWeight={600}>
                          {item.linkedAt
                            ? new Date(item.linkedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                            : '—'}
                        </Typography>
                      ),
                      children: (
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: item.active ? alpha('#059669', 0.2) : 'divider',
                            backgroundColor: item.active ? alpha('#059669', 0.02) : 'background.paper'
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight={600} fontSize="0.875rem">
                                Snapshot Linked
                              </Typography>
                              {trend && trend.direction !== 'neutral' && (
                                <Typography
                                  variant="caption"
                                  fontWeight={600}
                                  fontSize="0.75rem"
                                  sx={{ color: trend.direction === 'up' ? '#059669' : '#dc2626' }}
                                >
                                  {trend.direction === 'up' ? '+' : ''}
                                  {trend.pctChange}%
                                </Typography>
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                              #{String(item.snapshotId).slice(0, 8)} • Score {score}%
                            </Typography>
                            <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.3) }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                Status
                              </Typography>
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  backgroundColor: item.active ? alpha('#059669', 0.08) : alpha(theme.palette.grey[500], 0.08),
                                  border: '1px solid',
                                  borderColor: item.active ? alpha('#059669', 0.15) : alpha(theme.palette.grey[500], 0.15)
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  fontSize="0.65rem"
                                  sx={{
                                    color: item.active ? '#059669' : theme.palette.text.secondary,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5
                                  }}
                                >
                                  {item.active ? 'ACTIVE' : 'INACTIVE'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Stack>
                        </Paper>
                      )
                    };
                  })}
                />
              </Box>
            </MainCard>
          </Grid>

          {/* AI SUMMARY */}
          <Grid size={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <HistoryOutlined style={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                  <Typography variant="h6" fontWeight={600} fontSize="1rem">
                    Behavioral Summary
                  </Typography>
                </Stack>

                <Typography color="text.secondary" fontSize="0.875rem" sx={{ lineHeight: 1.7 }}>
                  This tenant demonstrates <b>{risk.label.toLowerCase()}</b> behavioral lending characteristics based on{' '}
                  {tenantSnapshots.length} snapshot{tenantSnapshots.length !== 1 ? 's' : ''} of data.
                  {tenantSnapshots.length > 1 && scoreTrend.direction !== 'neutral' && (
                    <>
                      {' '}
                      Overall score has{' '}
                      <b>
                        {scoreTrend.direction === 'up' ? 'improved' : 'declined'} by {Math.abs(scoreTrend.pctChange)}%
                      </b>{' '}
                      since the previous snapshot.
                    </>
                  )}
                </Typography>

                <Grid container spacing={2}>
                  {[
                    { label: 'Rent Stability', value: latestSnapshot?.rentConsistency, threshold: 70 },
                    { label: 'Digital Economy', value: latestSnapshot?.mobileMoneyVolume, threshold: 60 },
                    { label: 'Repayment Strength', value: latestSnapshot?.loanRepaymentRate, threshold: 60 }
                  ].map((chip) => {
                    const pct = toPercent(chip.value);
                    const healthy = pct >= chip.threshold;
                    return (
                      <Grid size={{ xs: 12, md: 4 }} key={chip.label}>
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: healthy ? alpha('#059669', 0.2) : alpha('#dc2626', 0.2),
                            backgroundColor: healthy ? alpha('#059669', 0.04) : alpha('#dc2626', 0.04),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
                            {chip.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} fontSize="0.875rem" sx={{ color: healthy ? '#059669' : '#dc2626' }}>
                            {pct}%
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
}

TenantBehaviorProfile.propTypes = {
  tenantId: PropTypes.string
};
