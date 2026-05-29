// =========================================
// FILE: pages/financial-records/TenantFinancialRecords.jsx
// =========================================

import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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

export default function TenantFinancialRecords() {
  const { userId } = useAuth();

  const tenantId = userId;

  const { data, isLoading, error, mutate } = useTenantFinancialHistory(tenantId);

  const { createFinancialRecord } = useFinancialRecordActions();

  const records = useMemo(() => extractList(data), [data]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tenantId,
    txnId: '',
    category: 'RENT',
    amount: '',
    transactionDate: '',
    referenceNote: ''
  });

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await createFinancialRecord({
        ...form,
        tenantId,
        amount: Number(form.amount || 0)
      });

      await mutate();

      setDrawerOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Transaction',
      dataIndex: 'txnId',
      key: 'txnId'
    },

    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },

    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v) => <Typography fontWeight={700}>UGX {Number(v || 0).toLocaleString()}</Typography>
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';

        if (status === 'ON_TIME') color = 'green';
        if (status === 'LATE') color = 'orange';
        if (status === 'MISSED') color = 'red';

        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" justifyContent="space-between">
            <PageHeader title="My Financial Records" description="Track your rent and utility payments" icon={WalletOutlined} />

            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
              Add Record
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

            <AdvancedTable columns={columns} dataSource={records} loading={isLoading} rowKey={(r) => r.recordId} />
          </MainCard>
        </Grid>
      </Grid>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 420,
            p: 3
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h4">Add Financial Record</Typography>

            <TextField
              label="Transaction ID"
              value={form.txnId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  txnId: e.target.value
                }))
              }
              fullWidth
            />

            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  category: e.target.value
                }))
              }
              fullWidth
            >
              <MenuItem value="RENT">RENT</MenuItem>

              <MenuItem value="UTILITY">UTILITY</MenuItem>
            </TextField>

            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  amount: e.target.value
                }))
              }
              fullWidth
            />

            <TextField
              type="datetime-local"
              label="Transaction Date"
              InputLabelProps={{
                shrink: true
              }}
              value={form.transactionDate}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  transactionDate: e.target.value
                }))
              }
              fullWidth
            />

            <TextField
              multiline
              rows={4}
              label="Reference Note"
              value={form.referenceNote}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  referenceNote: e.target.value
                }))
              }
              fullWidth
            />

            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              Save Record
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
