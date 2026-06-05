import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

// material icons
import HomeWork from '@mui/icons-material/HomeWork';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// project imports
import MainCard from 'components/MainCard';
import TenantLoader from 'layout/Tenant/TenantLoader';
import useAuth from 'hooks/useAuth';
import { useUnitByTenant } from 'hooks/usePropertyUnits';

export default function TenantUnitPage() {
  const { userId } = useAuth();
  const { data: unit, error, isLoading } = useUnitByTenant(userId);

  // States to toggle masking for system IDs
  const [showPropertyId, setShowPropertyId] = useState(false);
  const [showUnitId, setShowUnitId] = useState(false);

  if (isLoading) {
    return <TenantLoader />;
  }

  // Helper helper to render clean key-value rows
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
      {error && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error.message}
        </Alert>
      )}

      {/* --- HERO PROPERTY HEADER CARD --- */}
      <MainCard sx={{ borderRadius: 4, border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', mr: 2, width: 48, height: 48 }}>
              <HomeWork />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {unit?.unitName || unit?.name || unit?.unitNumber || 'No unit assigned'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.25 }}
              >
                {unit?.propertyName || unit?.property?.name || 'Awaiting assignment from landlord.'}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={unit ? 'Active Tenancy Assignment' : 'Pending Space Assignment'}
            color={unit ? 'success' : 'default'}
            variant={unit ? 'light' : 'combined'}
            sx={{ alignSelf: 'flex-start', fontWeight: 700, borderRadius: 1.5, px: 0.5 }}
          />
        </Stack>
      </MainCard>

      {/* --- TENANCY HEALTH & DETAILS SECTION --- */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
      >
        Space Allocation Attributes
      </Typography>

      <MainCard sx={{ borderRadius: 4 }}>
        <Stack spacing={1.5}>
          {renderCleanRow('Assigned Space Name', unit?.unitName || unit?.unitNumber)}
          <Divider sx={{ opacity: 0.5 }} />
          {renderCleanRow('Parent Estate/Property', unit?.propertyName || unit?.property?.name)}
          <Divider sx={{ opacity: 0.5 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              System Status
            </Typography>
            <Chip
              label={unit?.status || (unit ? 'ACTIVE' : 'UNASSIGNED')}
              color={unit ? 'primary' : 'warning'}
              size="small"
              sx={{ fontWeight: 700, borderRadius: 1 }}
            />
          </Box>
        </Stack>
      </MainCard>

      {/* --- SENSITIVE DATA ID REGISTRY SECTION --- */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontWeight: 700, textTransform: 'uppercase', px: 0.5, letterSpacing: 0.5, mb: -1.5 }}
      >
        System Reference Registers
      </Typography>

      <MainCard sx={{ borderRadius: 4 }}>
        <Stack spacing={2}>
          {/* Property Reference Registry Item */}
          <Stack spacing={0.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Property Identity Hash
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={showPropertyId ? <VisibilityOff /> : <Visibility />}
                onClick={() => setShowPropertyId(!showPropertyId)}
                sx={{ textTransform: 'none', fontSize: '0.725rem', p: 0, minWidth: 0, color: 'text.secondary' }}
              >
                {showPropertyId ? 'Hide Hash' : 'Reveal Hash'}
              </Button>
            </Box>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1.5, minHeight: 32, display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="caption"
                component="code"
                sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  fontWeight: 600,
                  color: showPropertyId ? 'text.primary' : 'text.disabled'
                }}
              >
                {showPropertyId ? unit?.propertyId || unit?.property?.id || 'Data unavailable' : '••••••••-••••-••••-••••-••••••••••••'}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ opacity: 0.5 }} />

          {/* Unit Reference Registry Item */}
          <Stack spacing={0.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Unit Workspace Resource ID
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={showUnitId ? <VisibilityOff /> : <Visibility />}
                onClick={() => setShowUnitId(!showUnitId)}
                sx={{ textTransform: 'none', fontSize: '0.725rem', p: 0, minWidth: 0, color: 'text.secondary' }}
              >
                {showUnitId ? 'Hide Hash' : 'Reveal Hash'}
              </Button>
            </Box>
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1.5, minHeight: 32, display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="caption"
                component="code"
                sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  fontWeight: 600,
                  color: showUnitId ? 'text.primary' : 'text.disabled'
                }}
              >
                {showUnitId ? unit?.id || unit?.unitId || 'Data unavailable' : '••••••••-••••-••••-••••-••••••••••••'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </MainCard>
    </Stack>
  );
}
