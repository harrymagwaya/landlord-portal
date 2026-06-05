import { useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

// project imports
import MainCard from 'components/MainCard';
import TenantLoader from 'layout/Tenant/TenantLoader';
import useAuth from 'hooks/useAuth';
import useUserProfile from 'hooks/useUserProfile';
import { useEligibility } from 'hooks/useEligibility';
import { useTenantFinancialHistory } from 'hooks/useFinancial';
import { useUnitByTenant } from 'hooks/usePropertyUnits';
import { useLatestScore } from 'hooks/useScoring';
import { useRentalProfilesByTenant } from 'hooks/useRentalProfle';
import { useTenantCapacity } from 'hooks/useTenantCapacities';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getEligibilityState(eligibility) {
  const allowed = eligibility?.isCalculationAllowed ?? eligibility?.calculationAllowed ?? eligibility?.eligible ?? eligibility?.isEligible;
  if (allowed === undefined) {
    return { label: 'Not assessed', color: 'default' };
  }
  return allowed ? { label: 'Eligible', color: 'success' } : { label: 'Blocked', color: 'error' };
}

function getEligibilityValue(eligibility, keys, fallback = '-') {
  return keys.map((key) => eligibility?.[key]).find((value) => value !== undefined && value !== null && value !== '') ?? fallback;
}

function getCapacityValue(capacity) {
  return (
    capacity?.capacityScore ?? capacity?.score ?? capacity?.tenantCapacity ?? capacity?.financialCapacity ?? capacity?.capacity ?? null
  );
}

function getRiskLabel(score) {
  const value = Number(score || 0);
  if (!value) return 'No score yet';
  if (value >= 750) return 'Excellent standing';
  if (value >= 650) return 'Healthy standing';
  if (value >= 550) return 'Watch closely';
  return 'Needs improvement';
}

function getStatusColor(status) {
  switch (status) {
    case 'ON_TIME':
    case 'COMPLETED':
      return 'success';
    case 'LATE':
      return 'warning';
    case 'MISSED':
      return 'error';
    case 'PENDING':
      return 'info';
    default:
      return 'default';
  }
}

export default function TenantHomePage() {
  const { userId } = useAuth();

  // Custom API Hooks
  const { data: user, error: userError, isLoading: userLoading } = useUserProfile();
  const { data: score, error: scoreError, isLoading: scoreLoading } = useLatestScore(userId);
  const { data: eligibility, error: eligibilityError, isLoading: eligibilityLoading } = useEligibility(userId);
  const { data: financialData, error: financialError, isLoading: financialLoading } = useTenantFinancialHistory(userId);
  const { data: unit, error: unitError, isLoading: unitLoading } = useUnitByTenant(userId);
  const { data: rentalProfile, error: rentalProfileError, isLoading: rentalProfileLoading } = useRentalProfilesByTenant(userId);
  const { data: tenantCapacity, error: tenantCapacityError, isLoading: tenantCapacityLoading } = useTenantCapacity(userId);

  // Layout Local States
  const [showLatestRecordId, setShowLatestRecordId] = useState(false);
  const [financialFilter, setFinancialFilter] = useState('ALL');

  // Value parsing closures
  const records = extractList(financialData);
  const rentalProfiles = extractList(rentalProfile);
  const latestRecord = records[0];
  const paymentTotal = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const onTimeCount = records.filter((record) => String(record.status || '').toUpperCase() === 'ON_TIME').length;
  const latestScore = score?.creditScore ?? score?.score ?? score?.finalScore ?? '-';
  const capacityValue = getCapacityValue(tenantCapacity);
  const eligibilityState = getEligibilityState(eligibility);
  const firstName = user?.firstName || user?.username || 'Tenant';
  const scoreNumber = Number(latestScore || 0);
  const leaseProfile = rentalProfiles[0] || rentalProfile;
  const minLimit = getEligibilityValue(eligibility, ['minEligibleLimit', 'minimumLimit', 'minLimit', 'minimumEligibleAmount', 'minimumAmount']);
  const maxLimit = getEligibilityValue(eligibility, ['maxEligibleLimit', 'maximumLimit', 'maxLimit', 'maximumEligibleAmount', 'maximumAmount']);

  // Dynamic Record Counting across all system enums
  const activeRecordsFilteredCount = useMemo(() => {
    if (financialFilter === 'ALL') return records.length;
    return records.filter((rec) => String(rec.category || '').toUpperCase() === financialFilter).length;
  }, [financialFilter, records]);

  if (
    userLoading ||
    scoreLoading ||
    eligibilityLoading ||
    financialLoading ||
    unitLoading ||
    rentalProfileLoading ||
    tenantCapacityLoading
  ) {
    return <TenantLoader />;
  }

  const renderCleanRow = (label, value) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Stack spacing={3} sx={{ px: 1, pb: 4, maxWidth: '100%', overflowX: 'hidden' }}>
      {(userError || scoreError || eligibilityError || financialError || unitError || rentalProfileError || tenantCapacityError) && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          {userError?.message ||
            scoreError?.message ||
            eligibilityError?.message ||
            financialError?.message ||
            unitError?.message ||
            rentalProfileError?.message ||
            tenantCapacityError?.message}
        </Alert>
      )}

      {/* --- HERO CREDIT BRAND BANNER --- */}
      <MainCard
        sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)', color: 'common.white', border: 'none' }}
      >
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.14em', fontWeight: 600 }}>
            Welcome back
          </Typography>
          <Typography variant="h3" sx={{ color: 'common.white', fontWeight: 700, mt: -0.5 }}>
            {firstName}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Typography variant="h1" sx={{ color: 'common.white', fontWeight: 800, fontSize: '2.5rem' }}>
              {latestScore}
            </Typography>
            <Chip
              label={getRiskLabel(scoreNumber)}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'common.white', fontWeight: 600, borderRadius: 1.5 }}
            />
          </Stack>

          <LinearProgress
            variant="determinate"
            value={Math.min(Math.max((scoreNumber / 900) * 100 || 6, 6), 100)}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.14)',
              '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: '#ffffff' }
            }}
          />
        </Stack>
      </MainCard>

      {/* --- SECTION 1: FINANCIAL METRICS INSIGHTS --- */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
      >
        Financial & History Insights
      </Typography>

      <Grid container spacing={1.5}>
        {/* Dynamic Dropdown Record Card */}
        <Grid item xs={6}>
          <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.25 }}
            >
              Ledger Volume
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {activeRecordsFilteredCount}
            </Typography>

            <TextField
              select
              size="small"
              variant="standard"
              value={financialFilter}
              onChange={(e) => setFinancialFilter(e.target.value)}
              InputProps={{ disableUnderline: true, sx: { fontSize: '0.75rem', fontWeight: 700, color: 'primary.main', p: 0 } }}
            >
              <MenuItem value="ALL">All Records</MenuItem>
              <MenuItem value="RENT">Rent Ledger</MenuItem>
              <MenuItem value="UTILITY">Utilities</MenuItem>
              <MenuItem value="AIRTIME">Airtime Channel</MenuItem>
              <MenuItem value="SAVINGS">Savings Ledger</MenuItem>
              <MenuItem value="LOAN">Loan History</MenuItem>
              <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
            </TextField>
          </Box>
        </Grid>

        {/* On Time Ratio Card */}
        <Grid item xs={6}>
          <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.5 }}
            >
              On-Time Payments
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
              {onTimeCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Verified compliance count
            </Typography>
          </Box>
        </Grid>

        {/* Capacity Evaluation Value */}
        <Grid item xs={6} sm={3}>
          <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.5 }}
            >
              Borrow Capacity
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {capacityValue ?? '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Calculated weight parameters
            </Typography>
          </Box>
        </Grid>

        {/* Space Assignment Card */}
        <Grid item xs={6} sm={3}>
          <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.5 }}
            >
              Assigned Space
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
            >
              {unit?.unitName || unit?.name || unit?.unitNumber || 'Unassigned'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {unit?.propertyName || unit?.property?.name || 'Awaiting assignment'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* --- SECTION 2: ACTIVE LEASE CONTEXT SUMMARY --- */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 0.5, mb: -1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Lease & Space Context
        </Typography>
        <Button
          component={RouterLink}
          to="/tenant/unit"
          size="small"
          endIcon={<KeyboardArrowRight />}
          sx={{ textTransform: 'none', fontWeight: 600, p: 0 }}
        >
          Expand View
        </Button>
      </Box>

      <MainCard sx={{ borderRadius: 4 }}>
        <Stack spacing={1.5}>
          {renderCleanRow(
            'Assigned Tenancy Class',
            leaseProfile?.profileName || leaseProfile?.rentalType || leaseProfile?.tenancyType || 'Standard Class'
          )}
          <Divider sx={{ opacity: 0.5 }} />
          {renderCleanRow('Aggregated Value Handled', `UGX ${paymentTotal.toLocaleString()}`)}
          <Divider sx={{ opacity: 0.5 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Lease Execution Standing
            </Typography>
            <Chip
              label={leaseProfile?.status || leaseProfile?.leaseStatus || 'ACTIVE'}
              color="primary"
              size="small"
              variant="light"
              sx={{ fontWeight: 700, borderRadius: 1 }}
            />
          </Box>
        </Stack>
      </MainCard>

      {/* --- SECTION 3: UNDERWRITING PARAMETERS --- */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
      >
        Credit Risk Verification
      </Typography>

      <MainCard sx={{ borderRadius: 4 }}>
        <Stack spacing={1.5}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Underwriting Verification
            </Typography>
            <Chip label={eligibilityState.label} color={eligibilityState.color} size="small" sx={{ fontWeight: 600, borderRadius: 1 }} />
          </Box>
          <Divider sx={{ opacity: 0.5 }} />
          {renderCleanRow('Minimum Risk Limit Threshold', minLimit)}
          <Divider sx={{ opacity: 0.5 }} />
          {renderCleanRow('Maximum Allowed Micro-Limit', maxLimit)}
        </Stack>
      </MainCard>

      {/* --- SECTION 4: RECENT AUDIT ACTIVITY --- */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 0.5, mb: -1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Recent Audit Activity
        </Typography>
        <Button
          component={RouterLink}
          to="/tenant/payments"
          size="small"
          endIcon={<KeyboardArrowRight />}
          sx={{ textTransform: 'none', fontWeight: 600, p: 0 }}
        >
          View All Statement
        </Button>
      </Box>

      <MainCard sx={{ borderRadius: 4 }}>
        {!latestRecord ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1, textAlign: 'center' }}>
            No recent transactional history submitted yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  UGX {Number(latestRecord?.amount || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Category: {String(latestRecord?.category || 'RENT').replace('_', ' ')}
                </Typography>
              </Stack>
              <Chip
                label={latestRecord?.status || 'PENDING'}
                color={getStatusColor(latestRecord?.status)}
                size="small"
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              />
            </Box>

            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, bgcolor: 'action.hover', p: 1.25, borderRadius: 2 }}>
              {latestRecord?.referenceNote || 'No reference note narrative provided.'}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {latestRecord?.transactionDate ? new Date(latestRecord.transactionDate).toLocaleString() : 'Date missing'}
              </Typography>

              <Button
                size="small"
                variant="text"
                startIcon={showLatestRecordId ? <VisibilityOff /> : <Visibility />}
                onClick={() => setShowLatestRecordId(!showLatestRecordId)}
                sx={{ textTransform: 'none', fontSize: '0.7rem', p: 0, minWidth: 0, color: 'text.secondary' }}
              >
                {showLatestRecordId ? 'Hide ID' : 'Reveal Reference'}
              </Button>
            </Box>

            {showLatestRecordId && (
              <Box sx={{ p: 1, bgcolor: 'neutral.lighter', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider' }}>
                <Typography
                  variant="caption"
                  component="code"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all', display: 'block', fontWeight: 600 }}
                >
                  System Core ID: {latestRecord?.txnId || latestRecord?.id || 'N/A'}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </MainCard>

      {/* --- SECTION 5: PRIMARY PANEL WORKSPACE QUICKS --- */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
      >
        Quick Navigation Actions
      </Typography>

      <MainCard sx={{ borderRadius: 4 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={4}>
            <Button
              component={RouterLink}
              to="/tenant/payments"
              fullWidth
              variant="contained"
              size="small"
              sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
            >
              Ledger
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              component={RouterLink}
              to="/tenant/unit"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
            >
              My Space
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              component={RouterLink}
              to="/tenant/profile"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
            >
              Profile
            </Button>
          </Grid>
        </Grid>
      </MainCard>
    </Stack>
  );
}
