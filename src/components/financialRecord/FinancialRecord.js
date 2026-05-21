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

// antd
import { Tag } from 'antd';

// project imports
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useTenantFinancialHistory, useFinancialRecordActions } from 'hooks/useFinancialRecords';

// icons
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

// ==============================|| PAGE ||============================== //

export default function FinancialRecords({ tenantId }) {
  const { data, error, isLoading, mutate } = useTenantFinancialHistory(tenantId);

  const { createFinancialRecord, updateFinancialRecord, updateFinancialRecordStatus } = useFinancialRecordActions();

  const records = useMemo(() => extractList(data), [data]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tenantId: tenantId || '',
    amount: '',
    paymentType: '',
    paymentMethod: '',
    description: '',
    paymentDate: ''
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const openCreate = () => {
    setEditing(null);

    setForm({
      tenantId: tenantId || '',
      amount: '',
      paymentType: '',
      paymentMethod: '',
      description: '',
      paymentDate: ''
    });

    setDrawerOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);

    setForm({
      tenantId: record.tenantId || tenantId,

      amount: record.amount || '',

      paymentType: record.paymentType || '',

      paymentMethod: record.paymentMethod || '',

      description: record.description || '',

      paymentDate: record.paymentDate || ''
    });

    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (editing) {
        await updateFinancialRecord(editing.id, form);
      } else {
        await createFinancialRecord(form);
      }

      await mutate();

      setDrawerOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (recordId, status) => {
    await updateFinancialRecordStatus(recordId, status);

    await mutate();
  };

  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (v) => <Typography fontWeight={700}>UGX {Number(v || 0).toLocaleString()}</Typography>
    },

    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 160
    },

    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 160
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        let color = 'default';

        if (status === 'CONFIRMED') {
          color = 'green';
        }

        if (status === 'PENDING') {
          color = 'orange';
        }

        if (status === 'REJECTED') {
          color = 'red';
        }

        return <Tag color={color}>{status || 'UNKNOWN'}</Tag>;
      }
    },

    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 180
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => openEdit(record)}>
            Edit
          </Button>

          <Button size="small" color="success" variant="contained" onClick={() => handleStatusUpdate(record.id, 'CONFIRMED')}>
            Confirm
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <>
      <Grid container rowSpacing={3}>
        {/* HEADER */}
        <Grid size={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <PageHeader title="Financial Records" description="Manage tenant financial history and payment records" icon={WalletOutlined} />

            <Button startIcon={<PlusOutlined />} variant="contained" onClick={openCreate}>
              Add Record
            </Button>
          </Stack>
        </Grid>

        {/* TABLE */}
        <Grid size={12}>
          <MainCard content={false}>
            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">{error.message}</Alert>
              </Box>
            )}

            <AdvancedTable
              columns={columns}
              dataSource={records}
              loading={isLoading}
              rowKey={(r) => r.id}
              emptyText="No financial records found."
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 420,
            p: 3
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h4">{editing ? 'Edit Financial Record' : 'Add Financial Record'}</Typography>

            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Payment Type"
              value={form.paymentType}
              onChange={(e) => handleChange('paymentType', e.target.value)}
              fullWidth
            >
              <MenuItem value="RENT">RENT</MenuItem>

              <MenuItem value="UTILITY">UTILITY</MenuItem>

              <MenuItem value="DEPOSIT">DEPOSIT</MenuItem>
            </TextField>

            <TextField
              select
              label="Payment Method"
              value={form.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              fullWidth
            >
              <MenuItem value="MOBILE_MONEY">MOBILE MONEY</MenuItem>

              <MenuItem value="BANK">BANK</MenuItem>

              <MenuItem value="CASH">CASH</MenuItem>
            </TextField>

            <TextField
              label="Description"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
            />

            <TextField
              type="date"
              label="Payment Date"
              value={form.paymentDate}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
              fullWidth
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>

              <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
