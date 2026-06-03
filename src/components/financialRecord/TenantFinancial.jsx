// =========================================
// FILE: pages/financial-records/TenantFinancialRecords.jsx
// =========================================

import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

// antd
import { Tag } from 'antd';

// project
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

import useAuth from 'hooks/useAuth';
import { useTenantFinancialHistory, useFinancialRecordActions } from 'hooks/useFinancial';

// icons
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

const STATUS_MAPPING = {
  ON_TIME: { color: 'green', label: 'Approved (On Time)' },
  LATE: { color: 'orange', label: 'Late' },
  MISSED: { color: 'red', label: 'Missed' },
  PENDING: { color: 'blue', label: 'Pending Verification' }
};

export default function TenantFinancialRecords() {
  const { userId } = useAuth();
  const tenantId = userId;

  const { data, isLoading, error, mutate } = useTenantFinancialHistory(tenantId);
  const { createFinancialRecord } = useFinancialRecordActions();

  const records = useMemo(() => extractList(data), [data]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initial form layout blueprint
  const initialFormState = {
    tenantId,
    txnId: '',
    category: 'RENT',
    amount: '',
    transactionDate: '',
    referenceNote: ''
  };

  const [form, setForm] = useState(initialFormState);

  const handleSubmit = async () => {
    if (!form.txnId || !form.amount) return; // Basic validation protect

    try {
      setSubmitting(true);

      await createFinancialRecord({
        ...form,
        tenantId,
        amount: Number(form.amount || 0)
      });

      await mutate();
      handleCloseDrawer();
    } catch (err) {
      console.error('Failed to submit transactional profile record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDrawer = () => {
    setForm(initialFormState); // Clean state reset on close
    setDrawerOpen(false);
  };

  const columns = [
    {
      title: 'Transaction Ref',
      dataIndex: 'txnId',
      key: 'txnId'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount',
      key: 'amount',
      render: (v) => <Typography fontWeight={700}>UGX {Number(v || 0).toLocaleString()}</Typography>
    },
    {
      title: 'Verification Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = STATUS_MAPPING[status] || { color: 'default', label: status || 'PENDING' };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    }
  ];

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <PageHeader
              title="My Financial Records"
              description="Track your rent history and verify utility claims"
              icon={WalletOutlined}
            />

            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
              File Payment Record
            </Button>
          </Stack>
        </Grid>

        <Grid size={12}>
          <MainCard content={false}>
            {error && (
              <Box p={2}>
                <Alert severity="error">{error.message}</Alert>
              </Box>
            )}

            <AdvancedTable columns={columns} dataSource={records} loading={isLoading} rowKey={(r) => r.recordId || r.id} />
          </MainCard>
        </Grid>
      </Grid>

      {/* Slide Drawer Formulation View */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 420, p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">Submit Payment Record</Typography>
            <Typography variant="body2" color="text.secondary">
              File manual mobile money transfers, bank slips or checks here for audit matching.
            </Typography>

            <TextField
              label="Transaction ID / Reference Code"
              placeholder="e.g. QF67XX991"
              value={form.txnId}
              onChange={(e) => setForm((p) => ({ ...p, txnId: e.target.value }))}
              fullWidth
              required
            />

            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              fullWidth
            >
              <MenuItem value="RENT">RENTAL COMMITMENT</MenuItem>
              <MenuItem value="UTILITY">UTILITIES & SERVICES</MenuItem>
            </TextField>

            <TextField
              label="Amount Paid"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">UGX</InputAdornment>
                }
              }}
              fullWidth
              required
            />

            <TextField
              type="datetime-local"
              label="Transaction Timestamp"
              InputLabelProps={{ shrink: true }}
              value={form.transactionDate}
              onChange={(e) => setForm((p) => ({ ...p, transactionDate: e.target.value }))}
              fullWidth
            />

            <TextField
              multiline
              rows={4}
              label="Reference / Support Memo Notes"
              placeholder="Provide any additional bank remarks or payment confirmation text..."
              value={form.referenceNote}
              onChange={(e) => setForm((p) => ({ ...p, referenceNote: e.target.value }))}
              fullWidth
            />

            <Button variant="contained" onClick={handleSubmit} disabled={submitting || !form.txnId || !form.amount}>
              {submitting ? 'Processing Record...' : 'Submit to Management'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
