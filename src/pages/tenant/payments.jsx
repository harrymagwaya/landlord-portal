import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';import Avatar from '@mui/material/Avatar';// assets & icons
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';

// project imports
import MainCard from 'components/MainCard';
import TenantLoader from 'layout/Tenant/TenantLoader';
import useAuth from 'hooks/useAuth';
import { useFinancialRecordActions, useTenantFinancialHistory } from 'hooks/useFinancial';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
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

export default function TenantPaymentsPage() {
  const { userId } = useAuth();
  const { data, isLoading, error, mutate } = useTenantFinancialHistory(userId);
  const { createFinancialRecord } = useFinancialRecordActions();

  const records = useMemo(() => extractList(data), [data]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Track revealed state for individual transaction IDs
  const [revealedTxnIds, setRevealedTxnIds] = useState({});

  const initialFormState = {
    txnId: '',
    category: 'RENT',
    amount: '',
    transactionDate: '',
    referenceNote: ''
  };
  const [form, setForm] = useState(initialFormState);

  const filteredRecords = useMemo(() => {
    if (activeTab === 'ALL') return records;
    return records.filter((record) => String(record.category || '').toUpperCase() === activeTab);
  }, [activeTab, records]);

  // Aggregate metrics
  const totalAmount = records.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const rentCount = records.filter((record) => String(record.category || '').toUpperCase() === 'RENT').length;
  const utilityCount = records.filter((record) => String(record.category || '').toUpperCase() === 'UTILITY').length;

  const toggleRevealTxn = (id) => {
    setRevealedTxnIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const closeDrawer = () => {
    setForm(initialFormState);
    setDrawerOpen(false);
  };

  const handleSubmit = async () => {
    if (!form.txnId || !form.amount) return;

    try {
      setSubmitting(true);
      await createFinancialRecord({
        ...form,
        tenantId: userId,
        amount: Number(form.amount || 0)
      });
      await mutate();
      closeDrawer();
    } catch (submitError) {
      console.error('Failed to create tenant payment record:', submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <TenantLoader />;
  }

  return (
    <Stack spacing={2.5} sx={{ px: 1, pb: 4, maxWidth: '100%', overflowX: 'hidden' }}>
      {/* --- FLOATING FAB STYLE ACTION BUTTON --- */}
      <Button
        variant="contained"
        startIcon={<PlusOutlined />}
        onClick={() => setDrawerOpen(true)}
        sx={{
          borderRadius: 2.5,
          py: 1.35,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: '0px 4px 12px rgba(var(--mui-palette-primary-mainChannel), 0.2)'
        }}
      >
        File Payment Record
      </Button>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error.message}
        </Alert>
      )}

      {/* --- FINANCIAL HISTORY METRIC HERO --- */}
      <MainCard sx={{ borderRadius: 4, border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', mr: 1.5, width: 44, height: 44 }}>
              <AccountBalanceWallet fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                Total Aggregated Value
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                UGX {totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ opacity: 0.6 }} />

          <Box display="flex" justifyContent="space-between" sx={{ textAlign: 'center' }}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Rent Count
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {rentCount}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 2, height: 32, alignSelf: 'center' }} />
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Utility Count
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {utilityCount}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </MainCard>

      {/* --- SCROLLABLE CATEGORY NAVIGATION TABS --- */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: -1, px: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { textTransform: 'none', minWidth: 70, fontWeight: 600, fontSize: '0.85rem', py: 1, minHeight: 40 }
          }}
        >
          <Tab label="All" value="ALL" />
          <Tab label="Rent" value="RENT" />
          <Tab label="Utility" value="UTILITY" />
          <Tab label="Airtime" value="AIRTIME" />
          <Tab label="Savings" value="SAVINGS" />
          <Tab label="Loan" value="LOAN" />
          <Tab label="Mobile Money" value="MOBILE_MONEY" />
        </Tabs>
      </Box>

      {/* --- EMPTY FEEDBACK COMPONENT --- */}
      {!filteredRecords.length && !error && (
        <Box sx={{ py: 6, textAlign: 'center', px: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {activeTab === 'ALL' ? 'No payment records yet' : `No ${activeTab.toLowerCase().replace('_', ' ')} records`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto' }}>
            Your filed transactions will be displayed here once submitted for landlord verification.
          </Typography>
        </Box>
      )}

      {/* --- PREMIUM COMPACT STATEMENT TRANSACTION LIST --- */}
      {filteredRecords.length > 0 && (
        <MainCard
          title={
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Payment Ledger Statement
            </Typography>
          }
          sx={{ borderRadius: 4 }}
        >
          <Stack spacing={0.5}>
            {filteredRecords.map((record, index) => {
              const uniqueId = record.recordId || record.id || record.txnId || index;
              const isRevealed = !!revealedTxnIds[uniqueId];

              return (
                <Box key={uniqueId}>
                  {index > 0 && <Divider sx={{ my: 1.5, opacity: 0.4 }} />}

                  <Stack spacing={1}>
                    {/* Primary Row */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Stack spacing={0.25}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          UGX {Number(record.amount || 0).toLocaleString()}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label={String(record.category || 'RENT').replace('_', ' ')}
                            size="small"
                            variant="light"
                            color="secondary"
                            sx={{ fontSize: '0.7rem', fontWeight: 700, borderRadius: 1, height: 18 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            • {record.recordType || record.paymentType || record.channel || 'Manual'}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Chip
                        label={record.status || 'PENDING'}
                        color={getStatusColor(record.status)}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5, fontSize: '0.75rem' }}
                      />
                    </Box>

                    {/* Secondary Row (User Narrative notes) */}
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, lineHeight: 1.3 }}>
                      {record.referenceNote || 'No description provided'}
                    </Typography>

                    {/* Meta Action Row for sensitive ID values */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pt: 0.25 }}>
                      <Typography variant="caption" color="text.secondary">
                        {record.transactionDate
                          ? new Date(record.transactionDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : 'Date unavailable'}
                      </Typography>

                      <Button
                        size="small"
                        variant="text"
                        onClick={() => toggleRevealTxn(uniqueId)}
                        startIcon={
                          isRevealed ? (
                            <VisibilityOff sx={{ fontSize: '0.85rem !important' }} />
                          ) : (
                            <Visibility sx={{ fontSize: '0.85rem !important' }} />
                          )
                        }
                        sx={{ textTransform: 'none', fontSize: '0.7rem', p: 0, minWidth: 0, color: 'text.secondary' }}
                      >
                        {isRevealed ? 'Hide ID' : 'Show ID'}
                      </Button>
                    </Box>

                    {/* Conditionally Hidden System Transaction ID Block */}
                    {isRevealed && (
                      <Box sx={{ p: 1, mt: 0.5, bgcolor: 'action.hover', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider' }}>
                        <Typography
                          variant="caption"
                          component="code"
                          sx={{
                            display: 'block',
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: 'text.secondary'
                          }}
                        >
                          Ref ID: {record.txnId || record.id || 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </MainCard>
      )}

      {/* --- NATIVE STYLE BOTTOM ACTION MODAL SHEET --- */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxWidth: '100%', maxHeight: '90vh' } }}
      >
        <Box sx={{ p: 3, pb: 4 }}>
          {/* Native Grabber Bar indicator */}
          <Box sx={{ width: 40, height: 4, bgcolor: 'divider', borderRadius: 2, mx: 'auto', mb: 2.5 }} />

          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Submit Payment Record
              </Typography>
              <Typography variant="body2" color="text.secondary">
                File a mobile money, bank, or cash receipt for landlord audit.
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Transaction ID Reference"
              value={form.txnId}
              onChange={(event) => setForm((prev) => ({ ...prev, txnId: event.target.value }))}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <TextField
              select
              fullWidth
              label="Transaction Category"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            >
              <MenuItem value="RENT">Rent Payment</MenuItem>
              <MenuItem value="UTILITY">Utility Bills</MenuItem>
              <MenuItem value="AIRTIME">Airtime</MenuItem>
              <MenuItem value="SAVINGS">Savings Contribution</MenuItem>
              <MenuItem value="LOAN">Loan Repayment</MenuItem>
              <MenuItem value="MOBILE_MONEY">Mobile Money Remittance</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Transaction Amount"
              type="number"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>UGX</Typography>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }
              }}
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Exact Transaction Time"
              slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: 2 } } }}
              value={form.transactionDate}
              onChange={(event) => setForm((prev) => ({ ...prev, transactionDate: event.target.value }))}
            />

            <TextField
              fullWidth
              label="Reference Narrative Note"
              multiline
              minRows={2}
              maxRows={4}
              value={form.referenceNote}
              onChange={(event) => setForm((prev) => ({ ...prev, referenceNote: event.target.value }))}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={closeDrawer}
                sx={{ borderRadius: 2, textTransform: 'none', py: 1.2, fontWeight: 600, color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || !form.txnId || !form.amount}
                sx={{ borderRadius: 2, textTransform: 'none', py: 1.2, fontWeight: 600 }}
              >
                {submitting ? 'Submitting...' : 'Submit Receipt'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
