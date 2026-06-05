import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ChevronRight from '@mui/icons-material/ChevronRight';

// project imports
import MainCard from 'components/MainCard';
import TenantLoader from 'layout/Tenant/TenantLoader';
import useAuth from 'hooks/useAuth';
import { useTenantFinancialHistory } from 'hooks/useFinancial';
import { useUnitByTenant } from 'hooks/usePropertyUnits';
import { useRentalProfilesByTenant } from 'hooks/useRentalProfle';
import { useTenantCapacity } from 'hooks/useTenantCapacities';
import { useLatestScore } from 'hooks/useScoring';
import { useEligibility } from 'hooks/useEligibility';
import { useUserActions } from 'hooks/useUsers';
import useUserProfile from 'hooks/useUserProfile';
import { getLoginPathForAppType, getLoginStateForAppType } from 'utils/appIdentity';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getCapacityValue(capacity) {
  return (
    capacity?.capacityScore ?? capacity?.score ?? capacity?.tenantCapacity ?? capacity?.financialCapacity ?? capacity?.capacity ?? null
  );
}

function getEligibilityValue(eligibility, keys, fallback = '-') {
  return keys.map((key) => eligibility?.[key]).find((value) => value !== undefined && value !== null && value !== '') ?? fallback;
}

export default function TenantProfilePage() {
  const navigate = useNavigate();
  const { appType, logout, userId } = useAuth();

  // Custom API Hooks
  const { data: user, error, isLoading } = useUserProfile();
  const { data: rentalProfile, isLoading: rentalLoading } = useRentalProfilesByTenant(userId);
  const { data: tenantCapacity, isLoading: capacityLoading } = useTenantCapacity(userId);
  const { data: unit, isLoading: unitLoading } = useUnitByTenant(userId);
  const { data: financialData, isLoading: financialLoading } = useTenantFinancialHistory(userId);
  const { data: score } = useLatestScore(userId);
  const { data: eligibility } = useEligibility(userId);
  const { updateUser } = useUserActions();

  // Parsing values
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Tenant profile';
  const profiles = extractList(rentalProfile);
  const leaseProfile = profiles[0] || rentalProfile;
  const records = extractList(financialData);
  const capacityValue = getCapacityValue(tenantCapacity);
  const creditScore = score?.creditScore ?? score?.score ?? score?.finalScore ?? '-';
  const minLimit = getEligibilityValue(eligibility, ['minEligibleLimit', 'minimumLimit', 'minLimit', 'minimumEligibleAmount', 'minimumAmount']);
  const maxLimit = getEligibilityValue(eligibility, ['maxEligibleLimit', 'maximumLimit', 'maxLimit', 'maximumEligibleAmount', 'maximumAmount']);

  // Local UX States
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [selectedRecordType, setSelectedRecordType] = useState('ALL');
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || ''
    });
  }, [user?.firstName, user?.lastName, user?.phoneNumber]);

  if (isLoading || rentalLoading || capacityLoading || unitLoading || financialLoading) {
    return <TenantLoader />;
  }

  const handleLogout = () => {
    const nextLoginPath = getLoginPathForAppType(appType);
    const nextState = getLoginStateForAppType(appType);

    logout();
    navigate(nextLoginPath, { replace: true, state: nextState });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError('');
      await updateUser(userId, form);
      setEditOpen(false);
      window.location.reload();
    } catch (saveErr) {
      setSaveError(saveErr.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic filter logic using your enum values
  const filteredRecordsCount = records.filter((rec) => {
    if (selectedRecordType === 'ALL') return true;
    return rec?.category === selectedRecordType || rec?.type === selectedRecordType;
  }).length;

  const renderDataRow = (label, value) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'right' }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Stack spacing={3} sx={{ px: 1, pb: 6, maxWidth: '100%', overflowX: 'hidden', minHeight: '100vh', justifyContent: 'space-between' }}>
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error.message}
          </Alert>
        )}

        {/* --- SECTION 1: IDENTITY BANNER --- */}
        <MainCard sx={{ borderRadius: 4, border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <Stack spacing={2} alignItems="center" sx={{ py: 1 }}>
            <Avatar sx={{ width: 80, height: 80, fontSize: 28, bgcolor: 'primary.main', fontWeight: 600 }}>
              {user?.firstName?.[0] || user?.email?.[0] || 'T'}
            </Avatar>
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'No email registered'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  label={user?.status || 'ACTIVE'}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  variant="light"
                />
                <Chip label={`Credit Score: ${creditScore}`} color="primary" size="small" sx={{ fontWeight: 600, borderRadius: 1.5 }} />
              </Stack>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setEditOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', px: 3, mt: 0.5 }}
            >
              Edit Details
            </Button>
          </Stack>
        </MainCard>

        {/* --- SECTION 2: LIVE METRICS & FINANCIAL SNAPSHOT --- */}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
        >
          Financial Insights Snapshot
        </Typography>

        <Grid container spacing={1.5}>
          {/* Capacity Score Card */}
          <Grid item xs={6}>
            <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.5 }}
              >
                Borrow Capacity
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {capacityValue ?? '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Underwriting limit status
              </Typography>
            </Box>
          </Grid>

          {/* Records Counter Card with Enum Dropdown Selection */}
          <Grid item xs={6}>
            <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.25 }}
              >
                History Records
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {filteredRecordsCount}
              </Typography>

              {/* Category selector replacement dropdown */}
              <TextField
                select
                size="small"
                variant="standard"
                value={selectedRecordType}
                onChange={(e) => setSelectedRecordType(e.target.value)}
                InputProps={{ disableUnderline: true, sx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', p: 0 } }}
                SelectProps={{ sx: { py: 0 } }}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                <MenuItem value="RENT">Rent Payments</MenuItem>
                <MenuItem value="UTILITY">Utilities</MenuItem>
                <MenuItem value="AIRTIME">Airtime</MenuItem>
                <MenuItem value="SAVINGS">Savings Ledger</MenuItem>
                <MenuItem value="LOAN">Loan Ledgers</MenuItem>
                <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
              </TextField>
            </Box>
          </Grid>
        </Grid>

        {/* --- SECTION 3: RENTAL SPACE PROFILE --- */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 0.5, mb: -1.5 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Active Tenancy Profile
          </Typography>
          <Button
            size="small"
            endIcon={<ChevronRight />}
            onClick={() => navigate('/tenant/lease-details')}
            sx={{ textTransform: 'none', fontWeight: 600, p: 0 }}
          >
            View All
          </Button>
        </Box>

        <MainCard sx={{ borderRadius: 4 }}>
          <Stack spacing={1.75}>
            {renderDataRow('Assigned Property', unit?.propertyName || unit?.property?.name)}
            <Divider sx={{ opacity: 0.5 }} />
            {renderDataRow('Unit Assignment', unit?.unitName || unit?.name || unit?.unitNumber)}
            <Divider sx={{ opacity: 0.5 }} />
            {renderDataRow('Current Profile', leaseProfile?.profileName || leaseProfile?.rentalType || 'Rental profile available')}
          </Stack>
        </MainCard>

        {/* --- SECTION 4: UNDERWRITING PARAMETERS --- */}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
        >
          Risk Assessment & Verification
        </Typography>

        <MainCard sx={{ borderRadius: 4 }}>
          <Stack spacing={1.75}>
            {renderDataRow('Financial Evaluation', tenantCapacity?.financialStrength || tenantCapacity?.financialBand || '-')}
            <Divider sx={{ opacity: 0.5 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Risk Assignment Band
              </Typography>
              <Chip
                label={tenantCapacity?.riskBand || tenantCapacity?.band || '-'}
                size="small"
                color={tenantCapacity?.riskBand === 'HIGH' || tenantCapacity?.band === 'HIGH' ? 'error' : 'default'}
                sx={{ fontWeight: 600, borderRadius: 1 }}
              />
            </Box>
            <Divider sx={{ opacity: 0.5 }} />
            {renderDataRow('Allowed Limits (Min / Max)', `${minLimit} / ${maxLimit}`)}
          </Stack>
        </MainCard>

        {/* --- SECTION 5: PRIVATE PROFILE CREDENTIALS --- */}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
        >
          Security & Core Identifiers
        </Typography>

        <MainCard sx={{ borderRadius: 4 }}>
          <Stack spacing={1.75}>
            {renderDataRow('App Login Username', user?.username)}
            <Divider sx={{ opacity: 0.5 }} />
            {renderDataRow('Primary Contact Phone', user?.phoneNumber)}
            <Divider sx={{ opacity: 0.5 }} />

            {/* Reveal Interaction Layer for Internal IDs */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                System Unique Identifiers
              </Typography>
              <Button
                size="small"
                variant="light"
                color={showSensitiveData ? 'warning' : 'primary'}
                startIcon={showSensitiveData ? <VisibilityOff /> : <Visibility />}
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25, px: 1, borderRadius: 1.5 }}
              >
                {showSensitiveData ? 'Hide Metadata' : 'Reveal Details'}
              </Button>
            </Box>

            {showSensitiveData && (
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2.5, border: '1px dashed', borderColor: 'divider', mt: 0.5 }}>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Tenant Core ID:
                    </Typography>
                    <Typography variant="caption" component="code" sx={{ fontWeight: 700 }}>
                      {userId || '-'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Context Target Environment:
                    </Typography>
                    <Typography variant="caption" component="code" sx={{ fontWeight: 700 }}>
                      {appType || 'XPRO_RENTAL_MOBILE_APP'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </MainCard>
      </Stack>

      {/* --- BOTTOM STICKY THUMB ACTION SUITE --- */}
      <Stack spacing={1} sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth
          component={RouterLink}
          to="/tenant/reset-password"
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2.5, py: 1.2, textTransform: 'none', fontWeight: 600, fontSize: '0.9rem' }}
        >
          Reset Security Password
        </Button>
        <Button
          fullWidth
          variant="text"
          color="error"
          size="large"
          onClick={handleLogout}
          sx={{ borderRadius: 2.5, py: 1.2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' }}
        >
          Disconnect Account (Sign Out)
        </Button>
      </Stack>

      {/* Basic Info Dialog Component */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pt: 2, pb: 1 }}>Edit Profile Info</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              slotProps={{ input: { sx: { borderRadius: 2.5 } } }}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              slotProps={{ input: { sx: { borderRadius: 2.5 } } }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              slotProps={{ input: { sx: { borderRadius: 2.5 } } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setEditOpen(false)} color="secondary" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
